document.addEventListener('DOMContentLoaded', () => {
    const clockElement = document.getElementById('clock-display');
    let calendarRendered = false;

    const updateTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}`;

        // Only render calendar once unless the day changes
        if (!calendarRendered) {
            renderCalendar(now);
            calendarRendered = true;
        }

        // Re-render if midnight crosses
        if (hours === '00' && minutes === '00' && new Date().getSeconds() === 0) {
            renderCalendar(now);
        }

        // Dynamic Background Gradient based on hour
        updateBackgroundGradient(now.getHours());
    };

    function renderCalendar(date) {
        const monthYearEl = document.getElementById('calendar-month-year');
        const gridEl = document.getElementById('calendar-grid');
        if (!monthYearEl || !gridEl) return;

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        monthYearEl.textContent = `${months[date.getMonth()]} ${date.getFullYear()}`;

        gridEl.innerHTML = '';

        const year = date.getFullYear();
        const month = date.getMonth();
        const todayDir = date.getDate();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'empty-day');
            gridEl.appendChild(emptyCell);
        }

        // Days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');

            const numSpan = document.createElement('span');
            numSpan.textContent = i;
            dayCell.appendChild(numSpan);

            // Highlight today
            if (i === todayDir) {
                dayCell.classList.add('today');
            }

            gridEl.appendChild(dayCell);
        }
    }

    setInterval(updateTime, 1000);
    updateTime();

    const bgLayer = document.getElementById('bg-layer');
    const panels = document.querySelectorAll('.tilt-panel');

    document.addEventListener('mousemove', (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 50;

        bgLayer.style.transform = `translate(${xAxis}px, ${yAxis}px)`;

        panels.forEach(panel => {
            const rect = panel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            panel.style.setProperty('--mouse-x', `${x}px`);
            panel.style.setProperty('--mouse-y', `${y}px`);

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;

            const rotateX = (mouseY / (rect.height / 2)) * -4;
            const rotateY = (mouseX / (rect.width / 2)) * 4;

            if (e.clientX > rect.left - 100 && e.clientX < rect.right + 100 &&
                e.clientY > rect.top - 100 && e.clientY < rect.bottom + 100) {
                panel.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                panel.style.zIndex = '10';
            } else {
                panel.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                panel.style.zIndex = '1';
            }
        });
    });

    document.addEventListener('mouseleave', () => {
        panels.forEach(panel => {
            panel.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            panel.style.zIndex = '1';
        });
        bgLayer.style.transform = `translate(0px, 0px)`;
    });

    function updateBackgroundGradient(hour) {
        let gradient;
        if (hour >= 6 && hour < 18) {
            gradient = 'radial-gradient(circle at 50% 50%, #3a0d28 0%, #15030E 100%)';
        } else {
            gradient = 'radial-gradient(circle at 50% 50%, #200716 0%, #0a0106 100%)';
        }
        bgLayer.style.background = gradient;
    }
});

/* ── Pixel Character Interaction ── */
(function () {
    const el = document.getElementById('pixel-character');
    if (!el) return;
    const img = el.querySelector('img');

    const SPRITES = {
        idle: 'assets/character-idle.png',
        drag: 'assets/character-drag.png',
        fall: 'assets/character-fall.png'
    };

    // Home position – computed once on load as left/top pixel values
    // so the character always returns to exactly the same spot.
    const HOME_RIGHT = 28;
    const HOME_BOTTOM = 0;
    let homeLeft, homeTop;

    function computeHome() {
        homeLeft = window.innerWidth - HOME_RIGHT - el.offsetWidth;
        homeTop  = window.innerHeight - HOME_BOTTOM - el.offsetHeight;
    }
    let resizeTimer = null;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            computeHome();
            if (!isDragging) {
                el.style.transition = 'left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                el.style.left = homeLeft + 'px';
                el.style.top  = homeTop  + 'px';
                setTimeout(function () { el.style.transition = ''; }, 650);
            }
        }, 300);
    });

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    el.style.position = 'fixed';

    window.addEventListener('load', function () {
        computeHome();
        el.style.left = homeLeft + 'px';
        el.style.top  = homeTop  + 'px';
    });

    // Start in idle state
    setState('idle');

    function setState(state) {
        el.className = '';
        el.classList.add('state-' + state);
        img.src = SPRITES[state];
    }

    function getHomePosition() {
        return { left: homeLeft, top: homeTop };
    }

    function resetToHome() {
        el.style.position = 'fixed';
        el.style.left   = homeLeft + 'px';
        el.style.top    = homeTop  + 'px';
        el.style.right  = 'auto';
        el.style.bottom = 'auto';
    }

    /* ── Drag Start ── */
    function onDragStart(clientX, clientY) {
        const rect = el.getBoundingClientRect();
        const clickY = clientY - rect.top;

        // Only allow grabbing from the top half
        if (clickY > rect.height / 2) return;

        isDragging = true;
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;

        // Switch to absolute-like fixed positioning using left/top
        el.style.right = 'auto';
        el.style.bottom = 'auto';
        el.style.left = rect.left + 'px';
        el.style.top = rect.top + 'px';
        el.style.transition = 'none';

        setState('drag');
    }

    /* ── Drag Move ── */
    function onDragMove(clientX, clientY) {
        if (!isDragging) return;
        el.style.left = (clientX - offsetX) + 'px';
        el.style.top = (clientY - offsetY) + 'px';
    }

    /* ── Drag End ── */
    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;

        // 1. Pin element at its current drop position using left/top
        const rect = el.getBoundingClientRect();
        el.style.right = 'auto';
        el.style.bottom = 'auto';
        el.style.left = rect.left + 'px';
        el.style.top = rect.top + 'px';
        el.style.transition = 'none';

        // 2. Switch to fall sprite
        img.src = SPRITES.fall;

        // 3. Remove fall class, force reflow, then re-add to guarantee animation restarts
        el.classList.remove('state-drag', 'state-fall', 'state-idle', 'state-return');
        void el.offsetHeight; // force reflow
        el.classList.add('state-fall');

        // 4. Clear any lingering inline styles on img from previous cycles
        img.style.animation = '';
        img.style.transform = '';
        img.style.opacity = '';

        // 5. Listen for animation end (one-shot) then return home
        function onFallDone() {
            img.removeEventListener('animationend', onFallDone);

            // Brief pause before returning home
            setTimeout(function () {
                const home = getHomePosition();

                // Switch to idle sprite for the return journey
                img.src = SPRITES.idle;
                img.style.animation = 'none';
                img.style.transform = '';
                img.style.opacity = '';

                // Apply return transition class
                el.classList.remove('state-fall');
                void el.offsetHeight; // force reflow before transition
                el.classList.add('state-return');

                // Set destination to home
                el.style.left = home.left + 'px';
                el.style.top = home.top + 'px';

                // After transition completes, snap back to CSS fixed positioning
                function onReturnDone() {
                    el.removeEventListener('transitionend', onReturnDone);
                    el.classList.remove('state-return');
                    el.style.transition = '';
                    img.style.animation = '';
                    resetToHome();
                    setState('idle');
                }
                el.addEventListener('transitionend', onReturnDone, { once: true });

                // Safety fallback in case transitionend doesn't fire (e.g. already at home)
                setTimeout(function () {
                    if (el.classList.contains('state-return')) {
                        onReturnDone();
                    }
                }, 600);
            }, 400);
        }
        img.addEventListener('animationend', onFallDone, { once: true });
    }

    /* ── Mouse Events ── */
    el.addEventListener('mousedown', function (e) {
        e.preventDefault();
        onDragStart(e.clientX, e.clientY);
    });

    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            e.preventDefault();
            onDragMove(e.clientX, e.clientY);
        }
    });

    document.addEventListener('mouseup', function () {
        onDragEnd();
    });

    /* ── Touch Events ── */
    el.addEventListener('touchstart', function (e) {
        const touch = e.touches[0];
        onDragStart(touch.clientX, touch.clientY);
    }, { passive: true });

    document.addEventListener('touchmove', function (e) {
        if (isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            onDragMove(touch.clientX, touch.clientY);
        }
    }, { passive: false });

    document.addEventListener('touchend', function () {
        onDragEnd();
    });
})();

/* ── Void Universe Mode ── */
(function () {
    const trigger = document.getElementById('c137-trigger');
    if (!trigger) return;

    let voidActive = false;
    let canvas = null;
    let ctx = null;
    let charEl = null;
    let animFrameId = null;
    let stars = [];
    const STAR_COUNT = 400;

    // Star factory
    function createStars(width, height) {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: 0.5 + Math.random() * 1.5,
                baseAlpha: 0.3 + Math.random() * 0.7,
                twinkleSpeed: 0.002 + Math.random() * 0.006,
                twinkleOffset: Math.random() * Math.PI * 2,
                driftX: (Math.random() - 0.5) * 0.15,
                driftY: (Math.random() - 0.5) * 0.08,
                depth: 0.3 + Math.random() * 0.7  // parallax depth factor
            });
        }
    }

    // Draw nebula background
    function drawNebula(ctx, w, h, time) {
        // Deep purple nebula — top-left
        const g1 = ctx.createRadialGradient(w * 0.25, h * 0.35, 0, w * 0.25, h * 0.35, w * 0.5);
        const pulse1 = 0.04 + Math.sin(time * 0.0003) * 0.015;
        g1.addColorStop(0, `rgba(25, 5, 40, ${pulse1})`);
        g1.addColorStop(0.5, `rgba(15, 3, 25, ${pulse1 * 0.5})`);
        g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, w, h);

        // Deep teal nebula — bottom-right
        const g2 = ctx.createRadialGradient(w * 0.75, h * 0.7, 0, w * 0.75, h * 0.7, w * 0.45);
        const pulse2 = 0.035 + Math.sin(time * 0.0004 + 1.5) * 0.012;
        g2.addColorStop(0, `rgba(5, 20, 25, ${pulse2})`);
        g2.addColorStop(0.5, `rgba(3, 12, 18, ${pulse2 * 0.5})`);
        g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, w, h);

        // Very faint warm accent — center
        const g3 = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.35);
        const pulse3 = 0.02 + Math.sin(time * 0.00025 + 3) * 0.008;
        g3.addColorStop(0, `rgba(30, 5, 20, ${pulse3})`);
        g3.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = g3;
        ctx.fillRect(0, 0, w, h);
    }

    // Draw stars with drift and twinkle
    function drawStars(ctx, w, h, time) {
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];

            // Drift movement
            s.x += s.driftX * s.depth;
            s.y += s.driftY * s.depth;

            // Wrap around edges
            if (s.x < -5) s.x = w + 5;
            if (s.x > w + 5) s.x = -5;
            if (s.y < -5) s.y = h + 5;
            if (s.y > h + 5) s.y = -5;

            // Twinkle
            const alpha = s.baseAlpha * (0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset));

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        }
    }

    // Draw a 4-pointed sparkle shape at (cx, cy) with given size
    function drawSparkle(ctx, cx, cy, height, width) {
        var hw = width / 2;
        var hh = height / 2;
        // Pinch factor — how thin the waist is (smaller = sharper points)
        var pinch = 0.18;

        ctx.beginPath();
        // Top point
        ctx.moveTo(cx, cy - hh);
        // Curve to right point
        ctx.quadraticCurveTo(cx + hw * pinch, cy - hh * pinch, cx + hw, cy);
        // Curve to bottom point
        ctx.quadraticCurveTo(cx + hw * pinch, cy + hh * pinch, cx, cy + hh);
        // Curve to left point
        ctx.quadraticCurveTo(cx - hw * pinch, cy + hh * pinch, cx - hw, cy);
        // Curve back to top point
        ctx.quadraticCurveTo(cx - hw * pinch, cy - hh * pinch, cx, cy - hh);
        ctx.closePath();
        ctx.fill();
    }

    // Draw the special fixed sparkle cluster
    function drawSpecialStar(ctx, w, h) {
        var cx = w * 0.70;
        var cy = h * 0.18;

        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowBlur = 14;

        // Main sparkle — 20px tall, 14px wide (vertical elongated)
        drawSparkle(ctx, cx, cy, 20, 14);

        // Secondary sparkle — 40% size, offset upper-right
        ctx.shadowBlur = 8;
        drawSparkle(ctx, cx + 16, cy - 12, 8, 5.6);

        ctx.restore();
    }

    // Animation loop
    function animate(time) {
        if (!ctx || !canvas) return;
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);
        drawNebula(ctx, w, h, time);
        drawStars(ctx, w, h, time);
        drawSpecialStar(ctx, w, h);

        animFrameId = requestAnimationFrame(animate);
    }

    // Handle resize
    function onResize() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createStars(canvas.width, canvas.height);
    }

    // Enter void
    function enterVoid() {
        if (voidActive) return;
        voidActive = true;

        // Create canvas
        canvas = document.createElement('canvas');
        canvas.id = 'void-canvas';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');

        createStars(canvas.width, canvas.height);

        // Create character
        charEl = document.createElement('div');
        charEl.id = 'void-character';
        const img = document.createElement('img');
        img.src = 'assets/character-void.png';
        img.alt = 'void character';
        img.draggable = false;
        charEl.appendChild(img);
        document.body.appendChild(charEl);

        // Listen for click to exit — prevent any movement artifacts
        charEl.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            exitVoid();
        });
        charEl.addEventListener('mousedown', function (e) {
            e.preventDefault();
            e.stopPropagation();
        });

        // Start animation
        animFrameId = requestAnimationFrame(animate);

        // Resize handler
        window.addEventListener('resize', onResize);

        // Hide scrollbar for the entire void lifecycle (including exit fade)
        document.body.style.overflow = 'hidden';

        // Trigger transitions — use rAF to ensure elements are in DOM first
        requestAnimationFrame(function () {
            document.body.classList.add('void-active');
            canvas.classList.add('visible');
            charEl.classList.add('visible');
        });
    }

    // Exit void
    function exitVoid() {
        if (!voidActive) return;
        voidActive = false;

        // Start exit transitions
        document.body.classList.remove('void-active');
        if (canvas) canvas.classList.remove('visible');
        if (charEl) charEl.classList.remove('visible');

        // After transition ends, clean up DOM
        setTimeout(function () {
            if (animFrameId) {
                cancelAnimationFrame(animFrameId);
                animFrameId = null;
            }

            if (canvas && canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
            canvas = null;
            ctx = null;

            if (charEl && charEl.parentNode) {
                charEl.parentNode.removeChild(charEl);
            }
            charEl = null;

            stars = [];
            window.removeEventListener('resize', onResize);
            document.body.style.overflow = '';
        }, 850); // slightly longer than the 800ms transition
    }

    // Attach trigger
    trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        if (voidActive) return;
        enterVoid();
    });
})();

/* ── Frog Rain Widget ── */
(function () {
    const widget = document.getElementById('frog-panel');
    const img = document.getElementById('frog-img');
    const canvas = document.getElementById('rain-canvas');
    const ctx = canvas.getContext('2d');
    let rainActive = false;
    let animationId = null;

    // ── Audio state ──
    let audioCtx = null;
    let masterGain = null;
    let noiseSources = [];
    let tapInterval = null;

    // ── Rain drops ──
    const DROP_COUNT = 120;
    const drops = [];

    function createDrop() {
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight * 1.2 - window.innerHeight * 0.2,
            speed: 5 + Math.random() * 7,
            width: 2 + Math.random() * 1,          // 2–3px
            height: 12 + Math.random() * 8,         // 12–20px
            opacity: 0.35 + Math.random() * 0.15,   // 0.35–0.5
            drift: 0.8 + Math.random() * 0.6        // slight right angle
        };
    }

    function initDrops() {
        drops.length = 0;
        for (let i = 0; i < DROP_COUNT; i++) {
            drops.push(createDrop());
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function drawRain() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const d of drops) {
            ctx.save();
            // Light blue / white pixel-style raindrops
            const isWhite = Math.random() > 0.7;
            ctx.fillStyle = isWhite ? 'rgba(220, 235, 245, ' + d.opacity + ')'
                                    : 'rgba(160, 210, 235, ' + d.opacity + ')';

            // Draw as a vertical rectangle (pixel style — no rotation, just angled movement)
            ctx.fillRect(Math.round(d.x), Math.round(d.y), Math.round(d.width), Math.round(d.height));
            ctx.restore();

            // Move
            d.y += d.speed;
            d.x += d.drift;

            // Reset when off screen
            if (d.y > canvas.height + 20) {
                d.y = -(d.height + Math.random() * 40);
                d.x = Math.random() * canvas.width;
                d.speed = 5 + Math.random() * 7;
                d.opacity = 0.35 + Math.random() * 0.15;
            }
            if (d.x > canvas.width + 10) {
                d.x = -d.width;
            }
        }

        animationId = requestAnimationFrame(drawRain);
    }

    // ── Web Audio: Rain Synthesis ──
    function createNoiseBuffer(ctx, durationSec) {
        const size = ctx.sampleRate * durationSec;
        const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < size; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    function startAudio() {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        masterGain.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + 0.8);
        masterGain.connect(audioCtx.destination);

        const noiseBuffer = createNoiseBuffer(audioCtx, 3);

        // Layer 1: dense rain body — lowpass white noise for the shhh of heavy rain
        const src1 = audioCtx.createBufferSource();
        src1.buffer = noiseBuffer;
        src1.loop = true;
        const lp1 = audioCtx.createBiquadFilter();
        lp1.type = 'lowpass';
        lp1.frequency.value = 600;
        lp1.Q.value = 0.5;
        const g1 = audioCtx.createGain();
        g1.gain.value = 0.035;
        src1.connect(lp1);
        lp1.connect(g1);
        g1.connect(masterGain);
        src1.start();

        // Layer 2: mid rain texture — bandpass for the body of the downpour
        const src2 = audioCtx.createBufferSource();
        src2.buffer = noiseBuffer;
        src2.loop = true;
        const bp2 = audioCtx.createBiquadFilter();
        bp2.type = 'bandpass';
        bp2.frequency.value = 1000;
        bp2.Q.value = 0.6;
        const g2 = audioCtx.createGain();
        g2.gain.value = 0.025;
        src2.connect(bp2);
        bp2.connect(g2);
        g2.connect(masterGain);
        src2.start();

        // Layer 3: high-frequency splash texture — the collective impact of many drops
        const src3 = audioCtx.createBufferSource();
        src3.buffer = noiseBuffer;
        src3.loop = true;
        const bp3 = audioCtx.createBiquadFilter();
        bp3.type = 'bandpass';
        bp3.frequency.value = 2800;
        bp3.Q.value = 1.2;
        const g3 = audioCtx.createGain();
        g3.gain.value = 0.018;
        src3.connect(bp3);
        bp3.connect(g3);
        g3.connect(masterGain);
        src3.start();

        noiseSources = [
            { source: src1, filter: lp1, gain: g1 },
            { source: src2, filter: bp2, gain: g2 },
            { source: src3, filter: bp3, gain: g3 }
        ];

        // Tap layer: many overlapping drops hitting glass simultaneously
        // Each tap is very short and high-pitched; they fire rapidly and overlap
        // creating a collective impact texture rather than isolated drops
        function scheduleTap() {
            if (!audioCtx || !rainActive) return;

            // Fire 2-4 taps at once to simulate clusters of drops hitting together
            const clusterSize = 2 + Math.floor(Math.random() * 3);
            for (let i = 0; i < clusterSize; i++) {
                const tapSrc = audioCtx.createBufferSource();
                const tapBuf = createNoiseBuffer(audioCtx, 0.035);
                tapSrc.buffer = tapBuf;

                const tapFilter = audioCtx.createBiquadFilter();
                tapFilter.type = 'bandpass';
                tapFilter.frequency.value = 2500 + Math.random() * 3500;
                tapFilter.Q.value = 2.5;

                const tapGain = audioCtx.createGain();
                const vol = 0.025 + Math.random() * 0.03;
                tapGain.gain.setValueAtTime(vol, audioCtx.currentTime);
                tapGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.035);

                tapSrc.connect(tapFilter);
                tapFilter.connect(tapGain);
                tapGain.connect(masterGain);
                tapSrc.start();
                tapSrc.stop(audioCtx.currentTime + 0.035);
            }

            const nextDelay = 60 + Math.random() * 120;
            tapInterval = setTimeout(scheduleTap, nextDelay);
        }

        tapInterval = setTimeout(scheduleTap, 300);
    }

    function stopAudio() {
        if (tapInterval) {
            clearTimeout(tapInterval);
            tapInterval = null;
        }

        if (masterGain && audioCtx) {
            const now = audioCtx.currentTime;
            masterGain.gain.setValueAtTime(masterGain.gain.value, now);
            masterGain.gain.linearRampToValueAtTime(0, now + 0.5);

            // Disconnect everything after fade completes
            setTimeout(function () {
                noiseSources.forEach(function (n) {
                    try { n.source.stop(); } catch (e) {}
                    try { n.source.disconnect(); } catch (e) {}
                    try { n.filter.disconnect(); } catch (e) {}
                    try { n.gain.disconnect(); } catch (e) {}
                });
                noiseSources = [];

                try { masterGain.disconnect(); } catch (e) {}
                masterGain = null;

                if (audioCtx) {
                    audioCtx.close().catch(function () {});
                    audioCtx = null;
                }
            }, 600);
        } else {
            noiseSources = [];
            masterGain = null;
            if (audioCtx) {
                audioCtx.close().catch(function () {});
                audioCtx = null;
            }
        }
    }

    // ── Toggle ──
    function startRain() {
        rainActive = true;
        resizeCanvas();
        initDrops();
        canvas.style.display = 'block';
        img.style.opacity = '0';
        img.src = 'assets/frog-rain.png';
        setTimeout(function () { img.style.opacity = '1'; }, 20);
        widget.classList.add('rain-active');
        drawRain();
        startAudio();
    }

    function stopRain() {
        rainActive = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
        img.style.opacity = '0';
        img.src = 'assets/frog-idle.png';
        setTimeout(function () { img.style.opacity = '1'; }, 20);
        widget.classList.remove('rain-active');
        stopAudio();
    }

    widget.addEventListener('click', function () {
        if (rainActive) {
            stopRain();
        } else {
            startRain();
        }
    });

    window.addEventListener('resize', function () {
        if (rainActive) resizeCanvas();
    });
})();
