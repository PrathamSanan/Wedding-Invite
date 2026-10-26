document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       BASIC SETUP
    ===================================================== */

    const $ = (selector) => document.querySelector(selector);

    const $$ = (selector) =>
        Array.from(document.querySelectorAll(selector));

    const isMobile =
        window.matchMedia("(max-width: 900px)").matches;

    const reducedMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const hasGSAP =
        typeof window.gsap !== "undefined";

    const hasScrollTrigger =
        typeof window.ScrollTrigger !== "undefined";


    if (hasGSAP && hasScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }


    /* =====================================================
       ENVELOPE INTRO
       Tap the wax seal -> seal cracks, flap opens, letter
       slides out, envelope drops away, letter zooms into
       the site. Fires "intro:open" (music) and "intro:done".
    ===================================================== */

    window.introDone = false;

    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const introEl = $("#intro");

    function finishIntro() {

        if (window.introDone) return;

        window.introDone = true;

        if (introEl) introEl.remove();

        document.body.classList.remove("intro-lock");

        window.scrollTo({ top: 0, left: 0, behavior: "instant" });

        if (hasScrollTrigger) ScrollTrigger.refresh();

        document.dispatchEvent(new CustomEvent("intro:done"));

    }

    function setupIntro() {

        window.__introReady = true;

        if (!introEl || !hasGSAP || reducedMotion) {

            if (introEl) introEl.remove();

            /* deferred so enhance.js (loaded after) can listen */
            setTimeout(finishIntro, 0);

            return;

        }

        const stage = $("#envStage");
        const floater = $("#envFloat");
        const flap = $("#envFlap");
        const card = $("#envCard");
        const back = $("#envBack");
        const front = $("#envFront");
        const seal = $("#seal");
        const sealWrap = $("#sealWrap");
        const sealL = $("#sealL");
        const sealR = $("#sealR");
        const hint = $("#introHint");
        const skip = $("#introSkip");
        const top = $(".intro-top");
        const fx = $("#introFx");

        /* ---------- ambient hearts + twinkles ---------- */

        const heartCount = isMobile ? 9 : 16;
        const heartColors = ["#e8657a", "#f4a3b5", "#dfb743", "#fce6ab"];

        for (let i = 0; i < heartCount; i++) {

            const h = document.createElement("span");

            h.className = "intro-heart";
            h.textContent = Math.random() > 0.3 ? "♥" : "✦";
            h.style.left = Math.random() * 100 + "%";
            h.style.fontSize = 9 + Math.random() * 16 + "px";
            h.style.color = heartColors[i % heartColors.length];
            h.style.setProperty("--d", 11 + Math.random() * 9 + "s");
            h.style.setProperty("--delay", -Math.random() * 16 + "s");
            h.style.setProperty("--o", (0.25 + Math.random() * 0.4).toFixed(2));
            h.style.setProperty("--sway", (Math.random() * 60 - 30).toFixed(0) + "px");

            fx.appendChild(h);

        }

        for (let i = 0; i < (isMobile ? 8 : 14); i++) {

            const t = document.createElement("span");

            t.className = "intro-twinkle";
            t.textContent = "✦";
            t.style.left = 4 + Math.random() * 92 + "%";
            t.style.top = 4 + Math.random() * 92 + "%";
            t.style.fontSize = 7 + Math.random() * 10 + "px";
            t.style.setProperty("--d", 2.4 + Math.random() * 2.6 + "s");
            t.style.setProperty("--delay", -Math.random() * 4 + "s");

            fx.appendChild(t);

        }

        /* ---------- initial state ---------- */

        gsap.set(flap, { rotationX: 0, zIndex: 4 });
        gsap.set(card, { yPercent: 0 });
        gsap.set(stage, { opacity: 0 });

        let opened = false;
        let bob = null;
        let wiggle = null;

        /* ---------- entrance ---------- */

        const fontsReady = (document.fonts && document.fonts.ready)
            ? Promise.race([
                document.fonts.ready,
                new Promise((r) => setTimeout(r, 1800))
            ])
            : Promise.resolve();

        fontsReady.then(() => {

            if (opened) return;

            const enter = gsap.timeline();

            enter
                .fromTo(stage,
                    { y: 70, scale: 0.9, opacity: 0 },
                    { y: 0, scale: 1, opacity: 1, duration: 1.3, ease: "power3.out" })
                .to(top, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, 0.2)
                .fromTo(top, { y: -16 }, { y: 0, duration: 1, ease: "power2.out" }, 0.2)
                .to(skip, { opacity: 0.85, duration: 0.8 }, 0.8)
                .to(hint, { opacity: 0.9, duration: 0.8 }, 1.1)
                .fromTo(seal, { scale: 0.4 }, { scale: 1, duration: 0.9, ease: "back.out(2.4)" }, 0.9);

            bob = gsap.to(floater, {
                y: -9,
                rotation: 0.6,
                duration: 2.2,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1
            });

            /* little "psst, tap me" wiggle every few seconds */
            wiggle = gsap.timeline({ repeat: -1, repeatDelay: 2.6, delay: 2.4 });

            wiggle
                .to(sealWrap, { rotation: -9, duration: 0.09 })
                .to(sealWrap, { rotation: 9, duration: 0.14 })
                .to(sealWrap, { rotation: -6, duration: 0.12 })
                .to(sealWrap, { rotation: 0, duration: 0.2, ease: "back.out(3)" })
                .to(sealWrap, { scale: 1.07, duration: 0.18, yoyo: true, repeat: 1 }, 0);

        });

        /* ---------- confetti of hearts + sparkles ---------- */

        function confetti(x, y, count, spread) {

            const glyphs = ["♥", "✦", "♥", "✧"];
            const colors = ["#e8657a", "#f4a3b5", "#fce6ab", "#dfb743", "#ffffff"];

            for (let i = 0; i < count; i++) {

                const el = document.createElement("span");

                el.className = "intro-confetti";
                el.textContent = glyphs[i % glyphs.length];
                el.style.left = x + "px";
                el.style.top = y + "px";
                el.style.fontSize = 9 + Math.random() * 15 + "px";
                el.style.color = colors[(Math.random() * colors.length) | 0];

                introEl.appendChild(el);

                const ang = Math.random() * Math.PI * 2;
                const dist = spread * (0.45 + Math.random() * 0.65);

                gsap.fromTo(el,
                    { x: -6, y: -6, scale: 0, opacity: 1, rotation: 0 },
                    {
                        x: Math.cos(ang) * dist,
                        y: Math.sin(ang) * dist - 30,
                        scale: 0.8 + Math.random() * 0.9,
                        rotation: (Math.random() - 0.5) * 220,
                        duration: 0.75 + Math.random() * 0.4,
                        ease: "power3.out"
                    }
                );

                gsap.to(el, {
                    y: "+=" + (60 + Math.random() * 60),
                    opacity: 0,
                    duration: 0.9,
                    delay: 0.7 + Math.random() * 0.3,
                    ease: "power1.in",
                    onComplete: () => el.remove()
                });

            }

        }

        /* ---------- opening sequence ---------- */

        function open() {

            if (opened) return;

            opened = true;

            document.dispatchEvent(new CustomEvent("intro:open"));

            if (bob) bob.kill();
            if (wiggle) wiggle.kill();

            seal.blur();

            seal.style.pointerEvents = "none";
            skip.style.pointerEvents = "none";

            const sealRect = seal.getBoundingClientRect();
            const cx = sealRect.left + sealRect.width / 2;
            const cy = sealRect.top + sealRect.height / 2;

            const cardW = card.offsetWidth || 300;
            const target = Math.min(window.innerWidth * 0.86, 540) / cardW;
            const cardScale = Math.max(1.05, Math.min(target, 1.55));

            const drop = window.innerHeight * 0.7;

            const tl = gsap.timeline({ onComplete: finishIntro });

            tl.to(floater, { y: 0, rotation: 0, duration: 0.5, ease: "power2.out" }, 0)
              .to([hint, skip], { opacity: 0, duration: 0.3 }, 0)
              .to(".intro-top", { opacity: 0, y: -14, duration: 0.6, ease: "power2.in" }, 0.1)

              /* seal presses in, then cracks */
              .to(sealWrap, { scale: 0.9, rotation: 0, duration: 0.14, ease: "power2.out" }, 0)
              .to(sealWrap, { scale: 1.16, duration: 0.16, ease: "power2.out" }, 0.14)
              .add(() => confetti(cx, cy, isMobile ? 16 : 26, Math.min(window.innerWidth * 0.32, 190)), 0.3)
              .to(sealL, { x: "-52%", y: "88%", rotation: -34, opacity: 0, duration: 0.7, ease: "power2.in" }, 0.3)
              .to(sealR, { x: "52%", y: "104%", rotation: 28, opacity: 0, duration: 0.7, ease: "power2.in" }, 0.3)
              .set(".seal-ring", { display: "none" }, 0.3)

              /* flap opens (swap depth once it passes vertical) */
              .to(flap, { rotationX: 180, duration: 1.15, ease: "power2.inOut" }, 0.4)
              .set(flap, { zIndex: 1 }, 0.98)

              /* letter slides out */
              .to(card, { yPercent: -60, rotation: -1.5, duration: 1.2, ease: "power3.inOut" }, 1.05)

              /* envelope falls away, revealing the whole letter */
              .to([front, back], { y: drop, opacity: 0, duration: 0.95, ease: "power3.in", stagger: 0.05 }, 2.35)
              .to(flap, { y: drop, opacity: 0, duration: 0.95, ease: "power3.in" }, 2.3)

              /* letter centres and grows */
              .to(card, { yPercent: 0, rotation: 0, scale: cardScale, duration: 1.15, ease: "power3.inOut" }, 2.45)
              .to(card, { boxShadow: "0 0 70px rgba(223,183,67,.45), 0 20px 50px rgba(0,0,0,.45)", duration: 1, ease: "power2.out" }, 2.8)
              .add(() => {
                  const r = card.getBoundingClientRect();
                  confetti(r.left + r.width / 2, r.top + r.height / 2, isMobile ? 14 : 22, Math.min(window.innerWidth * 0.4, 240));
              }, 3.35)

              /* hold, then zoom into the invitation */
              .to(card, { scale: cardScale * 2.4, opacity: 0, duration: 0.95, ease: "power3.in" }, 4.55)
              .to(introEl, { opacity: 0, duration: 0.8, ease: "power2.inOut" }, 4.7);

        }

        seal.addEventListener("click", open);

        /* clicking the envelope body also opens it */
        [front, back].forEach((el) => {
            el.style.pointerEvents = "auto";
            el.style.cursor = "pointer";
            el.addEventListener("click", open);
        });

        flap.style.pointerEvents = "auto";
        flap.style.cursor = "pointer";
        flap.addEventListener("click", open);

        skip.addEventListener("click", () => {

            if (opened) return;

            opened = true;

            document.dispatchEvent(new CustomEvent("intro:open"));

            if (bob) bob.kill();
            if (wiggle) wiggle.kill();

            gsap.to(introEl, {
                opacity: 0,
                duration: 0.55,
                ease: "power2.inOut",
                onComplete: finishIntro
            });

        });

    }

    setupIntro();


    /* =====================================================
       PARTICLES
       Fewer particles on mobile
    ===================================================== */

    const particleContainer = $(".particles");

    if (
        particleContainer &&
        hasGSAP &&
        !reducedMotion
    ) {

        const particleCount =
            isMobile ? 18 : 45;

        for (let i = 0; i < particleCount; i++) {

            const particle =
                document.createElement("div");

            particle.className = "particle";

            particle.style.left =
                Math.random() * 100 + "%";

            particle.style.top =
                Math.random() * 100 + "%";

            particle.style.opacity =
                0.1 + Math.random() * 0.45;

            particleContainer.appendChild(
                particle
            );

            gsap.to(particle, {

                y:
                    -40 -
                    Math.random() *
                    (isMobile ? 70 : 140),

                x:
                    (Math.random() - 0.5) *
                    (isMobile ? 40 : 100),

                opacity: 0.02,

                duration:
                    4 +
                    Math.random() * 5,

                repeat: -1,

                delay:
                    Math.random() * 4,

                ease: "sine.inOut"

            });

        }

    }


    /* =====================================================
       HERO ENTRY
       
       IMPORTANT:
       NO CONTINUOUS FLOATING ANIMATION
    ===================================================== */

    if (
        hasGSAP &&
        !reducedMotion
    ) {

        const heroTimeline =
            gsap.timeline({
                paused: true,
                delay: 0.15
            });


        heroTimeline

            .from(".eyebrow", {
                opacity: 0,
                y: 20,
                duration: 0.7
            })

            .from(
                ".hero-title",
                {
                    opacity: 0,
                    y: isMobile ? 25 : 45,
                    scale: 0.94,
                    duration: 1,
                    ease: "power4.out"
                },
                "-=0.25"
            )

            .from(
                ".hero .gold-line",
                {
                    scaleX: 0,
                    duration: 0.7
                },
                "-=0.4"
            )

            .from(
                ".hero-subtitle",
                {
                    opacity: 0,
                    y: 15,
                    duration: 0.6
                },
                "-=0.3"
            )

            .from(
                ".hero-date",
                {
                    opacity: 0,
                    y: 15,
                    duration: 0.6
                },
                "-=0.3"
            )

            .from(
                ".discover",
                {
                    opacity: 0,
                    y: 12,
                    duration: 0.5
                }
            );


        /* hero plays once the envelope has finished */

        if (window.introDone) {

            heroTimeline.play();

        } else {

            document.addEventListener(
                "intro:done",
                () => heroTimeline.play(),
                { once: true }
            );

        }


        /*
         * Orbit animation ONLY on desktop.
         * Disabled on mobile for performance.
         */

        if (!isMobile) {

            if ($(".orbit-one")) {

                gsap.to(".orbit-one", {
                    rotation: 360,
                    duration: 35,
                    repeat: -1,
                    ease: "none"
                });

            }

            if ($(".orbit-two")) {

                gsap.to(".orbit-two", {
                    rotation: -360,
                    duration: 25,
                    repeat: -1,
                    ease: "none"
                });

            }

        }

    }


    /* =====================================================
       GENERAL REVEAL ANIMATIONS
    ===================================================== */

    if (
        hasGSAP &&
        hasScrollTrigger &&
        !reducedMotion
    ) {

        $$(".reveal").forEach((element) => {

            gsap.from(element, {

                opacity: 0,

                y:
                    isMobile
                        ? 30
                        : 65,

                duration:
                    isMobile
                        ? 0.7
                        : 1,

                ease: "power3.out",

                scrollTrigger: {

                    trigger: element,

                    start:
                        isMobile
                            ? "top 92%"
                            : "top 85%",

                    toggleActions:
                        "play none none reverse"

                }

            });

        });

    }


    /* =====================================================
       STORY TIMELINE
       DESKTOP ONLY
    ===================================================== */

    if (
        hasGSAP &&
        hasScrollTrigger &&
        !reducedMotion &&
        !isMobile
    ) {

        if ($(".timeline-line span")) {

            gsap.to(
                ".timeline-line span",
                {
                    height: "100%",

                    scrollTrigger: {
                        trigger: ".story-timeline",
                        start: "top 65%",
                        end: "bottom 70%",
                        scrub: 1
                    }

                }
            );

        }


        const storyCards = [
            [".story-card-1", -160],
            [".story-card-2", 160],
            [".story-card-3", -160]
        ];


        storyCards.forEach(
            ([selector, x]) => {

                if (!$(selector)) return;

                gsap.fromTo(
                    selector,

                    {
                        x,
                        opacity: 0
                    },

                    {
                        x: 0,
                        opacity: 1,

                        scrollTrigger: {
                            trigger:
                                ".story-timeline",

                            start: "top 70%",

                            end: "bottom 35%",

                            scrub: 1
                        }

                    }
                );

            }
        );

    }


    /* =====================================================
       COUPLE ANIMATION
    ===================================================== */

    if (
        hasGSAP &&
        hasScrollTrigger &&
        !reducedMotion &&
        $(".couple-stage")
    ) {

        gsap.from(".person", {

            opacity: 0,

            y:
                isMobile
                    ? 50
                    : 90,

            stagger:
                isMobile
                    ? 0.15
                    : 0.25,

            duration:
                isMobile
                    ? 0.7
                    : 1,

            scrollTrigger: {

                trigger: ".couple-stage",

                start: "top 85%",

                toggleActions:
                    "play none none reverse"

            }

        });

    }


    /* =====================================================
       GALLERY PARALLAX
       DESKTOP ONLY
    ===================================================== */

    if (
        hasGSAP &&
        hasScrollTrigger &&
        !reducedMotion &&
        !isMobile &&
        $(".gallery")
    ) {

        const galleryAnimations = [
            [".gallery-1", -80],
            [".gallery-2", 100],
            [".gallery-3", -100],
            [".gallery-4", 80],
            [".gallery-5", -70],
            [".gallery-6", 70]
        ];


        galleryAnimations.forEach(
            ([selector, y]) => {

                if (!$(selector)) return;

                gsap.to(selector, {

                    y,

                    scrollTrigger: {

                        trigger: ".gallery",

                        start: "top bottom",

                        end: "bottom top",

                        scrub: 1

                    }

                });

            }
        );

    }


    /* =====================================================
       EVENTS
    ===================================================== */

    if (
        hasGSAP &&
        hasScrollTrigger &&
        !reducedMotion &&
        $(".events-timeline")
    ) {

        if ($(".events-line span")) {

            gsap.to(
                ".events-line span",
                {

                    height: "100%",

                    scrollTrigger: {

                        trigger:
                            ".events-timeline",

                        start: "top 70%",

                        end: "bottom 70%",

                        scrub: 1

                    }

                }
            );

        }


        $$(".event-card").forEach(
            (card) => {

                if (isMobile) {

                    gsap.from(card, {

                        opacity: 0,

                        y: 35,

                        duration: 0.7,

                        scrollTrigger: {

                            trigger: card,

                            start: "top 90%",

                            toggleActions:
                                "play none none reverse"

                        }

                    });

                } else {

                    const fromX =
                        card.classList.contains(
                            "event-left"
                        )
                            ? -80
                            : 80;


                    gsap.from(card, {

                        opacity: 0,

                        x: fromX,

                        duration: 0.9,

                        scrollTrigger: {

                            trigger: card,

                            start: "top 85%",

                            toggleActions:
                                "play none none reverse"

                        }

                    });

                }

            }
        );

    }


    /* =====================================================
       NAVBAR
    ===================================================== */

    const navbar = $(".navbar");

    const navLinks =
        $$(".nav-links a");

    const sections =
        $$("section[id]");


    function updateNavbar() {

        if (!navbar) return;

        navbar.classList.toggle(
            "scrolled",
            window.scrollY > 50
        );

    }


    window.addEventListener(
        "scroll",
        updateNavbar,
        {
            passive: true
        }
    );


    updateNavbar();


    /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

    function updateActiveNavigation() {

        if (!sections.length) return;

        let currentSection = "";

        const position =
            window.scrollY + 180;


        sections.forEach((section) => {

            if (
                position >=
                section.offsetTop
            ) {

                currentSection =
                    section.id;

            }

        });


        navLinks.forEach((link) => {

            link.classList.remove(
                "active"
            );

            const href =
                link.getAttribute("href");


            if (
                href ===
                "#" + currentSection
            ) {

                link.classList.add(
                    "active"
                );

            }

        });

    }


    window.addEventListener(
        "scroll",
        updateActiveNavigation,
        {
            passive: true
        }
    );


    updateActiveNavigation();


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const menuButton =
        $("#menuButton");

    const mobileMenu =
        $("#mobileMenu");


    function setMobileMenu(open) {

        if (!mobileMenu) return;

        mobileMenu.classList.toggle(
            "open",
            open
        );

        document.body.classList.toggle(
            "menu-open",
            open
        );


        if (menuButton) {

            menuButton.setAttribute(
                "aria-expanded",
                String(open)
            );

        }

    }


    if (
        menuButton &&
        mobileMenu
    ) {

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );


        menuButton.addEventListener(
            "click",
            () => {

                const isOpen =
                    mobileMenu.classList.contains(
                        "open"
                    );

                setMobileMenu(
                    !isOpen
                );

            }
        );


        mobileMenu
            .querySelectorAll("a")
            .forEach((link) => {

                link.addEventListener(
                    "click",
                    () => {

                        setMobileMenu(
                            false
                        );

                    }
                );

            });

    }


    /* =====================================================
       SMOOTH NAVIGATION
    ===================================================== */

    $$(".nav-links a, .mobile-menu a")
        .forEach((link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const href =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !href ||
                        !href.startsWith("#")
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            href
                        );


                    if (!target) return;


                    event.preventDefault();

                    setMobileMenu(false);


                    const top =
                        target.getBoundingClientRect()
                            .top +
                        window.scrollY -
                        (
                            isMobile
                                ? 75
                                : 30
                        );


                    window.scrollTo({

                        top: Math.max(
                            0,
                            top
                        ),

                        behavior: "smooth"

                    });

                }
            );

        });


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                "Escape"
            ) {

                setMobileMenu(false);

                closeLightbox();

                closeRSVP();

            }

        }
    );


    /* =====================================================
       SCROLL PROGRESS
    ===================================================== */

    const progressBar =
        $(".scroll-progress span");


    function updateScrollProgress() {

        if (!progressBar) return;


        const total =
            document.documentElement
                .scrollHeight -
            window.innerHeight;


        if (total <= 0) {

            progressBar.style.height =
                "0%";

            return;

        }


        const percentage =
            (
                window.scrollY /
                total
            ) * 100;


        progressBar.style.height =
            Math.min(
                100,
                Math.max(
                    0,
                    percentage
                )
            ) + "%";

    }


    window.addEventListener(
        "scroll",
        updateScrollProgress,
        {
            passive: true
        }
    );


    updateScrollProgress();


    /* =====================================================
       BACK TO TOP
    ===================================================== */

    const topButton =
        $("#topButton");


    function updateTopButton() {

        if (!topButton) return;

        topButton.classList.toggle(
            "visible",
            window.scrollY > 600
        );

    }


    if (topButton) {

        topButton.addEventListener(
            "click",
            () => {

                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            }
        );

    }


    window.addEventListener(
        "scroll",
        updateTopButton,
        {
            passive: true
        }
    );


    updateTopButton();


    /* =====================================================
       COUNTDOWN
       
       WEDDING:
       04 DECEMBER 2026
       08:30 PM IST
    ===================================================== */

    const days =
        $("#days");

    const hours =
        $("#hours");

    const minutes =
        $("#minutes");

    const seconds =
        $("#seconds");

    const todayMessage =
        $("#todayMessage");


    const weddingDate =
        new Date(
            "2026-12-04T20:30:00+05:30"
        );


    function updateCountdown() {

        const now =
            new Date();


        let difference =
            weddingDate.getTime() -
            now.getTime();


        if (difference < 0) {

            difference = 0;

        }


        const totalSeconds =
            Math.floor(
                difference / 1000
            );


        const d =
            Math.floor(
                totalSeconds /
                86400
            );


        const h =
            Math.floor(
                (
                    totalSeconds %
                    86400
                ) / 3600
            );


        const m =
            Math.floor(
                (
                    totalSeconds %
                    3600
                ) / 60
            );


        const s =
            totalSeconds % 60;


        if (days) {

            days.textContent =
                String(d).padStart(
                    3,
                    "0"
                );

        }


        if (hours) {

            hours.textContent =
                String(h).padStart(
                    2,
                    "0"
                );

        }


        if (minutes) {

            minutes.textContent =
                String(m).padStart(
                    2,
                    "0"
                );

        }


        if (seconds) {

            seconds.textContent =
                String(s).padStart(
                    2,
                    "0"
                );

        }


        if (
            todayMessage &&
            difference <= 0
        ) {

            todayMessage.style.display =
                "flex";

        }

    }


    updateCountdown();


    setInterval(
        updateCountdown,
        1000
    );


    /* =====================================================
       LIGHTBOX
    ===================================================== */

    const galleryItems =
        $$(".gallery-item");

    const lightbox =
        $("#lightbox");

    const lightboxImage =
        $("#lightboxImage");

    const lightboxClose =
        $("#lightboxClose");

    const lightboxPrev =
        $("#lightboxPrev");

    const lightboxNext =
        $("#lightboxNext");


    let currentPhoto = 0;


    const galleryPhotos =
        galleryItems.map(
            (item) => {

                const image =
                    item.querySelector(
                        "img"
                    );

                return (
                    item.dataset.photo ||
                    image?.getAttribute(
                        "src"
                    ) ||
                    ""
                );

            }
        );


    function openLightbox(index) {

        if (
            !lightbox ||
            !lightboxImage ||
            !galleryPhotos.length
        ) return;


        currentPhoto =
            (
                index +
                galleryPhotos.length
            ) %
            galleryPhotos.length;


        lightboxImage.src =
            galleryPhotos[
                currentPhoto
            ];


        lightbox.classList.add(
            "open"
        );

        document.body.classList.add(
            "lightbox-open"
        );

    }


    function closeLightbox() {

        if (!lightbox) return;

        lightbox.classList.remove(
            "open"
        );

        document.body.classList.remove(
            "lightbox-open"
        );

    }


    function changePhoto(index) {

        if (
            !lightboxImage ||
            !galleryPhotos.length
        ) return;


        currentPhoto =
            (
                index +
                galleryPhotos.length
            ) %
            galleryPhotos.length;


        lightboxImage.src =
            galleryPhotos[
                currentPhoto
            ];

    }


    galleryItems.forEach(
        (item, index) => {

            item.addEventListener(
                "click",
                () => {

                    openLightbox(
                        index
                    );

                }
            );

        }
    );


    if (lightboxClose) {

        lightboxClose.addEventListener(
            "click",
            closeLightbox
        );

    }


    if (lightboxPrev) {

        lightboxPrev.addEventListener(
            "click",
            () => {

                changePhoto(
                    currentPhoto - 1
                );

            }
        );

    }


    if (lightboxNext) {

        lightboxNext.addEventListener(
            "click",
            () => {

                changePhoto(
                    currentPhoto + 1
                );

            }
        );

    }


    if (lightbox) {

        lightbox.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    lightbox
                ) {

                    closeLightbox();

                }

            }
        );

    }


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                !lightbox ||
                !lightbox.classList.contains(
                    "open"
                )
            ) {
                return;
            }


            if (
                event.key ===
                "ArrowRight"
            ) {

                changePhoto(
                    currentPhoto + 1
                );

            }


            if (
                event.key ===
                "ArrowLeft"
            ) {

                changePhoto(
                    currentPhoto - 1
                );

            }

        }
    );


    /* =====================================================
       GOOGLE MAPS
    ===================================================== */

    const mapButton =
        $("#mapBtn");


    if (mapButton) {

        mapButton.addEventListener(
            "click",
            () => {

                const location =
                    encodeURIComponent(
                        "De'Vansh's Resort, Ambala Cantt, Haryana"
                    );


                window.open(

                    "https://www.google.com/maps/search/?api=1&query=" +
                    location,

                    "_blank",

                    "noopener,noreferrer"

                );

            }
        );

    }


    /* =====================================================
       RSVP MODAL
    ===================================================== */

    const rsvpButton =
        $("#rsvpBtn");

    const rsvpModal =
        $("#rsvpModal");

    const rsvpClose =
        $("#rsvpModalClose");

    const rsvpForm =
        $("#rsvpForm");


    function openRSVP() {

        if (!rsvpModal) return;

        rsvpModal.classList.add(
            "open"
        );

        document.body.classList.add(
            "modal-open"
        );

        setTimeout(
            () => {

                $("#guestName")?.focus();

            },
            100
        );

    }


    function closeRSVP() {

        if (!rsvpModal) return;

        rsvpModal.classList.remove(
            "open"
        );

        document.body.classList.remove(
            "modal-open"
        );

    }


    if (rsvpButton) {

        rsvpButton.addEventListener(
            "click",
            openRSVP
        );

    }


    if (rsvpClose) {

        rsvpClose.addEventListener(
            "click",
            closeRSVP
        );

    }


    if (rsvpModal) {

        rsvpModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    rsvpModal
                ) {

                    closeRSVP();

                }

            }
        );

    }


    if (rsvpForm) {

        rsvpForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();


                const name =
                    $("#guestName")
                        ?.value
                        ?.trim() ||
                    "Guest";


                const count =
                    $("#guestCount")
                        ?.value
                        ?.trim() ||
                    "1";


                const note =
                    $("#guestMessage")
                        ?.value
                        ?.trim() ||
                    "Looking forward to celebrating with you!";


                const message =
                    `Namaskar! ❤️ My name is *${name}*. ` +
                    `I am confirming my presence (${count}) ` +
                    `at Vishal & Akshita's wedding on ` +
                    `4 December 2026.\n\n` +
                    `Note: ${note}`;


                window.open(

                    "https://wa.me/917206367728?text=" +
                    encodeURIComponent(
                        message
                    ),

                    "_blank",

                    "noopener,noreferrer"

                );


                closeRSVP();

            }
        );

    }


    /* =====================================================
       WHATSAPP BUTTON
    ===================================================== */

    const whatsappButton =
        $("#whatsappBtn");


    if (whatsappButton) {

        whatsappButton.addEventListener(
            "click",
            () => {

                const message =
                    "Namaskar Sanan Family! ❤️ " +
                    "Excited to be a part of your " +
                    "wedding celebration on 4 December 2026.";


                window.open(

                    "https://wa.me/917206367728?text=" +
                    encodeURIComponent(
                        message
                    ),

                    "_blank",

                    "noopener,noreferrer"

                );

            }
        );

    }


    /* =====================================================
       MUSIC
    ===================================================== */

    const musicButton =
        $("#musicButton");

    const music =
        $("#weddingMusic");


    let musicPlaying = false;

    let userPaused = false;


    function updateMusicUI() {

        if (!musicButton) return;

        musicButton.textContent =
            musicPlaying
                ? "Ⅱ"
                : "♪";

        musicButton.classList.toggle(
            "playing",
            musicPlaying
        );

        musicButton.setAttribute(
            "aria-pressed",
            String(musicPlaying)
        );

    }


    async function playMusic() {

        if (!music) return;

        try {

            await music.play();

            musicPlaying = true;

            updateMusicUI();

        } catch (error) {

            musicPlaying = false;

            updateMusicUI();

        }

    }


    function pauseMusic() {

        if (!music) return;

        music.pause();

        musicPlaying = false;

        updateMusicUI();

    }


    if (
        musicButton &&
        music
    ) {

        musicButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                if (musicPlaying) {

                    userPaused = true;

                    pauseMusic();

                } else {

                    userPaused = false;

                    playMusic();

                }

            }
        );


        /*
         * Tapping the wax seal is the user's first gesture,
         * so the browser lets the melody start right there.
         */

        document.addEventListener(
            "intro:open",
            () => {

                if (!userPaused) {

                    playMusic();

                }

            }
        );


        /*
         * Fallback for visitors who never see the intro:
         * start on the first interaction, but never override
         * a pause the visitor chose themselves.
         */

        const startMusic =
            () => {

                if (
                    !musicPlaying &&
                    !userPaused &&
                    window.introDone
                ) {

                    playMusic();

                }

            };


        document.addEventListener(
            "touchend",
            startMusic,
            {
                once: true,
                passive: true
            }
        );


        document.addEventListener(
            "click",
            startMusic,
            {
                once: true
            }
        );


        music.addEventListener(
            "play",
            () => {

                musicPlaying = true;

                updateMusicUI();

            }
        );


        music.addEventListener(
            "pause",
            () => {

                musicPlaying = false;

                updateMusicUI();

            }
        );

    }


    /* =====================================================
       SHARE BUTTON
    ===================================================== */

    const shareButton =
        $("#shareButton");


    if (shareButton) {

        shareButton.addEventListener(
            "click",
            async () => {

                const shareData = {

                    title:
                        "Vishal & Akshita — Wedding",

                    text:
                        "You are invited to celebrate " +
                        "Vishal & Akshita's wedding. ❤️",

                    url:
                        window.location.href

                };


                if (
                    navigator.share
                ) {

                    try {

                        await navigator.share(
                            shareData
                        );

                    } catch (error) {

                        /*
                         * User cancelled sharing.
                         */

                    }

                } else {

                    try {

                        await navigator
                            .clipboard
                            .writeText(
                                window.location.href
                            );


                        const oldText =
                            shareButton.textContent;


                        shareButton.textContent =
                            "✓";


                        setTimeout(
                            () => {

                                shareButton.textContent =
                                    oldText;

                            },
                            1500
                        );

                    } catch (error) {

                        console.warn(
                            "Clipboard unavailable."
                        );

                    }

                }

            }
        );

    }


    /* =====================================================
       MAGNETIC BUTTONS
       DESKTOP ONLY
    ===================================================== */

    if (
        hasGSAP &&
        !isMobile &&
        !reducedMotion
    ) {

        $$(".magnetic").forEach(
            (button) => {

                button.addEventListener(
                    "mousemove",
                    (event) => {

                        const rect =
                            button.getBoundingClientRect();


                        const x =
                            event.clientX -
                            (
                                rect.left +
                                rect.width / 2
                            );


                        const y =
                            event.clientY -
                            (
                                rect.top +
                                rect.height / 2
                            );


                        gsap.to(button, {

                            x:
                                x * 0.15,

                            y:
                                y * 0.15,

                            duration:
                                0.25,

                            ease:
                                "power2.out"

                        });

                    }
                );


                button.addEventListener(
                    "mouseleave",
                    () => {

                        gsap.to(button, {

                            x: 0,

                            y: 0,

                            duration: 0.4,

                            ease:
                                "power3.out"

                        });

                    }
                );

            }
        );

    }


    /* =====================================================
       CUSTOM CURSOR
       DESKTOP ONLY
    ===================================================== */

    if (
        !isMobile &&
        !reducedMotion
    ) {

        const cursorDot =
            $(".cursor-dot");

        const cursorRing =
            $(".cursor-ring");


        if (
            cursorDot &&
            cursorRing
        ) {

            let mouseX = 0;
            let mouseY = 0;

            let ringX = 0;
            let ringY = 0;


            window.addEventListener(
                "mousemove",
                (event) => {

                    mouseX =
                        event.clientX;

                    mouseY =
                        event.clientY;


                    cursorDot.style.left =
                        mouseX + "px";

                    cursorDot.style.top =
                        mouseY + "px";

                }
            );


            function animateCursor() {

                ringX +=
                    (
                        mouseX -
                        ringX
                    ) * 0.15;


                ringY +=
                    (
                        mouseY -
                        ringY
                    ) * 0.15;


                cursorRing.style.left =
                    ringX + "px";

                cursorRing.style.top =
                    ringY + "px";


                requestAnimationFrame(
                    animateCursor
                );

            }


            animateCursor();


            $$(
                "a, button, .gallery-item, .event-card, .portrait"
            ).forEach(
                (element) => {

                    element.addEventListener(
                        "mouseenter",
                        () => {

                            cursorRing.classList.add(
                                "cursor-active"
                            );

                        }
                    );


                    element.addEventListener(
                        "mouseleave",
                        () => {

                            cursorRing.classList.remove(
                                "cursor-active"
                            );

                        }
                    );

                }
            );

        }

    }


    /* =====================================================
       TOUCH DEVICE
    ===================================================== */

    document.addEventListener(
        "touchstart",
        () => {

            document.body.classList.add(
                "touch-device"
            );

        },
        {
            once: true,
            passive: true
        }
    );


    /* =====================================================
       GSAP REFRESH
    ===================================================== */

    if (hasScrollTrigger) {

        window.addEventListener(
            "load",
            () => {

                ScrollTrigger.refresh();

            }
        );


        let resizeTimer;


        window.addEventListener(
            "resize",
            () => {

                clearTimeout(
                    resizeTimer
                );


                resizeTimer =
                    setTimeout(
                        () => {

                            ScrollTrigger.refresh();

                            updateScrollProgress();

                            updateActiveNavigation();

                        },
                        250
                    );

            }
        );

    }


    /* =====================================================
       FINAL INITIALIZATION
    ===================================================== */

    updateNavbar();

    updateTopButton();

    updateScrollProgress();

    updateActiveNavigation();

});