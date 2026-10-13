'use strict';
const header=document.getElementById('siteHeader'),toggle=document.getElementById('menuToggle'),menu=document.getElementById('mobileMenu');
const main=document.querySelector('main'),footer=document.querySelector('footer');
function closeMenu(returnFocus=false){menu.classList.remove('open');menu.inert=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation menu');toggle.classList.remove('active');document.body.classList.remove('menu-open');main.inert=false;footer.inert=false;if(returnFocus)toggle.focus();}
toggle.addEventListener('click',()=>{if(toggle.getAttribute('aria-expanded')==='true'){closeMenu(true);return;}header.classList.remove('header-hidden');menu.inert=false;menu.classList.add('open');toggle.classList.add('active');toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Close navigation menu');document.body.classList.add('menu-open');main.inert=true;footer.inert=true;menu.querySelector('a').focus();});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
document.addEventListener('keydown',e=>{if(toggle.getAttribute('aria-expanded')!=='true')return;if(e.key==='Escape'){closeMenu(true);return;}if(e.key==='Tab'){const items=[toggle,...menu.querySelectorAll('a')];const idx=items.indexOf(document.activeElement);if(e.shiftKey&&idx===0){e.preventDefault();items.at(-1).focus();}else if(!e.shiftKey&&idx===items.length-1){e.preventDefault();toggle.focus();}}});
let lastHeaderScroll=window.scrollY;
function headerState(){
 const y=Math.max(0,window.scrollY),delta=y-lastHeaderScroll;
 header.classList.toggle('scrolled',y>35);
 header.classList.remove('header-theme-dark','header-theme-split');header.classList.add('header-theme-light');
 if(y<=header.offsetHeight||document.body.classList.contains('menu-open'))header.classList.remove('header-hidden');
 else if(Math.abs(delta)>=5)header.classList.toggle('header-hidden',delta>0);
 if(Math.abs(delta)>=5||y===0)lastHeaderScroll=y;
}
header.addEventListener('focusin',()=>header.classList.remove('header-hidden'));

window.addEventListener('scroll',headerState,{passive:true});window.addEventListener('resize',()=>{headerState();if(innerWidth>1100)closeMenu();});headerState();
const slider=document.getElementById('comparisonSlider');if(slider){const update=()=>{document.getElementById('comparisonBefore').style.width=slider.value+'%';document.getElementById('comparisonLine').style.left=slider.value+'%';slider.setAttribute('aria-valuetext',slider.value+' percent of the before image visible');};slider.addEventListener('input',update);update();}
document.getElementById('currentYear').textContent=new Date().getFullYear();
// Notice acknowledgement only: no optional tracking is installed or enabled.
const key='clutter-cookie-notice',version=1,ttl=180*86400000,notice=document.querySelector('.cookie-notice'),dialog=document.getElementById('privacyDialog');
let previousFocus=null;
function remembered(){try{const v=JSON.parse(localStorage.getItem(key));return v&&v.version===version&&Date.now()-v.time<ttl;}catch{return false;}}
function acknowledge(){try{localStorage.setItem(key,JSON.stringify({version,time:Date.now()}));}catch{}notice.hidden=true;}
notice.hidden=remembered();
document.querySelector('[data-ack]').addEventListener('click',acknowledge);
document.querySelectorAll('[data-privacy]').forEach(b=>b.addEventListener('click',()=>{previousFocus=b;dialog.showModal();}));
document.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>previousFocus?.focus());
document.querySelector('[data-forget]').addEventListener('click',()=>{try{localStorage.removeItem(key);}catch{}notice.hidden=false;document.getElementById('privacyStatus').textContent='Saved notice preference cleared. No optional trackers were active.';});
window.addEventListener('storage',e=>{if(e.key===key)notice.hidden=remembered();});
const form=document.getElementById('enquiryForm');
if(form){
 const status=document.getElementById('formStatus'),submit=form.querySelector('[type="submit"]');let pending=false;
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(pending)return;
  if(!form.querySelector('[name="spaces[]"]:checked')){status.className='error';status.textContent='Please select at least one space.';form.querySelector('[name="spaces[]"]').focus();return;}
  pending=true;submit.disabled=true;status.className='';status.textContent='Sending your questionnaire…';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{
   const start=await fetch('api/enquiry.php',{credentials:'same-origin',cache:'no-store',signal:controller.signal});
   if(!start.ok)throw new Error('The form is temporarily unavailable. Please email farryn@clutterandco.co.za or call us. Your answers remain here.');
   const {token}=await start.json();if(!token)throw new Error('Could not start a secure request. Please reload or email us.');
   const data=new FormData(form);data.append('token',token);
   const response=await fetch('api/enquiry.php',{method:'POST',body:data,credentials:'same-origin',signal:controller.signal});
   const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.message||'Unable to send. Please email us; your answers remain here.');
   status.className='success';status.textContent='Your questionnaire has been accepted for delivery. If you do not hear back, please contact us directly.';form.reset();
  }catch(err){status.className='error';status.textContent=err.name==='AbortError'?'The request timed out and delivery is unconfirmed. Please contact us before resending. Your answers remain here.':err instanceof SyntaxError?'The form is temporarily unavailable. Please email farryn@clutterandco.co.za. Your answers remain here.':err.message;}
  finally{clearTimeout(timer);pending=false;submit.disabled=false;}
 });
}

// Accessible back-to-top control, kept above the privacy notice when visible.
const backToTop=document.createElement('button');
backToTop.type='button';backToTop.className='back-to-top';backToTop.setAttribute('aria-label','Back to top');backToTop.title='Back to top';backToTop.textContent='↑';backToTop.hidden=true;document.body.append(backToTop);
function updateBackToTop(){
 backToTop.hidden=window.scrollY<400||document.body.classList.contains('menu-open');
 backToTop.style.bottom=(!notice.hidden?notice.getBoundingClientRect().height+36:24)+'px';
}
backToTop.addEventListener('click',()=>{
 header.classList.remove('header-hidden');
 window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 document.querySelector('.brand').focus({preventScroll:true});
});
window.addEventListener('scroll',updateBackToTop,{passive:true});window.addEventListener('resize',updateBackToTop);
new ResizeObserver(updateBackToTop).observe(notice);
new MutationObserver(updateBackToTop).observe(notice,{attributes:true,attributeFilter:['hidden']});
new MutationObserver(updateBackToTop).observe(document.body,{attributes:true,attributeFilter:['class']});
updateBackToTop();
