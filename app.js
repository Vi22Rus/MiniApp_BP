// app.js
const topSights = [
  'Сад Нонг Нуч',
  'Art in Paradise',
  'Underwater World',
  'Mini Siam',
  'Big Buddha',
  'Pattaya Dolphin World',
  'Sanctuary of Truth',
  'Ripley’s Believe It or Not',
  'Tiffany’s Show'
];

const startTrip = new Date('2025-12-29');
const endTrip = new Date('2026-01-26');

const activities = Array.from({length: 28}, (_, i) => {
  const day = i + 1;
  const d = new Date(startTrip.getTime() + day * 864e5);
  const date = d.toLocaleDateString('ru-RU');
  const isSea = day % 3 !== 0;
  let type = isSea ? 'sea' : 'sight';
  let text = isSea
    ? (day % 2 === 0 ? 'Пляж Вонгамат' : 'Пляж Бамбу Бич')
    : `Достопримечательность: ${topSights[(day-1) % topSights.length]}`;
  return {
    type,
    date,
    text,
    cost: 'Бесплатно',
    workingHours: 'круглосуточно',
    transport: ['Сонгтео (10 бат)', 'Такси Bolt/Grab (100–150 бат)'],
    restaurants: ['The Glass House (200–500 бат)'],
    tips: type==='sight'
      ? `Обязательно посетите ${text.replace('Достопримечательность: ', '')}. Рекомендуется взять воду и лёгкий перекус.`
      : 'Берите головной убор и воду',
    articleLink: 'https://life-thai.com'
  };
});

function updateCountdown() {
  const now = new Date();
  let label, days;
  if (now < startTrip) {
    label = 'До поездки:'; days = Math.ceil((startTrip-now)/864e5);
  } else if (now <= endTrip) {
    label = 'До отъезда:'; days = Math.ceil((endTrip-now)/864e5);
  } else {
    label = 'Поездка завершена!'; days = 0;
  }
  document.getElementById('countdownText').textContent = label;
  document.getElementById('days').textContent = days>0 ? days : '✔';
  document.querySelector('.countdown-label').textContent = days>0 ? 'дней' : '';
}

function renderActivities(list) {
  const grid = document.getElementById('activitiesGrid');
  grid.innerHTML = list.map((a,i) => `
    <div class="activity-card ${a.type}" onclick="openModal(${i})">
      <div class="activity-header">
        <div class="activity-icon">${a.type==='sea'?'🏖️':'🎡'}</div>
        <div class="activity-date">${a.date}</div>
      </div>
      <div class="activity-title">${a.text}</div>
      <div class="activity-meta"><span>${a.cost}</span><span>${a.workingHours}</span></div>
    </div>
  `).join('');
}

function initTabs() {
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(tc=>tc.classList.remove('active'));
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      renderActivities(f==='all' ? activities : activities.filter(a=>a.type===f));
    });
  });
  document.getElementById('searchInput').addEventListener('input', e => {
    const t = e.target.value.toLowerCase();
    renderActivities(activities.filter(a=>a.text.toLowerCase().includes(t)||a.date.includes(t)));
  });
}

function openModal(idx) {
  const a = activities[idx];
  document.getElementById('modalTitle').textContent = `День ${idx+1}: ${a.date}`;
  document.getElementById('modalBody').innerHTML = `
    <p><strong>${a.text}</strong></p>
    <p>Стоимость: ${a.cost}</p>
    <p>Время: ${a.workingHours}</p>
    <p>Транспорт: ${a.transport.join(', ')}</p>
    <p>Где поесть: ${a.restaurants.join(', ')}</p>
    <p>Совет: ${a.tips}</p>
    <a href="${a.articleLink}" target="_blank">Подробнее</a>
  `;
  document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
  updateCountdown();
  setInterval(updateCountdown, 3600000);
  renderActivities(activities);
  initTabs();
  initFilters();
  document.getElementById('closeModal').addEventListener('click', closeModal);
});
