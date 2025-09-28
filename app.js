// Version: 1.4.0 | Lines: 580
// Last updated: 2025-09-28
// Версия скрипта: app.js (580 строк) с ГИБРИДНЫМ ХРАНИЛИЩЕМ
const homeCoords = { lat: 12.96933724471163, lng: 100.88800963156544 };
let userCoords = null;
let activeGeoFilter = 'naklua';

// TELEGRAM BOT INTEGRATION - ВСТАВЬТЕ ВАШИ ДАННЫЕ
const BOT_TOKEN = '8238598464:AAGwjUOg3H5j69xoFeNnaiUO9Y1wkjZSIX4';
const CHAT_ID = '231009417';

// Хранилище и синхронизация
let botStorage = {};
let storageInitialized = false;
let lastUpdateId = 0;
let syncInterval = null;
let saveTimeout = null;

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
    initDailyPlanModal();
    initBotStorage(); // ИНИЦИАЛИЗАЦИЯ ГИБРИДНОГО ХРАНИЛИЩА
    
    updateCountdown();
    setInterval(updateCountdown, 3600000);
    
    renderActivities(activities);
    renderContacts(points);
    
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', e => {
        if (e.target.id === 'modalOverlay') closeModal();
    });
}

// ГИБРИДНОЕ ХРАНИЛИЩЕ: localStorage (постоянно) + Telegram (синхронизация)

// Инициализация гибридного хранилища
async function initBotStorage() {
    if (storageInitialized) return;
    
    try {
        console.log('🤖 Initializing Hybrid storage (localStorage + Telegram sync)...');
        
        // Загружаем ВСЕ данные из localStorage
        const allKeys = Object.keys(localStorage).filter(key => key.includes('_') && key.match(/\d{2}\.\d{2}\.\d{4}_\d{2}:\d{2}/));
        
        allKeys.forEach(key => {
            botStorage[key] = localStorage.getItem(key);
        });
        
        storageInitialized = true;
        
        console.log(`📱 Storage initialized with ${Object.keys(botStorage).length} plans from localStorage`);
        console.log('📋 Loaded plans:', Object.keys(botStorage));
        
        if (Object.keys(botStorage).length === 0) {
            await sendToTelegramBot('🏖️ Pattaya Plans Bot запущен!\nИспользуется гибридное хранилище: localStorage + Telegram sync');
        }
        
        // Запускаем синхронизацию изменений
        startPeriodicSync();
        
    } catch (error) {
        console.error('❌ Storage init error:', error);
        storageInitialized = true;
    }
}

// Трансляция изменений через Telegram
function broadcastChange(action, key, value = null) {
    const changeMessage = `SYNC:${JSON.stringify({
        action: action,
        key: key,
        value: value,
        timestamp: Date.now(),
        user: 'user_' + Math.random().toString(36).substr(2, 5) // Уникальный ID пользователя
    })}`;
    sendToTelegramBot(changeMessage, true);
}

// Отслеживание SYNC сообщений от других пользователей
async function loadNewUpdatesFromBot() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&limit=100`);
        const result = await response.json();
        
        if (result.ok && result.result && result.result.length > 0) {
            let dataUpdated = false;
            
            result.result.forEach(update => {
                lastUpdateId = Math.max(lastUpdateId, update.update_id);
                
                // Отслеживаем SYNC сообщения (изменения от других пользователей)
                if (update.message && update.message.text && update.message.text.startsWith('SYNC:')) {
                    try {
                        const syncText = update.message.text.replace('SYNC:', '');
                        const syncData = JSON.parse(syncText);
                        
                        if (syncData.action === 'set') {
                            if (localStorage.getItem(syncData.key) !== syncData.value) {
                                localStorage.setItem(syncData.key, syncData.value);
                                botStorage[syncData.key] = syncData.value;
                                dataUpdated = true;
                                console.log('🔄 Synced SET from other user:', syncData.key, '=', syncData.value);
                            }
                        } else if (syncData.action === 'delete') {
                            if (localStorage.getItem(syncData.key)) {
                                localStorage.removeItem(syncData.key);
                                delete botStorage[syncData.key];
                                dataUpdated = true;
                                console.log('🔄 Synced DELETE from other user:', syncData.key);
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing SYNC data:', e);
                    }
                }
            });
            
            if (dataUpdated) {
                refreshCurrentModal();
            }
        }
    } catch (error) {
        console.error('❌ Sync error:', error);
    }
}

// Запуск синхронизации
function startPeriodicSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
    }
    
    syncInterval = setInterval(async () => {
        if (storageInitialized) {
            await loadNewUpdatesFromBot();
        }
    }, 3000); // Каждые 3 секунды
}

// Обновление попапа при синхронизации
function refreshCurrentModal() {
    const modal = document.getElementById('dailyPlanModal');
    if (modal && modal.classList.contains('active')) {
        document.querySelectorAll('.plan-input').forEach(input => {
            const date = input.dataset.date;
            const time = input.dataset.time;
            const key = `${date}_${time}`;
            const savedValue = botStorage[key] || '';
            
            if (document.activeElement !== input && input.value !== savedValue) {
                input.value = savedValue;
                input.style.backgroundColor = '#e3f2fd';
                setTimeout(() => {
                    input.style.backgroundColor = '';
                }, 1000);
                console.log('🔄 UI refreshed with synced data:', key);
            }
        });
    }
}

// Принудительная синхронизация
async function forceSync() {
    console.log('🔄 Force sync requested...');
    const button = event.target;
    button.textContent = '⏳';
    button.disabled = true;
    
    await loadNewUpdatesFromBot();
    refreshCurrentModal();
    
    button.textContent = '🔄 Обновить';
    button.disabled = false;
    
    const notification = document.createElement('div');
    notification.textContent = '✅ Данные синхронизированы';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 10000;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

async function sendToTelegramBot(message, isData = false) {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                disable_notification: isData,
                parse_mode: isData ? undefined : 'Markdown',
                ...(isData && { disable_web_page_preview: true })
            })
        });
        const result = await response.json();
        if (!result.ok) {
            console.error('Telegram API error:', result);
        }
        return result;
    } catch (error) {
        console.error('❌ Telegram send error:', error);
        return null;
    }
}

// ГИБРИДНЫЕ ФУНКЦИИ ХРАНЕНИЯ

function setStorageItem(key, value, callback = null) {
    if (!storageInitialized) {
        setTimeout(() => setStorageItem(key, value, callback), 500);
        return;
    }
    
    // Сохраняем локально ВСЕГДА (основное хранилище)
    localStorage.setItem(key, value);
    botStorage[key] = value;
    
    // Уведомление в Telegram
    const [date, time] = key.split('_');
    const formattedDate = date.split('.').reverse().join('-');
    const dateObj = new Date(formattedDate);
    const dayName = dateObj.toLocaleDateString('ru-RU', { weekday: 'long' });
    
    sendToTelegramBot(`📝 *Новый план добавлен*\n\n📅 ${date} (${dayName})\n🕐 ${time}\n💭 "${value}"`);
    
    // Синхронизация: отправляем изменение всем пользователям
    broadcastChange('set', key, value);
    
    console.log('✅ Saved to localStorage + broadcasted to other users');
    if (callback) callback();
}

function getStorageItem(key, callback) {
    if (!storageInitialized) {
        setTimeout(() => getStorageItem(key, callback), 100);
        return;
    }
    
    // Читаем из localStorage (надежное хранилище)
    const value = localStorage.getItem(key) || '';
    botStorage[key] = value; // Синхронизируем с памятью
    
    if (value) {
        console.log(`✅ Found local plan: ${key} = "${value}"`);
    }
    
    callback(value);
}

function removeStorageItem(key, callback = null) {
    if (!storageInitialized) {
        setTimeout(() => removeStorageItem(key, callback), 500);
        return;
    }
    
    if (localStorage.getItem(key)) {
        const oldValue = localStorage.getItem(key);
        
        // Удаляем из обоих хранилищ
        localStorage.removeItem(key);
        delete botStorage[key];
        
        const [date, time] = key.split('_');
        sendToTelegramBot(`🗑️ *План удален*\n\n📅 ${date}\n🕐 ${time}\n~~"${oldValue}"~~`);
        
        // Синхронизация: сообщаем об удалении всем пользователям
        broadcastChange('delete', key);
        
        console.log('✅ Deleted from localStorage + broadcasted to other users');
    }
    
    if (callback) callback();
}

// Очистка при закрытии страницы
window.addEventListener('beforeunload', () => {
    if (syncInterval) {
        clearInterval(syncInterval);
    }
});

// [ОСТАЛЬНОЙ КОД БЕЗ ИЗМЕНЕНИЙ]

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
    document.getElementById('locateBtn').addEventListener('click', () => {
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

    document.querySelectorAll('.geo-item-btn').forEach(initGeoItemButton);
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
        distSpan.textContent = ` ≈ ${distance} км`;
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
        nearbyContainer.innerHTML = `<div class="empty-state">Нет заведений</div>`;
    }
}

function restoreAllButtonsVisibility() {
    document.querySelectorAll('.geo-item-btn').forEach(btn => btn.style.display = 'flex');
}

function resetGeoState() {
    userCoords = null;
    document.getElementById('nearbyItems').innerHTML = `<div class="empty-state">Нажмите "Получить местоположение"</div>`;
    restoreAllButtonsVisibility();
    document.querySelectorAll('.distance-tag').forEach(tag => tag.remove());
    document.querySelectorAll('[data-distance]').forEach(el => delete el.dataset.distance);
}

function initGeoItemButton(button) {
    const id = parseInt(button.dataset.id, 10);
    if (isNaN(id)) return;

    let pressTimer = null;
    let startX, startY;
    let isScrolling = false;
    const MOVE_THRESHOLD = 10;

    const handlePressStart = (e) => {
        isScrolling = false;
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

        pressTimer = setTimeout(() => {
            if (!isScrolling) {
                if (!userCoords) return alert('Сначала определите ваше местоположение.');
                const destination = allGeoData[id].coords.join(',');
                const origin = userCoords.join(',');
                window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, '_blank');
            }
            pressTimer = null;
        }, 800);
    };

    const handlePressMove = (e) => {
        if (isScrolling || !pressTimer) return;
        const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        if (Math.abs(currentX - startX) > MOVE_THRESHOLD || Math.abs(currentY - startY) > MOVE_THRESHOLD) {
            isScrolling = true;
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    };

    const handlePressEnd = (e) => {
        if (!isScrolling && pressTimer) {
            e.preventDefault();
            clearTimeout(pressTimer);
            window.open(allGeoData[id].link, '_blank');
        }
        pressTimer = null;
    };

    const handlePressCancel = () => { clearTimeout(pressTimer); pressTimer = null; };

    button.removeEventListener('mousedown', handlePressStart);
    button.removeEventListener('mousemove', handlePressMove);
    button.removeEventListener('mouseup', handlePressEnd);
    button.removeEventListener('mouseleave', handlePressCancel);
    button.addEventListener('mousedown', handlePressStart);
    button.addEventListener('mousemove', handlePressMove);
    button.addEventListener('mouseup', handlePressEnd);
    button.addEventListener('mouseleave', handlePressCancel);

    button.removeEventListener('touchstart', handlePressStart);
    button.removeEventListener('touchmove', handlePressMove);
    button.removeEventListener('touchend', handlePressEnd);
    button.removeEventListener('touchcancel', handlePressCancel);
    button.addEventListener('touchstart', handlePressStart, { passive: true });
    button.addEventListener('touchmove', handlePressMove, { passive: true });
    button.addEventListener('touchend', handlePressEnd);
    button.addEventListener('touchcancel', handlePressCancel);
}

const kidsLeisure = [
    { name: 'Mini Siam', date: '01.01.2026', coords: { lat: 12.9554157, lng: 100.9088538 }, tips: 'Парк миниатюр.', type: 'sight' },
    { name: 'Деревня слонов', date: '04.01.2026', coords: { lat: 12.91604299, lng: 100.93883441 }, tips: 'Шоу слонов (14:30–16:00).', type: 'sight' },
    { name: 'Дельфинариум', date: '07.01.2026', coords: { lat: 12.95222191, lng: 100.93617557 }, tips: 'Шоу дельфинов в 15:00.', type: 'sight' },
    { name: 'Сад Нонг Нуч', date: '11.01.2026', coords: { lat: 12.76575858, lng: 100.93505629 }, tips: 'Шоу слонов и сад.', type: 'sight' },
    { name: 'Музей искусств 3D', date: '13.01.2026', coords: { lat: 12.94832322, lng: 100.88976288 }, tips: 'Интерактивные фотозоны.', type: 'sight' },
    { name: 'Аюттайя', date: '16.01.2026', coords: { lat: 14.35741905, lng: 100.56757512 }, tips: 'Древняя столица.', type: 'sight' },
    { name: 'Зоопарк Кхао Кхео', date: '19.01.2026', coords: { lat: 13.21500644, lng: 101.05700099 }, tips: 'Открытый зоопарк.', type: 'sight' },
    { name: 'Плавучий рынок', date: '22.01.2026', coords: { lat: 12.86799376, lng: 100.90469404 }, tips: 'Торговля на лодках.', type: 'sight' }
];

function generateBeachDays() {
    const used = kidsLeisure.map(x => x.date), days = [];
    const start = new Date('2025-12-29'), end = new Date('2026-01-26');
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const date = d.toLocaleDateString('ru-RU');
        if (!used.includes(date)) {
            days.push({ type: 'sea', name: 'Пляжинг', date, coords: null, tips: 'Отдых на море.' });
        }
    }
    return days;
}

const activities = [...generateBeachDays(), ...kidsLeisure].sort((a,b) => new Date(a.date.split('.').reverse().join('-')) - new Date(b.date.split('.').reverse().join('-')));

function updateCountdown() {
    const startTrip = new Date('2025-12-29');
    const endTrip = new Date('2026-01-26');
    const now = new Date();
    
    if (now < startTrip) {
        const days = Math.ceil((startTrip - now) / 864e5);
        document.getElementById('countdownText').textContent = 'До поездки:';
        document.getElementById('days').textContent = days;
        document.querySelector('.countdown-label').textContent = 'дней';
    } else if (now >= startTrip && now < endTrip) {
        const daysToGo = Math.ceil((endTrip - now) / 864e5);
        document.getElementById('countdownText').textContent = 'До отъезда:';
        document.getElementById('days').textContent = daysToGo;
        document.querySelector('.countdown-label').textContent = 'дней';
    } else {
        document.getElementById('countdownText').textContent = 'Поездка завершена!';
        document.getElementById('days').textContent = '✔';
        document.querySelector('.countdown-label').textContent = '';
    }
}

function renderActivities(list) {
    const grid = document.getElementById('activitiesGrid');
    if (!grid) return;
    grid.innerHTML = list.map(a => {
        const cardClass = `card ${a.type === 'sea' ? 'activity-sea' : 'activity-sight'}`;
        let icon = a.type === 'sea' ? '🏖️ ' : (getIconForActivity(a.name) + ' ');
        const prices = {
            'Mini Siam': `<p class="price-tag"><span class="price-label">Взрослый</span> 230 ฿ / <span class="price-label">Детский</span> 130 ฿</p>`,
            'Деревня слонов': `<p class="price-tag"><span class="price-label">Взрослый</span> 650 ฿ / <span class="price-label">Детский</span> 500 ฿</p>`,
            'Дельфинариум': `<p class="price-tag"><span class="price-label">Взрослый</span> 630 ฿ / <span class="price-label">Детский</span> 450 ฿</p>`,
            'Сад Нонг Нуч': `<p class="price-tag"><span class="price-label">Взрослый</span> 420 ฿ / <span class="price-label">Детский</span> 320 ฿</p>`,
            'Музей искусств 3D': `<p class="price-tag"><span class="price-label">Взрослый</span> 235 ฿ / <span class="price-label">Детский</span> 180 ฿</p>`,
            'Зоопарк Кхао Кхео': `<p class="price-tag"><span class="price-label">Взрослый</span> 350 ฿ / <span class="price-label">Детский</span> 120 ฿</p>`,
        };
        const priceLine = prices[a.name] || '';
        const dist = userCoords && a.coords ? `<p class="distance-tag">≈${getDistance(userCoords, [a.coords.lat, a.coords.lng])} км</p>` : '';
        
        const buttonHtml = a.type === 'sea' ? 
            `<button class="details daily-plan-btn" data-name="${a.name}" data-date="${a.date}">Планы на день</button>` :
            (a.coords ? `<button class="details" data-name="${a.name}" data-date="${a.date}">Подробнее</button>` : '');
        
        return `<div class="${cardClass}"><h3>${icon}${a.name}</h3><p>${a.date}</p>${priceLine}${dist}${buttonHtml}</div>`;
    }).join('');
    bindDetailButtons();
}

function bindDetailButtons() {
    document.querySelectorAll('.details').forEach(btn => {
        btn.onclick = () => {
            if (btn.classList.contains('daily-plan-btn')) {
                openDailyPlanModal(btn.dataset.name, btn.dataset.date);
            } else {
                const act = activities.find(x => x.name === btn.dataset.name && x.date === btn.dataset.date);
                if (act) showModal(act);
            }
        };
    });
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
        content += `<p>📏 Расстояние: ≈${distance} км</p>`;
    }
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalOverlay').classList.add('active');
}

const points = [ { name: 'MO Play Kidz', coords: {lat: 12.935051, lng: 100.882722}, icon: '👶' } ];

function renderContacts(list) {
    const grid = document.getElementById('contactsGrid');
    if (!grid) return;
    let items = list.slice();
    if (userCoords) {
        items.forEach(p => p.distance = parseFloat(getDistance(userCoords, [p.coords.lat, p.coords.lng])));
        items.sort((a,b) => a.distance - b.distance);
    }
    grid.innerHTML = items.map(p => {
        const distTag = p.distance ? `<span class="distance-tag">≈${p.distance.toFixed(1)} км</span>` : '';
        return `<button class="contact-btn" onclick='showContactModal(${JSON.stringify(p)})'><span class="icon">${p.icon}</span><span>${p.name}</span>${distTag}</button>`;
    }).join('');
}

function getIconForActivity(name) {
    const icons = {
        'Mini Siam': '🏛️', 'Деревня слонов': '🐘', 'Дельфинариум': '🐬', 'Сад Нонг Нуч': '🌺',
        'Музей искусств 3D': '🎨', 'Аюттайя': '⛩️', 'Зоопарк Кхао Кхео': '🦒', 'Плавучий рынок': '🛶'
    };
    return icons[name] || '📍';
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

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
    
    document.querySelector('#dailyPlanModalBody h3').innerHTML = `
        📝 Планы на день - ${activityName}
        <button onclick="forceSync()" style="float:right; padding:6px 12px; font-size:14px; background:#4f46e5; color:white; border:none; border-radius:6px; cursor:pointer; margin-left:10px;">🔄 Обновить</button>
    `;
    
    let timeSlots = '';
    const timeSlotData = [];
    
    for (let hour = 7; hour <= 20; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        const key = `${date}_${startTime}`;
        
        timeSlotData.push({ startTime, endTime, key, date });
        
        timeSlots += `
            <div class="daily-plan-row">
                <div class="time-slot">${startTime} - ${endTime}</div>
                <input type="text" 
                       class="plan-input" 
                       data-time="${startTime}" 
                       data-date="${date}"
                       value=""
                       placeholder="..............................">
            </div>
        `;
    }
    
    grid.innerHTML = timeSlots;
    modal.classList.add('active');
    
    timeSlotData.forEach(slot => {
        getStorageItem(slot.key, (savedPlan) => {
            const input = document.querySelector(`input[data-time="${slot.startTime}"][data-date="${slot.date}"]`);
            if (input && savedPlan) {
                input.value = savedPlan;
            }
        });
    });
    
    document.querySelectorAll('.plan-input').forEach(input => {
        let touchStartTime = 0;
        let touchStartY = 0;
        
        input.addEventListener('blur', () => {
            autoSavePlan(input);
        });
        
        let saveTimeout;
        input.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                autoSavePlan(input);
            }, 1000);
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                autoSavePlan(input);
                input.blur();
            }
        });
        
        input.addEventListener('touchstart', e => {
            touchStartTime = Date.now();
            touchStartY = e.touches[0].clientY;
        });
        
        input.addEventListener('touchend', e => {
            const touchEndTime = Date.now();
            const timeDiff = touchEndTime - touchStartTime;
            
            if (timeDiff > 150) {
                setTimeout(() => input.focus(), 50);
            }
        });
        
        input.addEventListener('touchmove', e => {
            const currentY = e.touches[0].clientY;
            const moveDiff = Math.abs(currentY - touchStartY);
            
            if (moveDiff > 10) {
                touchStartTime = 0;
            }
        });
    });
}

function closeDailyPlanModal() {
    const modal = document.getElementById('dailyPlanModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function autoSavePlan(input) {
    const date = input.dataset.date;
    const time = input.dataset.time;
    const value = input.value.trim();
    const key = `${date}_${time}`;
    
    console.log(`🔄 Auto-saving plan: ${key} = "${value}"`);
    
    if (value) {
        setStorageItem(key, value, () => {
            input.style.backgroundColor = '#dcfce7';
            setTimeout(() => {
                input.style.backgroundColor = '';
            }, 300);
            console.log(`✅ Plan saved: ${time} - ${value}`);
        });
    } else {
        removeStorageItem(key, () => {
            console.log(`🗑️ Empty plan removed: ${time}`);
        });
    }
}
