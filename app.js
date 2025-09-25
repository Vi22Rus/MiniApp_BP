// Application data
const appData = {
  "activities": [
    {
      "type": "sea",
      "date": "29.12.2025", 
      "text": "Пляж Джомтьен + детская зона",
      "coords": "12.8844, 100.8806",
      "cost": "Бесплатно",
      "workingHours": "Круглосуточно",
      "transport": [
        "Сонгтео от центра (10 бат, 15 мин)",
        "Такси Bolt/Grab (100-150 бат, 10 мин)",
        "Пешком от отеля Ambassador (5 мин)"
      ],
      "restaurants": [
        "The Glass House (200-500 бат, морепродукты)",
        "Кафе на пляже (80-200 бат за блюдо)"
      ],
      "tips": "Лучшее время: 8-11 утра. Взять: солнцезащитный крем, воду, головной убор",
      "articleLink": "https://life-thai.com/plyazhi-pattayi-dzhomtien/"
    },
    {
      "type": "sea",
      "date": "30.12.2025",
      "text": "Пляж Вонгамат + водные горки", 
      "coords": "12.9845, 100.8878",
      "cost": "Бесплатно",
      "workingHours": "Круглосуточно",
      "transport": [
        "Сонгтео до Наклыа (10 бат, 20 мин)",
        "Такси (120-180 бат, 15 мин)",
        "Байк в аренду (200-300 бат/день)"
      ],
      "restaurants": [
        "Moom Aroi Seafood (150-350 бат)",
        "Пляжное кафе (100-250 бат)"
      ],
      "tips": "Тихий пляж, подходит для семей. Горки работают 10-18:00",
      "articleLink": "https://pattaya-city.ru/beaches/wongamat/"
    },
    {
      "type": "sight",
      "date": "31.12.2025",
      "text": "Ват Янсангварам + прогулка по парку",
      "coords": "12.789444, 100.958333", 
      "cost": "Бесплатно (пожертвования приветствуются)",
      "workingHours": "6:00 - 18:00",
      "transport": [
        "Такси от центра (300-500 бат, 30 мин)",
        "Сонгтео + пешком (20 бат + 2 км пешком)",
        "Аренда байка (лучший вариант)"
      ],
      "restaurants": [
        "Кафе при храме (50-120 бат)",
        "Ресторан по дороге назад (100-200 бат)"
      ],
      "tips": "Одеться скромно, покрыть плечи и колени. Снять обувь в храме",
      "articleLink": "https://experience.tripster.ru/experience/Pattaya/sights/"
    },
    {
      "type": "sea",
      "date": "01.01.2026",
      "text": "Пляж Паттайя + Underwater World",
      "coords": "12.9235, 100.8740",
      "cost": "Пляж бесплатно, океанариум 500 бат взрослый, 300 бат детский",
      "workingHours": "Пляж круглосуточно, океанариум 9:00-18:00",
      "transport": [
        "Пешком от центра (10-15 мин)",
        "Сонгтео до Бич Роад (10 бат, 5 мин)"
      ],
      "restaurants": [
        "Hard Rock Cafe (300-800 бат за блюдо)",
        "Фудкорт Central Festival (50-150 бат)"
      ],
      "tips": "Людный пляж, океанариум лучше с утра. Билеты онлайн дешевле",
      "articleLink": "https://ezdili-znaem.com/underwater-world-pattaya/"
    },
    {
      "type": "sea", 
      "date": "02.01.2026",
      "text": "Морская прогулка к Ко Лан (снорклинг)",
      "coords": "12.9119, 100.8570",
      "cost": "Паром 30 бат, спидбот 200-300 бат, снорклинг 300-500 бат",
      "workingHours": "Паромы 7:00-18:30 каждые 30 мин",
      "transport": [
        "Пешком до пирса Бали Хай (15 мин от центра)",
        "Сонгтео до пирса (10 бат, 10 мин)"
      ],
      "restaurants": [
        "Рестораны на Ко Лан (150-400 бат)",
        "Обед на пляже Таваен (200-350 бат)"  
      ],
      "tips": "Взять маску, крем от солнца, воду. Последний паром в 18:30",
      "articleLink": "https://life-thai.com/ostrov-ko-lan-pattaya/"
    }
  ],
  "tips": [
    {
      "category": "Транспорт", 
      "text": "Сонгтео (тук-тук) - основной транспорт, 10 бат за поездку в городе. Такси через Bolt/Grab удобнее и безопаснее",
      "link": "https://pattayatrip.ru/pattayya/tuk-tuk"
    },
    {
      "category": "Пляжи",
      "text": "Лучшее время для пляжа 8-11 утра, пока не жарко. Всегда с собой солнцезащитный крем SPF 50+",
      "link": "https://turpotok.com/plyazhi-pattayi/"
    },
    {
      "category": "Храмы", 
      "text": "Закрытая одежда обязательна. Снимайте обувь перед входом. Нельзя фотографироваться с Буддой спиной",
      "link": "https://samokatus.ru/pattaya-temples/"
    },
    {
      "category": "Еда",
      "text": "Местная еда острая. Просите 'No spicy' или 'Mai pet'. Не пейте воду из крана, только бутилированную",
      "link": "https://allmyworld.ru/gde-poest-v-pattaje-luchshie-restorany-kafe-fudkorty/"
    },
    {
      "category": "Безопасность",
      "text": "Носите копию паспорта. Оригинал в сейфе отеля. Будьте осторожны с мотобайками на дорогах",
      "link": "https://www.pattayaunlimited.com/pattaya-beginners-tips-and-tricks/"
    }
  ],
  "contacts": [
    {
      "category": "Экстренные службы",
      "items": [
        "🚔 Полиция: 191",
        "🚨 Туристическая полиция: 1155 (говорят на английском)", 
        "🚑 Скорая помощь: 1669",
        "🚒 Пожарная служба: 199"
      ]
    },
    {
      "category": "Медицина", 
      "items": [
        "🏥 Bangkok Hospital Pattaya: +66 33 259 999",
        "🏥 Pattaya Memorial Hospital: +66 38 428 428", 
        "💊 Аптеки Boots, Watsons работают до 22:00"
      ]
    },
    {
      "category": "Транспорт",
      "items": [
        "🚕 Bolt приложение (такси)",
        "🚕 Grab приложение", 
        "✈️ Аэропорт Утапао: +66 38 245 595",
        "🚌 Автовокзал Паттайи: Северная дорога"
      ]
    },
    {
      "category": "Дипломатические службы",
      "items": [
        "🇷🇺 Посольство РФ в Бангкоке: +66 2 234 2012",
        "📍 Консульский отдел: 78 Saphan Phut Road"
      ]
    }
  ]
};

// DOM Elements
let currentFilter = 'all';
let searchTerm = '';

// Initialize Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  
  // Set theme
  document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
  document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
}

// Calculate days until trip
function updateCountdown() {
  const tripDate = new Date('2025-12-29');
  const now = new Date();
  const diffTime = tripDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const daysElement = document.getElementById('days');
  if (daysElement) {
    if (diffDays > 0) {
      daysElement.textContent = diffDays;
    } else if (diffDays === 0) {
      daysElement.textContent = '🎒';
      document.querySelector('.countdown-label').textContent = 'Сегодня!';
    } else {
      daysElement.textContent = '🏝️';
      document.querySelector('.countdown-label').textContent = 'В поездке';
    }
  }
}

// Tab switching
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      
      // Update active tab button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update active tab content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId) {
          content.classList.add('active');
        }
      });
    });
  });
}

// Render activities
function renderActivities(activities = appData.activities) {
  const grid = document.getElementById('activitiesGrid');
  const emptyState = document.getElementById('emptyState');
  
  if (activities.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  grid.style.display = 'grid';
  emptyState.style.display = 'none';
  
  grid.innerHTML = activities.map((activity, index) => {
    const icon = activity.type === 'sea' ? '🏖️' : '🏛️';
    const dayNumber = appData.activities.findIndex(a => a.date === activity.date) + 1;
    
    return `
      <div class="activity-card ${activity.type} fade-in" onclick="openActivityModal(${appData.activities.indexOf(activity)})">
        <div class="activity-header">
          <div class="activity-icon">${icon}</div>
          <div>
            <div class="activity-date">День ${dayNumber} • ${activity.date}</div>
            <div class="activity-title">${activity.text}</div>
          </div>
        </div>
        <div class="activity-meta">
          <span class="meta-tag">${activity.cost}</span>
          <span class="meta-tag">${activity.workingHours}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Filter activities
function filterActivities() {
  let filtered = appData.activities;
  
  // Apply type filter
  if (currentFilter !== 'all') {
    filtered = filtered.filter(activity => activity.type === currentFilter);
  }
  
  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(activity => 
      activity.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.date.includes(searchTerm)
    );
  }
  
  renderActivities(filtered);
}

// Initialize filters
function initFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('searchInput');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentFilter = button.dataset.filter;
      filterActivities();
    });
  });
  
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    filterActivities();
  });
}

// Clear filters
function clearFilters() {
  currentFilter = 'all';
  searchTerm = '';
  document.getElementById('searchInput').value = '';
  document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
  document.querySelectorAll('.filter-btn:not([data-filter="all"])').forEach(btn => 
    btn.classList.remove('active')
  );
  filterActivities();
}

// Open activity modal
function openActivityModal(index) {
  const activity = appData.activities[index];
  const modal = document.getElementById('modalOverlay');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');
  
  const dayNumber = index + 1;
  title.textContent = `День ${dayNumber} • ${activity.date}`;
  
  body.innerHTML = `
    <div class="detail-section">
      <h4>📍 ${activity.text}</h4>
      <p><strong>Стоимость:</strong> ${activity.cost}</p>
      <p><strong>Время работы:</strong> ${activity.workingHours}</p>
      <a href="https://maps.google.com/?q=${activity.coords}" target="_blank" class="coords-link">
        📍 Открыть на карте (${activity.coords})
      </a>
    </div>
    
    <div class="detail-section">
      <h4>🚗 Как добраться</h4>
      <ul class="detail-list">
        ${activity.transport.map(transport => `<li>${transport}</li>`).join('')}
      </ul>
    </div>
    
    <div class="detail-section">
      <h4>🍽️ Где поесть</h4>
      <ul class="detail-list">
        ${activity.restaurants.map(restaurant => `<li>${restaurant}</li>`).join('')}
      </ul>
    </div>
    
    <div class="detail-section">
      <h4>💡 Полезные советы</h4>
      <p>${activity.tips}</p>
    </div>
    
    <a href="${activity.articleLink}" target="_blank" class="article-link">
      📖 Читать подробнее
    </a>
  `;
  
  modal.classList.add('active');
  
  // Enable Telegram back button
  if (tg && tg.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(closeActivityModal);
  }
}

// Close activity modal
function closeActivityModal() {
  const modal = document.getElementById('modalOverlay');
  modal.classList.remove('active');
  
  // Hide Telegram back button
  if (tg && tg.BackButton) {
    tg.BackButton.hide();
  }
}

// Initialize modal
function initModal() {
  const modal = document.getElementById('modalOverlay');
  const closeBtn = document.getElementById('closeModal');
  
  closeBtn.addEventListener('click', closeActivityModal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeActivityModal();
    }
  });
  
  // Handle Telegram back button
  if (tg) {
    tg.onEvent('backButtonClicked', closeActivityModal);
  }
}

// Render tips
function renderTips() {
  const tipsGrid = document.getElementById('tipsGrid');
  
  if (tipsGrid) {
    tipsGrid.innerHTML = appData.tips.map(tip => `
      <div class="tip-card">
        <div class="tip-category">💡 ${tip.category}</div>
        <div class="tip-text">${tip.text}</div>
        <a href="${tip.link}" target="_blank" class="tip-link">
          📖 Подробнее →
        </a>
      </div>
    `).join('');
  }
}

// Render contacts
function renderContacts() {
  const contactsGrid = document.getElementById('contactsGrid');
  
  if (contactsGrid) {
    contactsGrid.innerHTML = appData.contacts.map(group => `
      <div class="contact-group">
        <div class="contact-category">${group.category}</div>
        <ul class="contact-items">
          ${group.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }
}

// Initialize app
function initApp() {
  updateCountdown();
  initTabs();
  initFilters();
  initModal();
  renderActivities();
  renderTips();
  renderContacts();
  
  // Update countdown every hour
  setInterval(updateCountdown, 3600000);
}

// Start app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Handle visibility change for Telegram WebApp
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && tg) {
    tg.expand();
  }
});

// Export functions for global access
window.openActivityModal = openActivityModal;
window.closeActivityModal = closeActivityModal;
window.clearFilters = clearFilters;