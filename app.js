// Version: 1.0.5
// Last updated: 2025-09-26
// Версия скрипта: app.js (334 строки)
// Дом (Club Royal)
const homeCoords = { lat: 12.96933724471163, lng: 100.88800963156544 };

// Геолокация
let userCoords = null;
let nearbyItems = []; // Массив для хранения ближайших мест
let activeGeoFilter = 'naklua'; // Фильтр по умолчанию

// Ссылки для кнопок кафе (короткое нажатие)
const geoCafeLinks = [
    "https://maps.app.goo.gl/1Ubzy3TB3hCdG2YR8",
    "https://maps.app.goo.gl/fCCogyeGKWqJca8g7",
    "https://maps.app.goo.gl/Fba5C2aJVW7YxLz98",
    "https://maps.app.goo.gl/UagUbAPDmdJBAbCJ6",
    "https://maps.app.goo.gl/dXaCX7UgmriNPEpm8",
    "https://maps.app.goo.gl/Zn15kwEB5i9bfJGL6",
    "https://maps.app.goo.gl/VyE7D7gwHRL4nMNc6",
    "https://maps.app.goo.gl/DwNiL8531uQVURRZ9",
    "https://maps.app.goo.gl/VFFio7Q6t9qgJk4A9",
    "https://maps.app.goo.gl/UpRFKn6nAgTa1sNS8",
    "https://maps.app.goo.gl/fn868NKBZYGE4tUJ7",
    "https://maps.app.goo.gl/d6Wp4s38aTAPBCFz9",
    "https://maps.app.goo.gl/LGssrnWfy3KEZJ9u6",
    "https://maps.app.goo.gl/zPpiXtiNQts6f1Tb6",
    "https://maps.app.goo.gl/rFeQbBftxVTd2M6j9"
];

// Координаты для кнопок кафе (длительное нажатие и расчет дистанции)
const geoCafeCoords = [
    [12.965314728870327, 100.88574547083675], // Pad Thai Shop
    [12.964959752753911, 100.88655104216504], // Indian food
    [12.965151141707688, 100.88674436342762], // Tony seafood
    [12.964288806741925, 100.88816176884599], // SIAM
    [12.96424632513826, 100.88873268926864], // Тайское кафе
    [12.964275050492303, 100.88867431363093], // COFFEE CORNER
    [12.967898770765563, 100.89741326647155], // Coconut restaurant
    [12.973265034689499, 100.90657393095435], // Рыбный рынок
    [12.968006641294641, 100.89704079447756], // 3 Tolstyaka
    [12.96748945294801, 100.88317093728782], // Thai on beach
    [12.892621251136807, 100.87323076484746], // Tum Yum Bar
    [12.909346981806133, 100.85799998332298], // макашница
    [12.909615777640497, 100.86413037030111], // BAR MANGAL B-B-Q
    [12.909461552901218, 100.86416750079316], // kruatabird
    [12.91753238629045, 100.86705154538753]  // CHAO DOI COFFEE
];

// Функция расчёта расстояния (Haversine)
function getDistance([lat1, lon1], [lat2, lon2]) {
    const toRad = d => d * Math.PI / 180;
    const R = 6371; 
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
}

// Запуск после загрузки
document.addEventListener('DOMContentLoaded', () => {
    // геолокация
    document.getElementById('locateBtn').addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert('Геолокация не поддерживается вашим браузером.');
            resetGeoState();
            return;
        }
        navigator.geolocation.getCurrentPosition(pos => {
            userCoords = [pos.coords.latitude, pos.coords.longitude];
            updateGeoView();
        }, () => {
            alert('Не удалось получить местоположение.');
            resetGeoState();
        });
    });

    updateCountdown();
    setInterval(updateCountdown, 3600000);

    initTabs();
    initFilters();
    initGeoCafeButtons(); // Инициализация кнопок кафе
    initGeoFilters(); // Инициализация новых фильтров
    renderActivities(activities);
    renderContacts(points);
    renderNearbyBlock();
    
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', e => {
        if (e.target.id === 'modalOverlay') closeModal();
    });
});

// -- Новая логика для Гео-фильтров --

function initGeoFilters() {
    document.querySelectorAll('.geo-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.geo-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeGeoFilter = btn.dataset.filter;
            updateGeoView();
        });
    });
}

function updateGeoView() {
    if (!userCoords) return;
    updateGeoCafeDistances();
    sortCafeSubblocks();
    applyGeoFilter();
}

function sortCafeSubblocks() {
    ['naklua', 'pratamnak', 'jomtien'].forEach(subblockName => {
        const container = document.querySelector(`.cafe-sub-block.${subblockName}`);
        const buttons = Array.from(container.querySelectorAll('.geo-cafe-btn'));
        
        buttons.sort((a, b) => {
            const distA = parseFloat(a.querySelector('.distance-tag')?.textContent.replace(/[^0-9.]/g, '') || 9999);
            const distB = parseFloat(b.querySelector('.distance-tag')?.textContent.replace(/[^0-9.]/g, '') || 9999);
            return distA - distB;
        });

        buttons.forEach(button => container.appendChild(button));
    });
}

function applyGeoFilter() {
    restoreAllCafeButtonsToSubblocks(); // Сначала возвращаем всё на места
    const nearbyContainer = document.getElementById('nearbyItems');
    if (!userCoords) {
        nearbyContainer.innerHTML = `<div class="empty-state">Нажмите "Получить местоположение" чтобы увидеть ближайшие места</div>`;
        return;
    }

    const targetSubblock = document.querySelector(`.cafe-sub-block.${activeGeoFilter}`);
    if (!targetSubblock) return;

    const closestButton = targetSubblock.querySelector('.geo-cafe-btn'); // После сортировки он будет первым
    
    if (closestButton) {
        const clone = closestButton.cloneNode(true);
        clone.classList.add('nearby-item'); // Добавляем класс для стилизации в блоке "Рядом"
        clone.classList.remove('geo-cafe-btn');
        initGeoCafeButtons([clone]); // Перенавешиваем события на клон
        nearbyContainer.innerHTML = '';
        nearbyContainer.appendChild(clone);
        closestButton.style.display = 'none'; // Скрываем оригинал
    } else {
        nearbyContainer.innerHTML = `<div class="empty-state">Нет заведений в районе ${activeGeoFilter}</div>`;
    }
}

function restoreAllCafeButtonsToSubblocks() {
    // Показываем все скрытые кнопки
    document.querySelectorAll('.geo-cafe-btn').forEach(btn => btn.style.display = '');
    // Очищаем блок "Рядом"
    const nearbyContainer = document.getElementById('nearbyItems');
    nearbyContainer.innerHTML = `<div class="empty-state">Нажмите "Получить местоположение" чтобы увидеть ближайшие места</div>`;
}

function resetGeoState() {
    userCoords = null;
    restoreAllCafeButtonsToSubblocks();
    // Убираем все теги с дистанцией
    document.querySelectorAll('.geo-cafe-btn .distance-tag').forEach(tag => tag.remove());
}


// -- Существующая логика (с изменениями) --

function initGeoCafeButtons(buttonsToInit = document.querySelectorAll('.geo-cafe-btn')) {
    const allButtons = Array.from(document.querySelectorAll('.geo-cafe-btn'));
    buttonsToInit.forEach(button => {
        const index = allButtons.findIndex(btn => btn.innerText === button.innerText);
        if (index === -1) return;
        
        let pressTimer;
        let isLongPress = false;

        const startPress = (e) => {
            e.preventDefault();
            isLongPress = false;
            pressTimer = window.setTimeout(() => {
                isLongPress = true;
                if (!userCoords) {
                    alert('Сначала определите ваше местоположение, нажав на кнопку "Получить местоположение".');
                    return;
                }
                if (geoCafeCoords[index]) {
                    const destination = geoCafeCoords[index].join(',');
                    const origin = userCoords.join(',');
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
                    window.open(url, '_blank');
                }
            }, 800);
        };

        const cancelPress = () => {
            clearTimeout(pressTimer);
            if (!isLongPress) {
                if (geoCafeLinks[index]) {
                    window.open(geoCafeLinks[index], '_blank');
                }
            }
        };
        
        button.addEventListener('mousedown', startPress);
        button.addEventListener('mouseup', cancelPress);
        button.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        button.addEventListener('touchstart', startPress, { passive: true });
        button.addEventListener('touchend', cancelPress);
        button.addEventListener('touchcancel', () => clearTimeout(pressTimer));
    });
}

function updateGeoCafeDistances() {
    if (!userCoords) return;
    const buttons = document.querySelectorAll('.geo-cafe-btn');
    const allButtonsList = Array.from(buttons);

    buttons.forEach(button => {
        const index = allButtonsList.findIndex(btn => btn.innerText === button.innerText);
        if (index === -1 || !geoCafeCoords[index]) return;
        
        const distance = getDistance(userCoords, geoCafeCoords[index]);
        let distSpan = button.querySelector('.distance-tag');
        if (!distSpan) {
            distSpan = document.createElement('span');
            distSpan.className = 'distance-tag';
            button.appendChild(distSpan);
        }
        distSpan.textContent = ` ≈ ${distance} км`;
    });
}

function updateNearbyItems() {
    if (!userCoords) {
        nearbyItems = [];
        return;
    }
    const allPlaces = [...points];
    const placesWithDistance = allPlaces.map(place => ({
        ...place,
        distance: parseFloat(getDistance(userCoords, [place.coords.lat, place.coords.lng]))
    })).sort((a, b) => a.distance - b.distance);
    nearbyItems = placesWithDistance.slice(0, 5);
}

function getIconForActivity(name) {
    const icons = {
        'Mini Siam': '🏛️', 'Деревня слонов': '🐘', 'Дельфинариум': '🐬', 'Сад Нонг Нуч': '🌺',
        'Музей искусств 3D': '🎨', 'Аюттайя': '⛩️', 'Зоопарк Кхао Кхео': '🦒', 'Плавучий рынок': '🛶'
    };
    return icons[name] || '📍';
}

function renderNearbyBlock() {
    const container = document.getElementById('nearbyItems');
    if (nearbyItems.length === 0 && userCoords) {
        applyGeoFilter();
    } else if (nearbyItems.length === 0) {
        container.innerHTML = `<div class="empty-state">Нажмите "Получить местоположение" чтобы увидеть ближайшие места</div>`;
    } else {
        container.innerHTML = nearbyItems.map(item => `
            <div class="nearby-item">
                <span class="icon">${item.icon}</span>
                <span class="name">${item.name}</span>
                <span class="distance">${item.distance} км</span>
            </div>
        `).join('');
    }
}

function showModal(place) {
    let content = `<h3>${place.icon ? place.icon + ' ' : ''}${place.name}</h3>`;
    if (place.tips) content += `<p>💡 ${place.tips}</p>`;
    const fromHome = `${homeCoords.lat},${homeCoords.lng}`;
    const to = `${place.coords.lat},${place.coords.lng}`;
    content += `<p><a href="https://www.google.com/maps/dir/?api=1&origin=${fromHome}&destination=${to}" target="_blank">🗺️ Маршрут от дома</a></p>`;
    if (userCoords) {
        const userFrom = `${userCoords[0]},${userCoords[1]}`;
        content += `<p><a href="https://www.google.com/maps/dir/?api=1&origin=${userFrom}&destination=${to}" target="_blank">📍 Маршрут от текущего местоположения</a></p>`;
        content += `<p>📏 Расстояние: ${place.distance} км</p>`;
    }
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalOverlay').classList.add('active');
}

const kidsLeisure = [
    { name: 'Mini Siam', date: '01.01.2026', coords: { lat: 12.9554157, lng: 100.9088538 }, tips: 'Парк миниатюр под открытым небом, возьмите головной убор.', type: 'sight' },
    { name: 'Деревня слонов', date: '04.01.2026', coords: { lat: 12.91604299, lng: 100.93883441 }, tips: 'Кормление слонов и катание на них. Шоу слонов (14:30–16:00).', type: 'sight' },
    { name: 'Дельфинариум', date: '07.01.2026', coords: { lat: 12.95222191, lng: 100.93617557 }, tips: 'Шоу дельфинов в 15:00.', type: 'sight' },
    { name: 'Сад Нонг Нуч', date: '11.01.2026', coords: { lat: 12.76575858, lng: 100.93505629 }, tips: 'Найдите шоу слонов и сад рано утром.', type: 'sight' },
    { name: 'Музей искусств 3D', date: '13.01.2026', coords: { lat: 12.94832322, lng: 100.88976288 }, tips: 'Интерактивные фотозоны.', type: 'sight' },
    { name: 'Аюттайя', date: '16.01.2026', coords: { lat: 14.35741905, lng: 100.56757512 }, tips: 'Посетите храмы.', type: 'sight' },
    { name: 'Зоопарк Кхао Кхео', date: '19.01.2026', coords: { lat: 13.21500644, lng: 101.05700099 }, tips: 'Кормление жирафов в 15:00.', type: 'sight' },
    { name: 'Плавучий рынок', date: '22.01.2026', coords: { lat: 12.86799376, lng: 100.90469404 }, tips: 'Фрукты у лодочников.', type: 'sight' }
];

function generateBeachDays() {
    const used = kidsLeisure.map(x => x.date), days = [];
    const start = new Date('2025-12-29'), end = new Date('2026-01-26');
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const date = d.toLocaleDateString('ru-RU');
        if (!used.includes(date)) {
            days.push({ type: 'sea', name: 'Пляжинг и Прогулинг', date, coords: null, tips: 'Отдых на пляже и прогулка по набережной Наклуа.' });
        }
    }
    return days;
}

const activities = [...generateBeachDays(), ...kidsLeisure].sort((a,b) => {
    const da = a.date.split('.').reverse().join('-'), db = b.date.split('.').reverse().join('-');
    return new Date(da) - new Date(db);
});

const startTrip = new Date('2025-12-29'), endTrip = new Date('2026-01-26');
function updateCountdown() {
    const now = new Date();
    const label = now < startTrip ? 'До поездки:' : now <= endTrip ? 'До отъезда:' : 'Поездка завершена!';
    const days = now < startTrip ? Math.ceil((startTrip - now) / 864e5) : now <= endTrip ? Math.ceil((endTrip - now) / 864e5) : 0;
    document.getElementById('countdownText').textContent = label;
    document.getElementById('days').textContent = days > 0 ? days : '✔';
    document.querySelector('.countdown-label').textContent = days > 0 ? 'дней' : '';
}

function bindDetailButtons() {
    document.querySelectorAll('.details').forEach(btn => {
        btn.onclick = () => {
            const act = activities.find(x => x.name === btn.dataset.name && x.date === btn.dataset.date);
            showModal(act);
        };
    });
}

function renderActivities(list) {
    const grid = document.getElementById('activitiesGrid');
    grid.innerHTML = list.map(a => {
        let icon = a.type === 'sea' ? '🏖️ ' : '';
        if (a.type === 'sight') icon = getIconForActivity(a.name) + ' ';
        const prices = {
            'Mini Siam': `<p class="price-tag">Взрослый 230 ฿ / Детский 130 ฿</p>`, 'Деревня слонов': `<p class="price-tag">Взрослый 650 ฿ / Детский 500 ฿</p>`,
            'Дельфинариум': `<p class="price-tag">Взрослый 630 ฿ / Детский 450 ฿</p>`, 'Сад Нонг Нуч': `<p class="price-tag">Взрослый 420 ฿ / Детский 320 ฿</p>`,
            'Музей искусств 3D': `<p class="price-tag">Взрослый 235 ฿ / Детский 180 ฿</p>`, 'Зоопарк Кхао Кхео': `<p class="price-tag">Взрослый 350 ฿ / Детский 120 ฿</p>`,
        };
        const priceLine = prices[a.name] || '';
        const dist = userCoords && a.coords ? `<p class="distance-tag">≈${getDistance(userCoords, [a.coords.lat, a.coords.lng])} км от вас</p>` : '';
        return `<div class="card"><h3>${icon}${a.name}</h3><p>${a.date}</p>${priceLine}${dist}${a.coords ? `<button class="details" data-name="${a.name}" data-date="${a.date}">Подробнее</button>` : ''}</div>`;
    }).join('');
    bindDetailButtons();
}

function showContactModal(place) {
    let content = `<h3>${place.icon} ${place.name}</h3>`;
    const to = `${place.coords.lat},${place.coords.lng}`;
    if (userCoords) {
        content += `<p class="distance-tag">≈${getDistance(userCoords, [place.coords.lat, place.coords.lng])} км от вас</p>`;
        const userFrom = `${userCoords[0]},${userCoords[1]}`;
        content += `<p><a href="https://www.google.com/maps/dir/?api=1&origin=${userFrom}&destination=${to}" target="_blank">📍 Маршрут от текущего местоположения</a></p>`;
    }
    const fromHome = `${homeCoords.lat},${homeCoords.lng}`;
    content += `<p><a href="https://www.google.com/maps/dir/?api=1&origin=${fromHome}&destination=${to}" target="_blank">🗺️ Маршрут от дома</a></p>`;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalOverlay').classList.add('active');
}

const points = [ { name: 'MO Play Kidz', coords: {lat: 12.935051, lng: 100.882722}, icon: '👶' } ];

function renderContacts(list) {
    let items = list.slice();
    if (userCoords) {
        items = items.map(p => ({ ...p, distance: parseFloat(getDistance(userCoords, [p.coords.lat, p.coords.lng])) }));
        items.sort((a,b) => a.distance - b.distance);
    }
    const grid = document.getElementById('contactsGrid');
    grid.innerHTML = items.map(p => {
        const distTag = p.distance !== undefined ? `<span class="distance-tag">≈${p.distance.toFixed(1)} км</span>` : '';
        return `<button class="contact-btn" onclick='showContactModal(${JSON.stringify(p)})'><span class="icon">${p.icon}</span><span>${p.name}</span>${distTag}</button>`;
    }).join('');
}

function initTabs() {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
}

function initFilters() {
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

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}
