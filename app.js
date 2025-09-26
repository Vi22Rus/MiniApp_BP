// Version: 1.0.1
// Last updated: 2025-09-26
// Версия скрипта: app.js (219 строк)
// Дом (Club Royal)
const homeCoords = { lat: 12.96933724471163, lng: 100.88800963156544 };

// Геолокация
let userCoords = null;
let nearbyItems = []; // Массив для хранения ближайших мест

// Ссылки для кнопок кафе
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
            alert('Геолокация не поддерживается вашим браузером');
            return;
        }
        navigator.geolocation.getCurrentPosition(pos => {
            userCoords = [pos.coords.latitude, pos.coords.longitude];
            updateNearbyItems();
            renderActivities(activities);
            renderContacts(points);
            renderNearbyBlock();
        }, () => alert('Не удалось получить местоположение'));
    });

    updateCountdown();
    setInterval(updateCountdown, 3600000);

    initTabs();
    initFilters();
    initGeoCafeButtons(); // Инициализация кнопок кафе
    renderActivities(activities);
    renderContacts(points);
    renderNearbyBlock();

    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', e => {
        if (e.target.id === 'modalOverlay') closeModal();
    });
});

// Инициализация кнопок кафе во вкладке Гео
function initGeoCafeButtons() {
    const buttons = document.querySelectorAll('.geo-cafe-btn');
    buttons.forEach((button, index) => {
        if (geoCafeLinks[index]) {
            button.addEventListener('click', () => {
                window.open(geoCafeLinks[index], '_blank');
            });
        }
    });
}


// Обновление списка ближайших мест
function updateNearbyItems() {
    if (!userCoords) return;
    
    // Объединяем все места из разных источников
    const allPlaces = [...points];

    // Добавляем координаты для мест из календаря
    activities.forEach(activity => {
        if (activity.coords && activity.type === 'sight') {
            allPlaces.push({
                name: activity.name,
                coords: activity.coords,
                icon: getIconForActivity(activity.name),
                source: 'calendar'
            });
        }
    });

    // Вычисляем расстояния и сортируем
    const placesWithDistance = allPlaces.map(place => ({
        ...place,
        distance: parseFloat(getDistance(userCoords, [place.coords.lat, place.coords.lng]))
    })).sort((a, b) => a.distance - b.distance);
    
    // Берем 5 ближайших мест
    nearbyItems = placesWithDistance.slice(0, 5);
}

// Получение иконки для активности
function getIconForActivity(name) {
    const icons = {
        'Mini Siam': '🏛️',
        'Деревня слонов': '🐘',
        'Дельфинариум': '🐬',
        'Сад Нонг Нуч': '🌺',
        'Музей искусств 3D': '🎨',
        'Аюттайя': '⛩️',
        'Зоопарк Кхао Кхео': '🦒',
        'Плавучий рынок': '🛶'
    };
    return icons[name] || '📍';
}

// Рендер блока "Рядом"
function renderNearbyBlock() {
    const container = document.getElementById('nearbyItems');
    if (nearbyItems.length === 0) {
        container.innerHTML = `<div class="empty-state">Нажмите "Получить местоположение" чтобы увидеть ближайшие места</div>`;
        return;
    }
    
    container.innerHTML = nearbyItems.map(item => `
        <div class="nearby-item">
            <span class="icon">${item.icon}</span>
            <span class="name">${item.name}</span>
            <span class="distance">${item.distance} км</span>
        </div>
    `).join('');
}


// Модальное окно
function showModal(place) {
    let content = `<h3>${place.icon ? place.icon + ' ' : ''}${place.name}</h3>`;
    
    if (place.tips) {
        content += `<p>💡 ${place.tips}</p>`;
    }
    
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

// Данные для вкладки Календарь
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

// Счётчик
const startTrip = new Date('2025-12-29'), endTrip = new Date('2026-01-26');
function updateCountdown() {
    const now = new Date();
    const label = now < startTrip ? 'До поездки:' : now <= endTrip ? 'До отъезда:' : 'Поездка завершена!';
    const days = now < startTrip ? Math.ceil((startTrip - now) / 864e5) : now <= endTrip ? Math.ceil((endTrip - now) / 864e5) : 0;
    document.getElementById('countdownText').textContent = label;
    document.getElementById('days').textContent = days > 0 ? days : '✔';
    document.querySelector('.countdown-label').textContent = days > 0 ? 'дней' : '';
}


// Привязка кнопок "Подробнее"
function bindDetailButtons() {
    document.querySelectorAll('.details').forEach(btn => {
        btn.onclick = () => {
            const act = activities.find(x => x.name === btn.dataset.name && x.date === btn.dataset.date);
            showModal(act);
        };
    });
}

// Рендер вкладки Календарь
function renderActivities(list) {
    const grid = document.getElementById('activitiesGrid');
    grid.innerHTML = list.map(a => {
        let icon = a.type === 'sea' ? '🏖️ ' : '';
        if (a.type === 'sight') {
            icon = getIconForActivity(a.name) + ' ';
        }
        
        const prices = {
            'Mini Siam': `<p class="price-tag">Взрослый 230 ฿ / Детский 130 ฿</p>`,
            'Деревня слонов': `<p class="price-tag">Взрослый 650 ฿ / Детский 500 ฿</p>`,
            'Дельфинариум': `<p class="price-tag">Взрослый 630 ฿ / Детский 450 ฿</p>`,
            'Сад Нонг Нуч': `<p class="price-tag">Взрослый 420 ฿ / Детский 320 ฿</p>`,
            'Музей искусств 3D': `<p class="price-tag">Взрослый 235 ฿ / Детский 180 ฿</p>`,
            'Зоопарк Кхао Кхео': `<p class="price-tag">Взрослый 350 ฿ / Детский 120 ฿</p>`,
        };
        const priceLine = prices[a.name] || '';
        
        const dist = userCoords && a.coords ? `<p class="distance-tag">≈${getDistance(userCoords, [a.coords.lat, a.coords.lng])} км от вас</p>` : '';

        return `
            <div class="card">
                <h3>${icon}${a.name}</h3>
                <p>${a.date}</p>
                ${priceLine}
                ${dist}
                ${a.coords ? `<button class="details" data-name="${a.name}" data-date="${a.date}">Подробнее</button>` : ''}
            </div>
        `;
    }).join('');
    bindDetailButtons();
}

// Модалка для контактов
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

// Данные для вкладки Моё местоположение (только MO Play Kidz)
const points = [
    { name: 'MO Play Kidz', coords: {lat: 12.935051, lng: 100.882722}, icon: '👶' }
];

// Рендер вкладки Моё местоположение
function renderContacts(list) {
    let items = list.slice();
    if (userCoords) {
        items = items.map(p => ({ ...p, distance: parseFloat(getDistance(userCoords, [p.coords.lat, p.coords.lng])) }));
        items.sort((a,b) => a.distance - b.distance);
    }
    
    const grid = document.getElementById('contactsGrid');
    grid.innerHTML = items.map(p => {
        const distTag = p.distance !== undefined ? `<span class="distance-tag">≈${p.distance.toFixed(1)} км</span>` : '';
        return `
            <button class="contact-btn" onclick='showContactModal(${JSON.stringify(p)})'>
                <span class="icon">${p.icon}</span>
                <span>${p.name}</span>
                ${distTag}
            </button>
        `;
    }).join('');
}


// Инициализация вкладок
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

// Инициализация фильтров
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

// Закрытие модалки
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}
