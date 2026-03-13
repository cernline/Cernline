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
