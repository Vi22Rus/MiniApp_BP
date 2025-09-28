// Version: 1.2.4 | Lines: 450
// Last updated: 2025-09-28
const homeCoords = { lat: 12.96933724471163, lng: 100.88800963156544 };
let userCoords = null;
let activeGeoFilter = 'naklua';

// Фильтр по районам для кафе
const allGeoData = [
    // Кафе (0-14)
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
    
    // Храмы (15-24)
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

function getDistance([lat1, lon1], [lat2, lon2]) {
    const toRad = d => d * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        initApp();
    } catch (e) {
        console.error("Критическая ошибка при инициализации:", e);
    }
});

function initApp() {
    initTabs();
    initCalendarFilters();
    initGeoFeatures();
    updateCountdown();
    setInterval(updateCountdown, 3600000);
    renderActivities(activities);
    renderContacts(points);
    initDailyPlanModal();
    
    const modal = document.getElementById('activityModal');
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target === modal) closeModal();
        });
    }
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

function initGeoFeatures() {
    const locateBtn = document.querySelector('.locate-button');
    if (locateBtn) {
        locateBtn.addEventListener('click', getUserLocation);
    }
    
    document.querySelectorAll('.geo-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.geo-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeGeoFilter = btn.dataset.geoFilter;
            updateCafeContent();
            if (userCoords) updateGeoView();
        });
    });
    
    updateCafeContent();
    updateTemplesContent();
}

function getUserLocation() {
    if (!navigator.geolocation) {
        alert('Геолокация не поддерживается браузером.');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(pos => {
        userCoords = [pos.coords.latitude, pos.coords.longitude];
        updateGeoView();
    }, () => {
        alert('Не удалось получить местоположение.');
    });
}

function updateGeoView() {
    updateAllDistances();
    sortAllGeoBlocks();
    updateNearbySection();
}

function updateAllDistances() {
    if (!userCoords) return;
    
    document.querySelectorAll('.geo-item-btn').forEach(button => {
        const id = parseInt(button.dataset.id, 10);
        if (isNaN(id) || !allGeoData[id]) return;
        
        const distance = getDistance(userCoords, allGeoData[id].coords);
        button.dataset.distance = distance;
        
        let distSpan = button.querySelector('.distance-tag');
        if (!distSpan) {
            distSpan = document.createElement('span');
            distSpan.className = 'distance-tag';
            button.appendChild(distSpan);
        }
        distSpan.textContent = `≈ ${distance} км`;
    });
}

function sortAllGeoBlocks() {
    ['naklua', 'pratamnak', 'jomtien'].forEach(subblockName => {
        const container = document.querySelector(`.cafe-sub-block[data-subblock="${subblockName}"]`);
        if (container) {
            const buttons = Array.from(container.querySelectorAll('.geo-item-btn'));
            buttons.sort((a, b) => (parseFloat(a.dataset.distance) || 9999) - (parseFloat(b.dataset.distance) || 9999));
            buttons.forEach(button => container.appendChild(button));
        }
    });
    
    const templesContainer = document.querySelector('.geo-temples .geo-items-container');
    if (templesContainer) {
        const buttons = Array.from(templesContainer.querySelectorAll('.geo-item-btn'));
        buttons.sort((a, b) => (parseFloat(a.dataset.distance) || 9999) - (parseFloat(b.dataset.distance) || 9999));
        buttons.forEach(button => templesContainer.appendChild(button));
    }
}

function updateNearbySection() {
    const nearbyContainer = document.getElementById('nearbyItems');
    if (!nearbyContainer) return;
    
    nearbyContainer.innerHTML = '';
    
    const targetSubblock = document.querySelector(`.cafe-sub-block[data-subblock="${activeGeoFilter}"]`);
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
        nearbyContainer.innerHTML = '<div class="empty-state">Места не найдены</div>';
    }
}

function updateCafeContent() {
    const cafeContent = document.getElementById('cafeContent');
    if (!cafeContent) return;
    
    const subblocks = {
        naklua: { name: 'Наклуа', items: [] },
        pratamnak: { name: 'Пратамнак', items: [] },
        jomtien: { name: 'Джомтьен', items: [] }
    };
    
    allGeoData.forEach((item, index) => {
        if (item.type === 'cafe' && subblocks[item.subblock]) {
            subblocks[item.subblock].items.push({ ...item, id: index });
        }
    });
    
    cafeContent.innerHTML = Object.keys(subblocks).map(key => {
        const subblock = subblocks[key];
        if (subblock.items.length === 0) return '';
        
        return `
            <div class="cafe-sub-block ${key}" data-subblock="${key}">
                <h4>📍 ${subblock.name}</h4>
                ${subblock.items.map(item => `
                    <button class="geo-item-btn" data-id="${item.id}">
                        <span class="icon">☕</span>
                        <span class="name">Кафе</span>
                    </button>
                `).join('')}
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.geo-item-btn').forEach(initGeoItemButton);
}

function updateTemplesContent() {
    const templesContainer = document.getElementById('templesContainer');
    if (!templesContainer) return;
    
    const temples = allGeoData.filter((item, index) => item.type === 'temple').map((item, originalIndex) => {
        const realIndex = allGeoData.findIndex(data => data === item);
        return { ...item, id: realIndex };
    });
    
    templesContainer.innerHTML = temples.map(temple => `
        <button class="geo-item-btn" data-id="${temple.id}">
            <span class="icon">🏛️</span>
            <span class="name">Храм</span>
        </button>
    `).join('');
    
    document.querySelectorAll('#templesContainer .geo-item-btn').forEach(initGeoItemButton);
}

function initGeoItemButton(button) {
    let startY = 0;
    let startTime = 0;
    let isLongPress = false;
    
    button.addEventListener('touchstart', e => {
        startY = e.touches[0].clientY;
        startTime = Date.now();
        isLongPress = false;
        
        setTimeout(() => {
            if (Date.now() - startTime >= 800) {
                isLongPress = true;
                const id = parseInt(button.dataset.id, 10);
                if (!isNaN(id) && allGeoData[id] && userCoords) {
                    const coords = allGeoData[id].coords;
                    const routeUrl = `https://www.google.com/maps/dir/${userCoords[0]},${userCoords[1]}/${coords[0]},${coords[1]}`;
                    window.open(routeUrl, '_blank');
                }
            }
        }, 800);
    });
    
    button.addEventListener('touchmove', e => {
        const currentY = e.touches[0].clientY;
        if (Math.abs(currentY - startY) > 10) {
            isLongPress = false;
        }
    });
    
    button.addEventListener('touchend', e => {
        e.preventDefault();
        if (Date.now() - startTime < 800 && !isLongPress) {
            const id = parseInt(button.dataset.id, 10);
            if (!isNaN(id) && allGeoData[id]) {
                window.open(allGeoData[id].link, '_blank');
            }
        }
    });
    
    button.addEventListener('click', e => {
        e.preventDefault();
        if (!isLongPress) {
            const id = parseInt(button.dataset.id, 10);
            if (!isNaN(id) && allGeoData[id]) {
                window.open(allGeoData[id].link, '_blank');
            }
        }
    });
}

function openInMaps(url) {
    window.open(url, '_blank');
}

function updateCountdown() {
    const targetDate = new Date('2025-01-07T00:00:00+07:00');
    const now = new Date();
    const diff = targetDate - now;
    
    const textElement = document.getElementById('countdownText');
    const daysElement = document.getElementById('days');
    
    if (!textElement || !daysElement) return;
    
    if (diff > 0) {
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        textElement.textContent = 'До отпуска осталось';
        daysElement.textContent = days;
    } else {
        textElement.textContent = 'Отпуск начался!';
        daysElement.textContent = '🎉';
    }
}

const activities = [
    { name: 'Mini Siam', type: 'sight', date: '2025-01-08', coords: {lat: 12.9833, lng: 100.9167} },
    { name: 'Деревня слонов', type: 'sight', date: '2025-01-10', coords: {lat: 12.8833, lng: 100.9833} },
    { name: 'Дельфинариум', type: 'sight', date: '2025-01-12', coords: {lat: 12.8500, lng: 100.9167} },
    { name: 'Сад Нонг Нуч', type: 'sight', date: '2025-01-14', coords: {lat: 12.7667, lng: 100.9500} },
    { name: 'Музей искусств 3D', type: 'sight', date: '2025-01-16', coords: {lat: 12.9333, lng: 100.8833} },
    { name: 'Аюттайя', type: 'sight', date: '2025-01-18', coords: {lat: 14.3692, lng: 100.5877} },
    { name: 'Зоопарк Кхао Кхео', type: 'sight', date: '2025-01-20', coords: {lat: 13.1167, lng: 101.0667} },
    { name: 'Плавучий рынок', type: 'sight', date: '2025-01-22', coords: {lat: 13.4167, lng: 100.3333} },
    { name: 'Пляж Джомтьен', type: 'sea', date: '2025-01-09' },
    { name: 'Пляж Наклуа', type: 'sea', date: '2025-01-11' },
    { name: 'Пляж Банг Саре', type: 'sea', date: '2025-01-13' },
    { name: 'Пляж Пратамнак', type: 'sea', date: '2025-01-15' },
    { name: 'Пляж Вонгамат', type: 'sea', date: '2025-01-17' },
    { name: 'Пляж Кози Бич', type: 'sea', date: '2025-01-19' }
];

function renderActivities(list) {
    const grid = document.getElementById('activitiesGrid');
    if (!grid) return;
    
    grid.innerHTML = list.map(a => `
        <div class="card activity-${a.type}">
            <h3>${getIconForActivity(a.name)} ${a.name}</h3>
            <p>📅 ${a.date}</p>
            ${a.type === 'sea' ? 
                `<button class="details" onclick="openDailyPlanModal('${a.name}', '${a.date}')">📝 Планы на день</button>` :
                `<button class="details" onclick="showActivityDetails('${a.name}')">Подробнее</button>`
            }
        </div>
    `).join('');
}

function showActivityDetails(activityName) {
    const activity = activities.find(a => a.name === activityName);
    if (!activity) return;
    
    const prices = {
        'Mini Siam': `<p class="price-label">Цена:</p><p class="price-tag">Взрослый 230 ฿ / Детский 130 ฿</p>`,
        'Деревня слонов': `<p class="price-label">Цена:</p><p class="price-tag">Взрослый 650 ฿ / Детский 500 ฿</p>`,
        'Дельфинариум': `<p class="price-label">Цена:</p><p class="price-tag">Взрослый 630 ฿ / Детский 450 ฿</p>`,
        'Сад Нонг Нуч': `<p class="price-label">Цена:</p><p class="price-tag">Взрослый 420 ฿ / Детский 320 ฿</p>`,
        'Музей искусств 3D': `<p class="price-label">Цена:</p><p class="price-tag">Взрослый 235 ฿ / Детский 180 ฿</p>`,
        'Зоопарк Кхао Кхео': `<p class="price-label">Цена:</p><p class="price-tag">Взрослый 350 ฿ / Детский 120 ฿</p>`,
    };
    
    const priceLine = prices[activity.name] || '';
    const dist = userCoords && activity.coords ? `<p class="distance-tag">≈${getDistance(userCoords, [activity.coords.lat, activity.coords.lng])} км</p>` : '';
    
    let content = `
        <h3>${getIconForActivity(activity.name)} ${activity.name}</h3>
        <p><strong>Дата:</strong> ${activity.date}</p>
        ${priceLine}
        ${dist}
    `;
    
    if (activity.coords) {
        content += `<button class="details" onclick="openInMaps('https://www.google.com/maps/search/?api=1&query=${activity.coords.lat},${activity.coords.lng}')">🗺️ Открыть на карте</button>`;
    }
    
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('activityModal').classList.add('active');
}

const points = [
    { name: 'MO Play Kidz', coords: {lat: 12.935051, lng: 100.882722}, icon: '👶' }
];

function renderContacts(list) {
    // Контакты уже отрендерены в HTML
}

function getIconForActivity(name) {
    const icons = {
        'Mini Siam': '🏛️',
        'Деревня слонов': '🐘',
        'Дельфинариум': '🐬',
        'Сад Нонг Нуч': '🌺',
        'Музей искусств 3D': '🎨',
        'Аюттайя': '⛩️',
        'Зоопарк Кхао Кхео': '🦒',
        'Плавучий рынок': '🛶',
        'Пляж Джомтьен': '🏖️',
        'Пляж Наклуа': '🏖️',
        'Пляж Банг Саре': '🏖️',
        'Пляж Пратамнак': '🏖️',
        'Пляж Вонгамат': '🏖️',
        'Пляж Кози Бич': '🏖️'
    };
    return icons[name] || '📍';
}

function closeModal() {
    document.getElementById('activityModal').classList.remove('active');
}

// Функции для попапа ежедневника
function initDailyPlanModal() {
    const modal = document.getElementById('dailyPlanModal');
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target === modal) closeDailyPlanModal();
        });
    }
}

function openDailyPlanModal(activityName, date) {
    const modal = document.getElementById('dailyPlanModal');
    const grid = document.getElementById('dailyPlanGrid');
    
    if (!modal || !grid) return;
    
    // Генерируем временные слоты с 07:00 до 21:00
    let timeSlots = '';
    for (let hour = 7; hour <= 20; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        const key = `${date}_${startTime}`;
        const savedPlan = localStorage.getItem(key) || '';
        
        timeSlots += `
            <div class="daily-plan-row">
                <div class="time-slot">${startTime} - ${endTime}</div>
                <input type="text" 
                       class="plan-input" 
                       data-time="${startTime}" 
                       data-date="${date}"
                       value="${savedPlan}"
                       placeholder="..................................">
            </div>
        `;
    }
    
    document.querySelector('#dailyPlanModalBody h3').textContent = `📝 Планы на день - ${activityName}`;
    grid.innerHTML = timeSlots;
    
    // Добавляем обработчики с защитой от случайных тапов
    document.querySelectorAll('.plan-input').forEach(input => {
        let touchStartTime = 0;
        let touchStartY = 0;
        
        input.addEventListener('touchstart', e => {
            touchStartTime = Date.now();
            touchStartY = e.touches[0].clientY;
        });
        
        input.addEventListener('touchend', e => {
            const touchEndTime = Date.now();
            const timeDiff = touchEndTime - touchStartTime;
            
            // Фокусируемся только при намеренном тапе (больше 150ms)
            if (timeDiff > 150) {
                setTimeout(() => input.focus(), 50);
            }
        });
        
        input.addEventListener('touchmove', e => {
            const currentY = e.touches[0].clientY;
            const moveDiff = Math.abs(currentY - touchStartY);
            
            // Если есть значительное движение, не фокусируемся
            if (moveDiff > 10) {
                touchStartTime = 0;
            }
        });
    });
    
    modal.classList.add('active');
}

function closeDailyPlanModal() {
    const modal = document.getElementById('dailyPlanModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function saveDailyPlan() {
    const inputs = document.querySelectorAll('.plan-input');
    let savedCount = 0;
    
    inputs.forEach(input => {
        const date = input.dataset.date;
        const time = input.dataset.time;
        const value = input.value.trim();
        const key = `${date}_${time}`;
        
        if (value) {
            localStorage.setItem(key, value);
            savedCount++;
        } else {
            localStorage.removeItem(key);
        }
    });
    
    // Показываем уведомление о сохранении
    const saveBtn = document.querySelector('.save-plan-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = `✅ Сохранено (${savedCount})`;
    saveBtn.style.backgroundColor = '#22c55e';
    
    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.backgroundColor = '';
    }, 2000);
}
