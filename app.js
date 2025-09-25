// Дом (Club Royal)
const homeCoords = { lat:12.96933724471163, lng:100.88800963156544 };

// Места для досуга
const kidsLeisure = [ /* ... */ ];

// Ссылки на сайты достопримечательностей
const attractionSites = { /* ... */ };

function generateBeachDays() { /* ... */ }

const activities = [...generateBeachDays(), ...kidsLeisure].sort((a,b)=>{/* ... */});

// Счётчик
const startTrip = new Date('2025-12-29'), endTrip = new Date('2026-01-26');
function updateCountdown() { /* ... */ }

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
    // ...генерация HTML карточки...
  }).join('');
  bindDetailButtons();
}

// Модалка
function showModal(a){
  let content = `<h2>${a.name}</h2><p>${a.date}</p>`;
  if(a.coords){ /* ... */ }
  if(a.type==='sight' && attractionSites[a.name]){ /* ... */ }
  if(cafes[a.name]){ /* ... */ }
  content += `<p>💡 Совет: ${a.tips}</p>`;
  document.getElementById('modalBody').innerHTML = content;
  document.getElementById('modalOverlay').classList.add('active');
}

// Вкладки и фильтры
function initTabs() { /* ... */ }
function initFilters() { /* ... */ }

function closeModal(){
  document.getElementById('modalOverlay').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', ()=>{
  updateCountdown();
  setInterval(updateCountdown,3600000);
  initTabs();
  initFilters();
  renderActivities(activities);
  document.getElementById('closeModal').addEventListener('click',closeModal);
  document.getElementById('modalOverlay').addEventListener('click',e=>{
    if(e.target.id==='modalOverlay') closeModal();
  });
});
