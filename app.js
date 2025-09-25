// Данные достопримечательностей с ссылками
const topSights = [
  { name: 'Сад Нонг Нуч', link: 'https://ru.wikipedia.org/wiki/Нонг_Нуч' },
  { name: 'Art in Paradise', link: 'https://ru.wikipedia.org/wiki/Art_in_Paradise' },
  { name: 'Underwater World', link: 'https://ru.wikipedia.org/wiki/Underwater_World' },
  { name: 'Mini Siam', link: 'https://ru.wikipedia.org/wiki/Mini_Siam' },
  { name: 'Big Buddha', link: 'https://ru.wikipedia.org/wiki/Большой_будда' },
  { name: 'Pattaya Dolphin World', link: 'https://ru.wikipedia.org/wiki/Pattaya_Dolphin_World' },
  { name: 'Sanctuary of Truth', link: 'https://ru.wikipedia.org/wiki/Санктуарий_правды' },
  { name: 'Ripley’s Believe It or Not', link: 'https://ru.wikipedia.org/wiki/Ripley’s_Believe_It_or_Not' },
  { name: 'Tiffany’s Show', link: 'https://ru.wikipedia.org/wiki/Tiffany’s_Show' }
];

// Даты поездки
const startTrip = new Date('2025-12-29');
const endTrip   = new Date('2026-01-26');

// Генерация расписания с учётом детской адаптации
const activities = Array.from({length:28}, (_, i) => {
  const day = i + 1;
  const dateObj = new Date(startTrip.getTime() + day * 864e5);
  const date = dateObj.toLocaleDateString('ru-RU');
  const isSea = day % 3 !== 0;
  let item = {};

  if (isSea) {
    item = {
      type: 'sea',
      name: day % 2 === 0 ? 'Пляж Вонгамат' : 'Пляж Бамбу Бич',
      link: '',
      tips: 'Берите головной убор и воду',
    };
  } else {
    const sight = topSights[(day - 1) % topSights.length];
    item = {
      type: 'sight',
      name: sight.name,
      link: sight.link,
      tips: `Обязательно посетите ${sight.name}. Рекомендуется взять воду и лёгкий перекус.`,
    };
  }

  // Детская адаптация для Cartoon Network Amazone
  if (item.name === 'Cartoon Network Amazone') {
    item.age = '3+';
    item.duration = '3–4 ч';
    item.start = '10:00';
    item.tips += ' Возьмите запасной купальник.';
  }

  return {
    ...item,
    date,
    transport: ['Сонгтео (10 бат)', 'Такси Bolt/Grab (100–150 бат)'],
    restaurants: ['The Glass House (200–500 бат)']
  };
});

// Обновление счётчика дней
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

// Отрисовка карточек активностей
function renderActivities(list) {
  const grid = document.getElementById('activitiesGrid');
  grid.innerHTML = list.map(a => `
    <div class="card" data-type="${a.type}">
      <h3>${a.name}</h3>
      <p>${a.date}</p>
      <button data-name="${a.name}" class="details">Подробнее</button>
    </div>
  `).join('');
  document.querySelectorAll('.details').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = list.find(a => a.name === btn.dataset.name);
      showModal(act);
    });
  });
}

// Показ модального окна с деталями
function showModal(a) {
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <h2>${a.name}</h2>
    <p>Дата: ${a.date}</p>
    ${a.link ? `<p><a href="${a.link}" target="_blank">Статья</a></p>` : ''}
    ${a.age ? `<p>Возраст: ${a.age}</p>` : ''}
    ${a.duration ? `<p>Длительность: ${a.duration}</p>` : ''}
    <p>Совет: ${a.tips}</p>
    <p>Транспорт: ${a.transport.join(', ')}</p>
    <p>Еда: ${a.restaurants.join(', ')}</p>
  `;
  document.getElementById('modalOverlay').classList.add('active');
}

// Инициализация вкладок
function initTabs() {
  document.querySelectorAll('.tabs button').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelector('.tabs button.active').classList.remove('active');
      btn.classList.add('active');
      document.querySelector('.tab-content.active').classList.remove('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    })
  );
}

// Инициализация фильтров
function initFilters() {
  const fs = document.querySelectorAll('.filters button');
  fs.forEach(f =>
    f.addEventListener('click', () => {
      fs.forEach(x => x.classList.remove('active'));
      f.classList.add('active');
      const filtered = f.dataset.filter === 'all'
        ? activities
        : activities.filter(a => a.type === f.dataset.filter);
      renderActivities(filtered);
      localStorage.setItem('filter', f.dataset.filter);
    })
  );
  const saved = localStorage.getItem('filter') || 'all';
  document.querySelector(`.filters button[data-filter="${saved}"]`).click();
}

// Закрытие модалки
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

// Старт приложения
document.addEventListener('DOMContentLoaded', () => {
  updateCountdown();
  setInterval(updateCountdown, 3600000);
  initTabs();
  initFilters();
  renderActivities(activities);
  document.getElementById('closeModal').addEventListener('click', closeModal);
});
