// Версия скрипта: app.js v1.3.4 (180 строк)

// Дом (Club Royal)
const homeCoords = { lat: 12.96933724471163, lng: 100.88800963156544 };

// Геолокация
let userCoords = null;

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

// Кнопка геолокации
document.getElementById('locateBtn').addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('Геолокация не поддерживается вашим браузером');
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    userCoords = [pos.coords.latitude, pos.coords.longitude];
    renderActivities(activities);
    renderContacts(points);
  }, () => alert('Не удалось получить местоположение'));
});

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

const activities = [...generateBeachDays(), ...kidsLeisure].sort((a, b) => {
  const da = a.date.split('.').reverse().join('-'),
        db = b.date.split('.').reverse().join('-');
  return new Date(da) - new Date(db);
});

// Обновление счётчика
const startTrip = new Date('2025-12-29'), endTrip = new Date('2026-01-26');
function updateCountdown() {
  const now = new Date();
  const label = now < startTrip ? 'До поездки:' : now <= endTrip ? 'До отъезда:' : 'Поездка завершена!';
  const days = now < startTrip
    ? Math.ceil((startTrip - now) / 864e5)
    : now <= endTrip
      ? Math.ceil((endTrip - now) / 864e5)
      : 0;
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
      const m = {
        'Mini Siam': '🏛️ ', 'Деревня слонов': '🐘 ', 'Дельфинариум': '🐬 ',
        'Сад Нонг Нуч': '🌺 ', 'Музей искусств 3D': '🎨 ', 'Аюттайя': '⛩️ ',
        'Зоопарк Кхао Кхео': '🦒 ', 'Плавучий рынок': '🛶 '
      };
      icon = m[a.name] || '';
    }
    const prices = {
      'Mini Siam': '<p class="price-tag">Взрослый 230 ฿ / Детский 130 ฿</p>',
      'Деревня слонов': '<p class="price-tag">Взрослый 650 ฿ / Детский 500 ฿</p>',
      'Дельфинариум': '<p class="price-tag">Взрослый 630 ฿ / Детский 450 ฿</p>',
      'Сад Нонг Нуч': '<p class="price-tag">Взрослый 420 ฿ / Детский 320 ฿</p>',
      'Музей искусств 3D': '<p class="price-tag">Взрослый 235 ฿ / Детский 180 ฿</p>',
      'Зоопарк Кхао Кхео': '<p class="price-tag">Взрослый 350 ฿ / Детский 120 ฿</p>'
    };
    const priceLine = prices[a.name] || '';
    const dist = userCoords && a.coords
      ? `<p class="distance-tag">≈${getDistance(userCoords, [a.coords.lat, a.coords.lng])} км от вас</p>`
      : '';
    return `
      <div class="card ${a.type}">
        <h3>${icon}${a.name}</h3>
        <p>${a.date}</p>
        ${priceLine}
        ${dist}
        <button data-name="${a.name}" data-date="${a.date}" class="details">ℹ Подробнее</button>
      </div>`;
  }).join('');
  bindDetailButtons();
}

// Показ модалки
function showModal(a) {
  let content = `<h2>${a.name}</h2><p>${a.date}</p>`;
  if (a.coords) {
    const from = `${homeCoords.lat},${homeCoords.lng}`;
    const to = `${a.coords.lat},${a.coords.lng}`;
    content += `<p>🗺️ <a href="https://www.google.com/maps/dir/${from}/${to}" target="_blank">Маршрут</a></p>`;
  }
  document.getElementById('modalBody').innerHTML = content;
  document.getElementById('modalOverlay').classList.add('active');
}

// Данные для вкладки Контакты
const points = [
  { name: 'Пляж Джомтьен', coords: { lat: 12.872089, lng: 100.888602 }, icon: '🏖️' },
  { name: 'Пляж Вонгамат', coords: { lat: 12.960493, lng: 100.884647 }, icon: '🏖️' },
  { name: 'Пляж Паттайя', coords: { lat: 12.937846, lng: 100.883071 }, icon: '🏖️' },
  { name: 'Wat Yansangwararam', coords: { lat: 12.788879, lng: 100.958025 }, icon: '⛩️' },
  { name: 'Nong Nooch Tropical Garden', coords: { lat: 12.764635, lng: 100.934615 }, icon: '🏡' },
  { name: 'Art in Paradise', coords: { lat: 12.948058, lng: 100.889670 }, icon: '🖼️' },
  { name: 'Central Festival Pattaya', coords: { lat: 12.934546, lng: 100.883775 }, icon: '🛍️' },
  { name: 'Pattaya Park Tower', coords: { lat: 12.906208, lng: 100.863070 }, icon: '🎢' },
  { name: 'Wat Phra Yai', coords: { lat: 12.914316, lng: 100.868633 }, icon: '⛩️' },
  { name: 'Wat Chai Mongkhon', coords: { lat: 12.925924, lng: 100.876520 }, icon: '⛩️' },
  { name: 'Wat Khao Phra Bat', coords: { lat: 12.920287, lng: 100.866723 }, icon: '⛩️' },
  { name: 'Wat Huay Yai', coords: { lat: 12.991000, lng: 100.893200 }, icon: '⛩️' },
  { name: 'Wat Sothon', coords: { lat: 13.673700, lng: 101.067300 }, icon: '⛩️' },
  { name: 'Wat Phra Bat (Miracle Hill)', coords: { lat: 12.728300, lng: 100.900400 }, icon: '⛩️' },
  { name: 'Terminal 21 Pattaya', coords: { lat: 12.950209, lng: 100.888678 }, icon: '🛍️' },
  { name: 'Mike Shopping Mall', coords: { lat: 12.932139, lng: 100.880387 }, icon: '🛍️' },
  { name: 'Royal Garden Plaza', coords: { lat: 12.929325, lng: 100.878093 }, icon: '🛍️' },
  { name: 'Walking Street', coords: { lat: 12.927433, lng: 100.874671 }, icon: '🚶‍♂️' },
  { name: 'Mini Siam', coords: { lat: 12.955070, lng: 100.908823 }, icon: '🏛️' },
  { name: 'Underwater World Pattaya', coords: { lat: 12.896693, lng: 100.896062 }, icon: '🐠' },
  { name: 'Sanctuary of Truth', coords: { lat: 12.972778, lng: 100.888889 }, icon: '🛕' },
  { name: 'Cartoon Network Amazone', coords: { lat: 12.747200, lng: 100.945900 }, icon: '🎡' },
  { name: 'Khao Chi Chan Buddha', coords: { lat: 13.366600, lng: 100.771400 }, icon: '🗿' },
  { name: 'Pattaya Floating Market', coords: { lat: 12.867974, lng: 100.904574 }, icon: '🛶' },
  { name: 'MO Play Kidz', coords: { lat: 12.935050619117566, lng: 100.88272152208495 }, icon: '👶' }
];

// Рендер вкладки Контакты
function renderContacts(list) {
  let items = list.slice();
  if (userCoords) {
    items = items.map(p => ({ ...p, distance: parseFloat(getDistance(userCoords, [p.coords.lat, p.coords.lng])) }));
    items.sort((a, b) => a.distance - b.distance);
  }
  const grid = document.getElementById('contactsGrid');
  grid.innerHTML = items.map(p => {
    const distTag = p.distance !== undefined ? `<span class="distance-tag">≈${p.distance.toFixed(1)} км</span>` : '';
    return `
      <button class="contact-btn" data-name="${p.name}">
        <span class="icon">${p.icon}</span>
        ${p.name}
        ${distTag}
      </button>`;
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

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
  updateCountdown(); setInterval(updateCountdown, 3600000);
  initTabs(); initFilters();
  renderActivities(activities);
  renderContacts(points);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target.id === 'modalOverlay') closeModal();
  });
});
