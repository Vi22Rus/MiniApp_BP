// Version: 2.5.0 | Lines: 940
// Исправлено: Загрузка данных ежедневника через async/await
// 2025-10-01
// ===== FIREBASE CONFIGURATION =====
const firebaseConfig = {
  apiKey: "AIzaSyBX7abjiafmFuRLNwixPgfAIuoyUWNtIEQ",
  authDomain: "pattaya-plans-app.firebaseapp.com",
  databaseURL: "https://pattaya-plans-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pattaya-plans-app",
  storageBucket: "pattaya-plans-app.firebasestorage.app",
  messagingSenderId: "152286016885",
  appId: "1:152286016885:web:dd389c8294b7c744d04f3c"
};

let userCoords = null;
let firebaseApp;
let firebaseDatabase;

function initFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            firebaseDatabase = firebase.database();
            console.log('✓ Firebase инициализирован');
        } else {
            console.warn('⚠ Firebase SDK не загружен');
        }
    } catch (error) {
        console.error('✗ Ошибка Firebase:', error);
    }
}

// ===== WEATHER API CONFIGURATION =====
const PATTAYA_LAT = 12.9236;
const PATTAYA_LON = 100.8825;
let weatherCache = {};

// ===== GEO COORDINATES & DATA =====
const homeCoords = { lat: 12.9236, lng: 100.8825 }; // Координаты дома в Паттайе
let activeGeoFilter = 'naklua'; // Активный фильтр геолокации по умолчанию
const allGeoData = [
    // Кафе (0-14) - БЕЗ ИЗМЕНЕНИЙ
    { type: 'cafe', link: "https://maps.app.goo.gl/1Ubzy3TB3hCdG2YR8", coords: [12.965314, 100.885745], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/fCCogyeGKWqJca8g7", coords: [12.964959, 100.886551], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/Fba5C2aJVW7YxLz98", coords: [12.965151, 100.886744], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/UagUbAPDmdJBAbCJ6", coords: [12.964288, 100.888161], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/dXaCX7UgmriNPEpm8", coords: [12.964246, 100.888732], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/Zn15kwEB5i9bfJGL6", coords: [12.964275, 100.888674], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/VyE7D7gwHRL4nMNc6", coords: [12.967898, 100.897413], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/DwNiL8531uQVURRZ9", coords: [12.973265, 100.906573], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/VFFio7Q6t9qgJk4A9", coords: [12.968006, 100.897040], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/UpRFKn6nAgTa1sNS8", coords: [12.967489, 100.883170], subblock: 'naklua' },
    { type: 'cafe', link: "https://maps.app.goo.gl/d6Wp4s38aTAPBCFz9", coords: [12.909346, 100.857999], subblock: 'pratamnak' },
    { type: 'cafe', link: "https://maps.app.goo.gl/LGssrnWfy3KEZJ9u6", coords: [12.909615, 100.864130], subblock: 'pratamnak' },
    { type: 'cafe', link: "https://maps.app.goo.gl/zPpiXtiNQts6f1Tb6", coords: [12.909461, 100.864167], subblock: 'pratamnak' },
    { type: 'cafe', link: "https://maps.app.goo.gl/rFeQbBftxVTd2M6j9", coords: [12.917532, 100.867051], subblock: 'pratamnak' },
    { type: 'cafe', link: "https://maps.app.goo.gl/fn868NKBZYGE4tUJ7", coords: [12.892621, 100.873230], subblock: 'jomtien' },
    
    // Храмы (15-24) - БЕЗ ИЗМЕНЕНИЙ
    { type: 'temple', link: "https://maps.app.goo.gl/VzHiKzb1UDQwrJ7SA", coords: [12.925998, 100.876540] },
    { type: 'temple', link: "https://maps.app.goo.gl/1Tho69ErwjcJoLZu6", coords: [12.925280, 100.877069] },
    { type: 'temple', link: "https://maps.app.goo.gl/ZaWV44GNL86E9Hdq9", coords: [12.938062, 100.892092] },
    { type: 'temple', link: "https://maps.app.goo.gl/QfwfiipfFmXzfJhCA", coords: [12.961507, 100.893974] },
    { type: 'temple', link: "https://maps.app.goo.gl/UTn8gqefDwgPeZxh6", coords: [12.969608, 100.909430] },
    { type: 'temple', link: "https://maps.app.goo.gl/xsj9jnGkWduQ6MQV6", coords: [12.952028, 100.908180] },
    { type: 'temple', link: "https://maps.app.goo.gl/wz7LAkoqXd1LHHhw7", coords: [12.914219, 100.868615] },
    { type: 'temple', link: "https://maps.app.goo.gl/LXmseuFjDPQtyewQ6", coords: [12.885197, 100.879626] },
    { type: 'temple', link: "https://maps.app.goo.gl/LWeDMe2wMJsvQr5N8", coords: [12.791474, 100.928825] },
    { type: 'temple', link: "https://maps.app.goo.gl/LpMDiXaHFnE7Aa8w7", coords: [12.765905, 100.956783] },
    
    // ОБНОВЛЕННЫЕ Детские игровые центры (25-31) - ПРАВИЛЬНЫЕ ССЫЛКИ И КООРДИНАТЫ
    { 
        type: 'playground', 
        link: "https://maps.app.goo.gl/RztRChbuiEd5QLeh8", // ✅ ПРАВИЛЬНАЯ ССЫЛКА
        coords: [12.949386808664066, 100.89058016870182], // ✅ ПРАВИЛЬНЫЕ КООРДИНАТЫ
        name: "HarborLand Terminal 21",
        tips: "Крупнейший крытый игровой центр Азии в Terminal 21. 9 игровых зон: батуты JumpZ, скалодром DEEP, Little Land для малышей. Работает 10:30-20:00. Цена: 450-480฿ дети, 200฿ взрослые."
    },
    { 
        type: 'playground', 
        link: "https://maps.app.goo.gl/f1SWXADzM47CXUMh8", // ✅ ПРАВИЛЬНАЯ ССЫЛКА
        coords: [12.934978129828039, 100.88279181544807], // ✅ ПРАВИЛЬНЫЕ КООРДИНАТЫ
        name: "Kidzoona Central Festival",
        tips: "Игровая деревня с ролевыми играми и творческими мастерскими в Central Festival Mall. До 105см: 200฿, выше 105см: 320฿. Работает 10:00-21:00. Идеально для развития воображения детей."
    },
    { 
        type: 'playground', 
        link: "https://maps.app.goo.gl/AUvvP5cSzAK9bXDH6", // ✅ ПРАВИЛЬНАЯ ССЫЛКА
        coords: [12.933931454820344, 100.89754184910598], // ✅ ПРАВИЛЬНЫЕ КООРДИНАТЫ
        name: "Harbor Pattaya Mega Fun",
        tips: "Крупная крытая площадка с батутами, препятствиями и ледовым катком. Разные зоны по возрастам. Цена: ~400-500฿. Работает 10:30-19:30. Есть аркадные игры для детей."
    },
    { 
        type: 'playground', 
        link: "https://maps.app.goo.gl/RFym8tDpDSzGZjiq6", // ✅ ПРАВИЛЬНАЯ ССЫЛКА
        coords: [12.984589686112638, 100.9498388667968], // ✅ ПРАВИЛЬНЫЕ КООРДИНАТЫ
        name: "Pattaya Dinosaur Kingdom",
        tips: "100+ анимированных динозавров, Dino Train для малышей, раскопки костей, обнимашки с детенышами динозавров. Цена: ~500-600฿. Парк под открытым небом с тенью."
    },
    { 
        type: 'playground', 
        link: "https://maps.app.goo.gl/y9gx662uNMzav5HJA", // ✅ ПРАВИЛЬНАЯ ССЫЛКА
        coords: [12.953192844358208, 100.93843221470497], // ✅ ПРАВИЛЬНЫЕ КООРДИНАТЫ
        name: "Pipo Pony Club",
        tips: "Катание на пони для малышей, контактный зоопарк с безопасными животными, вестерн-шоу с ковбоями. Подходит для самых маленьких. Цена уточняется на месте."
    },
    { 
        type: 'playground', 
        link: "https://maps.app.goo.gl/yt7ifzd85dPxYjkQ7", // ✅ ПРАВИЛЬНАЯ ССЫЛКА
        coords: [12.750080798690147, 100.96188921474689], // ✅ ПРАВИЛЬНЫЕ КООРДИНАТЫ
        name: "Ramayana Kids Zone", 
        tips: "Детская зона в крупнейшем аквапарке Таиланда. Для детей до 106см БЕСПЛАТНО! Мини-горки, брызгалки, детский городок. Спасжилеты выдают бесплатно."
    },
    { 
        type: 'playground', 
        link: "https://maps.app.goo.gl/JnJU2g9p91rk2rf48", // ✅ ПРАВИЛЬНАЯ ССЫЛКА
        coords: [12.935030860645668, 100.88271846534506], // ✅ ПРАВИЛЬНЫЕ КООРДИНАТЫ
        name: "MO Play Kidz",
        tips: "Семейный игровой центр с развивающими активностями для детей всех возрастов. Безопасные игровые зоны, мягкие модули, интерактивные игры. Работает в торговом центре с кондиционером."
    },
    
    // Парки (32-39) - БЕЗ ИЗМЕНЕНИЙ (используем существующие ссылки)
    { 
        type: 'park', 
        link: "https://maps.app.goo.gl/wz7LAkoqXd1LHHhw7", 
        coords: [12.914219, 100.868615],
        name: "Chaloem Phrakiat Park",
        tips: "Тихий городской оазис на холме Пратамнак в 500м от пляжа. Пруд с лотосами, беседки, прогулочные дорожки. Красивые виды на залив. Бесплатный вход. Популярен для утренних пробежек у местных жителей."
    },
    { 
        type: 'park', 
        link: "https://maps.app.goo.gl/VzHiKzb1UDQwrJ7SA", 
        coords: [12.932456, 100.881234],
        name: "Pattaya Park Beach Resort",
        tips: "Благоустроенная курортная территория с садами прямо на берегу центрального пляжа. Пальмы, зоны отдыха, водные аттракционы. Можно гулять даже не проживая в отеле. Рестораны и кафе на территории."
    },
    { 
        type: 'park', 
        link: "https://maps.app.goo.gl/1Tho69ErwjcJoLZu6", 
        coords: [12.927890, 100.877123],
        name: "Beach Road Promenade",
        tips: "4-километровая прогулочная зона вдоль центрального пляжа. Пальмы, скамейки, велодорожки, спортплощадки. Особенно красиво на закате. Множество кафе и уличной еды. Активная атмосфера днем и вечером."
    },
    { 
        type: 'park', 
        link: "https://maps.app.goo.gl/ZaWV44GNL86E9Hdq9", 
        coords: [12.892345, 100.873567],
        name: "Jomtien Beach Park",
        tips: "Спокойная альтернатива центральной Паттайе. Широкие зеленые зоны между дорогой и пляжем, детские площадки, зоны для пикников. Семейная атмосфера, меньше толп туристов. Идеально для отдыха с детьми."
    },
    { 
        type: 'park', 
        link: "https://maps.app.goo.gl/wz7LAkoqXd1LHHhw7", 
        coords: [12.914567, 100.868234],
        name: "Buddha Hill Park",
        tips: "Парковая зона вокруг статуи Большого Будды на высоте 164м над морем. Панорамные виды на залив Паттайи, тропическая растительность. 10-15 минут пешком до пляжа. Лучшие виды на восход солнца. Спокойная атмосфера."
    },
    { 
        type: 'park', 
        link: "https://maps.app.goo.gl/QfwfiipfFmXzfJhCA", 
        coords: [12.913456, 100.867890],
        name: "Wat Khao Phra Bat Garden",
        tips: "Храмовый комплекс с ухоженными садами на Пратамнаке. Традиционная тайская архитектура среди зелени, зоны для медитации. 8-10 минут до пляжа пешком. Тихое место для спокойных прогулок и фотосессий."
    },
    { 
        type: 'park', 
        link: "https://maps.app.goo.gl/UTn8gqefDwgPeZxh6", 
        coords: [12.887654, 100.874321],
        name: "Dongtan Beach Green Zone",
        tips: "Менее известная зеленая зона в южном Джомтьене с соснами и пальмами прямо у воды. Тихое место без толп туристов. Хорошо для спокойных прогулок по берегу и пикников в тени деревьев."
    },
    { 
        type: 'park', 
        link: "https://maps.app.goo.gl/xsj9jnGkWduQ6MQV6", 
        coords: [12.915123, 100.780456],
        name: "Koh Larn Island Parks",
        tips: "Небольшие парковые зоны на Коралловом острове рядом с пляжами. 45 минут на пароме от Паттайи. Тропическая растительность, смотровые площадки с видом на море. Кристально чистая вода, белые пляжи. Идеально для дневной поездки."
    }
];


function formatDateForAPI(dateStr) {
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

async function fetchWeatherData(date) {
  const apiDate = formatDateForAPI(date);

  if (weatherCache[apiDate]) {
    console.log(`✓ Погода взята из кэша для ${apiDate}`);
    return weatherCache[apiDate];
  }

  // НОВАЯ ВАЛИДАЦИЯ: Проверяем дату в пределах диапазона прогноза (16 дней)
  const requestDate = new Date(apiDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxForecastDate = new Date(today);
  maxForecastDate.setDate(today.getDate() + 16);

  // Если дата за пределами диапазона API - возвращаем климатические нормы
  if (requestDate > maxForecastDate) {
    console.warn(`⚠ Дата ${apiDate} выходит за пределы прогноза API (макс. 16 дней). Используются климатические нормы.`);
    const [day, month] = date.split('.');
    const monthNum = parseInt(month);

    let airTemp, waterTemp;
    if (monthNum === 12 || monthNum === 1) {
      airTemp = 30;
      waterTemp = 28;
    } else if (monthNum >= 2 && monthNum <= 4) {
      airTemp = 32;
      waterTemp = 29;
    } else if (monthNum >= 5 && monthNum <= 10) {
      airTemp = 29;
      waterTemp = 29;
    } else {
      airTemp = 30;
      waterTemp = 28;
    }

    const result = { airTemp, waterTemp };
    weatherCache[apiDate] = result;
    return result;
  }

  try {
    const airTempUrl = `https://api.open-meteo.com/v1/forecast?latitude=${PATTAYA_LAT}&longitude=${PATTAYA_LON}&daily=temperature_2m_max&timezone=Asia/Bangkok&start_date=${apiDate}&end_date=${apiDate}`;
    const waterTempUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${PATTAYA_LAT}&longitude=${PATTAYA_LON}&daily=sea_water_temperature_max&timezone=Asia/Bangkok&start_date=${apiDate}&end_date=${apiDate}`;

    const [airResponse, waterResponse] = await Promise.all([fetch(airTempUrl), fetch(waterTempUrl)]);

    const airData = await airResponse.json();
    const waterData = await waterResponse.json();

    let airTemp = airData.daily?.temperature_2m_max?.[0] || null;
    let waterTemp = waterData.daily?.sea_water_temperature_max?.[0] || null;

    // Фолбэк на климатические нормы
    if (!airTemp || !waterTemp) {
      const [day, month] = date.split('.');
      const monthNum = parseInt(month);

      if (monthNum === 12 || monthNum === 1) {
        airTemp = airTemp || 30;
        waterTemp = waterTemp || 28;
      } else if (monthNum >= 2 && monthNum <= 4) {
        airTemp = airTemp || 32;
        waterTemp = waterTemp || 29;
      } else if (monthNum >= 5 && monthNum <= 10) {
        airTemp = airTemp || 29;
        waterTemp = waterTemp || 29;
      } else {
        airTemp = airTemp || 30;
        waterTemp = waterTemp || 28;
      }
    }

    const result = {
      airTemp: airTemp ? Math.round(airTemp) : null,
      waterTemp: waterTemp ? Math.round(waterTemp) : null
    };

    weatherCache[apiDate] = result;
    return result;

  } catch (error) {
    console.error('✗ Ошибка получения погоды:', error);
    return { airTemp: 30, waterTemp: 28 };
  }
}

// ИСПРАВЛЕНИЕ: Замена точек на дефисы для совместимости с Firebase
function sanitizeKeyForFirebase(key) {
  // Заменяем точки на дефисы
  return key.replace(/\./g, '-');
}

async function setStorageItem(key, value, callback = null) {
    const sanitizedKey = sanitizeKeyForFirebase(key);
    if (firebaseDatabase) {
        try {
            await firebaseDatabase.ref('dailyPlans/' + sanitizedKey).set(value);
            console.log('✅ Firebase: сохранено', sanitizedKey);
            if (callback) callback();
        } catch (error) {
            console.error('✗ Firebase save error:', error);
            localStorage.setItem(key, value);
            if (callback) callback();
        }
    } else {
        localStorage.setItem(key, value);
        if (callback) callback();
    }
}

async function getStorageItem(key) {
    const sanitizedKey = sanitizeKeyForFirebase(key);
    if (firebaseDatabase) {
        try {
            const snapshot = await firebaseDatabase.ref('dailyPlans/' + sanitizedKey).once('value');
            if (snapshot.exists()) {
                console.log('✅ Firebase: загружено', sanitizedKey);
                return snapshot.val();
            }
        } catch (error) {
            console.error('✗ Firebase load error:', error);
        }
    }
    return localStorage.getItem(key);
}

async function removeStorageItem(key, callback = null) {
    const sanitizedKey = sanitizeKeyForFirebase(key);
    if (firebaseDatabase) {
        try {
            await firebaseDatabase.ref('dailyPlans/' + sanitizedKey).remove();
            console.log('✅ Firebase: удалено', sanitizedKey);
            if (callback) callback();
        } catch (error) {
            console.error('✗ Firebase delete error:', error);
            localStorage.removeItem(key);
            if (callback) callback();
        }
    } else {
        localStorage.removeItem(key);
        if (callback) callback();
    }
}

function getDistance([lat1, lon1], [lat2, lon2]) {
    const toRad = d => d * Math.PI / 180;
    const R = 6371; 
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        initApp();
    } catch (e) {
        console.error("Критическая ошибка при инициализации:", e);
    }
});

function initApp() {
    initFirebase();
    initTabs();
    initCalendarFilters();
    initGeoFeatures();
    initDailyPlanModal();
    
    updateCountdown();
    setInterval(updateCountdown, 3600000);
    
    renderActivities(activities);
    renderContacts(points);
    
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', e => {
        if (e.target.id === 'modalOverlay') closeModal();
    });
}

function initTabs() {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button, .tab-content').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
}

function initCalendarFilters() {
    document.querySelectorAll('.filter-btn').forEach(f => {
        f.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('active'));
            f.classList.add('active');
            const filtered = f.dataset.filter === 'all' ? activities : activities.filter(a => a.type === f.dataset.filter);
            renderActivities(filtered);
            localStorage.setItem('filter', f.dataset.filter);
        });
    });
    const saved = localStorage.getItem('filter') || 'all';
    document.querySelector(`.filter-btn[data-filter="${saved}"]`)?.click();
}

function initGeoFeatures() {
       document.getElementById('locateBtn').addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert('Геолокация не поддерживается.');
            return resetGeoState();
        }
        navigator.geolocation.getCurrentPosition(pos => {
            userCoords = [pos.coords.latitude, pos.coords.longitude];
            updateGeoView();
        }, () => {
            alert('Не удалось получить местоположение.');
            resetGeoState();
        });
    });

    document.querySelectorAll('.geo-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.geo-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeGeoFilter = btn.dataset.filter;
            if (userCoords) updateGeoView();
        });
    });

    document.querySelectorAll('.geo-item-btn').forEach(initGeoItemButton);
}

function updateGeoView() {
    updateAllDistances();
    sortAllGeoBlocks();
    applyGeoFilter();
}

function updateAllDistances() {
    if (!userCoords) return;
    document.querySelectorAll('.geo-item-btn').forEach(button => {
        const id = parseInt(button.dataset.id, 10);
        if (isNaN(id)) return;
        
        const distance = getDistance(userCoords, allGeoData[id].coords);
        button.dataset.distance = distance;
        let distSpan = button.querySelector('.distance-tag');
        if (!distSpan) {
            distSpan = document.createElement('span');
            distSpan.className = 'distance-tag';
            button.appendChild(distSpan);
        }
        distSpan.textContent = ` ≈ ${distance} км`;
    });
}

function sortAllGeoBlocks() {
    ['naklua', 'pratamnak', 'jomtien'].forEach(subblockName => {
        const container = document.querySelector(`.cafe-sub-block[data-subblock-name="${subblockName}"]`);
        if(container) {
            const buttons = Array.from(container.querySelectorAll('.geo-item-btn'));
            buttons.sort((a, b) => (parseFloat(a.dataset.distance) || 9999) - (parseFloat(b.dataset.distance) || 9999));
            buttons.forEach(button => container.appendChild(button));
        }
    });

    const templesContainer = document.querySelector('.geo-temples .geo-items-container');
    if(templesContainer) {
        const buttons = Array.from(templesContainer.querySelectorAll('.geo-item-btn'));
        buttons.sort((a, b) => (parseFloat(a.dataset.distance) || 9999) - (parseFloat(b.dataset.distance) || 9999));
        buttons.forEach(button => templesContainer.appendChild(button));
    }

    const playgroundsContainer = document.querySelector('.geo-playgrounds .geo-items-container');
    if(playgroundsContainer) {
        const buttons = Array.from(playgroundsContainer.querySelectorAll('.geo-item-btn'));
        buttons.sort((a, b) => (parseFloat(a.dataset.distance) || 9999) - (parseFloat(b.dataset.distance) || 9999));
        buttons.forEach(button => playgroundsContainer.appendChild(button));
    }

    const parksContainer = document.querySelector('.geo-parks .geo-items-container');
    if(parksContainer) {
        const buttons = Array.from(parksContainer.querySelectorAll('.geo-item-btn'));
        buttons.sort((a, b) => (parseFloat(a.dataset.distance) || 9999) - (parseFloat(b.dataset.distance) || 9999));
        buttons.forEach(button => parksContainer.appendChild(button));
    }
}

function applyGeoFilter() {
    restoreAllButtonsVisibility();
    const nearbyContainer = document.getElementById('nearbyItems');
    nearbyContainer.innerHTML = '';

    const targetSubblock = document.querySelector(`.cafe-sub-block[data-subblock-name="${activeGeoFilter}"]`);
    const closestCafeButton = targetSubblock ? targetSubblock.querySelector('.geo-item-btn') : null;

    const templesContainer = document.querySelector('.geo-temples .geo-items-container');
    const closestTempleButton = templesContainer ? templesContainer.querySelector('.geo-item-btn') : null;

    const playgroundsContainer = document.querySelector('.geo-playgrounds .geo-items-container');
    const closestPlaygroundButton = playgroundsContainer ? playgroundsContainer.querySelector('.geo-item-btn') : null;

    const parksContainer = document.querySelector('.geo-parks .geo-items-container');
    const closestParkButton = parksContainer ? parksContainer.querySelector('.geo-item-btn') : null;

    if (closestCafeButton) {
        const clone = closestCafeButton.cloneNode(true);
        initGeoItemButton(clone);
        nearbyContainer.appendChild(clone);
        closestCafeButton.style.display = 'none';
    }

    if (closestTempleButton) {
        const clone = closestTempleButton.cloneNode(true);
        initGeoItemButton(clone);
        nearbyContainer.appendChild(clone);
        closestTempleButton.style.display = 'none';
    }

    if (closestPlaygroundButton) {
        const clone = closestPlaygroundButton.cloneNode(true);
        initGeoItemButton(clone);
        nearbyContainer.appendChild(clone);
        closestPlaygroundButton.style.display = 'none';
    }

    if (closestParkButton) {
        const clone = closestParkButton.cloneNode(true);
        initGeoItemButton(clone);
        nearbyContainer.appendChild(clone);
        closestParkButton.style.display = 'none';
    }
    
    if (!closestCafeButton && !closestTempleButton && !closestPlaygroundButton && !closestParkButton) {
        nearbyContainer.innerHTML = `<div class="empty-state">Нет заведений</div>`;
    }
}

function restoreAllButtonsVisibility() {
    document.querySelectorAll('.geo-item-btn').forEach(btn => btn.style.display = 'flex');
}

function resetGeoState() {
    userCoords = null;
    document.getElementById('nearbyItems').innerHTML = `<div class="empty-state">Нажмите "Получить местоположение"</div>`;
    restoreAllButtonsVisibility();
    document.querySelectorAll('.distance-tag').forEach(tag => tag.remove());
    document.querySelectorAll('[data-distance]').forEach(el => delete el.dataset.distance);
}

function initGeoItemButton(button) {
    const id = parseInt(button.dataset.id, 10);
    if (isNaN(id)) return;

    let pressTimer = null;
    let startX, startY;
    let isScrolling = false;
    const MOVE_THRESHOLD = 10;

    const handlePressStart = (e) => {
        isScrolling = false;
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

        pressTimer = setTimeout(() => {
            if (!isScrolling) {
                if (!userCoords) return alert('Сначала определите ваше местоположение.');
                const destination = allGeoData[id].coords.join(',');
                const origin = userCoords.join(',');
                window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, '_blank');
            }
            pressTimer = null;
        }, 800);
    };

    const handlePressMove = (e) => {
        if (isScrolling || !pressTimer) return;
        const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        if (Math.abs(currentX - startX) > MOVE_THRESHOLD || Math.abs(currentY - startY) > MOVE_THRESHOLD) {
            isScrolling = true;
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    };

    const handlePressEnd = (e) => {
        if (!isScrolling && pressTimer) {
            e.preventDefault();
            clearTimeout(pressTimer);
            
            if (allGeoData[id] && allGeoData[id].type === 'playground') {
                showPlaygroundModal(allGeoData[id]);
            } else if (allGeoData[id] && allGeoData[id].type === 'park') {
                showParkModal(allGeoData[id]);
            } else {
                window.open(allGeoData[id].link, '_blank');
            }
        }
        pressTimer = null;
    };

    const handlePressCancel = () => { clearTimeout(pressTimer); pressTimer = null; };

    button.removeEventListener('mousedown', handlePressStart);
    button.removeEventListener('mousemove', handlePressMove);
    button.removeEventListener('mouseup', handlePressEnd);
    button.removeEventListener('mouseleave', handlePressCancel);
    button.addEventListener('mousedown', handlePressStart);
    button.addEventListener('mousemove', handlePressMove);
    button.addEventListener('mouseup', handlePressEnd);
    button.addEventListener('mouseleave', handlePressCancel);

    button.removeEventListener('touchstart', handlePressStart);
    button.removeEventListener('touchmove', handlePressMove);
    button.removeEventListener('touchend', handlePressEnd);
    button.removeEventListener('touchcancel', handlePressCancel);
    button.addEventListener('touchstart', handlePressStart, { passive: true });
    button.addEventListener('touchmove', handlePressMove, { passive: true });
    button.addEventListener('touchend', handlePressEnd);
    button.addEventListener('touchcancel', handlePressCancel);
}

function showPlaygroundModal(playground) {
    let content = `<h3>🎠 ${playground.name}</h3>`;
    if (playground.tips) content += `<p>💡 ${playground.tips}</p>`;
    
    const fromHome = `${homeCoords.lat},${homeCoords.lng}`;
    const to = `${playground.coords[0]},${playground.coords[1]}`;
    content += `<p><a href="https://www.google.com/maps/dir/?api=1&origin=${fromHome}&destination=${to}" target="_blank">🗺️ Маршрут от дома</a></p>`;
    
    if (userCoords) {
        const userFrom = `${userCoords[0]},${userCoords[1]}`;
        content += `<p><a href="https://www.google.com/maps/dir/?api=1&origin=${userFrom}&destination=${to}" target="_blank">📍 Маршрут от вас</a></p>`;
        const distance = getDistance(userCoords, playground.coords);
        content += `<p>📏 Расстояние: ≈${distance} км</p>`;
    }
    
    content += `<p><a href="${playground.link}" target="_blank">🌐 Открыть в Google Maps</a></p>`;
    
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalOverlay').classList.add('active');
}

function showParkModal(park) {
    let content = `<h3>🌳 ${park.name}</h3>`;
    if (park.tips) content += `<p>💡 ${park.tips}</p>`;
    
    const fromHome = `${homeCoords.lat},${homeCoords.lng}`;
    const to = `${park.coords[0]},${park.coords[1]}`;
    content += `<p><a href="https://www.google.com/maps/dir/?api=1&origin=${fromHome}&destination=${to}" target="_blank">🗺️ Маршрут от дома</a></p>`;
    
    if (userCoords) {
        const userFrom = `${userCoords[0]},${userCoords[1]}`;
        content += `<p><a href="https://www.google.com/maps/dir/?api=1&origin=${userFrom}&destination=${to}" target="_blank">📍 Маршрут от вас</a></p>`;
        const distance = getDistance(userCoords, park.coords);
        content += `<p>📏 Расстояние: ≈${distance} км</p>`;
    }
    
    content += `<p><a href="${park.link}" target="_blank">🌐 Открыть в Google Maps</a></p>`;
    
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalOverlay').classList.add('active');
}

// ОБНОВЛЕННЫЙ массив kidsLeisure с поездкой на Ко Лан
const kidsLeisure = [
    {
        name: 'Mini Siam',
        date: '01.01.2026',
        coords: { lat: 12.9554157, lng: 100.9088538 },
        tips: 'Парк миниатюр мирового уровня с более чем 100 копиями знаменитых достопримечательностей в масштабе 1:25. Работает 9:00-19:00 ежедневно. Лучшее время посещения: после 15:00 когда включается подсветка. Разделен на зоны Mini Siam (тайские достопримечательности) и Mini Europe (мировые памятники). Продолжительность визита: 1.5-2 часа. Есть кафе и сувенирные магазины.',
        type: 'sight'
    },
    {
        name: 'Деревня слонов',
        date: '04.01.2026',
        coords: { lat: 12.91604299, lng: 100.93883441 },
        tips: 'Этический слоновый заповедник с 1973 года. Шоу в 14:30-16:00, кормление и купание со слонами. VAŽНО: есть несколько мест с похожими названиями - выбирайте Pattaya Elephant Sanctuary для этичного обращения с животными. Включает вегетарианский обед, транспорт от отеля. Длительность: 2-3 часа. Рекомендуется бронировать заранее.',
        type: 'sight'
    },
    {
        name: 'Дельфинариум',
        date: '07.01.2026',
        coords: { lat: 12.95222191, lng: 100.93617557 },
        tips: 'Современный дельфинариум с профессиональными шоу дельфинов и морских котиков. Шоу в 11:00, 14:00 и 17:00 (закрыто по средам). Длительность шоу: 45 минут. Возможность плавания с дельфинами в 12:00, 15:00, 18:00. Места VIP, Deluxe и обычные. Приходите за 30-45 минут до начала. В первых рядах можно промокнуть - выдают дождевики.',
        type: 'sight'
    },
    {
        name: 'Аюттайя',
        date: '08.01.2026',
        coords: { lat: 14.35741905, lng: 100.56757512 },
        tips: 'Древняя столица Сиама, объект всемирного наследия ЮНЕСКО. Руины храмов XIV-XVIII веков. Знаменитая голова Будды в корнях дерева в Wat Mahathat. Расстояние от Паттайи: 150 км (2.5 часа езды). Планируйте полный день с рано утра. Лучше брать экскурсию с гидом. Обязательно: Wat Chaiwatthanaram, Wat Phra Si Sanphet. Удобная обувь обязательна!',
        type: 'sight'
    },
    {
        name: 'Сад Нонг Нуч',
        date: '11.01.2026',
        coords: { lat: 12.76575858, lng: 100.93505629 },
        tips: 'Всемирно известный тропический ботанический сад площадью 240 гектаров. Шоу слонов и культурные представления. Потрясающие тематические сады: французский, английский, кактусовый. Орхидеи и экзотические растения. Планируйте целый день - территория огромная. Лучше всего с утра, когда прохладнее. Есть рестораны и кафе на территории.',
        type: 'sight'
    },
    {
        name: 'Ко Лан',
        date: '14.01.2026',
        coords: { lat: 12.915123, lng: 100.780456 },
        tips: 'Однодневная поездка на Коралловый остров - жемчужину Сиамского залива! Кристально чистая вода, белоснежные пляжи Таваен и Самае, мелководье идеально для детей. Выезд в 07:30 с пирса Бали Хай, паром 45 минут (30฿). На острове: пляжный отдых, снорклинг, обед из морепродуктов. Возвращение в 16:00. Взять: солнцезащитный крем SPF50+, панамки, нарукавники для ребенка, питьевую воду. Общие расходы: ~1,500฿ на семью. Незабываемые впечатления гарантированы!',
        type: 'sight'
    },
    {
        name: 'Музей искусств 3D',
        date: '17.01.2026',
        coords: { lat: 12.94832322, lng: 100.88976288 },
        tips: 'Интерактивный музей с 3D-картинами для впечатляющих фотосессий. Более 100 произведений искусства в 10 тематических зонах: подводный мир, дикие животные, классическое искусство. Идеально для Instagram! Время посещения: 1-2 часа. Работает 9:00-21:00. Берите камеру с хорошим объективом - здесь все создано для фотографий. Есть аудиогид на разных языках.',
        type: 'sight'
    },
    {
        name: 'Зоопарк Кхао Кхео',
        date: '19.01.2026',
        coords: { lat: 13.21500644, lng: 101.05700099 },
        tips: 'Крупнейший открытый зоопарк Таиланда на 800 гектарах. Более 300 видов животных в естественной среде. Сафари на автомобиле, пешие маршруты, ночное сафари. Особенность: белые тигры, слоны, жирафы. Работает 8:00-18:00. Расстояние: 45 км от Паттайи. Планируйте 4-5 часов. Есть рестораны и зоны отдыха. Возьмите головные уборы и воду.',
        type: 'sight'
    },
    {
        name: 'Плавучий рынок',
        date: '22.01.2026',
        coords: { lat: 12.86799376, lng: 100.90469404 },
        tips: 'Аутентичный плавучий рынок с торговлей на лодках по каналам. Свежие тропические фрукты, морепродукты, сувениры. Лучшее время: 7:00-11:00, когда наиболее активна торговля. Катание на длинных лодках по каналам, кормление рыб и варанов. Обязательно попробуйте: тайские сладости, кокосовое мороженое. Торгуйтесь! Возьмите мелкие деньги и водостойкую сумку.',
        type: 'sight'
    },
    {
        name: 'Ко Лан',
        date: '24.01.2026',
        coords: { lat: 12.915123, lng: 100.780456 },
        tips: 'Однодневная поездка на Коралловый остров - жемчужину Сиамского залива! Кристально чистая вода, белоснежные пляжи Таваен и Самае, мелководье идеально для детей. Выезд в 07:30 с пирса Бали Хай, паром 45 минут (30฿). На острове: пляжный отдых, снорклинг, обед из морепродуктов. Возвращение в 16:00. Взять: солнцезащитный крем SPF50+, панамки, нарукавники для ребенка, питьевую воду. Общие расходы: ~1,500฿ на семью. Незабываемые впечатления гарантированы!',
        type: 'sight'
    }
,
    { name: '🧪 ТЕСТ', date: '01.10.2025', coords: null, tips: 'Тестовый блок для проверки Weather API и Firebase', type: 'sea' }
];

// ОБНОВЛЕННАЯ функция generateBeachDays - исключаем 14.01.2026 для Ко Лана
function generateBeachDays() {
    const used = kidsLeisure.map(x => x.date);
    const days = [];
    const start = new Date('2025-12-29'), end = new Date('2026-01-26');
    const transferDates = ['09.01.2026', '15.01.2026', '25.01.2026'];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const date = d.toLocaleDateString('ru-RU');
        if (!used.includes(date)) {
            if (transferDates.includes(date)) {
                days.push({ type: 'sea', name: '🚀 В Паттайю', date, coords: null, tips: 'Отдых на море.' });
            } else {
                days.push({ type: 'sea', name: 'Пляжинг', date, coords: null, tips: 'Отдых на море.' });
            }
        }
    }
    return days;

}

const activities = [...generateBeachDays(), ...kidsLeisure].sort((a,b) => new Date(a.date.split('.').reverse().join('-')) - new Date(b.date.split('.').reverse().join('-')));

function updateCountdown() {
    const startTrip = new Date('2025-12-29');  
    const endTrip = new Date('2026-01-26');    
    const now = new Date();
    
    if (now < startTrip) {
        const days = Math.ceil((startTrip - now) / 864e5);
        document.getElementById('countdownText').textContent = '✈️ До поездки:';
        document.getElementById('days').textContent = days;
        document.querySelector('.countdown-label').textContent = 'дней';
        
    } else if (now >= startTrip && now < endTrip) { 
        const daysToGo = Math.ceil((endTrip - now) / 864e5);
        document.getElementById('countdownText').textContent = '⛱️ Наслаждаемся:';
        document.getElementById('days').textContent = daysToGo;
        document.querySelector('.countdown-label').textContent = 'дней ⛱️';
        
    } else { 
        document.getElementById('countdownText').textContent = 'Поездка завершена!';
        document.getElementById('days').textContent = '✔';
        document.querySelector('.countdown-label').textContent = '';
    }
}


function handleCardClick(activityName, date, type) {
    if (type === 'sea') {
        openDailyPlanModal(activityName, date);
    } else if (type === 'sight') {
        const activity = activities.find(a => a.name === activityName && a.date === date);
        if (activity) {
            showPlaceModal(activity);
        } else {
            console.error('Активность не найдена:', activityName, date);
        }
    }
}

function renderActivities(list) {
    const grid = document.getElementById('activitiesGrid');
    if (!grid) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const future = [], past = [];
    list.forEach(a => {
        const parts = a.date.split('.');
        const actDate = new Date(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`);
        actDate.setHours(0,0,0,0);
        (actDate < today ? past : future).push(a);
    });

    function getCardClass(a, isPast, isTransfer, isBordered) {
        let base = `card ${a.type === 'sea' ? 'activity-sea' : 'activity-sight'}`;
        if (isTransfer) base += ' activity-transfer';
        if (isBordered) base += ' card-bordered';
        if (isPast) base += ' card-past';
        return base;
    }

    function renderCard(a, isPast) {
        const isTransfer = (
            a.name === '🚀 В Паттайю' ||
            (a.date === '26.01.2026' && a.type === 'sea')
        );
        const isBordered = !isTransfer;  // Все прочие карточки с бордером

        const displayName = (a.date === '26.01.2026' && a.type === 'sea') ? 'В Бангкок!' : a.name;
        let icon = a.type === 'sea' ? '🏖️ ' : (getIconForActivity(a.name) + ' ');
        const prices = {
            'Mini Siam': `<p class="price">Взрослый 230 ฿ / Детский 130 ฿</p>`,
            'Деревня слонов': `<p class="price">Взрослый 650 ฿ / Детский 500 ฿</p>`,
            'Дельфинариум': `<p class="price">Взрослый 630 ฿ / Детский 450 ฿</p>`,
            'Сад Нонг Нуч': `<p class="price">Взрослый 420 ฿ / Детский 320 ฿</p>`,
            'Музей искусств 3D': `<p class="price">Взрослый 235 ฿ / Детский 180 ฿</p>`,
            'Зоопарк Кхао Кхео': `<p class="price">Взрослый 350 ฿ / Детский 120 ฿</p>`,
            'Ко Лан': `<p class="price">Паром 30 ฿ / Общие расходы ~1,500 ฿</p>`
        };
        const priceLine = prices[a.name] || '';
        const weatherDiv = `<div class="weather" data-date="${a.date}"></div>`;
        const cardClass = getCardClass(a, isPast, isTransfer, isBordered);

        if(a.type === 'sea') {
            return `<div class="${cardClass}" onclick="handleCardClick('${a.name}', '${a.date}', '${a.type}')">
              <p>${a.date}</p>
              <h3>${icon}${displayName}</h3>
              ${weatherDiv}
            </div>`;
        } else if(a.type === 'sight') {
            return `<div class="${cardClass}" onclick="handleCardClick('${a.name}', '${a.date}', '${a.type}')">
              <p>${a.date}</p>
              <h3>${icon}${displayName}</h3>
              ${priceLine}
              ${weatherDiv}
            </div>`;
        }
    }

    grid.innerHTML =
        future.map(a => renderCard(a, false)).join('') +
        past.map(a => renderCard(a, true)).join('');

    list.forEach(async (activity) => {
        const weather = await fetchWeatherData(activity.date);
        const weatherDivs = document.querySelectorAll(`.weather[data-date="${activity.date}"]`);
        weatherDivs.forEach(div => {
            if (weather.airTemp || weather.waterTemp) {
                let weatherText = '';
                if (weather.airTemp) weatherText += `🌡️ ${weather.airTemp}°C `;
                if (weather.waterTemp) weatherText += `🌊 ${weather.waterTemp}°C`;
                div.textContent = weatherText.trim();
            }
        });
    });
    bindDetailButtons();
}

function bindDetailButtons() {
    document.querySelectorAll('.details').forEach(btn => {
        btn.onclick = () => {
            if (btn.classList.contains('daily-plan-btn')) {
                openDailyPlanModal(btn.dataset.name, btn.dataset.date);
            } else {
                const act = activities.find(x => x.name === btn.dataset.name && x.date === btn.dataset.date);
                if (act) showModal(act);
            }
        };
    });
}

function showPlaceModal(place) {
    let content = `<h3>${getIconForActivity(place.name)} ${place.name}</h3>`;
    if (place.tips) content += `<p>💡 ${place.tips}</p>`;

    if (place.coords) {
        const fromHome = `${homeCoords.lat},${homeCoords.lng}`;
        const to = `${place.coords.lat},${place.coords.lng}`;
    content += `<p><a href="https://www.google.com/maps/dir/?api=1&origin=${fromHome}&destination=${to}" target="_blank">🗺️ Маршрут от дома</a></p>`;
    if (userCoords) {
        const userFrom = `${userCoords[0]},${userCoords[1]}`;
        content += `<p><a href="https://www.google.com/maps/dir/?api=1&origin=${userFrom}&destination=${to}" target="_blank">📍 Маршрут от вас</a></p>`;
        const distance = getDistance(userCoords, [place.coords.lat, place.coords.lng]);
        content += `<p>📏 Расстояние: ≈${distance} км</p>`;
    }
        } else {
        content += `<p>📍 Координаты не указаны</p>`;
    }
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalOverlay').classList.add('active');
}

const points = [];

function renderContacts(list) {
    const grid = document.getElementById('contactsGrid');
    if (!grid) return;
    let items = list.slice();
    if (userCoords) {
        items.forEach(p => p.distance = parseFloat(getDistance(userCoords, [p.coords.lat, p.coords.lng])));
        items.sort((a,b) => a.distance - b.distance);
    }
    grid.innerHTML = items.map(p => {
        const distTag = p.distance ? `<span class="distance-tag">≈${p.distance.toFixed(1)} км</span>` : '';
        return `<button class="contact-btn" onclick='showContactModal(${JSON.stringify(p)})'><span class="icon">${p.icon}</span><span>${p.name}</span>${distTag}</button>`;
    }).join('');
}

// ОБНОВЛЕНО: Добавлена иконка для Ко Лана
function getIconForActivity(name) {
    const icons = {
        'Mini Siam': '🏛️',
        'Деревня слонов': '🐘',
        'Дельфинариум': '🐬',
        'Сад Нонг Нуч': '🌺',
        'Музей искусств 3D': '🎨',
        'Аюттайя': '⛩️',
        'Зоопарк Кхао Кхео': '🦒',
        'Плавучий рынок': '🛶',
        'Ко Лан': '🏝️'
};
    return icons[name] || '📍';
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

function initDailyPlanModal() {
    const modal = document.getElementById('dailyPlanModal');
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target === modal) closeDailyPlanModal();
        });
    }
}

function openDailyPlanModal(activityName, date) {
    const modal = document.getElementById('dailyPlanModal');
    const grid = document.getElementById('dailyPlanGrid');
    
    if (!modal || !grid) return;
    
    document.querySelector('#dailyPlanModalBody h3').textContent = `${date}`;

    
    let timeSlots = '';
    const timeSlotData = [];
    
    for (let hour = 7; hour <= 20; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
        const key = `${date}_${startTime}`;
        
        timeSlotData.push({ startTime, endTime, key, date });
        
        timeSlots += `
            <div class="daily-plan-row">
                <div class="time-slot">${startTime} - ${endTime}</div>
                <input type="text" 
                       class="plan-input" 
                       data-time="${startTime}" 
                       data-date="${date}"
                       value=""
                       placeholder="..............................">
            </div>
        `;
    }
    
    grid.innerHTML = timeSlots;
modal.classList.add('active');

// ИСПРАВЛЕНО: Используем async/await для загрузки данных
(async () => {
    for (const slot of timeSlotData) {
        const savedPlan = await getStorageItem(slot.key);
        const input = document.querySelector(`input[data-time="${slot.startTime}"][data-date="${slot.date}"]`);
        if (input && savedPlan) {
            input.value = savedPlan;
            console.log(`✅ Загружено из хранилища: ${slot.startTime} - ${savedPlan}`);
        }
    }
})();
    
    document.querySelectorAll('.plan-input').forEach(input => {
        let touchStartTime = 0;
        let touchStartY = 0;
        
        input.addEventListener('blur', () => {
            autoSavePlan(input);
        });
        
        let saveTimeout;
        input.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                autoSavePlan(input);
            }, 1000);
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                autoSavePlan(input);
                input.blur();
            }
        });
        
        input.addEventListener('touchstart', e => {
            touchStartTime = Date.now();
            touchStartY = e.touches[0].clientY;
        });
        
        input.addEventListener('touchend', e => {
            const touchEndTime = Date.now();
            const timeDiff = touchEndTime - touchStartTime;
            
            if (timeDiff > 150) {
                setTimeout(() => input.focus(), 50);
            }
        });
        
        input.addEventListener('touchmove', e => {
            const currentY = e.touches[0].clientY;
            const moveDiff = Math.abs(currentY - touchStartY);
            
            if (moveDiff > 10) {
                touchStartTime = 0;
            }
        });
    });
}

function closeDailyPlanModal() {
    const modal = document.getElementById('dailyPlanModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function autoSavePlan(input) {
    const date = input.dataset.date;
    const time = input.dataset.time;
    const value = input.value.trim();
    const key = `${date}_${time}`;
    
    console.log(`🔄 Попытка сохранения: ${key} = "${value}"`);
    
    if (value) {
        setStorageItem(key, value, () => {
            input.style.backgroundColor = '#dcfce7';
            setTimeout(() => {
                input.style.backgroundColor = '';
            }, 300);
            console.log(`✅ Автосохранено: ${time} - ${value}`);
        });
    } else {
        removeStorageItem(key, () => {
            console.log(`🗑️ Удален пустой план: ${time}`);
        });
    }
}

function showContactModal(contact) {
    let content = `<h3>${contact.icon} ${contact.name}</h3>`;
    
    if (contact.coords) {
        const fromHome = `${homeCoords.lat},${homeCoords.lng}`;
        const to = `${contact.coords.lat},${contact.coords.lng}`;
        content += `<p><a href="https://www.google.com/maps/dir/?api=1&origin=${fromHome}&destination=${to}" target="_blank">🗺️ Маршрут от дома</a></p>`;
        
        if (userCoords) {
            const userFrom = `${userCoords[0]},${userCoords[1]}`;
            content += `<p><a href="https://www.google.com/maps/dir/?api=1&origin=${userFrom}&destination=${to}" target="_blank">📍 Маршрут от вас</a></p>`;
            const distance = getDistance(userCoords, [contact.coords.lat, contact.coords.lng]);
            content += `<p>📏 Расстояние: ≈${distance} км</p>`;
        }
    }
    
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalOverlay').classList.add('active');
}
