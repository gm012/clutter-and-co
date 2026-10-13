'use strict';


// ============================================================
// CLUTTER & CO.
// GLOBAL SITE SCRIPT
// ============================================================



// ============================================================
// CORE ELEMENTS
// ============================================================

const header =
    document.getElementById('siteHeader');

const toggle =
    document.getElementById('menuToggle');

const menu =
    document.getElementById('mobileMenu');

const main =
    document.querySelector('main');

const footer =
    document.querySelector('footer');



// ============================================================
// HEADER VISUAL STATE
//
// IMPORTANT:
// Keep the header permanently in the LIGHT visual treatment.
//
// This means:
// - dark / charcoal logo
// - charcoal navigation
// - sage hover treatment
// - transparent background
//
// We deliberately DO NOT switch to header-theme-split or
// header-theme-dark because those styles were turning the
// Clutter logo white.
// ============================================================

function enforceHeaderTheme() {

    if (!header) {
        return;
    }


    header.classList.remove(
        'header-theme-dark',
        'header-theme-split',
        'scrolled'
    );


    header.classList.add(
        'header-theme-light'
    );

}



// ============================================================
// MOBILE MENU
// ============================================================

function closeMenu(returnFocus = false) {

    if (
        !menu ||
        !toggle
    ) {
        return;
    }


    menu.classList.remove(
        'open'
    );


    menu.inert =
        true;


    toggle.classList.remove(
        'active'
    );


    toggle.setAttribute(
        'aria-expanded',
        'false'
    );


    toggle.setAttribute(
        'aria-label',
        'Open navigation menu'
    );


    document.body.classList.remove(
        'menu-open'
    );


    if (main) {

        main.inert =
            false;

    }


    if (footer) {

        footer.inert =
            false;

    }


    if (returnFocus) {

        toggle.focus();

    }

}



// ============================================================
// MOBILE MENU OPEN
// ============================================================

if (
    toggle &&
    menu
) {

    toggle.addEventListener(
        'click',
        () => {

            const isOpen =
                toggle.getAttribute(
                    'aria-expanded'
                ) === 'true';


            if (isOpen) {

                closeMenu(true);

                return;

            }


            if (header) {

                header.classList.remove(
                    'header-hidden'
                );

            }


            enforceHeaderTheme();


            menu.inert =
                false;


            menu.classList.add(
                'open'
            );


            toggle.classList.add(
                'active'
            );


            toggle.setAttribute(
                'aria-expanded',
                'true'
            );


            toggle.setAttribute(
                'aria-label',
                'Close navigation menu'
            );


            document.body.classList.add(
                'menu-open'
            );


            if (main) {

                main.inert =
                    true;

            }


            if (footer) {

                footer.inert =
                    true;

            }


            const firstMenuLink =
                menu.querySelector('a');


            if (firstMenuLink) {

                firstMenuLink.focus();

            }

        }
    );



    menu
        .querySelectorAll('a')
        .forEach(
            link => {

                link.addEventListener(
                    'click',
                    () => {

                        closeMenu();

                    }
                );

            }
        );

}



// ============================================================
// MOBILE MENU KEYBOARD ACCESSIBILITY
// ============================================================

document.addEventListener(
    'keydown',
    event => {

        if (
            !toggle ||
            !menu
        ) {
            return;
        }


        const menuOpen =
            toggle.getAttribute(
                'aria-expanded'
            ) === 'true';


        if (!menuOpen) {
            return;
        }



        // ----------------------------------------------------
        // ESCAPE
        // ----------------------------------------------------

        if (
            event.key ===
            'Escape'
        ) {

            closeMenu(true);

            return;

        }



        // ----------------------------------------------------
        // TAB LOOP
        // ----------------------------------------------------

        if (
            event.key ===
            'Tab'
        ) {

            const items = [
                toggle,
                ...menu.querySelectorAll('a')
            ];


            const index =
                items.indexOf(
                    document.activeElement
                );


            if (
                event.shiftKey &&
                index === 0
            ) {

                event.preventDefault();


                items
                    .at(-1)
                    ?.focus();

            }


            else if (
                !event.shiftKey &&
                index ===
                items.length - 1
            ) {

                event.preventDefault();


                toggle.focus();

            }

        }

    }
);



// ============================================================
// HEADER HIDE / SHOW
//
// SCROLL DOWN = HIDE
// SCROLL UP   = SHOW
// TOP         = SHOW
//
// No background gets added.
// No colour theme switching gets added.
// ============================================================

let lastHeaderScroll =
    Math.max(
        0,
        window.scrollY
    );


const headerScrollThreshold =
    5;



function headerState() {

    if (!header) {
        return;
    }


    // Always keep correct Clutter header colour.

    enforceHeaderTheme();



    const currentScroll =
        Math.max(
            0,
            window.scrollY
        );


    const difference =
        currentScroll -
        lastHeaderScroll;



    // --------------------------------------------------------
    // ALWAYS VISIBLE AT TOP
    // --------------------------------------------------------

    if (
        currentScroll <=
        header.offsetHeight
    ) {

        header.classList.remove(
            'header-hidden'
        );


        lastHeaderScroll =
            currentScroll;


        return;

    }



    // --------------------------------------------------------
    // ALWAYS VISIBLE WHILE MOBILE MENU IS OPEN
    // --------------------------------------------------------

    if (
        document.body.classList.contains(
            'menu-open'
        )
    ) {

        header.classList.remove(
            'header-hidden'
        );


        lastHeaderScroll =
            currentScroll;


        return;

    }



    // --------------------------------------------------------
    // IGNORE TINY MOVEMENTS
    // --------------------------------------------------------

    if (
        Math.abs(difference) <
        headerScrollThreshold
    ) {
        return;
    }



    // --------------------------------------------------------
    // SCROLLING DOWN
    // --------------------------------------------------------

    if (
        difference >
        0
    ) {

        header.classList.add(
            'header-hidden'
        );

    }



    // --------------------------------------------------------
    // SCROLLING UP
    // --------------------------------------------------------

    else {

        header.classList.remove(
            'header-hidden'
        );

    }



    lastHeaderScroll =
        currentScroll;

}



// ============================================================
// HEADER FOCUS
//
// If somebody tabs into the header, make sure it becomes visible.
// ============================================================

if (header) {

    header.addEventListener(
        'focusin',
        () => {

            header.classList.remove(
                'header-hidden'
            );


            enforceHeaderTheme();

        }
    );

}



// ============================================================
// GLOBAL SCROLL
// ============================================================

window.addEventListener(
    'scroll',
    headerState,
    {
        passive: true
    }
);



// ============================================================
// GLOBAL RESIZE
// ============================================================

window.addEventListener(
    'resize',
    () => {

        enforceHeaderTheme();


        headerState();



        if (
            window.innerWidth >
            1100
        ) {

            closeMenu();

        }

    }
);



// ============================================================
// INITIAL HEADER STATE
// ============================================================

enforceHeaderTheme();

headerState();



// ============================================================
// BEFORE / AFTER SLIDER
// ============================================================

const slider =
    document.getElementById(
        'comparisonSlider'
    );


if (slider) {

    const comparisonBefore =
        document.getElementById(
            'comparisonBefore'
        );


    const comparisonLine =
        document.getElementById(
            'comparisonLine'
        );



    function updateComparison() {

        const value =
            Number(
                slider.value
            );


        if (comparisonBefore) {

            comparisonBefore.style.width =
                `${value}%`;

        }


        if (comparisonLine) {

            comparisonLine.style.left =
                `${value}%`;

        }


        slider.setAttribute(
            'aria-valuetext',
            `${value} percent of the before image visible`
        );

    }



    slider.addEventListener(
        'input',
        updateComparison
    );


    updateComparison();

}



// ============================================================
// CURRENT YEAR
// ============================================================

const currentYear =
    document.getElementById(
        'currentYear'
    );


if (currentYear) {

    currentYear.textContent =
        new Date()
            .getFullYear();

}



// ============================================================
// PRIVACY / COOKIE NOTICE
//
// Essential preference only.
// No analytics or advertising trackers.
// ============================================================

const cookieKey =
    'clutter-cookie-notice';


const cookieVersion =
    1;


const cookieTTL =
    180 *
    86400000;


const notice =
    document.querySelector(
        '.cookie-notice'
    );


const dialog =
    document.getElementById(
        'privacyDialog'
    );


let previousFocus =
    null;



// ============================================================
// CHECK SAVED COOKIE NOTICE STATE
// ============================================================

function remembered() {

    try {

        const raw =
            localStorage.getItem(
                cookieKey
            );


        if (!raw) {

            return false;

        }


        const value =
            JSON.parse(
                raw
            );


        return Boolean(

            value &&

            value.version ===
            cookieVersion &&

            Date.now() -
            value.time <
            cookieTTL

        );

    }


    catch {

        return false;

    }

}



// ============================================================
// ACKNOWLEDGE NOTICE
// ============================================================

function acknowledge() {

    try {

        localStorage.setItem(
            cookieKey,

            JSON.stringify({
                version:
                    cookieVersion,

                time:
                    Date.now()
            })
        );

    }


    catch {

        // Local storage may be disabled.
        // Site functionality should continue.

    }



    if (notice) {

        notice.hidden =
            true;

    }



    updateBackToTop();

}



// ============================================================
// INITIAL COOKIE NOTICE STATE
// ============================================================

if (notice) {

    notice.hidden =
        remembered();

}



// ============================================================
// ACKNOWLEDGE BUTTON
// ============================================================

const acknowledgeButton =
    document.querySelector(
        '[data-ack]'
    );


if (acknowledgeButton) {

    acknowledgeButton.addEventListener(
        'click',
        acknowledge
    );

}



// ============================================================
// OPEN PRIVACY DIALOG
// ============================================================

document
    .querySelectorAll(
        '[data-privacy]'
    )
    .forEach(
        button => {

            button.addEventListener(
                'click',
                () => {

                    if (!dialog) {

                        return;

                    }


                    previousFocus =
                        button;


                    dialog.showModal();

                }
            );

        }
    );



// ============================================================
// CLOSE PRIVACY DIALOG
// ============================================================

const closePrivacyButton =
    document.querySelector(
        '[data-close]'
    );


if (
    closePrivacyButton &&
    dialog
) {

    closePrivacyButton.addEventListener(
        'click',
        () => {

            dialog.close();

        }
    );

}



// ============================================================
// RESTORE FOCUS WHEN PRIVACY DIALOG CLOSES
// ============================================================

if (dialog) {

    dialog.addEventListener(
        'close',
        () => {

            if (
                previousFocus &&
                typeof previousFocus.focus ===
                'function'
            ) {

                previousFocus.focus();

            }

        }
    );

}



// ============================================================
// CLEAR SAVED PRIVACY NOTICE PREFERENCE
// ============================================================

const forgetButton =
    document.querySelector(
        '[data-forget]'
    );


if (forgetButton) {

    forgetButton.addEventListener(
        'click',
        () => {

            try {

                localStorage.removeItem(
                    cookieKey
                );

            }


            catch {

                // Local storage unavailable.

            }



            if (notice) {

                notice.hidden =
                    false;

            }



            const privacyStatus =
                document.getElementById(
                    'privacyStatus'
                );


            if (privacyStatus) {

                privacyStatus.textContent =
                    'Saved notice preference cleared. No optional trackers were active.';

            }



            updateBackToTop();

        }
    );

}



// ============================================================
// COOKIE STATE BETWEEN OPEN TABS
// ============================================================

window.addEventListener(
    'storage',
    event => {

        if (
            event.key !==
            cookieKey
        ) {

            return;

        }


        if (notice) {

            notice.hidden =
                remembered();

        }


        updateBackToTop();

    }
);



// ============================================================
// QUESTIONNAIRE FORM
// ============================================================

const form =
    document.getElementById(
        'enquiryForm'
    );


if (form) {

    const status =
        document.getElementById(
            'formStatus'
        );


    const submit =
        form.querySelector(
            '[type="submit"]'
        );


    let pending =
        false;



    form.addEventListener(
        'submit',
        async event => {

            event.preventDefault();



            if (
                pending ||
                !submit
            ) {

                return;

            }



            // =================================================
            // REQUIRE AT LEAST ONE SPACE
            // =================================================

            const firstSpace =
                form.querySelector(
                    '[name="spaces[]"]'
                );


            const selectedSpace =
                form.querySelector(
                    '[name="spaces[]"]:checked'
                );


            if (!selectedSpace) {

                if (status) {

                    status.className =
                        'error';


                    status.textContent =
                        'Please select at least one space.';

                }


                if (firstSpace) {

                    firstSpace.focus();

                }


                return;

            }



            // =================================================
            // LOCK FORM WHILE SENDING
            // =================================================

            pending =
                true;


            submit.disabled =
                true;



            if (status) {

                status.className =
                    '';


                status.textContent =
                    'Sending your questionnaire…';

            }



            const controller =
                new AbortController();


            const timer =
                setTimeout(
                    () => {

                        controller.abort();

                    },
                    20000
                );



            try {

                // =============================================
                // GET TEMPORARY SECURITY TOKEN
                // =============================================

                const start =
                    await fetch(
                        'api/enquiry.php',
                        {
                            method:
                                'GET',

                            credentials:
                                'same-origin',

                            cache:
                                'no-store',

                            signal:
                                controller.signal
                        }
                    );



                if (!start.ok) {

                    throw new Error(
                        'The form is temporarily unavailable. Please email farryn@clutterandco.co.za or eloise@clutterandco.co.za, or call us. Your answers remain here.'
                    );

                }



                const startResult =
                    await start.json();



                const token =
                    startResult.token;



                if (!token) {

                    throw new Error(
                        'Could not start a secure request. Please reload the page or email us directly.'
                    );

                }



                // =============================================
                // BUILD FORM DATA
                // =============================================

                const data =
                    new FormData(
                        form
                    );


                data.append(
                    'token',
                    token
                );



                // =============================================
                // SUBMIT FORM
                // =============================================

                const response =
                    await fetch(
                        'api/enquiry.php',
                        {
                            method:
                                'POST',

                            body:
                                data,

                            credentials:
                                'same-origin',

                            cache:
                                'no-store',

                            signal:
                                controller.signal
                        }
                    );



                let result;



                try {

                    result =
                        await response.json();

                }


                catch {

                    throw new Error(
                        'The form is temporarily unavailable. Please email farryn@clutterandco.co.za or eloise@clutterandco.co.za. Your answers remain here.'
                    );

                }



                if (
                    !response.ok ||
                    !result.ok
                ) {

                    throw new Error(
                        result.message ||
                        'Unable to send the questionnaire. Please email us directly. Your answers remain here.'
                    );

                }



                // =============================================
                // SUCCESS
                // =============================================

                if (status) {

                    status.className =
                        'success';


                    status.textContent =
                        'Your questionnaire has been accepted for delivery. If you do not hear back, please contact us directly.';

                }



                form.reset();

            }



            catch (error) {

                if (status) {

                    status.className =
                        'error';



                    if (
                        error.name ===
                        'AbortError'
                    ) {

                        status.textContent =
                            'The request timed out and delivery is unconfirmed. Please contact us before resending. Your answers remain here.';

                    }


                    else {

                        status.textContent =
                            error.message ||
                            'Something went wrong. Please contact us directly. Your answers remain here.';

                    }

                }

            }



            finally {

                clearTimeout(
                    timer
                );


                pending =
                    false;


                submit.disabled =
                    false;

            }

        }
    );

}



// ============================================================
// BACK TO TOP BUTTON
// ============================================================

const backToTop =
    document.createElement(
        'button'
    );


backToTop.type =
    'button';


backToTop.className =
    'back-to-top';


backToTop.setAttribute(
    'aria-label',
    'Back to top'
);


backToTop.title =
    'Back to top';


backToTop.textContent =
    '↑';


backToTop.hidden =
    true;


document.body.append(
    backToTop
);



// ============================================================
// POSITION / SHOW BACK TO TOP
// ============================================================

function updateBackToTop() {

    const menuOpen =
        document.body.classList.contains(
            'menu-open'
        );


    backToTop.hidden =
        window.scrollY <
        400 ||
        menuOpen;



    let noticeHeight =
        0;



    if (
        notice &&
        !notice.hidden
    ) {

        noticeHeight =
            notice
                .getBoundingClientRect()
                .height;

    }



    if (
        noticeHeight >
        0
    ) {

        backToTop.style.bottom =
            `${noticeHeight + 36}px`;

    }


    else {

        backToTop.style.bottom =
            '24px';

    }

}



// ============================================================
// BACK TO TOP CLICK
// ============================================================

backToTop.addEventListener(
    'click',
    () => {

        if (header) {

            header.classList.remove(
                'header-hidden'
            );

        }


        enforceHeaderTheme();



        const reducedMotion =
            window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches;



        window.scrollTo({
            top: 0,

            behavior:
                reducedMotion
                    ? 'auto'
                    : 'smooth'
        });



        const brand =
            document.querySelector(
                '.brand'
            );


        if (brand) {

            brand.focus({
                preventScroll:
                    true
            });

        }

    }
);



// ============================================================
// BACK TO TOP EVENTS
// ============================================================

window.addEventListener(
    'scroll',
    updateBackToTop,
    {
        passive: true
    }
);


window.addEventListener(
    'resize',
    updateBackToTop
);



// ============================================================
// WATCH COOKIE NOTICE HEIGHT
// ============================================================

if (
    notice &&
    'ResizeObserver' in window
) {

    const noticeResizeObserver =
        new ResizeObserver(
            updateBackToTop
        );


    noticeResizeObserver.observe(
        notice
    );

}



// ============================================================
// WATCH COOKIE NOTICE VISIBILITY
// ============================================================

if (
    notice &&
    'MutationObserver' in window
) {

    const noticeMutationObserver =
        new MutationObserver(
            updateBackToTop
        );


    noticeMutationObserver.observe(
        notice,
        {
            attributes:
                true,

            attributeFilter: [
                'hidden'
            ]
        }
    );

}



// ============================================================
// WATCH MOBILE MENU BODY STATE
// ============================================================

if (
    'MutationObserver' in window
) {

    const bodyMutationObserver =
        new MutationObserver(
            updateBackToTop
        );


    bodyMutationObserver.observe(
        document.body,
        {
            attributes:
                true,

            attributeFilter: [
                'class'
            ]
        }
    );

}



// ============================================================
// INITIAL BACK TO TOP STATE
// ============================================================

updateBackToTop();