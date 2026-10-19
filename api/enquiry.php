<?php
declare(strict_types=1);
// PHP 8.1+; plain-text enquiry delivery. No submitted details are stored on disk.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function respond(int $code, string $message, array $extra=[]): never {
    http_response_code($code); echo json_encode(array_merge(['ok'=>$code===200,'message'=>$message],$extra)); exit;
}
if (!in_array($_SERVER['REQUEST_METHOD']??'', ['GET','POST'],true)) { header('Allow: GET, POST'); respond(405,'Method not allowed.'); }
$secure=isset($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off';
session_name('clutter_session');
session_set_cookie_params(['lifetime'=>0,'path'=>'/api/','secure'=>$secure,'httponly'=>true,'samesite'=>'Strict']);
ini_set('session.use_strict_mode','1');
if (!session_start()) respond(503,'The secure form is unavailable. Please email farryn@clutterandco.co.za or eloise@clutterandco.co.za.');
if ($_SERVER['REQUEST_METHOD']==='GET') {
    $_SESSION['token']??=bin2hex(random_bytes(32));
    respond(200,'Ready.',['token'=>$_SESSION['token']]);
}
if ((int)($_SERVER['CONTENT_LENGTH']??0)>24000) respond(413,'Please shorten your message.');
$origin=$_SERVER['HTTP_ORIGIN']??'';
if ($origin!==''&&!in_array($origin,['https://clutterandco.co.za','https://www.clutterandco.co.za'],true)) respond(403,'Please submit from the Clutter & Co. website.');
if (($_SERVER['HTTP_SEC_FETCH_SITE']??'')==='cross-site') respond(403,'Please submit from the Clutter & Co. website.');
$token=$_POST['token']??'';
if (!is_string($token)||!isset($_SESSION['token'])||!hash_equals($_SESSION['token'],$token)) respond(403,'Your secure session expired. Please try again.');
function field(string $name,int $max,bool $required=false): string {
    $value=$_POST[$name]??'';
    if (!is_string($value)) respond(422,'Please check your form details.');
    $value=trim($value);
    if (strlen($value)>$max||($required&&$value==='')||str_contains($value,"\0")) respond(422,'Please check the required fields and message lengths.');
    return $value;
}
if(field('company_website',200)!=='')respond(422,'Unable to process this enquiry. Please contact us directly.');
$name=field('name',480,true);$email=field('email',254,true);$phone=field('phone',30,true);$suburb=field('suburb',480,true);$message=field('message',16000,true);$budget=field('budget',800);
if(!filter_var($email,FILTER_VALIDATE_EMAIL)||preg_match('/[\r\n]/',$email.$name.$phone.$suburb))respond(422,'Please enter valid contact details.');
if(!preg_match('/^[+0-9() .-]{7,30}$/',$phone)||strlen($message)<10)respond(422,'Please check your phone number and describe the space in at least 10 characters.');
if(field('acknowledge',5)!=='yes')respond(422,'Please read and acknowledge the privacy notice.');
$method=field('contact_method',30);$timing=field('timing',60);
if(!in_array($method,['Phone call','Email','WhatsApp'],true)||!in_array($timing,['Flexible / exploring options','Within a month','Within three months','Planning a move'],true))respond(422,'Please choose a listed contact method and timeframe.');
$spaces=$_POST['spaces']??[];$allowed=['Kitchen / pantry','Wardrobe / cupboards','Playroom','Garage / storeroom','Office','Whole home','Moving / unpacking','Other'];
if(!is_array($spaces)||count($spaces)<1||count($spaces)>8)respond(422,'Please choose at least one space.');
foreach($spaces as $space)if(!is_string($space)||!in_array($space,$allowed,true))respond(422,'Please choose one of the listed spaces.');
// Use the server temp location, never a presumed writable parent of public_html.
// Only a daily salted IP hash and recent timestamps are kept; no form content.
$dir=sys_get_temp_dir().'/clutter-enquiry-'.substr(hash('sha256',__DIR__),0,16);
$tempRoot=realpath(sys_get_temp_dir());$publicRoot=realpath(dirname(__DIR__));
if(!$tempRoot||!$publicRoot||str_starts_with(strtolower($tempRoot.DIRECTORY_SEPARATOR),strtolower($publicRoot.DIRECTORY_SEPARATOR)))respond(503,'The form is unavailable. Please email farryn@clutterandco.co.za or eloise@clutterandco.co.za.');
if(!is_dir($dir)&&!@mkdir($dir,0700,true)&&!is_dir($dir))respond(503,'The form is unavailable. Please email farryn@clutterandco.co.za or eloise@clutterandco.co.za.');
$secretFile=$dir.'/secret';
if(!is_file($secretFile)){ $fh=@fopen($secretFile,'x');if($fh){fwrite($fh,bin2hex(random_bytes(32)));fclose($fh);@chmod($secretFile,0600);} }
$secret=@file_get_contents($secretFile);if(!$secret)respond(503,'The form is unavailable. Please email us.');
$id=hash_hmac('sha256',($_SERVER['REMOTE_ADDR']??'unknown').gmdate('Y-m-d'),$secret);
$fp=@fopen($dir.'/'.$id.'.json','c+');if(!$fp||!flock($fp,LOCK_EX))respond(503,'The form is busy. Please try again shortly.');
$now=time();$times=json_decode(stream_get_contents($fp),true);$times=is_array($times)?array_values(array_filter($times,fn($v)=>is_int($v)&&$v>$now-3600)):[];
if(count($times)>=5){flock($fp,LOCK_UN);fclose($fp);respond(429,'Too many requests. Please wait an hour or contact us directly.');}
$times[]=$now;rewind($fp);ftruncate($fp,0);fwrite($fp,json_encode($times));fflush($fp);flock($fp,LOCK_UN);fclose($fp);
foreach(glob($dir.'/*.json')?:[] as $old)if(filemtime($old)<$now-86400)@unlink($old);
$body="New Clutter & Co. space enquiry\n\nName: $name\nEmail: $email\nPhone: $phone\nSuburb: $suburb\nPreferred contact: $method\nTiming: $timing\nSpaces: ".implode(', ',$spaces)."\n\nProject details:\n$message\n\nBudget / priorities: $budget\n\nPrivacy notice acknowledged.\n";
$headers=['From'=>'Clutter & Co. <farryn@clutterandco.co.za>','Reply-To'=>$email,'MIME-Version'=>'1.0','Content-Type'=>'text/plain; charset=UTF-8'];
// Configure the domain mailbox / DNS on xneelo before verifying delivery.
if(!@mail('farryn@clutterandco.co.za, eloise@clutterandco.co.za','New space questionnaire - Clutter & Co.',$body,$headers))respond(503,'We could not send the questionnaire. Please email farryn@clutterandco.co.za or eloise@clutterandco.co.za. Your answers have not been cleared.');
unset($_SESSION['token']);
respond(200,'Accepted for delivery.');
