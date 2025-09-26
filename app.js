// Version: 1.0.3
// Last updated: 2025-09-26
// Версия скрипта: app.js (278 строк)
// Дом (Club Royal)
const homeCoords = { lat: 12.96933724471163, lng: 100.88800963156544 };

// Геолокация
let userCoords = null;
let nearbyItems = []; // Массив для хранения ближайших мест

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
            alert('Геолокация не поддерживается вашим браузером');
            return;
        }
        navigator.geolocation.getCurrentPosition(pos => {
            userCoords = [pos.coords.latitude, pos.coords.longitude];
            updateNearbyItems();
            renderActivities(activities);
            renderContacts(points);
            renderNearbyBlock();
            updateGeoCafeDistances(); // Обновляем дистанцию до кафе
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
            }, 800); // 800ms для долгого нажатия
        };

        const cancelPress = () => {
            clearTimeout(pressTimer);
            if (!isLongPress) {
                // Это обычный клик
                if (geoCafeLinks[index]) {
                    window.open(geoCafeLinks[index], '_blank');
                }
            }
        };

        // Обработчики для мыши
        button.addEventListener('mousedown', startPress);
        button.addEventListener('mouseup', cancelPress);
        button.addEventListener('mouseleave', () => clearTimeout(pressTimer));

        // Обработчики для сенсорных экранов
        button.addEventListener('touchstart', startPress);
        button.addEventListener('touchend', cancelPress);
        button.addEventListener('touchcancel', () => clearTimeout(pressTimer));
    });
}

// Обновление дистанции на кнопках кафе
function updateGeoCafeDistances() {
    if (!userCoords) return;
    const buttons = document.querySelectorAll('.geo-cafe-btn');
    buttons.forEach((button, index) => {
        if (geoCafeCoords[index]) {
            const distance = getDistance(userCoords, geoCafeCoords[index]);
            let distSpan = button.querySelector('.distance-tag');
            if (!distSpan) {
                distSpan = document.createElement('span');
                distSpan.className = 'distance-tag';
                button.appendChild(distSpan);
            }
            distSpan.textContent = ` ≈ ${distance} км`;
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
            'Mini Siam
