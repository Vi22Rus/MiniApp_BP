const homeCoords = { lat:12.96933724471163, lng:100.88800963156544 };

const kidsLeisure = [
  { name:'Mini Siam',       date:'01.01.2026', coords:{lat:12.955415713554308,lng:100.90885349381693}, tips:'Парк миниатюр под открытым небом, возьмите головной убор.', type:'sight' },
  { name:'Деревня слонов',  date:'04.01.2026', coords:{lat:12.916042985773633,lng:100.93883440612971}, tips:'Кормление слонов и катание на них. Удобная обувь обязательна.', type:'sight' },
  { name:'Дельфинариум',    date:'07.01.2026', coords:{lat:12.952221913414467,lng:100.93617556805272}, tips:'Шоу дельфинов в 15:00. Приходите за 15 мин до начала.', type:'sight' },
  { name:'Сад Нонг Нуч',    date:'11.01.2026', coords:{lat:12.76575857856688,lng:100.93505629196102}, tips:'Найдите шоу слонов и сад как можно раньше утром.', type:'sight' },
  { name:'Музей искусств 3D',date:'13.01.2026', coords:{lat:12.948323220229895,lng:100.88976287787469}, tips:'Интерактивные фотозоны, безопасно для детей.', type:'sight' },
  { name:'Аюттайя',         date:'16.01.2026', coords:{lat:14.357419046191445,lng:100.5675751166289}, tips:'Экскурсия с гидом и лодкой, возьмите головной убор.', type:'sight' },
  { name:'Зоопарк Кхао Кхео',date:'19.01.2026', coords:{lat:13.21500643700206,lng:101.0570009938234}, tips:'Автобус по территории, кормление жирафов в 15:00.', type:'sight' },
  { name:'Плавучий рынок',   date:'22.01.2026', coords:{lat:12.867993764217232,lng:100.90469403957914}, tips:'Купите фрукты у лодочников и арендуйте лодку.', type:'sight' },
  { name:'Холм Пратамнак',   date:'25.01.2026', coords:{lat:12.920748620113667,lng:100.86674393868198}, tips:'Лучшие виды города на закате, возьмите воду.', type:'sight' }
];

function generateBeachDays() {
  const used = kidsLeisure.map(x=>x.date);
  const days=[];
  const start=new Date('2026-01-01'), end=new Date('2026-01-26');
  for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){
    const date=d.toLocaleDateString('ru-RU');
    if(!used.includes(date)){
      days.push({
        type:'sea',
        name:'Пляжинг и Прогулинг',
        date,
        coords:null,
        tips:'Отдых на пляже и прогулка по набережной Наклуа.'
      });
    }
  }
  return days;
}

const activities=[...generateBeachDays(),...kidsLeisure].sort((a,b)=>{
  const da=a.date.split('.').reverse().join('-');
  const db=b.date.split('.').reverse().join('-');
  return new Date(da)-new Date(db);
});

const startTrip=new Date('2026-01-01'), endTrip=new Date('2026-01-26');
function updateCountdown(){
  const now=new Date(), label=now<startTrip?'До поездки:':now<=endTrip?'До отъезда:':'Поездка завершена!';
  const days= now<startTrip?Math.ceil((startTrip-now)/864e5):now<=endTrip?Math.ceil((endTrip-now)/864e5):0;
  document.getElementById('countdownText').textContent=label;
  document.getElementById('days').textContent=days>0?days:'✔';
  document.querySelector('.countdown-label').textContent=days>0?'дней':'';
}

function renderActivities(list){
  const grid=document.getElementById('activitiesGrid');
  grid.innerHTML=list.map(a=>`
    <div class="card">
      <h3>${a.name}</h3>
      <p>${a.date}</p>
      <button data-name="${a.name}" data-date="${a.date}" class="details">ℹ Подробнее</button>
    </div>
  `).join('');
  document.querySelectorAll('.details').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const act=activities.find(x=>x.name===btn.dataset.name&&x.date===btn.dataset.date);
      showModal(act);
    });
  });
}

function showModal(a){
  let route='';
  if(a.coords){
    const from=`${homeCoords.lat},${homeCoords.lng}`,to=`${a.coords.lat},${a.coords.lng}`;
    route=`<p>🗺️ <a href="https://www.google.com/maps/dir/${from}/${to}" target="_blank">Маршрут</a></p>`;
  }
  document.getElementById('modalBody').innerHTML=`
    <h2>${a.name}</h2>
    <p>${a.date}</p>
    ${route}
    <p>💡 Совет: ${a.tips}</p>
  `;
  document.getElementById('modalOverlay').classList.add('active');
}

function initTabs(){
  document.querySelectorAll('.tabs button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelector('.tabs .active').classList.remove('active');
      btn.classList.add('active');
      document.querySelector('.tab-content.active').classList.remove('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

function initFilters(){
  document.querySelectorAll('.filters button').forEach(f=>{
    f.addEventListener('click',()=>{
      document.querySelectorAll('.filters .active').forEach(x=>x.classList.remove('active'));
      f.classList.add('active');
      const filt=f.dataset.filter;
      const filtered = filt==='all'?activities:activities.filter(a=>a.type===filt);
      renderActivities(filtered);
      localStorage.setItem('filter',filt);
    });
  });
  const saved=localStorage.getItem('filter')||'all';
  document.querySelector(`.filters button[data-filter="${saved}"]`).click();
}

function closeModal(){
  document.getElementById('modalOverlay').classList.remove('active');
}

document.addEventListener('DOMContentLoaded',()=>{
  updateCountdown(); setInterval(updateCountdown,3600000);
  initTabs(); initFilters(); renderActivities(activities);
  document.getElementById('closeModal').addEventListener('click',closeModal);
});
