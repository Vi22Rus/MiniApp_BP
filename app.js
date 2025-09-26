// Version: 1.0.6
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
    "https://maps.app.goo.gl/1Ubzy3TB3hCdG2YR8", "https://maps.app.goo.gl/fCCogyeGKWqJca8g7",
    "https://maps.app.goo.gl/Fba5C2aJVW7YxLz98", "https://maps.app.goo.gl/UagUbAPDmdJBAbCJ6",
    "https://maps.app.goo.gl/dXaCX7UgmriNPEpm8", "https://maps.app.goo.gl/Zn15kwEB5i9bfJGL6",
    "https://maps.app.goo.gl/VyE7D7gwHRL4nMNc6", "https://maps.app.goo.gl/DwNiL8531uQVURRZ9",
    "https://maps.app.goo.gl/VFFio7Q6t9qgJk4A9", "https://maps.app.goo.gl/UpRFKn6nAgTa1sNS8",
    "https://maps.app.goo.gl/fn868NKBZYGE4tUJ7", "https://maps.app.goo.gl/d6Wp4s38aTAPBCFz9",
    "https://maps.app.goo.gl/LGssrnWfy3KEZJ9u6", "https://maps.app.goo.gl/zPpiXtiNQts6f1Tb6",
    "https://maps.app.goo.gl/rFeQbBftxVTd2M6j9"
];

// Координаты для кнопок кафе (длительное нажатие и расчет дистанции)
const geoCafeCoords = [
    [12.965314728870327, 100.88574547083675], [12.964959752753911, 100.88655104216504],
    [12.965151141707688, 100.88674436342762], [12.964288806741925, 100.88816176884599],
    [12.96424632513826, 100.88873268926864], [12.964275050492303, 100.88867431363093],
    [12.967898770765563, 100.89741326647155], [12.973265034689499, 100.90657393095435],
    [12.968006641294641, 100.89704079447756], [12.96748945294801, 100.88317093728782],
    [12.892621251136807, 100.87323076484746], [12.909346981806133, 100.85799998332298],
    [12.909615777640497, 100.86413037030111], [12.909461552901218, 100.86416750079316],
    [12.91753238629045, 100.86705154538753]
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
    initGeoCafeButtons();
    initGeoFilters();
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
    if (!userCoords) {
        resetGeoState();
        return;
    }
    updateGeoCafeDistances();
    sortCafeSubblocks();
    applyGeoFilter();
}

function sortCafeSubblocks() {
    ['naklua', 'pratamnak', 'jomtien'].forEach(subblockName => {
        const container = document.querySelector(`.cafe-sub-block.${subblockName}`);
        const buttons = Array.from(container.querySelectorAll('.geo-cafe-btn'));
        
        buttons.sort((a, b) => {
            const distA = parseFloat(a.dataset.distance || 9999);
            const distB = parseFloat(b.dataset.distance || 9999);
            return distA - distB;
        });

        buttons.forEach(button => container.appendChild(button));
    });
}

function applyGeoFilter() {
    restoreAllCafeButtonsToSubblocks();
    const nearbyContainer = document.getElementById('nearbyItems');
    nearbyContainer.innerHTML = ''; // Очищаем блок "Рядом"

    if (!userCoords) {
        nearbyContainer.innerHTML = `<div class="empty-state">Нажмите "Получить местоположение"</div>`;
        return;
    }

    const targetSubblock = document.querySelector(`.cafe-sub-block.${activeGeoFilter}`);
    if (!targetSubblock) return;

    const closestButton = targetSubblock.querySelector('.geo-cafe-btn');
    
    if (closestButton) {
        const clone = closestButton.cloneNode(true);
        initGeoCafeButton(clone); // Навешиваем события на клон
        nearbyContainer.appendChild(clone);
        closestButton.style.display = 'none';
    } else {
        nearbyContainer.innerHTML = `<div class="empty-state">Нет заведений в районе ${activeGeoFilter}</div>`;
    }
}

function restoreAllCafeButtonsToSubblocks() {
    document.querySelectorAll('.geo-cafe-btn').forEach(btn => btn.style.display = 'flex');
    const nearbyContainer = document.getElementById('nearbyItems');
    nearbyContainer.innerHTML = `<div class="empty-state">Нажмите "Получить местоположение"</div>`;
}

function resetGeoState() {
    userCoords = null;
    restoreAllCafeButtonsToSubblocks();
    document.querySelectorAll('.geo-cafe-btn .distance-tag').forEach(tag => tag.remove());
    document.querySelectorAll('.geo-cafe-btn').forEach(btn => delete btn.dataset.distance);
}


// -- Существующая логика (с изменениями) --

function initGeoCafeButtons() {
    document.querySelectorAll('.geo-cafe-btn').forEach(initGeoCafeButton);
}

function initGeoCafeButton(button) {
    const id = parseInt(button.dataset.id, 10);
    if (isNaN(id)) return;
    
    let pressTimer;
    let isLongPress = false;

    const startPress = (e) => {
        e.preventDefault();
        isLongPress = false;
        pressTimer = setTimeout(() => {
            isLongPress = true;
            if (!userCoords) {
                alert('Сначала определите ваше местоположение.');
                return;
            }
            if (geoCafeCoords[id]) {
                const destination = geoCafeCoords[id].join(',');
                const origin = userCoords.join(',');
                window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, '_blank');
            }
        }, 800);
    };

    const cancelPress = () => {
        clearTimeout(pressTimer);
        if (!isLongPress) {
            if (geoCafeLinks[id]) {
                window.open(geoCafeLinks[id], '_blank');
            }
        }
    };
    
    button.addEventListener('mousedown', startPress);
    button.addEventListener('mouseup', cancelPress);
    button.addEventListener('mouseleave', () => clearTimeout(pressTimer));
    button.addEventListener('touchstart', startPress, { passive: true });
    button.addEventListener('touchend', cancelPress);
    button.addEventListener('touchcancel', () => clearTimeout(pressTimer));
}

function updateGeoCafeDistances() {
    if (!userCoords) return
