// Данные достопримечательностей и детских развлечений
const topSights = [
  { name: 'Сад Нонг Нуч', link: 'https://ru.wikipedia.org/wiki/Нонг_Нуч', type: 'sight', tips: 'Рекомендуется взять воду и лёгкий перекус.' },
  { name: 'Underwater World Pattaya', link: 'https://ru.wikipedia.org/wiki/Underwater_World', type: 'sight', tips: 'Кормление скатов в 11:00.' },
  { name: 'Mini Siam', link: 'https://ru.wikipedia.org/wiki/Mini_Siam', type: 'sight', tips: 'Головной убор не забудьте.' },
  { name: 'Big Buddha', link: 'https://ru.wikipedia.org/wiki/Большой_будда', type: 'sight', tips: 'Панорамный вид города.' },
  { name: 'Pattaya Dolphin World', link: 'https://ru.wikipedia.org/wiki/Pattaya_Dolphin_World', type: 'sight', tips: 'Шоу дельфинов в 15:00.' },
  { name: 'Sanctuary of Truth', link: 'https://ru.wikipedia.org/wiki/Санктуарий_правды', type: 'sight', tips: 'Резьба по дереву впечатляет.' },
  { name: 'Ripley’s Believe It or Not', link: 'https://ru.wikipedia.org/wiki/Ripley’s_Believe_It_or_Not', type: 'sight', tips: 'Не подходит для маленьких детей.' },
  { name: 'Tiffany’s Show', link: 'https://ru.wikipedia.org/wiki/Tiffany’s_Show', type: 'sight', tips: 'Шоу вечернее, идёт 1.5–2 ч.' }
];

// Топ-9 мест для детей
const kidsLeisure = [
  {
    name: 'Nong Nooch Tropical Garden',
    link: 'https://ru.wikipedia.org/wiki/Нонг_Нуч',
    age: '0+',
    duration: '3–4 ч',
    tips: 'Приходите к открытию, чтобы успеть все сады и шоу слонов.',
    type: 'sight'
  },
  {
    name: 'Underwater World Pattaya',
    link: 'https://ru.wikipedia.org/wiki/Underwater_World',
    age: '0+',
    duration: '2–3 ч',
    tips: 'Запланируйте визит утром, кормление скатов в 11:00.',
    type: 'sight'
  },
  {
    name: 'Mini Siam',
    link: 'https://ru.wikipedia.org/wiki/Mini_Siam',
    age: '0+',
    duration: '1–2 ч',
    tips: 'Парк миниатюр под открытым небом, возьмите головной убор.',
    type: 'sight'
  },
  {
    name: 'Cartoon Network Amazone',
    link: 'https://ru.wikipedia.org/wiki/Cartoon_Network_Amazone',
    age: '3+',
    duration: '3–4 ч',
    tips: 'Неглубокие бассейны для малышей, начало в 10:00.',
    type: 'sight'
  },
  {
    name: 'Ramayana Water Park',
    link: 'https://ru.wikipedia.org/wiki/Аквапарк_Рамаяна',
    age: '0+',
    duration: '4–5 ч',
    tips: 'Есть отдельные детские горки и безопасная зона.',
    type: 'sight'
  },
  {
    name: 'Khao Kheow Open Zoo',
    link: 'https://ru.wikipedia.org/wiki/Зоопарк_Кхао_Кхео',
    age: '0+',
    duration: '4–6 ч',
    tips: 'Кормление жирафов в 15:00, автобус по территории.',
    type: 'sight'
  },
  {
    name: 'Pattaya Sheep Farm',
    link: 'https://ru.wikipedia.org/wiki/Sheep_Farm_Pattaya',
    age: '0+',
    duration: '2–3 ч',
    tips: 'Покормите овечек и покатайтесь на ослике.',
    type: 'sight'
  },
  {
    name: 'Teddy Bear Museum',
    link: 'https://ru.wikipedia.org/wiki/Teddy_Bear_Museum_Pattaya',
    age: '0+',
    duration: '1–2 ч',
    tips: 'Фотозоны с гигантскими игрушками и мастер-классы.',
    type: 'sight'
  },
  {
    name: 'Pattaya Park Tower',
    link: 'https://ru.wikipedia.org/wiki/Pattaya_Park_Tower',
    age: '0+',
    duration: '2–3 ч',
    tips: 'Смотровая площадка и детская карусель на крыше.',
    type: 'sight'
  }
];

// Даты поездки
const startTrip = new Date('2025-12-29');
const endTrip   = new Date('2026-01-26');

// Генерация расписания моря/пляжа
const activities = Array.from({length:28}, (_, i) => {
  const day = i + 1;
  const dateObj = new Date(startTrip.getTime() + day * 864e5);
  const date = dateObj.toLocaleDateString('ru-RU');
  const isSea = day % 3 !== 0;
  const name = isSea
    ? (day % 2 === 0 ? 'Пляж Вонгамат' : 'Пляж Бамбу Бич')
    : null;
  return {
    type: isSea ? 'sea' : 'sight',
    name: name || topSights[(day - 1) % topSights.length].name,
    link: name ? '' : topSights[(day - 1) % topSights.length].link,
    date,
    tips: name
      ? 'Берите головной убор и воду.'
      : topSights[(day - 1) % topSights.length].tips,
    age: name ? '0+' : '',
    duration: '',
    transport: ['Сонгтео (10 бат)', 'Такси Bolt/Grab (100–150 бат)'],
    restaurants: ['The Glass House (200–500 бат)']
  };
});

// Обновление счётчика
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

// Отрисовка карточек
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
      const act = list.find(x => x.name === btn.dataset.name);
      showModal(act);
    });
  });
}

// Показ модалки
function showModal(a) {
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <h2>${a.name}</h2>
    ${a.link ? `<p><a href="${a.link}" target="_blank">Подробнее</a></p>` : ''}
    ${a.age ? `<p>Возраст: ${a.age}</p>` : ''}
    ${a.duration ? `<p>Длительность: ${a.duration}</p>` : ''}
    <p>Совет: ${a.tips}</p>
    <p>Транспорт: ${a.transport.join(', ')}</p>
    <p>Еда: ${a.restaurants.join(', ')}</p>
  `;
  document.getElementById('modalOverlay').classList.add('active');
}

// Вкладки
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

// Фильтры
function initFilters() {
  const fs = document.querySelectorAll('.filters button');
  fs.forEach(f =>
    f.addEventListener('click', () => {
      fs.forEach(x => x.classList.remove('active'));
      f.classList.add('active');
      let filtered;
      if (f.dataset.filter === 'all') {
        filtered = activities;
      } else if (f.dataset.filter === 'sight') {
        filtered = kidsLeisure;
      } else {
        filtered = activities.filter(a => a.type === f.dataset.filter);
      }
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

// Старт
document.addEventListener('DOMContentLoaded', () => {
  updateCountdown();
  setInterval(updateCountdown, 3600000);
  initTabs();
  initFilters();
  renderActivities(activities);
  document.getElementById('closeModal').addEventListener('click', closeModal);
});
