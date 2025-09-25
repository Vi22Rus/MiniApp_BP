// Версия скрипта: app.js v1.2.0 (150 строк)

// Дом (Club Royal)
const homeCoords = { lat:12.96933724471163, lng:100.88800963156544 };

// Места для досуга
const kidsLeisure = [
  { name:'Mini Siam', date:'01.01.2026', coords:{lat:12.955415713554308,lng:100.90885349381693}, tips:'Парк миниатюр под открытым небом, возьмите головной убор.', type:'sight' },
  { name:'Деревня слонов', date:'04.01.2026', coords:{lat:12.916042985773633,lng:100.93883440612971}, tips:'Кормление слонов и катание на них. Шоу слонов (14:30–16:00).', type:'sight' },
  { name:'Дельфинариум', date:'07.01.2026', coords:{lat:12.952221913414467,lng:100.93617556805272}, tips:'Шоу дельфинов в 15:00. Приходите за 15 мин до начала.', type:'sight' },
  { name:'Сад Нонг Нуч', date:'11.01.2026', coords:{lat:12.76575857856688,lng:100.93505629196102}, tips:'Найдите шоу слонов и сад рано утром.', type:'sight' },
  { name:'Музей искусств 3D', date:'13.01.2026', coords:{lat:12.948323220229895,lng:100.88976287787469}, tips:'Интерактивные фотозоны.', type:'sight' },
  { name:'Аюттайя', date:'16.01.2026', coords:{lat:14.357419046191445,lng:100.5675751166289}, tips:'Посетите храмы.', type:'sight' },
  { name:'Зоопарк Кхао Кхео', date:'19.01.2026', coords:{lat:13.21500643700206,lng:101.0570009938234}, tips:'Кормление жирафов в 15:00.', type:'sight' },
  { name:'Плавучий рынок', date:'22.01.2026', coords:{lat:12.867993764217232,lng:100.90469403957914}, tips:'Фрукты у лодочников.', type:'sight' }
];

// Геолокация пользователя
let userCoords = null;

// Haversine
function getDistance([lat1,lon1],[lat2,lon2]) {
  const toRad = d=>d*Math.PI/180;
  const R=6371;
  const dLat=toRad(lat2-lat1), dLon=toRad(lon2-lon1);
  const a=Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return (R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1);
}

// Обработчик геолокации
document.getElementById('locateBtn').addEventListener('click',()=>{
  if(!navigator.geolocation){ alert('Геолокация не поддерживается'); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    userCoords=[pos.coords.latitude,pos.coords.longitude];
    alert(`Координаты: ${userCoords[0].toFixed(5)}, ${userCoords[1].toFixed(5)}`);
    renderActivities(activities);
  },()=>alert('Не удалось получить местоположение'));
});

// Генерация пляжных дней
function generateBeachDays(){
  const used=kidsLeisure.map(x=>x.date), days=[];
  const start=new Date('2025-12-29'), end=new Date('2026-01-26');
  for(let d=new Date(start); d<=end; d.setDate(d.getDate()+1)){
    const date=d.toLocaleDateString('ru-RU');
    if(!used.includes(date)){
      days.push({ type:'sea', name:'Пляжинг и Прогулинг', date, coords:null, tips:'Отдых на пляже и прогулка по набережной Наклуа.' });
    }
  }
  return days;
}

const activities=[...generateBeachDays(),...kidsLeisure].sort((a,b)=>{
  const da=a.date.split('.').reverse().join('-'), db=b.date.split('.').reverse().join('-');
  return new Date(da)-new Date(db);
});

// Счётчик
const startTrip=new Date('2025-12-29'), endTrip=new Date('2026-01-26');
function updateCountdown(){
  const now=new Date();
  const label=now<startTrip?'До поездки:':now<=endTrip?'До отъезда:':'Поездка завершена!';
  const days= now<startTrip?Math.ceil((startTrip-now)/864e5)
            : now<=endTrip?Math.ceil((endTrip-now)/864e5):0;
  document.getElementById('countdownText').textContent=label;
  document.getElementById('days').textContent=days>0?days:'✔';
}

// Привязка деталей
function bindDetailButtons(){
  document.querySelectorAll('.details').forEach(btn=>{
    btn.onclick=()=>{
      const act=activities.find(x=>x.name===btn.dataset.name&&x.date===btn.dataset.date);
      showModal(act);
    };
  });
}

// Рендер карточек
function renderActivities(list){
  const grid=document.getElementById('activitiesGrid');
  grid.innerHTML=list.map(a=>{
    let icon='';
    switch(a.type){
      case 'sight':
        if(a.name==='Mini Siam') icon='🏛️ ';
        else if(a.name==='Деревня слонов') icon='🐘 ';
        else if(a.name==='Дельфинариум') icon='🐬 ';
        else if(a.name==='Сад Нонг Нуч') icon='🌺 ';
        else if(a.name==='Музей искусств 3D') icon='🎨 ';
        else if(a.name==='Аюттайя') icon='⛩️ ';
        else if(a.name==='Зоопарк Кхао Кхео') icon='🦒 ';
        else if(a.name==='Плавучий рынок') icon='🛶 ';
        break;
      case 'sea': icon='🏖️ '; break;
    }
    let priceLine='';
    switch(a.name){
      case 'Mini Siam': priceLine='<p class="price-tag">230฿/130฿</p>'; break;
      case 'Деревня слонов': priceLine='<p class="price-tag">650฿/500฿</p>'; break;
      case 'Дельфинариум': priceLine='<p class="price-tag">630฿/450฿</p>'; break;
      case 'Сад Нонг Нуч': priceLine='<p class="price-tag">420฿/320฿</p>'; break;
      case 'Музей искусств 3D': priceLine='<p class="price-tag">235฿/180฿</p>'; break;
      case 'Зоопарк Кхао Кхео': priceLine='<p class="price-tag">350฿/120฿</p>'; break;
    }
    const dist=(userCoords&&a.coords)?`<p class="distance-tag">≈${getDistance(userCoords,[a.coords.lat,a.coords.lng])} км</p>`:'';
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
function showModal(a){
  let content=`<h2>${a.name}</h2><p>${a.date}</p>`;
  if(a.coords){
    const from=`${homeCoords.lat},${homeCoords.lng}`, to=`${a.coords.lat},${a.coords.lng}`;
    content+=`<p>🗺️ <a href="https://www.google.com/maps/dir/${from}/${to}" target="_blank">Маршрут</a></p>`;
  }
  content+=`<p>💡 Совет: ${a.tips}</p>`;
  document.getElementById('modalBody').innerHTML=content;
  document.getElementById('modalOverlay').classList.add('active');
}

// Вкладки
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

// Фильтры
function initFilters(){
  document.querySelectorAll('.filter-btn').forEach(f=>{
    f.addEventListener('click',()=>{
      document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));
      f.classList.add('active');
      const filtered=f.dataset.filter==='all'?activities:activities.filter(a=>a.type===f.dataset.filter);
      renderActivities(filtered);
      localStorage.setItem('filter',f.dataset.filter);
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
  document.getElementById('closeModal').addEventListener('click',closeModal);
  document.getElementById('modalOverlay').addEventListener('click',e=>{ if(e.target.id==='modalOverlay') closeModal(); });
});
