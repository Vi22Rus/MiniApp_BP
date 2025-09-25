// Дом (Club Royal)
const homeCoords = { lat: 12.96933724471163, lng: 100.88800963156544 };

// 9 мест для детей
const kidsLeisure = [
  { name:'Mini Siam',        date:'01.01.2026', coords:{lat:12.955415713554308,lng:100.90885349381693}, tips:'Парк миниатюр под открытым небом, возьмите головной убор.', type:'sight' },
  { name:'Деревня слонов',   date:'04.01.2026', coords:{lat:12.916042985773633,lng:100.93883440612971}, tips:'Кормление слонов и катание на них. Удобная обувь обязательна.', type:'sight' },
  { name:'Дельфинариум',     date:'07.01.2026', coords:{lat:12.952221913414467,lng:100.93617556805272}, tips:'Шоу дельфинов в 15:00. Приходите за 15 мин до начала.', type:'sight' },
  { name:'Сад Нонг Нуч',     date:'11.01.2026', coords:{lat:12.76575857856688,lng:100.93505629196102},    tips:'Найдите шоу слонов и сад как можно раньше утром.', type:'sight' },
  { name:'Музей искусств 3D',date:'13.01.2026', coords:{lat:12.948323220229895,lng:100.88976287787469}, tips:'Интерактивные фотозоны, безопасно для детей.', type:'sight' },
  { name:'Аюттайя',          date:'16.01.2026', coords:{lat:14.357419046191445,lng:100.5675751166289},   tips:'Экскурсия с гидом и лодкой, возьмите головной убор.', type:'sight' },
  { name:'Зоопарк Кхао Кхео',date:'19.01.2026', coords:{lat:13.21500643700206,lng:101.0570009938234},   tips:'Автобус по территории, кормление жирафов в 15:00.', type:'sight' },
  { name:'Плавучий рынок',    date:'22.01.2026', coords:{lat:12.867993764217232,lng:100.90469403957914},  tips:'Купите фрукты у лодочников и арендуйте лодку.', type:'sight' },
  { name:'Холм Пратамнак',    date:'25.01.2026', coords:{lat:12.920748620113667,lng:100.86674393868198},  tips:'Лучшие виды города на закате, возьмите воду.', type:'sight' }
];

// Кафе рядом
const cafes = {
  'Mini Siam':         { name:'Fuku Yakiniku',     coords:{lat:12.95486925070086,lng:100.90718264135778} },
  'Деревня слонов':    { name:'Manee Meena Cafe',  coords:{lat:12.911526837804171,lng:100.9384575576231} },
  'Дельфинариум':      { name:'Тайское кафе',       coords:{lat:12.951726180432665,lng:100.9381495687648} },
  'Сад Нонг Нуч':      { name:'Тайское кафе',       coords:{lat:12.770286143945995,lng:100.92978865383589} },
  'Музей искусств 3D': { name:'Friendly Sea Food', coords:{lat:12.947540042644826,lng:100.8892577395075} },
  'Аюттайя':           { name:'Lekha',              coords:{lat:14.353322306142793,lng:100.56426912899451} },
  'Зоопарк Кхао Кхео': { name:'Тайское кафе',       coords:{lat:13.217345661166801,lng:101.05495940409241} },
  'Плавучий рынок':    { name:'Indian Thai',        coords:{lat:12.867533113850556,lng:100.90534297725313} },
  'Холм Пратамнак':     { name:'City Coffee',        coords:{lat:12.92441949946151,lng:100.86487143268879} }
};

// Генерация пляжных дней
function generateBeachDays() {
  const used = kidsLeisure.map(x => x.date);
  const days = [];
  const start = new Date('2026-01-01'), end = new Date('2026-01-26');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const date = d.toLocaleDateString('ru-RU');
    if (!used.includes(date)) {
      days.push({
        type: 'sea',
        name: 'Пляжинг и Прогулинг',
        date,
        coords: null,
        tips: 'Отдых на пляже и прогулка по набережной Наклуа.'
      });
    }
  }
  return days;
}

// Все активности
const activities = [...generateBeachDays(), ...kidsLeisure].sort((a, b) => {
  const da = a.date.split('.').reverse().join('-');
  const db = b.date.split('.').reverse().join('-');
  return new Date(da) - new Date(db);
});

// Счётчик
const startTrip = new Date('2026-01-01'), endTrip = new Date('2026-01-26');
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

// Отрисовка карточек
function renderActivities(list) {
  const grid = document.getElementById('activitiesGrid');
  grid.innerHTML = list.map(a => `
    <div class="card">
      <h3>${a.name}</h3>
      <p>${a.date}</p>
      <button data-name="${a.name}" data-date="${a.date}" class="details">ℹ Подробнее</button>
    </div>
  `).join('');
  document.querySelectorAll('.details').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = activities.find(x => x.name === btn.dataset.name && x.date === btn.dataset.date);
      showModal(act);
    });
  });
}

// Модалка
function showModal(a) {
  let content = `<h2>${a.name}</h2><p>${a.date}</p>`;
  // Маршрут до места
  if (a.coords) {
    const from = 'My+Location';
    const to = `${a.coords.lat},${a.coords.lng}`;
    content += `<p>🗺️ <a href="https://www.google.com/maps/dir/${from}/${to}" target="_blank">Маршрут</a></p>`;
  }
  // Кафе рядом: от текущего местоположения
  if (cafes[a.name]) {
    const cafe = cafes[a.name];
    const from = 'My+Location';
    const toC = `${cafe.coords.lat},${cafe.coords.lng}`;
    content += `<p>☕ <a href="https://www.google.com/maps/dir/${from}/${toC}" target="_blank">Кафе рядом: ${cafe.name}</a></p>`;
  }
  content += `<p>💡 Совет: ${a.tips}</p>`;
  document.getElementById('modalBody').innerHTML = content;
  document.getElementById('modalOverlay').classList.add('active');
}

// Вкладки и фильтры
function initTabs() {
  document.querySelectorAll('.tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.tabs .active').classList.remove('active');
      btn.classList.add('active');
      document.querySelector('.tab-content.active').classList.remove('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}
function initFilters() {
  document.querySelectorAll('.filters button').forEach(f => {
    f.addEventListener('click', () => {
      document.querySelectorAll('.filters .active').forEach(x => x.classList.remove('active'));
      f.classList.add('active');
      const filtered = f.dataset.filter === 'all'
        ? activities
        : activities.filter(a => a.type === f.dataset.filter);
      renderActivities(filtered);
      localStorage.setItem('filter', f.dataset.filter);
    });
  });
  const saved = localStorage.getItem('filter') || 'all';
  document.querySelector(`.filters button[data-filter="${saved}"]`).click();
}
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  updateCountdown(); setInterval(updateCountdown, 3600000);
  initTabs(); initFilters(); renderActivities(activities);
  document.getElementById('closeModal').addEventListener('click', closeModal);
});
