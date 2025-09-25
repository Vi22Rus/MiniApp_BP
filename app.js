// Версия скрипта: app.js v1.2.1 (135 строк)

// Дом (Club Royal)
const homeCoords = { lat: 12.96933724471163, lng: 100.88800963156544 };

// Места для досуга
const kidsLeisure = [
  { name: 'Mini Siam', date: '01.01.2026', coords: { lat: 12.955415713554308, lng: 100.90885349381693 }, tips: 'Парк миниатюр под открытым небом, возьмите головной убор.', type: 'sight' },
  { name: 'Деревня слонов', date: '04.01.2026', coords: { lat: 12.916042985773633, lng: 100.93883440612971 }, tips: 'Кормление слонов и катание на них. Шоу слонов (14:30–16:00).', type: 'sight' },
  { name: 'Дельфинариум', date: '07.01.2026', coords: { lat: 12.952221913414467, lng: 100.93617556805272 }, tips: 'Шоу дельфинов в 15:00.', type: 'sight' },
  { name: 'Сад Нонг Нуч', date: '11.01.2026', coords: { lat: 12.76575857856688, lng: 100.93505629196102 }, tips: 'Найдите шоу слонов и сад рано утром.', type: 'sight' },
  { name: 'Музей искусств 3D', date: '13.01.2026', coords: { lat: 12.948323220229895, lng: 100.88976287787469 }, tips: 'Интерактивные фотозоны.', type: 'sight' },
  { name: 'Аюттайя', date: '16.01.2026', coords: { lat: 14.357419046191445, lng: 100.5675751166289 }, tips: 'Посетите храмы.', type: 'sight' },
  { name: 'Зоопарк Кхао Кхео', date: '19.01.2026', coords: { lat: 13.21500643700206, lng: 101.0570009938234 }, tips: 'Кормление жирафов в 15:00.', type: 'sight' },
  { name: 'Плавучий рынок', date: '22.01.2026', coords: { lat: 12.867993764217232, lng: 100.90469403957914 }, tips: 'Фрукты у лодочников.', type: 'sight' }
];

// Геолокация
let userCoords = null;
function getDistance([lat1, lon1], [lat2, lon2]) {
  const toRad = d => d * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
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
    alert(`Ваши координаты: ${userCoords[0].toFixed(5)}, ${userCoords[1].toFixed(5)}`);
    renderActivities(activities);
  }, () => alert('Не удалось получить ваше местоположение'));
});

// Генерация пляжных дней
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

// Счётчик
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

// Привязка "Подробнее"
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
    // иконка
    let icon = a.type === 'sea' ? '🏖️ ' : '';
    if (a.type === 'sight') {
      const m = {
        'Mini Siam':'🏛️ ',
        'Деревня слонов':'🐘 ',
        'Дельфинариум':'🐬 ',
        'Сад Нонг Нуч':'🌺 ',
        'Музей искусств 3D':'🎨 ',
        'Аюттайя':'⛩️ ',
        'Зоопарк Кхао Кхео':'🦒 ',
        'Плавучий рынок':'🛶 '
      };
      icon = m[a.name] || '';
    }
    // цена
    const prices = {
      'Mini Siam':'<p class="price-tag">Взрослый 230 ฿ / Детский 130 ฿</p>',
      'Деревня слонов':'<p class="price-tag">Взрослый 650 ฿ / Детский 500 ฿</p>',
      'Дельфинариум':'<p class="price-tag">Взрослый 630 ฿ / Детский 450 ฿</p>',
      'Сад Нонг Нуч':'<p class="price-tag">Взрослый 420 ฿ / Детский 320 ฿</p>',
      'Музей искусств 3D':'<p class="price-tag">Взрослый 235 ฿ / Детский 180 ฿</p>',
      'Зоопарк Кхао Кхео':'<p class="price-tag">Взрослый 350 ฿ / Детский 120 ฿</p>'
    };
    const priceLine = prices[a.name] || '';
    // расстояние
    const dist = userCoords && a.coords
      ? `<p class="distance-tag">≈${getDistance(userCoords,[a.coords.lat,a.coords.lng])} км от вас</p>`
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

// Попап
function showModal(a) {
  let content = `<h2>${a.name}</h2><p>${a.date}</p>`;
  if (a.coords) {
    const from = `${homeCoords.lat},${homeCoords.lng}`,
          to = `${a.coords.lat},${a.coords.lng}`;
    content += `<p>🗺️ <a href="https://www.google.com/maps/dir/${from}/${to}" target="_blank">Маршрут</a></p>`;
  }
  // Сайт
  const sites = {
    'Mini Siam':'https://www.tripadvisor.ru/Attraction_Review-g293919-d464601-Reviews-Mini_Siam-Pattaya_Chonburi_Province.html',
    'Деревня слонов':'https://www.tripadvisor.ru/Attraction_Review-g293919-d464600-Reviews-Pattaya_Elephant_Village-Pattaya_Chonburi_Province.html',
    'Дельфинариум':'https://www.tripadvisor.ru/Attraction_Review-g293919-d17457573-Reviews-Pattaya_Dolphinarium-Pattaya_Chonburi_Province.html',
    'Сад Нонг Нуч':'https://www.tripadvisor.ru/Attraction_Review-g2005201-d669526-Reviews-Nong_Nooch_Tropical_Botanical_Garden-Na_Chom_Thian_Sattahip_Chonburi_Province.html',
    'Музей искусств 3D':'https://www.tripadvisor.ru/ShowUserReviews-g293919-d3611252-r200685589-Art_in_Paradise_Pattaya-Pattaya_Chonburi_Province.html',
    'Зоопарк Кхао Кхео':'https://www.tripadvisor.ru/Attraction_Review-g1602205-d669532-Reviews-Khao_Kheow_Open_Zoo-Si_Racha_Chonburi_Province.html',
    'Плавучий рынок':'https://www.tripadvisor.ru/Attraction_Review-g293919-d1438832-Reviews-Pattaya_Floating_Market-Pattaya_Chonburi_Province.html'
  };
  if (a.type === 'sight' && sites[a.name]) {
    content += `<p>🌐 <a href="${sites[a.name]}" target="_blank">Сайт</a></p>`;
  }
  // Кафе рядом
  const cafes = {
    'Mini Siam':{name:'Fuku Yakiniku',coords:{lat:12.95487,lng:100.90718}},
    'Деревня слонов':{name:'Manee Meena Cafe',coords:{lat:12.91153,lng:100.93846}},
    'Дельфинариум':{name:'Тайское кафе',coords:{lat:12.95173,lng:100.93815}},
    'Сад Нонг Нуч':{name:'Тайское кафе',coords:{lat:12.77029,lng:100.92979}},
    'Музей искусств 3D':{name:'Friendly Sea Food',coords:{lat:12.94754,lng:100.88926}},
    'Аюттайя':{name:'Lekha',coords:{lat:14.35332,lng:100.56427}},
    'Зоопарк Кхао Кхео':{name:'Тайское кафе',coords:{lat:13.21735,lng:101.05496}},
    'Плавучий рынок':{name:'Indian Thai',coords:{lat:12.86753,lng:100.90534}}
  };
  if (cafes[a.name]) {
    const cafe = cafes[a.name], toC = `${cafe.coords.lat},${cafe.coords.lng}`;
    content += `<p>☕ <a href="https://www.google.com/maps/dir/My+Location/${toC}" target="_blank">Кафе рядом: ${cafe.name}</a></p>`;
  }
  content += `<p>💡 Совет: ${a.tips}</p>`;
  document.getElementById('modalBody').innerHTML = content;
  document.getElementById('modalOverlay').classList.add('active');
}

// Вкладки и фильтры
function initTabs(){
  document.querySelectorAll('.tab-button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.tab-button').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}
function initFilters(){
  document.querySelectorAll('.filter-btn').forEach(f=>{
    f.addEventListener('click',()=>{
      document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));
      f.classList.add('active');
      const filtered = f.dataset.filter==='all' ? activities : activities.filter(a=>a.type===f.dataset.filter);
      renderActivities(filtered);
      localStorage.setItem('filter', f.dataset.filter);
    });
  });
  document.querySelector(`.filter-btn[data-filter="${localStorage.getItem('filter')||'all'}"]`)?.click();
}

function closeModal(){
  document.getElementById('modalOverlay').classList.remove('active');
}

document.addEventListener('DOMContentLoaded',()=>{
  updateCountdown();
  setInterval(updateCountdown,3600000);
  initTabs();
  initFilters();
  renderActivities(activities);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e=>{ if(e.target.id==='modalOverlay') closeModal(); });
});
