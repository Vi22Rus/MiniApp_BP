// Демо-данные и логика: не менее 28 дней, заменены названия пляжей, правильный счетчик, обновлены селекторы и табы
const startTrip = new Date('2025-12-29');
const endTrip = new Date('2026-01-26');

// Демо-список активностей (указан смена названий Джомтьен->Вонгамат, Паттайя->Бамбу Бич)
const activities = Array.from({length: 28}, (_, i) => {
  let day = i+1;
  let date = new Date(startTrip.getTime() + day*864e5);
  let txt = day%2===0 ? 'Пляж Вонгамат' : 'Пляж Бамбу Бич';
  let type = day%4===0 ? 'sight' : 'sea';
  if (type==='sea') txt = day%2===0 ? 'Пляж Вонгамат' : 'Пляж Бамбу Бич';
  if (type==='sight') txt = `🎡 Досуг: шоу ${day}`;
  return {
    type,
    date: date.toLocaleDateString('ru-RU'),
    text: txt,
    cost: 'Бесплатно',
    workingHours: 'Круглосуточно',
    transport: ["Сонгтео 10 бат", "Такси Bolt/Grab"],
    restaurants: ["Glass House"],
    tips: "Берите головной убор",
    articleLink: "https://life-thai.com"
  };
});

window.activities = activities;

// Правильный счетчик
function updateCountdown(){
  const now = new Date();
  let numDays, label;
  if (now < startTrip) {
    numDays = Math.ceil((startTrip-now)/864e5);
    label = 'До поездки:';
  } else if (now >= startTrip && now < endTrip){
    numDays = Math.ceil((endTrip-now)/864e5);
    label = 'До отъезда:';
  } else {
    numDays = 0; label='Поездка завершена!';
  }
  document.getElementById('countdownText').textContent = label;
  document.getElementById('days').textContent = numDays>0 ? numDays : '✔';
  document.querySelector('.countdown-label').textContent = numDays>0 ? 'дней' : '';
}
setInterval(updateCountdown,60000);

document.addEventListener('DOMContentLoaded',()=>{
  updateCountdown();
  renderActivities(activities);
  // табы фикс
  document.querySelector('.tabs').style.display='flex';
});

// Рендер карточек
function renderActivities(arr){
  const grid=document.getElementById('activitiesGrid');
  grid.innerHTML = arr.map((a,i)=>`
    <div class="activity-card ${a.type}">
      <div class="activity-header">
        <div class="activity-icon">${a.type==='sea'?'🏖️':'🎡'}</div>
        <div class="activity-date">${a.date}</div>
      </div>
      <div class="activity-title">${a.text}</div>
      <div class="activity-meta">
        <span class="meta-tag">${a.cost}</span>
        <span class="meta-tag">${a.workingHours}</span>
      </div>
    </div>
  `).join('');
}
