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
    computeHome();                       // calculate once on load
    window.addEventListener('resize', computeHome); // recalc on resize

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    // Apply home position immediately (left/top only, no right/bottom ever)
    el.style.position = 'fixed';
    el.style.left = homeLeft + 'px';
    el.style.top  = homeTop  + 'px';

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
