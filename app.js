// Version: 1.8.1 | Lines: ~900 | Last updated: 2025-09-30
// ===== FIREBASE CONFIGURATION =====
const firebaseConfig = {
  apiKey: "AIzaSyBX7abjiafmFuRLNwixPgfAIuoyUWNtIEQ",
  authDomain: "pattaya-plans-app.firebaseapp.com",
  databaseURL: "https://pattaya-plans-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pattaya-plans-app",
  storageBucket: "pattaya-plans-app.firebasestorage.app",
  messagingSenderId: "152286016885",
  appId: "1:152286016885:web:dd389c8294b7c744d04f3c"
};

let firebaseApp;
let firebaseDatabase;

function initFirebase() {
  try {
    if (typeof firebase !== 'undefined') {
      firebaseApp = firebase.initializeApp(firebaseConfig);
      firebaseDatabase = firebase.database();
      console.log('✓ Firebase инициализирован');
    } else {
      console.warn('⚠ Firebase SDK не загружен');
    }
  } catch (error) {
    console.error('✗ Ошибка Firebase:', error);
  }
}

// ===== WEATHER API CONFIGURATION =====
const PATTAYA_LAT = 12.9236;
const PATTAYA_LON = 100.8825;
let weatherCache = {};

function formatDateForAPI(dateStr) {
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

async function fetchWeatherData(date) {
  const apiDate = formatDateForAPI(date);
  if (weatherCache[apiDate]) {
    console.log(`✓ Погода взята из кэша для ${apiDate}`);
    return weatherCache[apiDate];
  }
  try {
    const airTempUrl = `https://api.open-meteo.com/v1/forecast?latitude=${PATTAYA_LAT}&longitude=${PATTAYA_LON}&daily=temperature_2m_max&timezone=Asia/Bangkok&start_date=${apiDate}&end_date=${apiDate}`;
    const waterTempUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${PATTAYA_LAT}&longitude=${PATTAYA_LON}&daily=sea_water_temperature_max&timezone=Asia/Bangkok&start_date=${apiDate}&end_date=${apiDate}`;

    const [airResponse, waterResponse] = await Promise.all([fetch(airTempUrl), fetch(waterTempUrl)]);
    const airData = await airResponse.json();
    const waterData = await waterResponse.json();

    let airTemp = airData.daily?.temperature_2m_max?.[0] || null;
    let waterTemp = waterData.daily?.sea_water_temperature_max?.[0] || null;

    // Фолбэк на климатические нормы
    if (!airTemp || !waterTemp) {
      const [, month] = date.split('.');
      const monthNum = parseInt(month);
      if (monthNum === 12 || monthNum === 1) {
        airTemp = airTemp || 30;
        waterTemp = waterTemp || 28;
      } else if (monthNum >= 2 && monthNum <= 4) {
        airTemp = airTemp || 32;
        waterTemp = waterTemp || 29;
      } else if (monthNum >= 5 && monthNum <= 10) {
        airTemp = airTemp || 29;
        waterTemp = waterTemp || 29;
      } else {
        airTemp = airTemp || 30;
        waterTemp = waterTemp || 28;
      }
    }

    const result = {
      airTemp: airTemp ? Math.round(airTemp) : null,
      waterTemp: waterTemp ? Math.round(waterTemp) : null
    };
    weatherCache[apiDate] = result;
    return result;
  } catch (error) {
    console.error('✗ Ошибка получения погоды:', error);
    return { airTemp: 30, waterTemp: 28 };
  }
}

async function setStorageItem(key, value, callback = null) {
  if (firebaseDatabase) {
    try {
      await firebaseDatabase.ref('dailyPlans/' + key).set(value);
      console.log('✅ Firebase: сохранено', key);
      if (callback) callback();
    } catch (error) {
      console.error('✗ Firebase save error:', error);
      localStorage.setItem(key, value);
      if (callback) callback();
    }
  } else {
    localStorage.setItem(key, value);
    if (callback) callback();
  }
}

async function getStorageItem(key) {
  if (firebaseDatabase) {
    try {
      const snapshot = await firebaseDatabase.ref('dailyPlans/' + key).once('value');
      if (snapshot.exists()) {
        console.log('✅ Firebase: загружено', key);
        return snapshot.val();
      }
    } catch (error) {
      console.error('✗ Firebase load error:', error);
    }
  }
  return localStorage.getItem(key);
}

async function removeStorageItem(key, callback = null) {
  if (firebaseDatabase) {
    try {
      await firebaseDatabase.ref('dailyPlans/' + key).remove();
      console.log('✅ Firebase: удалено', key);
      if (callback) callback();
    } catch (error) {
      console.error('✗ Firebase delete error:', error);
      localStorage.removeItem(key);
      if (callback) callback();
    }
  } else {
    localStorage.removeItem(key);
    if (callback) callback();
  }
}

function getDistance([lat1, lon1], [lat2, lon2]) {
  const toRad = d => d * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

let userCoords = null;
let activeGeoFilter = 'naklua';
const allGeoData = {}; // ожидается заполняться извне

document.addEventListener('DOMContentLoaded', () => {
  try {
    initApp();
  } catch (e) {
    console.error("Критическая ошибка при инициализации:", e);
  }
});

function initApp() {
  initFirebase();
  initTabs();
  initCalendarFilters();
  initGeoFeatures();
  initDailyPlanModal();
  updateCountdown();
  setInterval(updateCountdown, 3600000);
  renderActivities(activities);
  renderContacts(points);
  document.getElementById('closeModal')?.addEventListener('click', closeModal);
  document.getElementById('modalOverlay')?.addEventListener('click', e => {
    if (e.target.id === 'modalOverlay') closeModal();
  });
}

function initTabs() {
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-button, .tab-content').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab)?.classList.add('active');
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
  document.getElementById('locateBtn')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается.');
      return resetGeoState();
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        userCoords = [pos.coords.latitude, pos.coords.longitude];
        updateGeoView();
      },
      () => {
        alert('Не удалось получить местоположение.');
        resetGeoState();
      }
    );
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

function resetGeoState() {
  userCoords = null;
  document.querySelectorAll('.distance-tag').forEach(el => el.remove());
}

function initGeoItemButton(button) {
  button.addEventListener('click', () => {
    // Хэндлер открытия карточки места по кнопке гео-объекта
    const id = parseInt(button.dataset.id, 10);
    if (!isNaN(id) && allGeoData[id]) {
      showPlaceModal({
        name: allGeoData[id].name || 'Место',
        date: '',
        coords: allGeoData[id].coords ? { lat: allGeoData[id].coords[0], lng: allGeoData[id].coords[1] } : null,
        tips: allGeoData[id].tips || ''
      });
    }
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
    if (isNaN(id) || !allGeoData[id]?.coords) return;
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

  const playgroundsContainer = document.querySelector('.geo-playgrounds .geo-items-container');
  if (playgroundsContainer) {
    const buttons = Array.from(playgroundsContainer.querySelectorAll('.geo-item-btn'));
    buttons.sort((a, b) => (parseFloat(a.dataset.distance) || 9999) - (parseFloat(b.dataset.distance) || 9999));
    buttons.forEach(button => playgroundsContainer.appendChild(button));
  }

  const parksContainer = document.querySelector('.geo-parks .geo-items-container');
  if (parksContainer) {
    const buttons = Array.from(parksContainer.querySelectorAll('.geo-item-btn'));
    buttons.sort((a, b) => (parseFloat(a.dataset.distance) || 9999) - (parseFloat(b.dataset.distance) || 9999));
    buttons.forEach(button => parksContainer.appendChild(button));
  }
}

function restoreAllButtonsVisibility() {
  document.querySelectorAll('.geo-item-btn').forEach(btn => { btn.style.display = ''; });
}

function applyGeoFilter() {
  restoreAllButtonsVisibility();

  const nearbyContainer = document.getElementById('nearbyItems');
  if (!nearbyContainer) return;
  nearbyContainer.innerHTML = '';

  const targetSubblock = document.querySelector(`.cafe-sub-block[data-subblock-name="${activeGeoFilter}"]`);
  const closestCafeButton = targetSubblock ? targetSubblock.querySelector('.geo-item-btn') : null;

  const templesContainer = document.querySelector('.geo-temples .geo-items-container');
  const closestTempleButton = templesContainer ? templesContainer.querySelector('.geo-item-btn') : null;

  const playgroundsContainer = document.querySelector('.geo-playgrounds .geo-items-container');
  const closestPlaygroundButton = playgroundsContainer ? playgroundsContainer.querySelector('.geo-item-btn') : null;

  const parksContainer = document.querySelector('.geo-parks .geo-items-container');
  const closestParkButton = parksContainer ? parksContainer.querySelector('.geo-item-btn') : null;

  const toClone = [closestCafeButton, closestTempleButton, closestPlaygroundButton, closestParkButton].filter(Boolean);

  toClone.forEach(btn => {
    const clone = btn.cloneNode(true);
    initGeoItemButton(clone);
    nearbyContainer.appendChild(clone);
    btn.style.display = 'none';
  });

  if (toClone.length === 0) {
    nearbyContainer.textContent = 'Нет объектов для отображения.';
  }
}

// ===== Activities, rendering, modals =====

const kidsLeisure = [
  { name: 'Mini Siam', date: '01.01.2026', coords: { lat: 12.9554157, lng: 100.9088538 }, tips: 'Парк миниатюр...', type: 'sight' },
  { name: 'Деревня слонов', date: '04.01.2026', coords: { lat: 12.91604299, lng: 100.93883441 }, tips: 'Этический заповедник...', type: 'sight' },
  { name: 'Дельфинариум', date: '07.01.2026', coords: { lat: 12.95222191, lng: 100.93617557 }, tips: 'Современный дельфинариум...', type: 'sight' },
  { name: 'Аюттайя', date: '08.01.2026', coords: { lat: 14.35741905, lng: 100.56757512 }, tips: 'Древняя столица...', type: 'sight' },
  { name: 'Сад Нонг Нуч', date: '11.01.2026', coords: { lat: 12.76575858, lng: 100.93505629 }, tips: 'Тропический сад...', type: 'sight' },
  { name: 'Музей искусств 3D', date: '13.01.2026', coords: { lat: 12.94832322, lng: 100.88976288 }, tips: 'Интерактивный музей...', type: 'sight' },
  { name: 'Ко Лан', date: '14.01.2026', coords: { lat: 12.915123, lng: 100.780456 }, tips: 'Однодневная поездка...', type: 'sight' },
  { name: 'Зоопарк Кхао Кхео', date: '19.01.2026', coords: { lat: 13.21500644, lng: 101.05700099 }, tips: 'Крупнейший зоопарк...', type: 'sight' },
  { name: 'Плавучий рынок', date: '22.01.2026', coords: { lat: 12.86799376, lng: 100.90469404 }, tips: 'Аутентичный рынок...', type: 'sight' },
  { name: 'Ко Лан', date: '24.01.2026', coords: { lat: 12.915123, lng: 100.780456 }, tips: 'Однодневная поездка...', type: 'sight' },
  { name: '🧪 ТЕСТ', date: '02.10.2025', coords: null, tips: 'Тестовый блок для проверки Weather API и Firebase', type: 'sea' }
];

function generateBeachDays() {
  const used = kidsLeisure.map(x => x.date);
  const days = [];
  const start = new Date('2025-12-29'), end = new Date('2026-01-26');
  const transferDates = ['09.01.2026', '15.01.2026', '25.01.2026'];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const date = d.toLocaleDateString('ru-RU');
    if (!used.includes(date)) {
      if (transferDates.includes(date)) {
        days.push({ type: 'sea', name: '🚀 В Паттайю', date, coords: null, tips: 'Отдых на море.' });
      } else {
        days.push({ type: 'sea', name: 'Пляжинг', date, coords: null, tips: 'Отдых на море.' });
      }
    }
  }
  return days;
}

const activities = [...generateBeachDays(), ...kidsLeisure].sort(
  (a,b) => new Date(a.date.split('.').reverse().join('-')) - new Date(b.date.split('.').reverse().join('-'))
);

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

function handleCardClick(activityName, date, type) {
  if (type === 'sea') {
    openDailyPlanModal(activityName, date);
  } else if (type === 'sight') {
    const activity = activities.find(a => a.name === activityName && a.date === date);
    if (activity) {
      showPlaceModal(activity);
    } else {
      console.error('Активность не найдена:', activityName, date);
    }
  }
}

function renderActivities(list) {
  const grid = document.getElementById('activitiesGrid');
  if (!grid) return;

  grid.innerHTML = list.map(a => {
    const cardClass = `card ${a.type === 'sea' ? 'activity-sea' : 'activity-sight'}`;
    const icon = a.type === 'sea' ? '🏖️ ' : (getIconForActivity(a.name) + ' ');
    const prices = {
      'Mini Siam': `Взрослый 230 ฿ / Детский 130 ฿`,
      'Деревня слонов': `Взрослый 650 ฿ / Детский 500 ฿`,
      'Дельфинариум': `Взрослый 630 ฿ / Детский 450 ฿`,
      'Сад Нонг Нуч': `Взрослый 420 ฿ / Детский 320 ฿`,
      'Музей искусств 3D': `Взрослый 235 ฿ / Детский 180 ฿`,
      'Зоопарк Кхао Кхео': `Взрослый 350 ฿ / Детский 120 ฿`,
      'Ко Лан': `Паром 30 ฿ / Общие расходы ~1,500 ฿`
    };
    const priceLine = prices[a.name] ? `<div class="price-line">${prices[a.name]}</div>` : '';
    const dist = userCoords && a.coords ? `≈${getDistance(userCoords, [a.coords.lat, a.coords.lng])} км` : '';
    const distLine = dist ? `<div class="distance-line">${dist}</div>` : '';

    return `
      <div class="${cardClass}" onclick="handleCardClick('${a.name.replace(/'/g,"\\'")}', '${a.date}', '${a.type}')">
        <div class="card-title">${icon}${a.name}</div>
        <div class="card-date">${a.date}</div>
        ${priceLine}
        ${distLine}
      </div>
    `;
  }).join('');
}

const points = [];

function renderContacts(list) {
  const grid = document.getElementById('contactsGrid');
  if (!grid) return;

  let items = list.slice();
  if (userCoords) {
    items.forEach(p => p.distance = p.coords ? parseFloat(getDistance(userCoords, [p.coords.lat, p.coords.lng])) : null);
    items.sort((a,b) => (a.distance ?? 1e9) - (b.distance ?? 1e9));
  }

  grid.innerHTML = items.map(p => {
    const distTag = p.distance ? `≈${p.distance.toFixed(1)} км` : '';
    return `
      <div class="contact-card">
        <div class="contact-name">${p.name || 'Контакт'}</div>
        <div class="contact-meta">${distTag}</div>
      </div>
    `;
  }).join('');
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
    'Ко Лан': '🏝️'
  };
  return icons[name] || '📍';
}

function closeModal() {
  document.getElementById('modalOverlay')?.classList.remove('active');
}

// ===== Place modal =====
function showPlaceModal(place) {
  let content = `<h3>${place.name}</h3>`;
  content += `<p>💡 ${place.tips || ''}</p>`;
  if (place.coords) {
    const fromHome = ''; // при необходимости подставить координаты дома
    const to = `${place.coords.lat},${place.coords.lng}`;
    content += `<p>🗺️ Маршрут от дома: ${to}</p>`;
    if (userCoords) {
      const distance = getDistance(userCoords, [place.coords.lat, place.coords.lng]);
      content += `<p>📍 Маршрут от вас</p>`;
      content += `<p>📏 Расстояние: ≈${distance} км</p>`;
    }
    content += `<p>🌐 Открыть в Google Maps</p>`;
  } else {
    content += `<p>📍 Координаты не указаны</p>`;
  }
  document.getElementById('modalBody').innerHTML = content;
  document.getElementById('modalOverlay').classList.add('active');
}

// ===== Daily plan modal =====
function initDailyPlanModal() {
  const modal = document.getElementById('dailyPlanModal');
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeDailyPlanModal();
    });
  }
}

function closeDailyPlanModal() {
  document.getElementById('dailyPlanModal')?.classList.remove('active');
}

function openDailyPlanModal(activityName, date) {
  const modal = document.getElementById('dailyPlanModal');
  const grid = document.getElementById('dailyPlanGrid');
  if (!modal || !grid) return;

  document.querySelector('#dailyPlanModalBody h3').textContent = `📝 Планы на день - ${activityName}`;

  let timeSlots = '';
  const timeSlotData = [];
  for (let hour = 7; hour <= 20; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
    const key = `${date}_${startTime}`;
    timeSlotData.push({ startTime, endTime, key, date });

    timeSlots += `
      <div class="time-slot" data-key="${key}">
        <div class="time">${startTime} - ${endTime}</div>
        <textarea placeholder="План..."></textarea>
        <button class="save-slot" data-key="${key}">Сохранить</button>
        <button class="delete-slot" data-key="${key}">Удалить</button>
      </div>
    `;
  }

  grid.innerHTML = timeSlots;

  grid.querySelectorAll('.save-slot').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.key;
      const area = grid.querySelector(`.time-slot[data-key="${key}"] textarea`);
      await setStorageItem(key, area.value);
      btn.textContent = 'Сохранено';
      setTimeout(() => (btn.textContent = 'Сохранить'), 1000);
    });
  });

  grid.querySelectorAll('.delete-slot').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.key;
      await removeStorageItem(key);
      const area = grid.querySelector(`.time-slot[data-key="${key}"] textarea`);
      if (area) area.value = '';
      btn.textContent = 'Удалено';
      setTimeout(() => (btn.textContent = 'Удалить'), 1000);
    });
  });

  // Загрузка сохранённых значений
  (async () => {
    for (const slot of timeSlotData) {
      const saved = await getStorageItem(slot.key);
      if (saved) {
        const area = grid.querySelector(`.time-slot[data-key="${slot.key}"] textarea`);
        if (area) area.value = saved;
      }
    }
  })();

  modal.classList.add('active');
}
