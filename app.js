/* Version: 2.1.0 | Lines: 430 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        initApp();
    } catch (e) {
        console.error("Критическая ошибка при инициализации:", e);
    }
});

const homeCoords = { lat: 12.96933724471163, lng: 100.88800963156544 };
let userCoords = null;
let currentPlannerDate = null;

const kidsLeisure = [
    { name: "Mini Siam", date: "01.01.2026", coords: { lat: 12.9554157, lng: 100.9088538 }, tips: "Красивый парк с миниатюрами со всего мира.", type: "sight" },
    { name: "Деревня слонов", date: "04.01.2026", coords: { lat: 12.91604299, lng: 100.93883441 }, tips: "Шоу в 14:30 и 16:00. Можно покормить слонов.", type: "sight" },
    { name: "Дельфинариум", date: "07.01.2026", coords: { lat: 12.95222191, lng: 100.93617557 }, tips: "Шоу в 15:00. Есть плавание с дельфинами.", type: "sight" },
    { name: "Сад Нонг Нуч", date: "11.01.2026", coords: { lat: 12.76575858, lng: 100.93505629 }, tips: "Огромный тропический сад, шоу слонов и культурное шоу.", type: "sight" },
    { name: "Музей искусств 3D", date: "13.01.2026", coords: { lat: 12.94832322, lng: 100.88976288 }, tips: "Art in Paradise. Приходить лучше в будни, меньше людей.", type: "sight" },
    { name: "Аюттайя", date: "16.01.2026", coords: { lat: 14.35741905, lng: 100.56757512 }, tips: "Древняя столица Сиама. Ехать на целый день.", type: "sight" },
    { name: "Зоопарк Кхао Кхео", date: "19.01.2026", coords: { lat: 13.21500644, lng: 101.05700099 }, tips: "Открытый зоопарк, можно кормить животных.", type: "sight" },
    { name: "Плавучий рынок", date: "22.01.2026", coords: { lat: 12.86799376, lng: 100.90469404 }, tips: "Туристическое место, но колоритное.", type: "sight" },
];

function generateBeachDays() {
    const usedDates = kidsLeisure.map(x => x.date);
    const days = [];
    const start = new Date("2025-12-29");
    const end = new Date("2026-01-26");
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const date = d.toLocaleDateString('ru-RU');
        if (!usedDates.includes(date)) {
            days.push({ type: "sea", name: "Пляжинг", date, coords: null, tips: "Отдых на море" });
        }
    }
    return days;
}

const activities = [...generateBeachDays(), ...kidsLeisure].sort((a, b) => {
    const dateA = new Date(a.date.split('.').reverse().join('-'));
    const dateB = new Date(b.date.split('.').reverse().join('-'));
    return dateA - dateB;
});

const points = [
    { name: 'MO Play Kidz', coords: {lat: 12.935051, lng: 100.882722}, icon: '👶' }
];

function initApp() {
    initTabs();
    initCalendarFilters();
    initGeoFeatures();
    updateCountdown();
    setInterval(updateCountdown, 3600000);
    renderActivities(activities);
    renderContacts(points);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', e => {
        if (e.target.id === 'modalOverlay') closeModal();
    });
    initPlanner();
}

function initTabs() {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button, .tab-content').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
}

function initCalendarFilters() {
    document.querySelectorAll('.filter-btn').forEach(f => {
        f.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('active'));
            f.classList.add('active');
            const filtered = f.dataset.filter === 'all' ? activities : activities.filter(a => a.type === f.dataset.filter);
            renderActivities(filtered);
            localStorage.setItem('filter', f.dataset.filter);
        });
    });
    const saved = localStorage.getItem('filter') || 'all';
    document.querySelector(`.filter-btn[data-filter="${saved}"]`)?.click();
}

function renderActivities(list) {
    const grid = document.getElementById('activitiesGrid');
    if (!grid) return;

    grid.innerHTML = list.map(a => {
        const cardClass = `card ${a.type === 'sea' ? 'activity-sea' : 'activity-sight'}`;
        const prices = {
            'Mini Siam': `<p class="price-tag"><span class="price-label">Взр. 230 ฿ / Дет. 130 ฿</span></p>`,
            'Деревня слонов': `<p class="price-tag"><span class="price-label">Взр. 650 ฿ / Дет. 500 ฿</span></p>`,
            'Дельфинариум': `<p class="price-tag"><span class="price-label">Взр. 630 ฿ / Дет. 450 ฿</span></p>`,
            'Сад Нонг Нуч': `<p class="price-tag"><span class="price-label">Взр. 420 ฿ / Дет. 320 ฿</span></p>`,
            'Музей искусств 3D': `<p class="price-tag"><span class="price-label">Взр. 235 ฿ / Дет. 180 ฿</span></p>`,
            'Зоопарк Кхао Кхео': `<p class="price-tag"><span class="price-label">Взр. 350 ฿ / Дет. 120 ฿</span></p>`,
        };
        const priceLine = prices[a.name] || '';
        const dist = userCoords && a.coords ? `<p class="distance-tag">~${getDistance(userCoords, [a.coords.lat, a.coords.lng])} км</p>` : '';
        
        let buttonHtml = '';
        if (a.type === 'sea') {
            buttonHtml = `<button class="btn-primary planner-btn" data-date="${a.date}">Планы</button>`;
        } else if (a.type === 'sight') {
            buttonHtml = `<button class="details" data-name="${a.name}" data-date="${a.date}">Детали</button>`;
        }
        
        return `
            <div class="${cardClass}">
                <h3>${getIconForActivity(a.name)} ${a.name}</h3>
                <p>${a.date}</p>
                ${priceLine}
                ${dist}
                ${buttonHtml}
            </div>
        `;
    }).join('');
    
    bindDetailButtons();
    bindPlannerButtons();
}

function bindDetailButtons() {
    document.querySelectorAll('.details').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const date = btn.dataset.date;
            const act = activities.find(x => x.name === name && x.date === date);
            if (act) showModal(act);
        });
    });
}

function getIconForActivity(name) {
    const icons = {
        'Mini Siam': '🏛️', 'Деревня слонов': '🐘', 'Дельфинариум': '🐬',
        'Сад Нонг Нуч': '🌺', 'Музей искусств 3D': '🎨', 'Аюттайя': '⛩️',
        'Зоопарк Кхао Кхео': '🦒', 'Плавучий рынок': '🛶'
    };
    return icons[name] || '';
}

function showModal(place) {
    let content = `<h3>${getIconForActivity(place.name)} ${place.name}</h3>`;
    if (place.tips) {
        content += `<p>💡 ${place.tips}</p>`;
    }
    const fromHome = `${homeCoords.lat},${homeCoords.lng}`;
    const to = `${place.coords.lat},${place.coords.lng}`;
    content += `<p><a href="https://www.google.com/maps/dir/?api=1&origin=${fromHome}&destination=${to}" target="_blank">🗺️ Маршрут от дома</a></p>`;

    if (userCoords) {
        const userFrom = `${userCoords[0]},${userCoords[1]}`;
        content += `<p><a href="https://www.google.com/maps/dir/?api=1&origin=${userFrom}&destination=${to}" target="_blank">📍 Маршрут от вас</a></p>`;
        const distance = getDistance(userCoords, [place.coords.lat, place.coords.lng]);
        content += `<p>📏 Расстояние: ~${distance} км</p>`;
    }

    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

function updateCountdown() {
    const startTrip = new Date('2025-12-29');
    const now = new Date();
    const days = Math.ceil((startTrip - now) / 864e5);
    document.getElementById('countdownText').textContent = days > 0 ? 'До поездки' : 'Поездка!';
    document.getElementById('days').textContent = days > 0 ? days : '🎉';
    document.querySelector('.countdown-label').textContent = days > 0 ? 'дней' : '';
}

function getDistance(from, to) {
    const toRad = d => d * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(to[0] - from[0]);
    const dLon = toRad(to[1] - from[1]);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(from[0])) * Math.cos(toRad(to[0])) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
}

function initGeoFeatures() {
    document.getElementById('locateBtn').addEventListener('click', () => {
        if (!navigator.geolocation) {
            return alert('Геолокация не поддерживается.');
        }
        navigator.geolocation.getCurrentPosition(pos => {
            userCoords = [pos.coords.latitude, pos.coords.longitude];
            renderActivities(activities);
            renderContacts(points);
        }, () => alert('Не удалось получить местоположение.'));
    });
}

function renderContacts(list) {
    const grid = document.getElementById('contactsGrid');
    if (!grid) return;
    let items = list.slice();
    if (userCoords) {
        items.forEach(p => p.distance = parseFloat(getDistance(userCoords, [p.coords.lat, p.coords.lng])));
        items.sort((a,b) => a.distance - b.distance);
    }
    grid.innerHTML = items.map(p => {
        const distTag = p.distance ? `<span class="distance-tag">~${p.distance.toFixed(1)} км</span>` : '';
        return `<button class="contact-btn" onclick='window.open("https://www.google.com/maps/dir/?api=1&destination=${p.coords.lat},${p.coords.lng}", "_blank")'><span class="icon">${p.icon}</span><span>${p.name}</span>${distTag}</button>`;
    }).join('');
}

// --- PLANNER LOGIC ---
function initPlanner() {
    const plannerOverlay = document.getElementById('plannerModalOverlay');
    const closeBtn = document.getElementById('closePlannerModal');
    const saveBtn = document.getElementById('savePlannerBtn');

    const closePlanner = () => {
        plannerOverlay.classList.remove('active');
        currentPlannerDate = null;
    };
    
    closeBtn.addEventListener('click', closePlanner);
    plannerOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'plannerModalOverlay') closePlanner();
    });

    saveBtn.addEventListener('click', () => {
        if (currentPlannerDate) {
            saveDayPlan(currentPlannerDate);
            closePlanner();
        }
    });
}

function bindPlannerButtons() {
    document.querySelectorAll('.planner-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            openDayPlanner(btn.dataset.date);
        });
    });
}

function openDayPlanner(date) {
    currentPlannerDate = date;
    const modal = document.getElementById('plannerModalOverlay');
    const titleEl = document.getElementById('plannerModalTitle');
    const bodyEl = document.getElementById('plannerModalBody');

    titleEl.textContent = `Планы на ${date}`;
    bodyEl.innerHTML = '';

    const savedPlans = JSON.parse(localStorage.getItem(`plan_${date}`) || '{}');

    for (let hour = 7; hour < 21; hour++) {
        const timeLabel = `${String(hour).padStart(2, '0')}:00`;
        const nextHourLabel = `${String(hour + 1).padStart(2, '0')}:00`;
        const planText = savedPlans[timeLabel] || '';

        const row = document.createElement('div');
        row.className = 'planner-row';
        row.innerHTML = `
            <span class="time-label">${timeLabel} - ${nextHourLabel}</span>
            <span class="plan-text" contenteditable="true" data-time="${timeLabel}">${planText}</span>
        `;
        bodyEl.appendChild(row);
    }
    modal.classList.add('active');
}

function saveDayPlan(date) {
    const plans = {};
    document.querySelectorAll('#plannerModalBody .plan-text').forEach(span => {
        const time = span.dataset.time;
        const text = span.innerText.trim();
        if (text) {
            plans[time] = text;
        }
    });

    if (Object.keys(plans).length > 0) {
        localStorage.setItem(`plan_${date}`, JSON.stringify(plans));
    } else {
        localStorage.removeItem(`plan_${date}`);
    }
}
