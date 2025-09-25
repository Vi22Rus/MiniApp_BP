// Дом (Club Royal)
const homeCoords = { lat: 12.96933724471163, lng: 100.88800963156544 };

// Места для досуга
const kidsLeisure = [
  { name:'Mini Siam', date:'01.01.2026', coords:{lat:12.955415713554308,lng:100.90885349381693}, tips:'Парк миниатюр под открытым небом, возьмите головной убор.', type:'sight' },
  { name:'Деревня слонов', date:'04.01.2026', coords:{lat:12.916042985773633,lng:100.93883440612971}, tips:'Кормление слонов и катание на них. Удобная обувь обязательна.', type:'sight' },
  { name:'Дельфинариум', date:'07.01.2026', coords:{lat:12.952221913414467,lng:100.93617556805272}, tips:'Шоу дельфинов в 15:00. Приходите за 15 мин до начала.', type:'sight' },
  { name:'Сад Нонг Нуч', date:'11.01.2026', coords:{lat:12.76575857856688,lng:100.93505629196102}, tips:'Найдите шоу слонов и сад как можно раньше утром.', type:'sight' },
  { name:'Музей искусств 3D', date:'13.01.2026', coords:{lat:12.948323220229895,lng:100.88976287787469}, tips:'Интерактивные фотозоны, безопасно для детей.', type:'sight' },
  { name:'Аюттайя', date:'16.01.2026', coords:{lat:14.357419046191445,lng:100.5675751166289}, tips:'Посетите самые красивые храмы — Ват Пра Си Санпхет, Ват Чайваттханарам, Ват Ма Хатхат.', type:'sight' },
  { name:'Зоопарк Кхао Кхео', date:'19.01.2026', coords:{lat:13.21500643700206,lng:101.0570009938234}, tips:'Автобус по территории, кормление жирафов в 15:00.', type:'sight' },
  { name:'Плавучий рынок', date:'22.01.2026', coords:{lat:12.867993764217232,lng:100.90469403957914}, tips:'Купите фрукты у лодочников и арендуйте лодку.', type:'sight' }
];

// Сайты достопримечательностей
const attractionSites = {
  'Mini Siam': 'https://www.tripadvisor.ru/Attraction_Review-g293919-d464601-Reviews-Mini_Siam-Pattaya_Chonburi_Province.html',
  'Деревня слонов': 'https://www.tripadvisor.ru/Attraction_Review-g293919-d464600-Reviews-Pattaya_Elephant_Village-Pattaya_Chonburi_Province.html',
  'Дельфинариум': 'https://www.tripadvisor.ru/Attraction_Review-g293919-d17457573-Reviews-Pattaya_Dolphinarium-Pattaya_Chonburi_Province.html',
  'Сад Нонг Нуч': 'https://www.tripadvisor.ru/Attraction_Review-g2005201-d669526-Reviews-Nong_Nooch_Tropical_Botanical_Garden-Na_Chom_Thian_Sattahip_Chonburi_Province.html',
  'Музей искусств 3D': 'https://www.tripadvisor.ru/ShowUserReviews-g293919-d3611252-r200685589-Art_in_Paradise_Pattaya-Pattaya_Chonburi_Province.html',
  'Зоопарк Кхао Кхео': 'https://www.tripadvisor.ru/Attraction_Review-g1602205-d669532-Reviews-Khao_Kheow_Open_Zoo-Si_Racha_Chonburi_Province.html',
  'Плавучий рынок': 'https://www.tripadvisor.ru/Attraction_Review-g293919-d1438832-Reviews-Pattaya_Floating_Market-Pattaya_Chonburi_Province.html'
};

// Кафе рядом
const cafes = {
  'Mini Siam':         { name:'Fuku Yakiniku', coords:{lat:12.95486925070086,lng:100.90718264135778} },
  'Деревня слонов':    { name:'Manee Meena Cafe', coords:{lat:12.911526837804171,lng:100.9384575576231} },
  'Дельфинариум':      { name:'Тайское кафе', coords:{lat:12.951726180432665,lng:100.9381495687648} },
  'Сад Нонг Нуч':      { name:'Тайское кафе', coords:{lat:12.770286143945995,lng:100.92978865383589} },
  'Музей искусств 3D': { name:'Friendly Sea Food', coords:{lat:12.947540042644826,lng:100.8892577395075} },
  'Аюттайя':           { name:'Lekha', coords:{lat:14.353322306142793,lng:100.56426912899451} },
  'Зоопарк Кхао Кхео': { name:'Тайское кафе', coords:{lat:13.217345661166801,lng:101.05495940409241} },
  'Плавучий рынок':    { name:'Indian Thai', coords:{lat:12.867533113850556,lng:100.90534297725313} }
};

// Генерация пляжных дней
function generateBeachDays() {
  const used = kidsLeisure.map(x => x.date);
  const days = [];
  const start = new Date('2025-12-29'), end = new Date('2026-01-26');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const date = d.toLocaleDateString('ru-RU');
    if (!used.includes(date)) {
      days.push({ type:'sea', name:'Пляжинг и Прогулинг', date, coords:null, tips:'Отдых на пляже и прогулка по набережной Наклуа.' });
    }
  }
  return days;
}

const activities = [...generateBeachDays(), ...kidsLeisure].sort((a, b) => {
  const da = a.date.split('.').reverse().join('-'),
        db = b.date.split('.').reverse().join('-');
  return new Date(da) - new Date(db);
});

// Счётчик
const startTrip = new Date('2025-12-29'), endTrip = new Date('2026-01-26');
function updateCountdown() {
  const now = new Date();
  const label = now < startTrip ? 'До поездки:' : now <= endTrip ? 'До отъезда:' : 'Поездка завершена!';
  const days  = now < startTrip
    ? Math.ceil((startTrip - now) / 864e5)
    : now <= endTrip
      ? Math.ceil((endTrip - now) / 864e5)
      : 0;
  document.getElementById('countdownText').textContent = label;
  document.getElementById('days').textContent = days > 0 ? days : '✔';
  document.querySelector('.countdown-label').textContent = days > 0 ? 'дней' : '';
}

// Привязка кнопок «Подробнее»
function bindDetailButtons() {
  document.querySelectorAll('.details').forEach(btn => {
    btn.onclick = () => {
      const act = activities.find(x => x.name === btn.dataset.name && x.date === btn.dataset.date);
      showModal(act);
    };
  });
}

// Рендер карточек
function renderActivities(list) {
  const grid = document.getElementById('activitiesGrid');
  grid.innerHTML = list.map(a => {
    let icon = '';
    switch (a.name) {
      case 'Mini Siam':         icon = '🏛️ '; break;
      case 'Деревня слонов':    icon = '🐘 '; break;
      case 'Дельфинариум':      icon = '🐬 '; break;
      case 'Сад Нонг Нуч':      icon = '🌺 '; break;
      case 'Музей искусств 3D': icon = '🎨 '; break;
      case 'Аюттайя':           icon = '⛩️ '; break;
      case 'Зоопарк Кхао Кхео': icon = '🦒 '; break;
      case 'Плавучий рынок':    icon = '🛶 '; break;
      case 'Пляжинг и Прогулинг': icon = '🏖️ '; break;
    }
    let priceLine = '';
    switch (a.name) {
      case 'Mini Siam':         priceLine = '<p class="price-tag">Взрослый 230 ฿ / Детский 130 ฿</p>'; break;
      case 'Сад Нонг Нуч':      priceLine = '<p class="price-tag">Взрослый 420 ฿ / Детский 320 ฿</p>'; break;
      case 'Дельфинариум':      priceLine = '<p class="price-tag">Взрослый 630 ฿ / Детский 450 ฿</p>'; break;
      case 'Музей искусств 3D': priceLine = '<p class="price-tag">Взрослый 235 ฿ / Детский 180 ฿</p>'; break;
      case 'Зоопарк Кхао Кхео': priceLine = '<p class="price-tag">Взрослый 350 ฿ / Детский 120 ฿</p>'; break;
    }
    return `
      <div class="card ${a.type}">
        <h3>${icon}${a.name}</h3>
        <p>${a.date}</p>
        ${priceLine}
        <button data-name="${a.name}" data-date="${a.date}" class="details">ℹ Подробнее</button>
      </div>`;
  }).join('');
  bindDetailButtons();
}

// Модалка
function showModal(a) {
  let content = `<h2>${a.name}</h2><p>${a.date}</p>`;

  if (a.coords) {
    const from = `${homeCoords.lat},${homeCoords.lng}`;
    const to   = `${a.coords.lat},${a.coords.lng}`;
    content += `<p>🗺️ <a href="https://www.google.com/maps/dir/${from}/${to}" target="_blank">Маршрут</a></p>`;
  }

  if (a.type === 'sight' && attractionSites[a.name]) {
    content += `<p>🌐 <a href="${attractionSites[a.name]}" target="_blank">Сайт</a></p>`;
  }

  if (cafes[a.name]) {
    const cafe = cafes[a.name];
    const toC  = `${cafe.coords.lat},${cafe.coords.lng}`;
    content += `<p>☕ <a href="https://www.google.com/maps/dir/My+Location/${toC}" target="_blank">Кафе рядом: ${cafe.name}</a></p>`;
  }

  content += `<p>💡 Совет: ${a.tips}</p>`;
  document.getElementById('modalBody').innerHTML = content;
  document.getElementById('modalOverlay').classList.add('active');
}

// Инициализация вкладок и фильтров
function initTabs() {
  const tabs = document.querySelectorAll('.tabs .tab-btn');
  const contents = document.querySelectorAll('.tab-content');
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  }));
}

function initFilters() {
  const filters = document.querySelectorAll('.filters .filter-btn');
  filters.forEach(f => f.addEventListener('click', () => {
    filters.forEach(x => x.classList.remove('active'));
    f.classList.add('active');
    const filtered = f.dataset.filter === 'all'
      ? activities
      : activities.filter(a => a.type === f.dataset.filter);
    renderActivities(filtered);
    localStorage.setItem('filter', f.dataset.filter);
  }));
  const saved = localStorage.getItem('filter') || 'all';
  document.querySelector(`.filter-btn[data-filter="${saved}"]`)?.click();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
  updateCountdown();
  setInterval(updateCountdown, 3600000);
  initTabs();
  initFilters();
  renderActivities(activities);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target.id === 'modalOverlay') closeModal();
  });
});

// Версия скрипта: app.js v1.1.0 (122 строки)
