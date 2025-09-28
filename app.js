/* Version: 2.1.0 | Lines: 550 */
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
let activeGeoFilter = 'naklua';

const allGeoData = [
    { type: 'cafe', link: "https://maps.app.goo.gl/1Ubzy3TB3hCdG2YR8", coords: [12.965314, 100.885745], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/fCCogyeGKWqJca8g7", coords: [12.964959, 100.886551], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/Fba5C2aJVW7YxLz98", coords: [12.965151, 100.886744], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/UagUbAPDmdJBAbCJ6", coords: [12.964288, 100.888161], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/dXaCX7UgmriNPEpm8", coords: [12.964246, 100.888732], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/Zn15kwEB5i9bfJGL6", coords: [12.964275, 100.888674], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/VyE7D7gwHRL4nMNc6", coords: [12.967898, 100.897413], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/DwNiL8531uQVURRZ9", coords: [12.973265, 100.906573], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/VFFio7Q6t9qgJk4A9", coords: [12.968006, 100.897040], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/UpRFKn6nAgTa1sNS8", coords: [12.967489, 100.883170], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/d6Wp4s38aTAPBCFz9", coords: [12.909346, 100.857999], subblock: 'pratamnak' },
    { type: 'cafe', link: "https://maps.app.goo.gl/LGssrnWfy3KEZJ9u6", coords: [12.909615, 100.864130], subblock: 'pratamnak' },
    { type: 'cafe', link: "https://maps.app.goo.gl/zPpiXtiNQts6f1Tb6", coords: [12.909461, 100.864167], subblock: 'pratamnak' },
    { type: 'cafe', link: "https://maps.app.goo.gl/rFeQbBftxVTd2M6j9", coords: [12.917532, 100.867051], subblock: 'pratamnak' },
    { type: 'cafe', link: "https://maps.app.goo.gl/fn868NKBZYGE4tUJ7", coords: [12.892621, 100.873230], subblock: 'jomtien' },
    { type: 'temple', link: "https://maps.app.goo.gl/VzHiKzb1UDQwrJ7SA", coords: [12.925998, 100.876540] },
    { type: 'temple', link: "https://maps.app.goo.gl/1Tho69ErwjcJoLZu6", coords: [12.925280, 100.877069] },
    { type: 'temple', link: "https://maps.app.goo.gl/ZaWV44GNL86E9Hdq9", coords: [12.938062, 100.892092] },
    { type: 'temple', link: "https://maps.app.goo.gl/QfwfiipfFmXzfJhCA", coords: [12.961507, 100.893974] },
    { type: 'temple', link: "https://maps.app.goo.gl/UTn8gqefDwgPeZxh6", coords: [12.969608, 100.909430] },
    { type: 'temple', link: "https://maps.app.goo.gl/xsj9jnGkWduQ6MQV6", coords: [12.952028, 100.908180] },
    { type: 'temple', link: "https://maps.app.goo.gl/wz7LAkoqXd1LHHhw7", coords: [12.914219, 100.868615] },
    { type: 'temple', link: "https://maps.app.goo.gl/LXmseuFjDPQtyewQ6", coords: [12.885197, 100.879626] },
    { type: 'temple', link: "https://maps.app.goo.gl/LWeDMe2wMJsvQr5N8", coords: [12.791474, 100.928825] },
    { type: 'temple', link: "https://maps.app.goo.gl/LpMDiXaHFnE7Aa8w7", coords: [12.765905, 100.956783] },
];

const kidsLeisure = [
    { name: "Mini Siam", date: "01.01.2026", coords: { lat: 12.9554157, lng: 100.9088538 }, tips: "...", type: "sight" },
    { name: "Деревня слонов", date: "04.01.2026", coords: { lat: 12.91604299, lng: 100.93883441 }, tips: "Шоу в 14:30 и 16:00.", type: "sight" },
];

function generateBeachDays() {
    const usedDates = kidsLeisure.map(x => x.date);
    const days = [];
    const start = new Date("2025-12-29");
    const end = new Date("2026-01-26");
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const date = d.toLocaleDateString('ru-RU');
        if (!usedDates.includes(date)) {
            days.push({ type: "sea", name: "Пляжинг", date, coords: null, tips: "Отдых" });
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
    renderGeoData();
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
            'Mini Siam': `<p class="price-tag">Взр. 230 ฿ / Дет. 130 ฿</p>`,
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
        'Mini Siam': '🏛️', 'Деревня слонов': '🐘',
    };
    return icons[name] || '';
}

function showModal(place) {
    let content = `<h3>${getIconForActivity(place.name)} ${place.name}</h3>`;
    if (place.tips) content += `<p>💡 ${place.tips}</p>`;
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

// --- GEO FEATURES (Original) ---
function initGeoFeatures() {
    document.getElementById('locateBtn')?.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert('Геолокация не поддерживается.');
            return resetGeoState();
        }
        navigator.geolocation.getCurrentPosition(pos => {
            userCoords = [pos.coords.latitude, pos.coords.longitude];
            updateGeoView();
        }, () => {
            alert('Не удалось получить местоположение.');
            resetGeoState();
        });
    });

    document.querySelectorAll('.geo-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.geo-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeGeoFilter = btn.dataset.filter;
            if (userCoords) updateGeoView();
        });
    });
}

function renderGeoData() {
    const cafeContainers = {
        naklua: document.querySelector('.cafe-sub-block[data-subblock-name="naklua"]'),
        pratamnak: document.querySelector('.cafe-sub-block[data-subblock-name="pratamnak"]'),
        jomtien: document.querySelector('.cafe-sub-block[data-subblock-name="jomtien"]'),
    };
    const templesContainer = document.querySelector('.geo-temples .geo-items-container');

    allGeoData.forEach((place, index) => {
        const button = document.createElement('button');
        button.className = 'contact-btn geo-item-btn';
        button.dataset.id = index;
        button.innerHTML = `<span class="icon">${place.type === 'cafe' ? '☕' : '🛕'}</span><span>Место #${index + 1}</span>`;

        if (place.type === 'cafe' && cafeContainers[place.subblock]) {
            cafeContainers[place.subblock].appendChild(button);
        } else if (place.type === 'temple') {
            templesContainer.appendChild(button);
        }
        initGeoItemButton(button);
    });
}

function updateGeoView() {
    updateAllDistances();
    sortAllGeoBlocks();
    applyGeoFilter();
}

function updateAllDistances() {
    if (!userCoords) return;
    document.querySelectorAll('.geo-item-btn').forEach(button => {
        const id = parseInt(button.dataset.id, 10);
        if (isNaN(id)) return;
        const distance = getDistance(userCoords, allGeoData[id].coords);
        button.dataset.distance = distance;
        let distSpan = button.querySelector('.distance-tag');
        if (!distSpan) {
            distSpan = document.createElement('span');
            distSpan.className = 'distance-tag';
            button.appendChild(distSpan);
        }
        distSpan.textContent = ` ~${distance} км`;
    });
}

function sortAllGeoBlocks() {
    ['naklua', 'pratamnak', 'jomtien'].forEach(subblockName => {
        const container = document.querySelector(`.cafe-sub-block[data-subblock-name="${subblockName}"]`);
        if(container) {
            const buttons = Array.from(container.querySelectorAll('.geo-item-btn'));
            buttons.sort((a, b) => (parseFloat(a.dataset.distance) || 9999) - (parseFloat(b.dataset.distance) || 9999));
            buttons.forEach(button => container.appendChild(button));
        }
    });
    const templesContainer = document.querySelector('.geo-temples .geo-items-container');
    if(templesContainer) {
        const buttons = Array.from(templesContainer.querySelectorAll('.geo-item-btn'));
        buttons.sort((a, b) => (parseFloat(a.dataset.distance) || 9999) - (parseFloat(b.dataset.distance) || 9999));
        buttons.forEach(button => templesContainer.appendChild(button));
    }
}

function applyGeoFilter() {
    restoreAllButtonsVisibility();
    const nearbyContainer = document.getElementById('nearbyItems');
    nearbyContainer.innerHTML = '';

    const targetSubblock = document.querySelector(`.cafe-sub-block[data-subblock-name="${activeGeoFilter}"]`);
    const closestCafeButton = targetSubblock ? targetSubblock.querySelector('.geo-item-btn') : null;
    const templesContainer = document.querySelector('.geo-temples .geo-items-container');
    const closestTempleButton = templesContainer ? templesContainer.querySelector('.geo-item-btn') : null;

    if (closestCafeButton) {
        const clone = closestCafeButton.cloneNode(true);
        initGeoItemButton(clone);
        nearbyContainer.appendChild(clone);
        closestCafeButton.style.display = 'none';
    }

    if (closestTempleButton) {
        const clone = closestTempleButton.cloneNode(true);
        initGeoItemButton(clone);
        nearbyContainer.appendChild(clone);
        closestTempleButton.style.display = 'none';
    }

    if (!closestCafeButton && !closestTempleButton) {
        nearbyContainer.innerHTML = '<p>Мест поблизости не найдено.</p>';
    }
}

function restoreAllButtonsVisibility() {
    document.querySelectorAll('.geo-item-btn').forEach(btn => btn.style.display = 'flex');
}

function resetGeoState() {
    userCoords = null;
    document.getElementById('nearbyItems').innerHTML = '<p>Нажмите "Найти меня", чтобы увидеть ближайшие места.</p>';
    restoreAllButtonsVisibility();
    document.querySelectorAll('.distance-tag').forEach(tag => tag.remove());
    document.querySelectorAll('[data-distance]').forEach(el => delete el.dataset.distance);
}

function initGeoItemButton(button) {
    let pressTimer = null;
    let startX, startY;
    let isScrolling = false;
    const MOVETHRESHOLD = 10;
    const idx = parseInt(button.dataset.id, 10);

    const handlePressStart = e => {
        isScrolling = false;
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        pressTimer = setTimeout(() => {
            if (!isScrolling) {
                if (!userCoords) return alert('Не определено ваше расположение');
                const destination = allGeoData[idx].coords.join();
                const origin = userCoords.join();
                window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, '_blank');
            }
            pressTimer = null;
        }, 800);
    };

    const handlePressMove = e => {
        if (isScrolling || !pressTimer) return;
        const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        if (Math.abs(currentX - startX) > MOVETHRESHOLD || Math.abs(currentY - startY) > MOVETHRESHOLD) {
            isScrolling = true;
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    };

    const handlePressEnd = e => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
             if (!isScrolling) window.open(allGeoData[idx].link, '_blank');
        }
    };

    const handlePressCancel = () => {
        if (pressTimer) clearTimeout(pressTimer);
        pressTimer = null;
    };

    button.addEventListener('mousedown', handlePressStart);
    button.addEventListener('mouseup', handlePressEnd);
    button.addEventListener('mouseleave', handlePressCancel);
    button.addEventListener('mousemove', handlePressMove);

    button.addEventListener('touchstart', handlePressStart, { passive: true });
    button.addEventListener('touchend', handlePressEnd);
    button.addEventListener('touchcancel', handlePressCancel);
    button.addEventListener('touchmove', handlePressMove, { passive: true });
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
