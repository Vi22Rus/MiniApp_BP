// Version: 1.0.7
// Last updated: 2025-09-26
// Версия скрипта: app.js (337 строк)
// Дом (Club Royal)
const homeCoords = { lat: 12.96933724471163, lng: 100.88800963156544 };

// Глобальные переменные
let userCoords = null;
let activeGeoFilter = 'naklua'; // Фильтр по умолчанию

// Данные по кафе
const geoCafeData = [
    { link: "https://maps.app.goo.gl/1Ubzy3TB3hCdG2YR8", coords: [12.965314728870327, 100.88574547083675] },
    { link: "https://maps.app.goo.gl/fCCogyeGKWqJca8g7", coords: [12.964959752753911, 100.88655104216504] },
    { link: "https://maps.app.goo.gl/Fba5C2aJVW7YxLz98", coords: [12.965151141707688, 100.88674436342762] },
    { link: "https://maps.app.goo.gl/UagUbAPDmdJBAbCJ6", coords: [12.964288806741925, 100.88816176884599] },
    { link: "https://maps.app.goo.gl/dXaCX7UgmriNPEpm8", coords: [12.96424632513826, 100.88873268926864] },
    { link: "https://maps.app.goo.gl/Zn15kwEB5i9bfJGL6", coords: [12.964275050492303, 100.88867431363093] },
    { link: "https://maps.app.goo.gl/VyE7D7gwHRL4nMNc6", coords: [12.967898770765563, 100.89741326647155] },
    { link: "https://maps.app.goo.gl/DwNiL8531uQVURRZ9", coords: [12.973265034689499, 100.90657393095435] },
    { link: "https://maps.app.goo.gl/VFFio7Q6t9qgJk4A9", coords: [12.968006641294641, 100.89704079447756] },
    { link: "https://maps.app.goo.gl/UpRFKn6nAgTa1sNS8", coords: [12.96748945294801, 100.88317093728782] },
    { link: "https://maps.app.goo.gl/fn868NKBZYGE4tUJ7", coords: [12.892621251136807, 100.87323076484746] },
    { link: "https://maps.app.goo.gl/d6Wp4s38aTAPBCFz9", coords: [12.909346981806133, 100.85799998332298] },
    { link: "https://maps.app.goo.gl/LGssrnWfy3KEZJ9u6", coords: [12.909615777640497, 100.86413037030111] },
    { link: "https://maps.app.goo.gl/zPpiXtiNQts6f1Tb6", coords: [12.909461552901218, 100.86416750079316] },
    { link: "https://maps.app.goo.gl/rFeQbBftxVTd2M6j9", coords: [12.91753238629045, 100.86705154538753] }
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
        console.error("Ошибка при инициализации приложения:", e);
        alert("Произошла ошибка при загрузке приложения. Пожалуйста, проверьте консоль.");
    }
});

function initApp() {
    initTabs();
    initFilters();
    initGeoFeatures();
    
    updateCountdown();
    setInterval(updateCountdown, 3600000);
    
    renderActivities(activities);
    renderContacts(points);
    
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', e => {
        if (e.target.id === 'modalOverlay') closeModal();
    });
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

// --- Логика для вкладки "Гео" ---

function initGeoFeatures() {
    // Кнопка "Получить местоположение"
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

    // Кнопки-фильтры районов
    document.querySelectorAll('.geo-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.geo-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeGeoFilter = btn.dataset.filter;
            if (userCoords) {
                updateGeoView();
            }
        });
    });

    // Кнопки кафе
    document.querySelectorAll('.geo-cafe-btn').forEach(initGeoCafeButton);
}

function updateGeoView() {
    updateGeoCafeDistances();
    sortCafeSubblocks();
    applyGeoFilter();
}

function updateGeoCafeDistances() {
    document.querySelectorAll('.geo-cafe-btn').forEach(button => {
        const id = parseInt(button.dataset.id, 10);
        if (isNaN(id) || !userCoords) return;
        
        const distance = getDistance(userCoords, geoCafeData[id].coords);
        button.dataset.distance = distance;
        let distSpan = button.querySelector('.distance-tag');
        if (!distSpan) {
            distSpan = document.createElement('span');
            distSpan.className = 'distance-tag';
            button.appendChild(distSpan);
        }
        distSpan.textContent = ` ≈ ${distance} км`;
    });
}

function sortCafeSubblocks() {
    ['naklua', 'pratamnak', 'jomtien'].forEach(subblockName => {
        const container = document.querySelector(`.cafe-sub-block[data-subblock-name="${subblockName}"]`);
        const buttons = Array.from(container.querySelectorAll('.geo-cafe-btn'));
        buttons.sort((a, b) => (parseFloat(a.dataset.distance) || 9999) - (parseFloat(b.dataset.distance) || 9999));
        buttons.forEach(button => container.appendChild(button));
    });
}

function applyGeoFilter() {
    restoreAllCafeButtons();
    const nearbyContainer = document.getElementById('nearbyItems');
    nearbyContainer.innerHTML = '';

    const targetSubblock = document.querySelector(`.cafe-sub-block[data-subblock-name="${activeGeoFilter}"]`);
    if (!targetSubblock) return;
    
    const closestButton = targetSubblock.querySelector('.geo-cafe-btn');
    if (closestButton) {
        nearbyContainer.appendChild(closestButton);
    } else {
        nearbyContainer.innerHTML = `<div class="empty-state">Нет заведений в этом районе</div>`;
    }
}

function restoreAllCafeButtons() {
    document.querySelectorAll('.geo-cafe-btn').forEach(button => {
        const id = parseInt(button.dataset.id, 10);
        const parentSubblock = document.querySelector(`.cafe-sub-block[data-subblock-name="${getSubblockNameForButton(id)}"]`);
        if (parentSubblock && !parentSubblock.contains(button)) {
            parentSubblock.appendChild(button);
        }
    });
}

function getSubblockNameForButton(id) {
    const btn = document.querySelector(`.geo-cafe-btn[data-id="${id}"]`);
    const subblock = btn?.closest('.cafe-sub-block');
    return subblock?.dataset.subblockName;
}

function resetGeoState() {
    userCoords = null;
    restoreAllCafeButtons();
    document.getElementById('nearbyItems').innerHTML = `<div class="empty-state">Нажмите "Получить местоположение"</div>`;
    document.querySelectorAll('.geo-cafe-btn .distance-tag').forEach(tag => tag.remove());
    document.querySelectorAll('.geo-cafe-btn').forEach(btn => delete btn.dataset.distance);
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
            if (geoCafeData[id]) {
                const destination = geoCafeData[id].coords.join(',');
                const origin = userCoords.join(',');
                window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, '_blank');
            }
        }, 800);
    };

    const cancelPress = (e) => {
        e.preventDefault();
        clearTimeout(pressTimer);
        if (!isLongPress) {
            if (geoCafeData[id]) {
                window.open(geoCafeData[id].link, '_blank');
            }
        }
    };
    
    // Удаляем старые обработчики, чтобы избежать дублирования
    button.removeEventListener('mousedown', start
