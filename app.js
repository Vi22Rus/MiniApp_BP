// app.js
const startTrip = new Date('2025-12-29');
const endTrip = new Date('2026-01-26');

// Sample data: 28 days with alternating beaches and leisure
const activities = Array.from({length: 28}, (_, i) => {
  const dayNum = i + 1;
  const date = new Date(startTrip.getTime() + dayNum * 864e5);
  const formattedDate = date.toLocaleDateString('ru-RU');
  const isSea = (dayNum % 3) !== 0;
  const text = isSea
    ? (dayNum % 2 === 0 ? 'Пляж Вонгамат' : 'Пляж Бамбу Бич')
    : `Досуг: шоу ${dayNum}`;
  return {
    type: isSea ? 'sea' : 'sight',
    date: formattedDate,
    text,
    cost: 'Бесплатно',
    workingHours: 'Круглосуточно',
    transport: ['Сонгтео (10 бат)', 'Такси Bolt/Grab (100–150 бат)'],
    restaurants: ['The Glass House (200–500 бат)'],
    tips: 'Берите головной убор и воду',
    articleLink: 'https://life-thai.com'
  };
});

function updateCountdown() {
  const now = new Date();
  let label, days;
  if (now < startTrip) {
    label = 'До поездки:';
    days = Math.ceil((startTrip - now) / 864e5);
  } else if (now <= endTrip) {
    label = 'До отъезда:';
    days = Math.ceil((endTrip - now) / 864e5);
  } else {
    label = 'Поездка завершена!';
    days = 0;
  }
  document.getElementById('countdownText').textContent = label;
  document.getElementById('days').textContent = days > 0 ? days : '✔';
  document.querySelector('.countdown-label').textContent = days > 0 ? 'дней' : '';
}

function renderActivities(data) {
  const grid = document.getElementById('activitiesGrid');
  grid.innerHTML = data.map((a, idx) => `
    <div class="activity-card ${a.type}" onclick="openModal(${idx})">
      <div class="activity-header">
        <div class="activity-icon">${a.type==='sea'?'🏖️':'🎡'}</div>
        <div class="activity-date">${a.date}</div>
      </div>
      <div class="activity-title">${a.text}</div>
      <div class="activity-meta">
        <span>${a.cost}</span>
        <span>${a.workingHours}</span>
      </div>
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
      const filter = btn.dataset.filter;
      const filtered = filter==='all'
        ? activities
        : activities.filter(a=>a.type===filter);
      renderActivities(filtered);
    });
  });
  document.getElementById('searchInput').addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    renderActivities(activities.filter(a=>
      a.text.toLowerCase().includes(term) || a.date.includes(term)
    ));
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
    <p>Ресто: ${a.restaurants.join(', ')}</p>
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
