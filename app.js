// Дом (Club Royal)
const homeCoords = { lat:12.96933724471163, lng:100.88800963156544 };

// 9 мест для детей
const kidsLeisure = [
  { name:'Mini Siam',        date:'01.01.2026', coords:{lat:12.955415713554308,lng:100.90885349381693}, tips:'Парк миниатюр под открытым небом, возьмите головной убор.', type:'sight' },
  { name:'Деревня слонов',   date:'04.01.2026', coords:{lat:12.916042985773633,lng:100.93883440612971}, tips:'Кормление слонов и катание на них. Удобная обувь обязательна.', type:'sight' },
  { name:'Дельфинариум',     date:'07.01.2026', coords:{lat:12.952221913414467,lng:100.93617556805272}, tips:'Шоу дельфинов в 15:00. Приходите за 15 мин до начала.', type:'sight' },
  { name:'Сад Нонг Нуч',     date:'11.01.2026', coords:{lat:12.76575857856688,lng:100.93505629196102},    tips:'Найдите шоу слонов и сад как можно раньше утром.', type:'sight' },
  { name:'Музей искусств 3D',date:'13.01.2026', coords:{lat:12.948323220229895,lng:100.88976287787469}, tips:'Интерактивные фотозоны, безопасно для детей.', type:'sight' },
  { name:'Аюттайя',          date:'16.01.2026', coords:{lat:14.357419046191445,lng:100.5675751166289},   tips:'Посетите самые красивые храмы — Ват Пра Си Санпхет, Ват Чайваттханарам, Ват Ма Хатхат.', type:'sight' },
  { name:'Зоопарк Кхао Кхео',date:'19.01.2026', coords:{lat:13.21500643700206,lng:101.0570009938234},   tips:'Автобус по территории, кормление жирафов в 15:00.', type:'sight' },
  { name:'Плавучий рынок',    date:'22.01.2026', coords:{lat:12.867993764217232,lng:100.90469403957914},  tips:'Купите фрукты у лодочников и арендуйте лодку.', type:'sight' },
  { name:'Пляжинг и Прогулинг',date:'29.12.2025',coords:null, tips:'Отдых на пляже и прогулка по набережной Наклуа.', type:'sea' }
];

// Генерация пляжных дней (29.12.2025–26.01.2026)
function generateBeachDays() {
  const used = kidsLeisure.map(x=>x.date);
  const days = [];
  const start=new Date('2025-12-29'), end=new Date('2026-01-26');
  for(let d=new Date(start); d<=end; d.setDate(d.getDate()+1)){
    const date=d.toLocaleDateString('ru-RU');
    if(!used.includes(date)) days.push({ type:'sea', name:'Пляжинг и Прогулинг', date, coords:null, tips:'Отдых на пляже и прогулка по набережной Наклуа.' });
  }
  return days;
}

// Все активности
const activities=[...generateBeachDays(),...kidsLeisure].sort((a,b)=>{
  const da=a.date.split('.').reverse().join('-'), db=b.date.split('.').reverse().join('-');
  return new Date(da)-new Date(db);
});

// Счётчик
const startTrip=new Date('2025-12-29'), endTrip=new Date('2026-01-26');
function updateCountdown(){
  const now=new Date(), label=now<startTrip?'До поездки:':now<=endTrip?'До отъезда:':'Поездка завершена!';
  const days= now<startTrip?Math.ceil((startTrip-now)/864e5):now<=endTrip?Math.ceil((endTrip-now)/864e5):0;
  document.getElementById('countdownText').textContent=label;
  document.getElementById('days').textContent=days>0?days:'✔';
  document.querySelector('.countdown-label').textContent=days>0?'дней':'';
}

// Рендер карточек
function renderActivities(list){
  const grid=document.getElementById('activitiesGrid');
  grid.innerHTML=list.map(a=>{
    let icon='';
    switch(a.name){
      case'Mini Siam': icon='🏛️ '; break;
      case'Деревня слонов': icon='🐘 '; break;
      case'Дельфинариум': icon='🐬 '; break;
      case'Сад Нонг Нуч': icon='🌺 '; break;
      case'Музей искусств 3D': icon='🎨 '; break;
      case'Аюттайя': icon='⛩️ '; break;
      case'Зоопарк Кхао Кхео': icon='🦒 '; break;
      case'Плавучий рынок': icon='🛶 '; break;
      case'Пляжинг и Прогулинг': icon='🏖️ '; break;
    }
    let priceLine='';
    switch(a.name){
      case'Mini Siam': priceLine='<p class="price-tag">Взрослый 230 ฿ / Детский 130 ฿</p>'; break;
      case'Сад Нонг Нуч': priceLine='<p class="price-tag">Взрослый 420 ฿ / Детский 320 ฿</p>'; break;
      case'Дельфинариум': priceLine='<p class="price-tag">Взрослый 630 ฿ / Детский 450 ฿</p>'; break;
      case'Музей искусств 3D': priceLine='<p class="price-tag">Взрослый 235 ฿ / Детский 180 ฿</p>'; break;
      case'Зоопарк Кхао Кхео': priceLine='<p class="price-tag">Взрослый 350 ฿ / Детский 120 ฿</p>'; break;
    }
    return `
      <div class="card ${a.type}">
        <h3>${icon}${a.name}</h3>
        <p>${a.date}</p>
        ${priceLine}
        <button data-name="${a.name}" data-date="${a.date}" class="details">ℹ Подробнее</button>
      </div>
    `;
  }).join('');
  document.querySelectorAll('.details').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const act=activities.find(x=>x.name===btn.dataset.name&&x.date===btn.dataset.date);
      showModal(act);
    });
  });
}

// Модалка
const cafes={/* ... */}; // как было
function showModal(a){
  let content=`<h2>${a.name}</h2><p>${a.date}</p>`;
  if(a.coords){
    const from=`${homeCoords.lat},${homeCoords.lng}`, to=`${a.coords.lat},${a.coords.lng}`;
    content+=`<p>🗺️ <a href="https://www.google.com/maps/dir/${from}/${to}" target="_blank">Маршрут</a></p>`;
  }
  if(cafes[a.name]){
    const cafe=cafes[a.name], toC=`${cafe.coords.lat},${cafe.coords.lng}`;
    content+=`<p>☕ <a href="https://www.google.com/maps/dir/My+Location/${toC}" target="_blank">Кафе рядом: ${cafe.name}</a></p>`;
  }
  content+=`<p>💡 Совет: ${a.tips}</p>`;
  document.getElementById('modalBody').innerHTML=content;
  document.getElementById('modalOverlay').classList.add('active');
}

// Инициализация
function initTabs(){/* ... */} 
function initFilters(){/* ... */} 
function closeModal(){/* ... */}
document.addEventListener('DOMContentLoaded',()=>{
  updateCountdown(); setInterval(updateCountdown,3600000);
  initTabs(); initFilters(); renderActivities(activities);
  document.getElementById('closeModal').addEventListener('click',closeModal);
});
