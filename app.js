/* Version: 2.1.0 | Lines: 498 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        initApp();
    } catch (e) {
        console.error("Ошибка инициализации приложения:", e);
    }
});

// --- Глобальные переменные ---
const homeCoords = { lat: 12.96933724471163, lng: 100.88800963156544 };
let userCoords = null;
let activeGeoFilter = 'naklua';

const allGeoData = [
    { type: 'cafe', link: "https://maps.app.goo.gl/1Ubzy3TB3hCdG2YR8", coords: { lat: 12.965314, lng: 100.885745 }, subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/fCCogyeGKWqJca8g7", coords: { lat: 12.964959, lng: 100.886551 }, subblock: 'naklua' },
    { type: 'temple', link: "https://maps.app.goo.gl/VzHiKzb1UDQwrJ7SA", coords: { lat: 12.925998, lng: 100.876540 }, subblock: 'pratamnak' }
];

const activities = [
    { name: "Пляжинг 🌊", type: "sea", date: "29.12.25" },
    { name: "Пляжинг 🌊", type: "sea", date: "30.12.25" },
    { name: "Mini Siam", type: "sight", date: "31.12.25", description: "Парк миниатюр.", price: "700 THB", coords: { lat: 12.952028, lng: 100.908180 } },
    { name: "Деревня слонов", type: "sight", date: "01.01.26", description: "Шоу и катание на слонах.", price: "650 THB", coords: { lat: 12.8916, lng: 100.9097 } },
    { name: "Пляжинг 🌊", type: "sea", date: "02.01.26" },
];

const contacts = [
    { name: "Туристическая полиция", phone: "1155" },
    { name: "Скорая помощь", phone: "1669" },
    { name: "Консульство РФ", phone: "+66-2-234-98-24" }
];

let currentPlannerDate = null;

// --- Основная функция инициализации ---
function initApp() {
    initTabs();
    initCalendarFilters();
    initGeoFeatures();
    updateCountdown();
    setInterval(updateCountdown, 3600000);
    renderActivities(activities);
    renderContacts(contacts);

    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay') closeModal();
    });

    initPlanner();
}

// --- Инициализация вкладок ---
function initTabs() {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button, .tab-content').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
}

// --- Логика календаря ---
function initCalendarFilters() {
    document.querySelectorAll('.filter-btn').forEach(f => {
        f.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('active'));
            f.classList.add('active');
            const filter = f.dataset.filter;
            const filtered = filter === 'all' ? activities : activities.filter(a => a.type === filter);
            renderActivities(filtered);
        });
    });
}

function renderActivities(list) {
    const grid = document.getElementById('activitiesGrid');
    if (!grid) return;

    grid.innerHTML = list.map(a => {
        const cardClass = `card`;
        let buttonHtml = '';
        if (a.type === 'sea') {
            buttonHtml = `<button class="btn-primary planner-btn" data-date="${a.date}">Планы</button>`;
        } else if (a.type === 'sight') {
            buttonHtml = `<button class="btn-primary details-btn" data-name="${a.name}" data-date="${a.date}">Детали</button>`;
        }
        return `
            <div class="${cardClass}">
                <h3>${a.name}</h3>
                <p>${a.date}</p>
                ${buttonHtml}
            </div>
        `;
    }).join('');

    bindDetailButtons();
    bindPlannerButtons();
}

// --- Детали активностей ---
function bindDetailButtons() {
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const act = activities.find(x => x.name === btn.dataset.name && x.date === btn.dataset.date);
            if (act) showModal(act);
        });
    });
}

function showModal(act) {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `<h2>${act.name}</h2><p>${act.description || ''}</p><p>Цена: ${act.price || 'Бесплатно'}</p>`;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// --- ЛОГИКА ДЛЯ ПЛАНЕРА ---
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
            alert('План сохранен!');
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

    for (let hour = 7; hour <= 20; hour++) {
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

// --- Контакты и геолокация ---
function renderContacts(contactsList) {
    const listEl = document.getElementById('contacts-list');
    if (!listEl) return;
    listEl.innerHTML = contactsList.map(c => 
        `<div class="contact-item"><strong>${c.name}:</strong> <a href="tel:${c.phone}">${c.phone}</a></div>`
    ).join('');
}

function initGeoFeatures() {
    document.getElementById('locateBtn').addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                userCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
                renderNearbyItems();
            }, () => {
                alert('Не удалось определить местоположение.');
            });
        } else {
            alert('Геолокация не поддерживается вашим браузером.');
        }
    });
}

function renderNearbyItems() {
    const container = document.getElementById('nearbyItems');
    if (!userCoords) {
        container.innerHTML = '<p>Нажмите "Найти меня", чтобы увидеть ближайшие места.</p>';
        return;
    }
    
    allGeoData.forEach(item => {
        item.distance = getDistance(userCoords, item.coords);
    });
    
    allGeoData.sort((a, b) => a.distance - b.distance);
    
    container.innerHTML = allGeoData.map(item => `
        <div class="card">
            <p>${item.type === 'cafe' ? 'Кафе' : 'Храм'} (~${item.distance.toFixed(1)} км)</p>
            <a href="${item.link}" target="_blank">Открыть на карте</a>
        </div>
    `).join('');
}

function getDistance(coords1, coords2) {
    const toRad = x => x * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// --- Утилиты ---
function updateCountdown() {
    const targetDate = new Date('2025-12-29T00:00:00');
    const now = new Date();
    const diff = targetDate - now;

    const daysEl = document.getElementById('days');
    const textEl = document.getElementById('countdownText');
    const labelEl = document.getElementById('countdown-label');

    if (diff <= 0) {
        textEl.textContent = 'Поездка началась!';
        daysEl.textContent = '🎉';
        labelEl.textContent = '';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    daysEl.textContent = days;
    textEl.textContent = 'До поездки';
    labelEl.textContent = 'дней';
}
