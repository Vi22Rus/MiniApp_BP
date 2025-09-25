// Версия скрипта: app.js v1.3.1 (200 строк)

// Дом (Club Royal)
const homeCoords = { lat: 12.96933724471163, lng: 100.88800963156544 };

// Геолокация
let userCoords = null;

// Функция расстояния (Haversine)
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
    renderActivities(activities);
    renderContacts(points);
  }, () => alert('Не удалось получить местоположение'));
});

// Данные активностей
const kidsLeisure = [
  { name:'Mini Siam', date:'01.01.2026', coords:{lat:12.955415713554308,lng:100.90885349381693}, tips:'Парк миниатюр под открытым небом, возьмите головной убор.', type:'sight' },
  { name:'Деревня слонов', date:'04.01.2026', coords:{lat:12.916042985773633,lng:100.93883440612971}, tips:'Кормление слонов и катание на них. Шоу слонов (14:30–16:00).', type:'sight' },
  { name:'Дельфинариум', date:'07.01.2026', coords:{lat:12.952221913414467,lng:100.93617556805272}, tips:'Шоу дельфинов в 15:00.', type:'sight' },
  { name:'Сад Нонг Нуч', date:'11.01.2026', coords:{lat:12.76575857856688,lng:100.93505629196102}, tips:'Найдите шоу слонов и сад рано утром.', type:'sight' },
  { name:'Музей искусств 3D', date:'13.01.2026', coords:{lat:12.948323220229895,lng:100.88976287787469}, tips:'Интерактивные фотозоны.', type:'sight' },
  { name:'Аюттайя', date:'16.01.2026', coords:{lat:14.357419046191445,lng:100.5675751166289}, tips:'Посетите храмы.', type:'sight' },
  { name:'Зоопарк Кхао Кхео', date:'19.01.2026', coords:{lat:13.21500643700206,lng:101.0570009938234}, tips:'Кормление жирафов в 15:00.', type:'sight' },
  { name:'Плавучий рынок', date:'22.01.2026', coords:{lat:12.867993764217232,lng:100.90469403957914}, tips:'Фрукты у лодочников.', type:'sight' }
];

function generateBeachDays() {
  const used = kidsLeisure.map(x => x.date), days = [];
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

// Рендер активностей
function renderActivities(list) {
  const grid = document.getElementById('activitiesGrid');
  grid.innerHTML = list.map(a => {
    let icon = a.type === 'sea' ? '🏖️ ' : '';
    if (a.type === 'sight') {
      const m = {
        'Mini Siam':'🏛️ ','Деревня слонов':'🐘 ','Дельфинариум':'🐬 ','Сад Нонг Нуч':'🌺 ',
        'Музей искусств 3D':'🎨 ','Аюттайя':'⛩️ ','Зоопарк Кхао Кхео':'🦒 ','Плавучий рынок':'🛶 '
      };
      icon = m[a.name] || '';
    }
    const prices = {
      'Mini Siam':'<p class="price-tag">Взрослый 230 ฿ / Детский 130 ฿</p>',
      'Деревня слонов':'<p class="price-tag">Взрослый 650 ฿ / Детский 500 ฿</p>',
      'Дельфинариум':'<p class="price-tag">Взрослый 630 ฿ / Детский 450 ฿</p>',
      'Сад Нонг Нуч':'<p class="price-tag">Взрослый 420 ฿ / Детский 320 ฿</p>',
      'Музей искусств 3D':'<p class="price-tag">Взрослый 235 ฿ / Детский 180 ฿</p>',
      'Зоопарк Кхао Кхео':'<p class="price-tag">Взрослый 350 ฿ / Детский 120 ฿</p>'
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

// Модалка
function showModal(a) {
  let content = `<h2>${a.name}</h2><p>${a.date}</p>`;
  if (a.coords) {
    const from = `${homeCoords.lat},${homeCoords.lng}`, to = `${a.coords.lat},${a.coords.lng}`;
    content += `<p>🗺️ <a href="https://www.google.com/maps/dir/${from}/${to}" target="_blank">Маршрут</a></p>`;
  }
  const sites = {
    'Mini Siam':'https://www.tripadvisor.ru/Attraction_Review-g293919-d464601-Reviews-Mini_Siam-Pattaya_Chonburi_Province.html',
    'Деревня слонов':'https://www.tripadvisor.ru/Attraction_Review-g293919-d464600-Reviews-Pattaya_Elephant_Village-Pattaya_Chonburi_Province.html',
    'Дельфинариум':'https://www.tripadvisor.ru/Attraction_Review-g293919-d17457573-Reviews-Pattaya_Dolphinarium-Pattaya_Chonburi_Province.html',
    'Сад Нонг Нуч':'https://www.tripadvisor.ru/Attraction_Review-g2005201-d669526-Reviews-Nong_Nooch_Tropical_Botanical_Garden-Na_Chom_Thian_Sattahip_Chonburi_Province.html',
    'Музей искусств 3D':'https://www.tripadvisor.ru/ShowUserReviews-g293919-d3611252-r200685589-Art_in_Paradise_Pattaya-Pattaya_Chonburi_Province.html',
    'Зоопарк Кхао Кхео':'https://www.tripadvisor.ru/Attraction_Review-g1602205-d669532-Reviews-Khao_Kheow_Open_Zoo-Si_Racha_Chonburi_Province.html',
    'Плавучий рынок':'https://www.tripadvisor.ru/Attraction_Review-g293919-d1438832-Reviews-Pattaya_Floating_Market-Pattaya_Chonburi_Province.html'
  };
  if (a.type==='sight' && sites[a.name]) {
    content += `<p>🌐 <a href="${sites[a.name]}" target="_blank">Сайт</a></p>`;
  }
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

// Данные контактов
const points = [
  { name:'Пляж Джомтьен', coords:{lat:12.8415,lng:100.8939}, icon:'🏖️' },
  { name:'Пляж Вонгамат', coords:{lat:12.9206,lng:100.8698}, icon:'🏖️' },
  { name:'Пляж Паттайя', coords:{lat:12.9276,lng:100.8825}, icon:'🏖️' },
  { name:'Wat Yansangwararam', coords:{lat:12.7437,lng:100.9043}, icon:'⛩️' },
  { name:'Nong Nooch Tropical Garden', coords:{lat:12.7565,lng:100.9351}, icon:'🏡' },
  { name:'Art in Paradise', coords:{lat:12.9483,lng:100.8898}, icon:'🖼️' },
  { name:'Central Festival Pattaya', coords:{lat:12.9312,lng:100.8909}, icon:'🛍️' },
  { name:'Pattaya Park Tower', coords:{lat:12.9385,lng:100.9158}, icon:'🎢' },
  { name:'Wat Phra Yai', coords:{lat:12.9864,lng:100.9073}, icon:'⛩️' },
  { name:'Wat Chai Mongkhon', coords:{lat:12.7320,lng:100.8853}, icon:'⛩️' },
  { name:'Wat Khao Phra Bat', coords:{lat:12.9397,lng:100.8905}, icon:'⛩️' },
  { name:'Wat Huay Yai', coords:{lat:12.9910,lng:100.8932}, icon:'⛩️' },
  { name:'Wat Sothon', coords:{lat:13.4152,lng:101.0635}, icon:'⛩️' },
  { name:'Wat Na Jomtien', coords:{lat:12.7792,lng:100.8771}, icon:'⛩️' },
  { name:'Wat Phra Bat (Miracle Hill)', coords:{lat:12.7283,lng:100.9004}, icon:'⛩️' },
  { name:'Wat Sam Sakhon', coords:{lat:13.5384,lng:100.3909}, icon:'⛩️' },
  { name:'Wat Klang', coords:{lat:13.3069,lng:100.1975}, icon:'⛩️' },
  { name:'Columbia Pictures Aquaverse', coords:{lat:12.8626,lng:100.9503}, icon:'💦' },
  { name:'Terminal 21 Pattaya', coords:{lat:12.9136,lng:100.8846}, icon:'🛍️' },
  { name:'Mike Shopping Mall', coords:{lat:12.9310,lng:100.8665}, icon:'🛍️' },
  { name:'Royal Garden Plaza', coords:{lat:12.9274,lng:100.8580}, icon:'🛍️' },
  { name:'Walking Street', coords:{lat:12.9389,lng:100.8850}, icon:'🚶‍♂️' },
  { name:'Madame Tussauds Pattaya', coords:{lat:12.9353,lng:100.8925}, icon:'🕴️' },
  { name:'Pattaya View Point', coords:{lat:12.9160,lng:100.8693}, icon:'🌅' },
  { name:'Mini Siam', coords:{lat:12.9554,lng:100.9089}, icon:'🏛️' },
  { name:'Koh Sichang Tour', coords:{lat:13.3616,lng:100.7941}, icon:'⛴️' },
  { name:'Underwater World Pattaya', coords:{lat:12.9320,lng:100.8785}, icon:'🐠' },
  { name:'Pattaya Dolphin World', coords:{lat:12.9522,lng:100.9362}, icon:'🐬' },
  { name:'Sanctuary of Truth', coords:{lat:12.6640,lng:100.9063}, icon:'🛕' },
  { name:'Cartoon Network Amazone', coords:{lat:12.7472,lng:100.9459}, icon:'🎡' },
  { name:'Flight of the Gibbon', coords:{lat:13.3000,lng:100.9310}, icon:'🌳' },
  { name:'Harbor Land Pattaya', coords:{lat:12.9280,lng:100.8877}, icon:'🎠' },
  { name:'Khao Chi Chan Buddha', coords:{lat:13.3666,lng:100.7714}, icon:'🗿' },
  { name:'Pattaya Floating Market', coords:{lat:12.8679,lng:100.9047}, icon:'🛶' },
  { name:'Pattaya Snake Farm', coords:{lat:12.9510,lng:100.9269}, icon:'🐍' },
  { name:'Pattaya Elephant Village', coords:{lat:12.9160,lng:100.9388}, icon:'🐘' },
  { name:'Art in Paradise 3D', coords:{lat:12.9483,lng:100.8898}, icon:'🎨' },
  { name:'Thepprasit Night Market', coords:{lat:12.9165,lng:100.8683}, icon:'🌙' },
  { name:'Lotus’s Pattaya', coords:{lat:12.9440,lng:100.8840}, icon:'🛒' },
  { name:'Pattaya Crocodile Farm', coords:{lat:12.9114,lng:100.8707}, icon:'🐊' },
  { name:'Million Years Stone Park', coords:{lat:12.8995,lng:100.9081}, icon:'🪨' },
  { name:'Bird Park', coords:{lat:12.9700,lng:100.8960}, icon:'🐦' },
  { name:'Nong Nooch Elephant Show', coords:{lat:12.7565,lng:100.9351}, icon:'🐘' },
  { name:'Oasis Spa Pattaya', coords:{lat:12.9189,lng:100.8961}, icon:'💆‍♀️' },
  { name:'Ramayana Water Park', coords:{lat:12.8753,lng:100.9930}, icon:'💦' },
  { name:'Siam Country Club', coords:{lat:13.5968,lng:100.7882}, icon:'🏌️‍♂️' },
  { name:'Pattaya Planetarium', coords:{lat:12.9410,lng:100.8940}, icon:'🌌' }
];

// Рендер контактов
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
      const tab = btn.dataset.tab;
      document.getElementById(tab).classList.add('active');
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

// Запуск
document.addEventListener('DOMContentLoaded', () => {
  updateCountdown(); setInterval(updateCountdown, 3600000);
  initTabs(); initFilters();
  renderActivities(activities);
  renderContacts(points);
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => { if (e.target.id === 'modalOverlay') closeModal(); });
});
