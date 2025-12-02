// Version: 2.5.0 | Lines: 940
// Исправлено: Загрузка данных ежедневника через async/await
// 2025-10-01
// ===== FIREBASE CONFIGURATION =====
// ===== КОНФИГ ВАЛЮТ И СОСТОЯНИЕ КУРСА =====

// Базовые валюты, которые можно выбрать в UI
const FX_BASES = ['THB', 'USD', 'CNY'];
// Целевая валюта фиксирована
const FX_TARGET = 'RUB';

// Текущее состояние курса
let fxState = {
  base: 'THB',        // активная базовая валюта
  rate: null,         // курс base -> RUB
  inverse: null,      // курс RUB -> base
  updatedAt: null,    // локальное время последнего удачного запроса (ms)
  nextUpdateAt: null, // время следующего обновления от провайдера (UTC в ms)
};

// Кэш курсов по базовой валюте
let fxCache = {};      // ключ: base, значение: { rate, inverse, ts, updatedAt, nextUpdateAt }

// TTL кэша (30 минут)
const FX_TTL_MS = 30 * 60 * 1000;

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

// Расчёт расстояния между двумя точками (формула Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Радиус Земли в км
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Расстояние в км
}

// Расчёт стоимости и времени транспорта
function calculateTransport(distanceKm) {
    // Сонгтео
    let songthaewPrice = distanceKm <= 3 ? 10 : (distanceKm <= 10 ? 20 : 30);
    let songthaewTime = Math.ceil(distanceKm * 3); // ~3 мин/км

    // Такси
    let taxiPrice = 35 + Math.ceil(distanceKm * 10);
    let taxiTime = Math.ceil(distanceKm * 2); // ~2 мин/км

    return {
        songthaew: { time: songthaewTime, price: songthaewPrice },
        taxi: { time: taxiTime, price: taxiPrice }
    };
}

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
const homeCoords = { lat: 12.96914180371933, lng: 100.88807709411466 }; // Координаты дома в Паттайе
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
        tips: "Детская зона в крупнейшем аквапарке Таиланда. Для детей до 106см БЕСПЛАТНО! Мини-горки, брызгалки, детский городок. Спасжилеты выд бесплатно."
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
        link: "https://maps.app.goo.gl/TDnUCJAJMMsbn3BP6",
        coords: [12.906411996641852, 100.86258504083105],
        name: "Pattaya Park Beach Resort",
        tips: "Благоустроенная курортная территория с садами прямо на берегу центрального пляжа. Пальмы, зоны отдыха, водные аттракционы. Можно гулять даже не проживая в отеле. Рестораны и кафе на территории."
    },
    { 
        type: 'park', 
        link: "https://maps.app.goo.gl/bLeMfjzsvtSPDRqw5",
        coords: [12.94836068902665, 100.88460996222713],
        name: "Beach Road Promenade",
        tips: "4-километровая прогулочная зона вдоль центрального пляжа. Пальмы, скамейки, велодорожки, спортплощадки. Особенно красиво на закате. Множество кафе и уличной еды. Активная атмосфера днем и вечером."
    },
    { 
        type: 'park', 
        link: "https://maps.app.goo.gl/a619nE1VSTu2hLMD7",
        coords: [12.890197609227872, 100.87451170477685],
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
        link: "https://maps.app.goo.gl/Kbucrn97gN5q4y5fA",
        coords: [12.899319145808768, 100.86596503421046],
        name: "Dongtan Beach Green Zone",
        tips: "Менее известная зеленая зона в южном Джомтьене с соснами и пальмами прямо у воды. Тихое место без толп туристов. Хорошо для спокойных прогулок по берегу и пикников в тени деревьев."
    },
    { 
        type: 'park', 
        link: "https://maps.app.goo.gl/xsj9jnGkWduQ6MQV6", 
        coords: [12.915160636391864, 100.78033264786737],
        name: "Koh Larn Island Parks",
        tips: "Небольшие парковые зоны на Коралловом острове рядом с пляжами. 45 минут на пароме от Паттайи. Тропическая растительность, смотровые площадки с видом на море. Кристально чистая вода, белые пляжи. Идеально для дневной поездки."
    }
];


function formatDateForAPI(dateStr) {
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}


async function fetchWeatherData(date) {
  const apiDate = formatDateForAPI(date); // ожидается DD.MM.YYYY -> YYYY-MM-DD

  if (weatherCache[apiDate]) {
    console.log(`✓ Погода взята из кэша для ${apiDate}`);
    return weatherCache[apiDate];
  }

  // Ограничение прогноза: 16 дней
  const requestDate = new Date(apiDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxForecastDate = new Date(today);
  maxForecastDate.setDate(today.getDate() + 16);

  if (requestDate > maxForecastDate) {
    console.warn(`⚠ Дата ${apiDate} выходит за пределы прогноза API (макс. 16 дней). Используются климатические нормы.`);
    const [, month] = date.split('.');
    const monthNum = parseInt(month, 10);

    let airTemp, waterTemp;
    if (monthNum === 12 || monthNum === 1) {
      airTemp = 30; waterTemp = 28;
    } else if (monthNum >= 2 && monthNum <= 4) {
      airTemp = 32; waterTemp = 29;
    } else if (monthNum >= 5 && monthNum <= 10) {
      airTemp = 29; waterTemp = 29;
    } else {
      airTemp = 30; waterTemp = 28;
    }

    const result = { airTemp, waterTemp };
    weatherCache[apiDate] = result;
    return result;
  }

  try {
    // Валидируем ISO-дату и строим корректные URL через URLSearchParams
    assertIsoDate(apiDate);

    const airTempUrl = buildAirUrl(PATTAYA_LAT, PATTAYA_LON, apiDate);           // daily=temperature_2m_max
    let waterTempUrl = buildMarineUrl(PATTAYA_LAT, PATTAYA_LON, apiDate, 'daily'); // daily=sea_surface_temperature_max

    // Запрашиваем воздух и воду параллельно
    let [airResponse, waterResponse] = await Promise.all([
      fetch(airTempUrl),
      fetch(waterTempUrl),
    ]);

    const airData = await airResponse.json();

    let waterData = null;
    if (!waterResponse.ok) {
      // Считываем reason и пробуем hourly fallback
      let errBody = {};
      try { errBody = await waterResponse.json(); } catch (_) {}
      console.warn('Marine daily error:', waterResponse.status, errBody?.reason || errBody);

      // Fallback на hourly=sea_surface_temperature, берём максимум
      waterTempUrl = buildMarineUrl(PATTAYA_LAT, PATTAYA_LON, apiDate, 'hourly');
      waterResponse = await fetch(waterTempUrl);
      if (!waterResponse.ok) {
        let err2 = {};
        try { err2 = await waterResponse.json(); } catch (_) {}
        console.error('Marine hourly error:', waterResponse.status, err2?.reason || err2);
      } else {
        waterData = await waterResponse.json();
      }
    } else {
      waterData = await waterResponse.json();
    }

    // Парсим воздух: daily.temperature_2m_max[0]
    let airTemp = airData?.daily?.temperature_2m_max?.[0] ?? null;

    // Парсим воду:
    // 1) daily sea_surface_temperature_max
    let waterTemp = waterData?.daily?.sea_surface_temperature_max?.[0] ?? null;

    // 2) если это hourly fallback — берём максимум из hourly.sea_surface_temperature
    if (waterTemp == null) {
      const hourly = waterData?.hourly?.sea_surface_temperature;
      if (Array.isArray(hourly) && hourly.length) {
        const numeric = hourly.filter((v) => Number.isFinite(v));
        if (numeric.length) {
          waterTemp = Math.max(...numeric);
        }
      }
    }

    // Фолбэк на климатические нормы, если чего-то нет
    if (airTemp == null || waterTemp == null) {
      const [, month] = date.split('.');
      const monthNum = parseInt(month, 10);
      if (monthNum === 12 || monthNum === 1) {
        airTemp = airTemp ?? 30;
        waterTemp = waterTemp ?? 28;
      } else if (monthNum >= 2 && monthNum <= 4) {
        airTemp = airTemp ?? 32;
        waterTemp = waterTemp ?? 29;
      } else if (monthNum >= 5 && monthNum <= 10) {
        airTemp = airTemp ?? 29;
        waterTemp = waterTemp ?? 29;
      } else {
        airTemp = airTemp ?? 30;
        waterTemp = waterTemp ?? 28;
      }
    }

    const result = {
      airTemp: airTemp != null ? Math.round(airTemp) : null,
      waterTemp: waterTemp != null ? Math.round(waterTemp) : null,
    };

    weatherCache[apiDate] = result;
    return result;
  } catch (error) {
    console.error('✗ Ошибка получения погоды:', error);
    return { airTemp: 30, waterTemp: 28 };
  }
}

function assertIsoDate(d) {
  // строго YYYY-MM-DD, без пробелов и лишних символов
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) throw new Error(`Bad ISO date: ${d}`);
  const [y, m, day] = d.split('-').map(Number);
  // проверяем валидность календарной даты
  const iso = new Date(Date.UTC(y, m - 1, day)).toISOString().slice(0, 10);
  if (iso !== d) throw new Error(`Bad calendar date: ${d}`);
}

function buildMarineUrl(lat, lon, isoDate, mode = 'daily') {
  assertIsoDate(isoDate);
  const u = new URL('https://marine-api.open-meteo.com/v1/marine');
  u.searchParams.set('latitude', String(lat));
  u.searchParams.set('longitude', String(lon));
  if (mode === 'daily') {
    // daily-агрегат SST: в некоторых конфигурациях доступен как sea_surface_temperature_max
    u.searchParams.set('daily', 'sea_surface_temperature_max');
  } else if (mode === 'hourly') {
    // hourly SST, берём максимум вручную
    u.searchParams.set('hourly', 'sea_surface_temperature');
  } else {
    throw new Error(`Unknown marine mode: ${mode}`);
  }
  u.searchParams.set('timezone', 'Asia/Bangkok');
  u.searchParams.set('start_date', isoDate);
  u.searchParams.set('end_date', isoDate);
  return u.toString();
}

function buildAirUrl(lat, lon, isoDate) {
  assertIsoDate(isoDate);
  const u = new URL('https://api.open-meteo.com/v1/forecast');
  u.searchParams.set('latitude', String(lat));
  u.searchParams.set('longitude', String(lon));
  u.searchParams.set('daily', 'temperature_2m_max');
  u.searchParams.set('timezone', 'Asia/Bangkok');
  u.searchParams.set('start_date', isoDate);
  u.searchParams.set('end_date', isoDate);
  return u.toString();
}

// ИСПРАВЛЕНИЕ: Замена точек на дефисы для совместимости с Firebase
function sanitizeKeyForFirebase(key) {
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

async function initApp() {
    initFirebase();
    
    // ✅ ДОБАВЛЕНО: Загрузка динамических мест из Firebase
    await loadDynamicGeoData();
    
    // ✅ ДОБАВЛЕНО: Рендеринг динамических мест при загрузке
    renderDynamicPlaces();
    
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

    // ИСПРАВЛЕНО: инициализируем только те кнопки, которые ещё не были инициализированы
    document.querySelectorAll('.geo-item-btn').forEach(btn => {
        if (!btn.geoInit) {
            initGeoItemButton(btn);
        }
    });
    
    addAddPlaceButton(); // Добавляем кнопку "Добавить место"
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
    const distance = parseFloat(getDistance(userCoords, allGeoData[id].coords));
    button.dataset.distance = distance;

    // Добавляем тег расстояния
    let distSpan = button.querySelector('.distance-tag');
    if (!distSpan) {
      distSpan = document.createElement('span');
      distSpan.className = 'distance-tag';
      button.appendChild(distSpan);
    }
    distSpan.textContent = distance.toFixed(1) + ' км';

    // Добавляем блок транспорта
    let transportDiv = button.querySelector('.transport-info');
    if (!transportDiv) {
      transportDiv = document.createElement('div');
      transportDiv.className = 'transport-info';
      button.appendChild(transportDiv);
    }

    const transport = calculateTransport(distance);
    transportDiv.innerHTML = `
      <div class="transport-option">
        <span class="transport-icon">🚕</span>
        <span>${transport.taxi.time} мин · ${transport.taxi.price}฿</span>
      </div>
      <div class="transport-option">
        <span class="transport-icon">🛺</span>
        <span>${transport.songthaew.time} мин · ${transport.songthaew.price}฿</span>
      </div>
    `;
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

    // Проверка и защита от повторной инициализации
    if (button.geoInit) {
        console.warn('Кнопка уже инициализирована, пропуск:', id);
        return;
    }
    button.geoInit = true;

    // Добавляем кнопку рейтинга, если её ещё нет
    if (!button.querySelector('.geo-item-rating-button')) {
        const ratingButton = document.createElement('button');
        ratingButton.className = 'geo-item-rating-button';
        ratingButton.innerHTML = '<span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span><span class="star">★</span>';
        
        // 🔴 УЛУЧШЕНО: обработчик клика для мобильных
        const openRating = (e) => {
            e.stopPropagation();
            e.preventDefault();
            openRatingModal(id);
        };
        
        ratingButton.onclick = openRating;
        
        // 🔴 УЛУЧШЕНО: полная изоляция touch-событий
        ratingButton.addEventListener('touchstart', (e) => {
            e.stopPropagation();
        }, { passive: false });
        
        ratingButton.addEventListener('touchend', (e) => {
            e.stopPropagation();
            e.preventDefault();
            openRatingModal(id);
        }, { passive: false });
        
        ratingButton.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        
        ratingButton.addEventListener('mousemove', (e) => {
            e.stopPropagation();
        });
        
        ratingButton.addEventListener('touchmove', (e) => {
            e.stopPropagation();
        }, { passive: false });
        
        button.appendChild(ratingButton);
        loadGeoRatingForButton(id, ratingButton);
    }

    // Логика long-press и клика для основной карточки
    let pressTimer = null;
    let startX = 0, startY = 0;
    let hasMoved = false;

    const handleStart = (e) => {
        // 🔴 УСИЛЕНО: проверяем тап именно на кнопке рейтинга
        if (e.target.closest('.geo-item-rating-button')) {
            return;
        }
        
        hasMoved = false;
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

        pressTimer = setTimeout(() => {
            if (!hasMoved) {
                if (!userCoords) {
                    alert('Сначала определите своё местоположение.');
                    return;
                }

                // 🔥 ИСПРАВЛЕНО: безопасное получение координат
                const place = allGeoData[id];
                if (!place || !place.coords) {
                    console.error('Место не найдено или нет координат:', id);
                    alert('Ошибка: координаты места не найдены');
                    return;
                }

                // Преобразуем координаты в массив независимо от формата
                const destCoords = Array.isArray(place.coords)
                    ? place.coords
                    : [place.coords[0], place.coords[1]];

                const destination = destCoords.join(',');
                const origin = userCoords.join(',');

                console.log('Построение маршрута:', { origin, destination, place: place.name });
                window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, '_blank');
                pressTimer = null;
            }
        }, 800);
    };

    const handleMove = (e) => {
        if (!pressTimer) return;

        const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        const diffX = Math.abs(currentX - startX);
        const diffY = Math.abs(currentY - startY);

        if (diffX > 10 || diffY > 10) {
            hasMoved = true;
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    };

    const handleEnd = (e) => {
        // 🔴 УСИЛЕНО: игнорируем клик на кнопке рейтинга
        if (e.target.closest('.geo-item-rating-button')) {
            clearTimeout(pressTimer);
            pressTimer = null;
            return;
        }

        if (pressTimer && !hasMoved) {
            clearTimeout(pressTimer);

            if (allGeoData[id] && allGeoData[id].type === 'playground') {
                showPlaygroundModal(allGeoData[id]);
            } else if (allGeoData[id] && allGeoData[id].type === 'park') {
                showParkModal(allGeoData[id]);
            } else {
                window.open(allGeoData[id].link, '_blank');
            }

            pressTimer = null;
            hasMoved = false;
        }
    };

    const handleCancel = () => {
        clearTimeout(pressTimer);
        pressTimer = null;
        hasMoved = false;
    };

    button.addEventListener('mousedown', handleStart);
    button.addEventListener('mousemove', handleMove);
    button.addEventListener('mouseup', handleEnd);
    button.addEventListener('mouseleave', handleCancel);
    button.addEventListener('touchstart', handleStart, { passive: true });
    button.addEventListener('touchmove', handleMove, { passive: true });
    button.addEventListener('touchend', handleEnd);
    button.addEventListener('touchcancel', handleCancel);

    console.log('✓ Кнопка инициализирована:', id, allGeoData[id]?.name);
}



function showPlaygroundModal(playground) {
    let content = `<h3>${playground.name}</h3>`;

    if (playground.tips) {
        content += `<p>${playground.tips}</p>`;
    }

    // 🔥 ИСПРАВЛЕНО: приоритет userCoords над homeCoords
    const from = userCoords
        ? `${userCoords[0]},${userCoords[1]}`  // от текущего местоположения
        : `${homeCoords.lat},${homeCoords.lng}`;  // от дома, если геолокация не определена

    const to = `${playground.coords[0]},${playground.coords[1]}`;

    content += `<p><a href="https://www.google.com/maps/dir/?api=1&origin=${from}&destination=${to}" target="_blank">📍 Построить маршрут</a></p>`;

    if (userCoords) {
        const distance = getDistance(userCoords, playground.coords);
        content += `<p>📏 Расстояние: ${distance} км</p>`;
    }

    content += `<p><a href="${playground.link}" target="_blank">🗺️ Открыть в Google Maps</a></p>`;

    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalOverlay').classList.add('active');
}


function showParkModal(park) {
    let content = `<h3>${park.name}</h3>`;

    if (park.tips) {
        content += `<p>${park.tips}</p>`;
    }

    // 🔥 ИСПРАВЛЕНО: приоритет userCoords над homeCoords
    const from = userCoords
        ? `${userCoords[0]},${userCoords[1]}`  // от текущего местоположения
        : `${homeCoords.lat},${homeCoords.lng}`;  // от дома, если геолокация не определена

    const to = `${park.coords[0]},${park.coords[1]}`;

    content += `<p><a href="https://www.google.com/maps/dir/?api=1&origin=${from}&destination=${to}" target="_blank">📍 Построить маршрут</a></p>`;

    if (userCoords) {
        const distance = getDistance(userCoords, park.coords);
        content += `<p>📏 Расстояние: ${distance} км</p>`;
    }

    content += `<p><a href="${park.link}" target="_blank">🗺️ Открыть в Google Maps</a></p>`;
    
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
        date: '16.01.2026',
        coords: { lat: 12.94832322, lng: 100.88976288 },
        tips: 'Интерактивный музей с 3D-картинами для впечатляющих фотосессий. Более 100 произведений искусства в 10 тематических зонах: подводный мир, дикие животные, классическое искусство. Идеально для Instagram! Время посещения: 1-2 часа. Работает 9:00-21:00. Берите камеру с хорошим объективом - здесь все создано для фотографий. Есть аудиогид на разных языках.',
        type: 'sight'
    },
    {
        name: 'Зоопарк Кхао Кхео',
        date: '18.01.2026',
        coords: { lat: 13.21500644, lng: 101.05700099 },
        tips: 'Крупнейший открытый зоопарк Таиланда на 800 гектарах. Более 300 видов животных в естественной среде. Сафари на автомобиле, пешие маршруты, ночное сафари. Особенность: белые тигры, слоны, жирафы. Работает 8:00-18:00. Расстояние: 45 км от Паттайи. Планируйте 4-5 часов. Есть рестораны и зоны отдыха. Возьмите головные уборы и воду.',
        type: 'sight'
    },
    {
        name: 'Плавучий рынок',
        date: '20.01.2026',
        coords: { lat: 12.86799376, lng: 100.90469404 },
        tips: 'Аутентичный плавучий рынок с торговлей на лодках по каналам. Свежие тропические фрукты, морепродукты, сувениры. Лучшее время: 7:00-11:00, когда наиболее активна торговля. Катание на длинных лодках по каналам, кормление рыб и варанов. Обязательно попробуйте: тайские сладости, кокосовое мороженое. Торгуйтесь! Возьмите мелкие деньги и водостойкую сумку.',
        type: 'sight'
    },
    {
        name: 'Ко Лан',
        date: '22.01.2026',
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
    const transferDates = ['09.01.2026', '15.01.2026', '23.01.2026'];
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

    // ✅ ДОБАВЛЕНО: Специальная ссылка на маршрут для Аюттайи
    if (place.name === 'Аюттайя') {
        content += `<p><a href="https://surl.li/mniuio" target="_blank">🗺️ Маршрут</a></p>`;
    }

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
let currentRatingGeoId = null;
function initGeoItemButton(button) {
    const id = parseInt(button.dataset.id, 10);
    if (isNaN(id)) return;

    // Добавляем кнопку со звёздами как последний элемент блока
    if (!button.querySelector('.geo-item-rating-button')) {
        const ratingButton = document.createElement('button');
        ratingButton.className = 'geo-item-rating-button';
        ratingButton.innerHTML = '<span class="star">☆</span><span class="star">☆</span><span class="star">☆</span><span class="star">☆</span><span class="star">☆</span>';
        ratingButton.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            openRatingModal(id);
        };
        // Блокируем обработчики нажатия на кнопке
        ratingButton.addEventListener('mousedown', (e) => e.stopPropagation());
        ratingButton.addEventListener('touchstart', (e) => e.stopPropagation());
        ratingButton.addEventListener('mousemove', (e) => e.stopPropagation());
        ratingButton.addEventListener('touchmove', (e) => e.stopPropagation());
        button.appendChild(ratingButton);
        loadGeoRatingForButton(id, ratingButton);
    }

    let pressTimer = null;
    let startX = 0, startY = 0;
    let hasMoved = false;

    const handleStart = (e) => {
        // Проверяем, что клик не по кнопке со звёздами
        if (e.target.closest('.geo-item-rating-button')) {
            return;
        }

        hasMoved = false;
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        pressTimer = setTimeout(() => {
            if (!hasMoved) {
                if (!userCoords) {
                    alert('Сначала определите местоположение');
                    return;
                }
                const destination = allGeoData[id].coords.join(',');
                const origin = userCoords.join(',');
                window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, '_blank');
            }
            pressTimer = null;
        }, 800);
    };

    const handleMove = (e) => {
        if (!pressTimer) return;
        
        const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        const diffX = Math.abs(currentX - startX);
        const diffY = Math.abs(currentY - startY);

        // Если палец/мышь сдвинулись больше чем на 10px - это движение, не клик
        if (diffX > 10 || diffY > 10) {
            hasMoved = true;
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    };

    const handleEnd = (e) => {
        // Проверяем, что клик не по кнопке со звёздами
        if (e.target.closest('.geo-item-rating-button')) {
            clearTimeout(pressTimer);
            pressTimer = null;
            return;
        }
        
        if (pressTimer && !hasMoved) {
            clearTimeout(pressTimer);
            // Обычный клик
            if (allGeoData[id] && allGeoData[id].type === 'playground') {
                showPlaygroundModal(allGeoData[id]);
            } else if (allGeoData[id] && allGeoData[id].type === 'park') {
                showParkModal(allGeoData[id]);
            } else {
                window.open(allGeoData[id].link, '_blank');
            }
        }
        pressTimer = null;
        hasMoved = false;
    };

    const handleCancel = () => {
        clearTimeout(pressTimer);
        pressTimer = null;
        hasMoved = false;
    };

    button.addEventListener('mousedown', handleStart);
    button.addEventListener('mousemove', handleMove);
    button.addEventListener('mouseup', handleEnd);
    button.addEventListener('mouseleave', handleCancel);
    button.addEventListener('touchstart', handleStart, { passive: true });
    button.addEventListener('touchmove', handleMove, { passive: true });
    button.addEventListener('touchend', handleEnd);
    button.addEventListener('touchcancel', handleCancel);
}

function openRatingModal(geoId) {
    currentRatingGeoId = geoId;
    const modal = document.getElementById('ratingModal');
    const placeName = document.getElementById('ratingPlaceName');
    const starsContainer = document.getElementById('starsContainer');
    const commentField = document.getElementById('ratingComment');
    const photoInput = document.getElementById('photoInput');
    const addPhotoBtn = document.getElementById('addPhotoBtn');

    if (!modal || !placeName || !starsContainer || !commentField) return;

    placeName.textContent = allGeoData[geoId]?.name || `Место #${geoId}`;

    // Загружаем сохранённые данные (рейтинг + комментарий + фото)
    loadRatingToModal(geoId, starsContainer, commentField);

    // Обработчики звёзд
    starsContainer.querySelectorAll('.star').forEach(star => {
        star.onclick = () => {
            const value = parseInt(star.dataset.value);
            setRating(geoId, value, starsContainer);
        };
    });

    // Удаляем старые обработчики через клонирование
    const newCommentField = commentField.cloneNode(true);
    commentField.parentNode.replaceChild(newCommentField, commentField);

    // Заново загружаем данные в новое поле
    loadRatingToModal(geoId, starsContainer, newCommentField);

    // Счётчик символов
    const charCount = document.getElementById('commentCharCount');
    newCommentField.addEventListener('input', () => {
        if (charCount) {
            charCount.textContent = newCommentField.value.length;
        }
    });

    // Автосохранение комментария
    let saveTimeout;
    newCommentField.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveComment(geoId, newCommentField.value.trim());
        }, 1000);
    });

    // Обработчик кнопки "Добавить фото"
    if (addPhotoBtn && photoInput) {
        // Удаляем старые обработчики
        const newPhotoBtn = addPhotoBtn.cloneNode(true);
        addPhotoBtn.parentNode.replaceChild(newPhotoBtn, addPhotoBtn);

        const newPhotoInput = photoInput.cloneNode(true);
        photoInput.parentNode.replaceChild(newPhotoInput, photoInput);

        newPhotoBtn.onclick = async () => {
    // Показываем выбор: Камера или Галерея
    const choice = confirm('Нажмите OK для камеры, Отмена для выбора из галереи');

    if (choice) {
        // Открываем камеру через MediaDevices API
        await openNativeCamera(geoId);
    } else {
        // Открываем галерею (стандартный input)
        newPhotoInput.click();
    }
};


        newPhotoInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Проверка размера (макс 5 МБ)
            if (file.size > 5 * 1024 * 1024) {
                alert('Файл слишком большой. Максимум 5 МБ');
                return;
            }

            // Загружаем фото
            const photoUrl = await uploadPhoto(geoId, file);

            if (photoUrl) {
                await savePhotoUrl(geoId, photoUrl);

                // Перезагружаем фото в модалке
                const key = `geo_rating_${geoId}`;
                const saved = await getStorageItem(key);

                if (saved) {
                    try {
                        const data = JSON.parse(saved);
                        renderPhotos(geoId, data.photos || []);
                    } catch (e) {
                        renderPhotos(geoId, []);
                    }
                }
            }

            // Очищаем input
            newPhotoInput.value = '';
        };
    }

    modal.classList.add('active');
}

function closeRatingModal() {
    const modal = document.getElementById('ratingModal');
    if (modal) modal.classList.remove('active');
    currentRatingGeoId = null;
}

async function setRating(geoId, value, starsContainer) {
    const key = `geo_rating_${geoId}`;
    
    // Загружаем текущий комментарий, чтобы не потерять при изменении звёзд
    const existing = await getStorageItem(key);
    let data = { rating: value, comment: '' };
    
    if (existing) {
        try {
            const parsed = JSON.parse(existing);
            data.comment = parsed.comment || '';
        } catch (e) {
            // Старый формат (просто число) — игнорируем
        }
    }
    
    data.rating = value;
    await setStorageItem(key, JSON.stringify(data));
    
    updateStarsDisplay(starsContainer, value);
    
    // Обновляем звёзды на самой карточке
    const button = document.querySelector(`.geo-item-btn[data-id="${geoId}"]`);
    if (button) {
        const ratingButton = button.querySelector('.geo-item-rating-button');
        if (ratingButton) {
            const stars = ratingButton.querySelectorAll('.star');
            stars.forEach((star, index) => {
                if (index < value) {
                    star.classList.add('filled');
                    star.textContent = '★';
                } else {
                    star.classList.remove('filled');
                    star.textContent = '☆';
                }
            });
        }
    }
}

async function saveComment(geoId, commentText) {
    const key = `geo_rating_${geoId}`;
    
    // Загружаем текущий рейтинг
    const existing = await getStorageItem(key);
    let data = { rating: 0, comment: commentText };
    
    if (existing) {
        try {
            const parsed = JSON.parse(existing);
            data.rating = parsed.rating || 0;
        } catch (e) {
            // Старый формат — оставляем rating = 0
        }
    }
    
    data.comment = commentText;
    await setStorageItem(key, JSON.stringify(data));
    
    console.log('💾 Комментарий сохранён для места', geoId);
}

async function resetRating() {
    if (currentRatingGeoId === null) return;
    
    if (!confirm('Удалить рейтинг, комментарий и все фото?')) return;

    const key = `geo_rating_${currentRatingGeoId}`;
    await removeStorageItem(key);

    const starsContainer = document.getElementById('starsContainer');
    const commentField = document.getElementById('ratingComment');

    updateStarsDisplay(starsContainer, 0);

    if (commentField) {
        commentField.value = '';
        const charCount = document.getElementById('commentCharCount');
        if (charCount) charCount.textContent = '0';
    }

    renderPhotos(currentRatingGeoId, []);

    // Обновляем звёзды на карточке
    const button = document.querySelector(`.geo-item-btn[data-id="${currentRatingGeoId}"]`);
    if (button) {
        const ratingButton = button.querySelector('.geo-item-rating-button');
        if (ratingButton) {
            const stars = ratingButton.querySelectorAll('.star');
            stars.forEach(star => {
                star.classList.remove('filled');
                star.textContent = '☆';
            });
        }
    }

    console.log('🗑️ Рейтинг, комментарий и фото сброшены');
}


// ===== РАБОТА С ФОТОГРАФИЯМИ ЧЕРЕЗ ImgBB =====
const IMGBB_API_KEY = '37d3e8bd689bc6706df19e1879ceed45';

async function uploadPhoto(geoId, file) {
    const progressEl = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBarFill');
    const progressText = document.getElementById('progressText');

    progressEl.style.display = 'block';
    progressBar.style.width = '30%';
    progressText.textContent = 'Подготовка...';

    try {
        // Конвертируем файл в base64
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        const base64Image = await base64Promise;

        progressBar.style.width = '50%';
        progressText.textContent = 'Загрузка...';

        // Загружаем на ImgBB
        const formData = new FormData();
        formData.append('image', base64Image);
        formData.append('name', `geo_${geoId}_${Date.now()}`);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error?.message || 'Неизвестная ошибка');
        }

        console.log('📸 Полный ответ ImgBB:', JSON.stringify(data, null, 2));

        // Используем прямую ссылку от ImgBB
        const photoUrl = data.data.url || data.data.display_url || data.data.image?.url;

        if (!photoUrl) {
            throw new Error('Не удалось получить URL фото из ответа ImgBB');
        }

        console.log('📸 URL фото:', photoUrl);
        console.log('📸 Размер файла:', data.data.size, 'байт');
        console.log('📸 Разрешение:', data.data.width, 'x', data.data.height);

        progressBar.style.width = '100%';
        progressText.textContent = 'Готово!';

        setTimeout(() => {
            progressEl.style.display = 'none';
        }, 1000);

        console.log('✅ Фото загружено:', photoUrl);
        return photoUrl;

    } catch (error) {
        console.error('❌ Ошибка загрузки фото:', error);
        alert('Не удалось загрузить фото: ' + error.message);
        progressEl.style.display = 'none';
        return null;
    }
}



// Прямой доступ к камере через MediaDevices API
// Прямой доступ к камере через MediaDevices API
async function openNativeCamera(geoId) {
    try {
        // Запрашиваем доступ к камере (задняя камера)
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        // Создаём полноэкранный интерфейс камеры
        const cameraOverlay = document.createElement('div');
        cameraOverlay.id = 'cameraOverlay';
        cameraOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 10000;
            display: flex;
            flex-direction: column;
        `;

        const video = document.createElement('video');
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true; // ВАЖНО для автовоспроизведения
        video.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';

        const controls = document.createElement('div');
        controls.style.cssText = `
            position: absolute;
            bottom: 30px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: center;
            gap: 20px;
            padding: 0 20px;
        `;

        const captureBtn = document.createElement('button');
        captureBtn.innerHTML = '📷';
        captureBtn.style.cssText = `
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: white;
            border: 4px solid #4f46e5;
            font-size: 32px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        const cancelBtn = document.createElement('button');
        cancelBtn.innerHTML = '✕';
        cancelBtn.style.cssText = `
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #ef4444;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        controls.appendChild(cancelBtn);
        controls.appendChild(captureBtn);
        cameraOverlay.appendChild(video);
        cameraOverlay.appendChild(controls);
        document.body.appendChild(cameraOverlay);

        // КРИТИЧНО: сначала добавляем в DOM, потом присваиваем srcObject
        video.srcObject = stream;

        // Ждём загрузки видео
        await new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
                video.play().then(resolve).catch(reject);
            };

            // Таймаут на случай, если видео не загрузится
            setTimeout(() => reject(new Error('Timeout')), 5000);
        });

        console.log('✅ Камера инициализирована');

        // Функция закрытия камеры
        const closeCamera = () => {
            stream.getTracks().forEach(track => track.stop());
            if (document.body.contains(cameraOverlay)) {
                document.body.removeChild(cameraOverlay);
            }
        };

        // Обработчик отмены
        cancelBtn.onclick = closeCamera;

        // Обработчик снимка
        captureBtn.onclick = async () => {
            // Проверяем, что видео воспроизводится
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                alert('Камера ещё не готова, подождите секунду');
                return;
            }

            // Создаём canvas для захвата кадра
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            // Конвертируем в blob
            canvas.toBlob(async (blob) => {
                closeCamera();

                if (!blob) {
                    alert('Ошибка создания фото');
                    return;
                }

                // Создаём файл
                const file = new File([blob], `camera_${Date.now()}.jpg`, {
                    type: 'image/jpeg'
                });

                // Загружаем через существующую функцию
                const photoUrl = await uploadPhoto(geoId, file);

                if (photoUrl) {
                    await savePhotoUrl(geoId, photoUrl);

                    // Перезагружаем фото в модалке
                    const key = `geo_rating_${geoId}`;
                    const saved = await getStorageItem(key);

                    if (saved) {
                        try {
                            const data = JSON.parse(saved);
                            renderPhotos(geoId, data.photos || []);
                        } catch (e) {
                            renderPhotos(geoId, []);
                        }
                    }
                }
            }, 'image/jpeg', 0.85);
        };

    } catch (error) {
        console.error('Ошибка доступа к камере:', error);

        if (error.name === 'NotAllowedError') {
            alert('Доступ к камере запрещён. Разрешите доступ в настройках Telegram.');
        } else if (error.name === 'NotFoundError') {
            alert('Камера не найдена на устройстве.');
        } else if (error.message === 'Timeout') {
            alert('Камера не отвечает. Попробуйте ещё раз или используйте галерею.');
        } else {
            alert('Не удалось открыть камеру. Используйте кнопку "Галерея"');
        }
    }
}


// Сохранение URL фото в данных места
async function savePhotoUrl(geoId, photoUrl) {
    const key = `geo_rating_${geoId}`;
    const existing = await getStorageItem(key);

    let data = { rating: 0, comment: '', photos: [] };

    if (existing) {
        try {
            data = JSON.parse(existing);
            if (!data.photos) data.photos = [];
        } catch (e) {
            // Старый формат
        }
    }

    data.photos.push(photoUrl);
    await setStorageItem(key, JSON.stringify(data));

    console.log('💾 URL фото сохранён');
}

// Удаление фото (только из списка)
async function deletePhoto(geoId, photoUrl) {
    const key = `geo_rating_${geoId}`;
    const existing = await getStorageItem(key);

    if (!existing) return;

    try {
        const data = JSON.parse(existing);
        if (data.photos) {
            data.photos = data.photos.filter(url => url !== photoUrl);
            await setStorageItem(key, JSON.stringify(data));
            console.log('🗑️ Фото удалено из списка');
        }
    } catch (e) {
        console.error('Ошибка удаления фото:', e);
    }
}

function renderPhotos(geoId, photos) {
    const container = document.getElementById('photosContainer');
    if (!container) return;

    container.innerHTML = '';

    if (!photos || photos.length === 0) {
        container.innerHTML = '<div style="color: #9ca3af; font-size: 13px;">Нет фотографий</div>';
        return;
    }

    console.log('📷 Рендерим', photos.length, 'фото');

    photos.forEach((photoUrl, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.innerHTML = `
            <img src="${photoUrl}" alt="Фото ${index + 1}">
            <button class="delete-photo" onclick="event.stopPropagation(); handleDeletePhoto('${geoId}', '${photoUrl}')">×</button>
        `;

        photoItem.querySelector('img').onclick = () => window.open(photoUrl, '_blank');
        container.appendChild(photoItem);
    });
}



// Обработчик удаления фото
async function handleDeletePhoto(geoId, photoUrl) {
    if (!confirm('Удалить это фото?')) return;

    await deletePhoto(geoId, photoUrl);

    // Перезагружаем фото в модалке
    const key = `geo_rating_${geoId}`;
    const saved = await getStorageItem(key);

    if (saved) {
        try {
            const data = JSON.parse(saved);
            renderPhotos(geoId, data.photos || []);
        } catch (e) {
            renderPhotos(geoId, []);
        }
    }
}

function updateStarsDisplay(container, value) {
    const stars = container.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < value) {
            star.classList.add('filled');
            star.textContent = '★';
        } else {
            star.classList.remove('filled');
            star.textContent = '☆';
        }
    });
}

async function loadRatingToModal(geoId, starsContainer, commentField) {
    const key = `geo_rating_${geoId}`;
    const saved = await getStorageItem(key);
    
    let rating = 0;
    let comment = '';
    let photos = [];

    if (saved) {
        try {
            const data = JSON.parse(saved);
            rating = data.rating || 0;
            comment = data.comment || '';
            photos = data.photos || [];
        } catch (e) {
            rating = parseInt(saved) || 0;
        }
    }

    updateStarsDisplay(starsContainer, rating);

    if (commentField) {
        commentField.value = comment;
        const charCount = document.getElementById('commentCharCount');
        if (charCount) {
            charCount.textContent = comment.length;
        }
    }

    // ОБЯЗАТЕЛЬНО: рендерим фото
    renderPhotos(geoId, photos);

    console.log('📷 Загружено фото:', photos.length);
}

async function loadGeoRating(geoId, ratingDiv) {
    const key = `geo_rating_${geoId}`;
    const saved = await getStorageItem(key);
    
    let rating = 0;
    
    if (saved) {
        try {
            // Новый формат: {rating: 3, comment: "..."}
            const data = JSON.parse(saved);
            rating = data.rating || 0;
        } catch (e) {
            // Старый формат (просто число "3")
            rating = parseInt(saved) || 0;
        }
    }
    
    updateStarsDisplay(ratingDiv, rating);
}

async function loadGeoRatingForButton(geoId, ratingButton) {
    const key = `geo_rating_${geoId}`;
    const saved = await getStorageItem(key);
    
    let rating = 0;
    
    if (saved) {
        try {
            // Новый формат: {rating: 3, comment: "..."}
            const data = JSON.parse(saved);
            rating = data.rating || 0;
        } catch (e) {
            // Старый формат (просто число "3")
            rating = parseInt(saved) || 0;
        }
    }
    
    const stars = ratingButton.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('filled');
            star.textContent = '★';
        } else {
            star.classList.remove('filled');
            star.textContent = '☆';
        }
    });
}


// Переменная для хранения динамических мест
let dynamicGeoData = [];

// Инициализация: загрузка динамических данных из Firebase
// Открыть модальное окно добавления места
function openAddPlaceModal() {
    const modal = document.getElementById('addPlaceModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('placeDataInput').value = '';
    }
}

// Закрыть модальное окно
function closeAddPlaceModal() {
    const modal = document.getElementById('addPlaceModal');
    if (modal) modal.classList.remove('active');
}
// Словарь перевода русских названий блоков и подблоков в английские ключи
const russianToEnglishMap = {
    'кафе': 'cafe',
    'парки': 'park',
    'площадки': 'playground',
    'наклуа': 'naklua',
    'пратамнак': 'pratamnak',
    'джомтьен': 'jomtien'
};

function translateRussianToKey(text) {
    const lowerText = text.toLowerCase().trim();
    if (russianToEnglishMap[lowerText]) {
        return russianToEnglishMap[lowerText];
    }
    return text.trim();
}

async function loadDynamicGeoData() {
    const saved = await getStorageItem('dynamic_geo_data');
    if (saved) {
        try {
            dynamicGeoData = JSON.parse(saved);
            console.log('✓ Загружено динамических мест:', dynamicGeoData.length);

            // 🔥 ДОБАВЛЕНО: проверка и нормализация координат
            dynamicGeoData.forEach((place, index) => {
                if (place.coords && !Array.isArray(place.coords)) {
                    console.warn(`⚠️ Место "${place.name}" (ID ${index}): координаты не массив, конвертирую...`);
                    // Преобразуем объект {0: lat, 1: lng} в массив [lat, lng]
                    place.coords = [place.coords[0], place.coords[1]];
                    console.log(`✓ Исправлено:`, place.coords);
                }
            });

            // Сохраняем исправленные данные обратно
            if (dynamicGeoData.some(p => p.coords && !Array.isArray(p.coords))) {
                await setStorageItem('dynamic_geo_data', JSON.stringify(dynamicGeoData));
                console.log('✓ Координаты нормализованы и сохранены');
            }

        } catch (e) {
            console.error('Ошибка парсинга:', e);
            dynamicGeoData = [];
        }
    }
}


// Добавить новое место
async function addNewPlace() {
    const input = document.getElementById('placeDataInput');
    const data = input.value.trim();
    
    if (!data) {
        alert('Пожалуйста, введите данные');
        return;
    }

    const parts = data.split(',').map(s => s.trim());
    
    if (parts.length < 7) {
        alert('Недостаточно данных. Формат:\nБлок, Подблок, Название, Описание, Ссылка, Широта, Долгота');
        return;
    }

    const [blockType, subBlock, name, description, link, lat, lon] = parts;
    
    // Переводим блок и подблок из русского в английский
    const translatedBlockType = translateRussianToKey(blockType);
    const translatedSubBlock = subBlock ? translateRussianToKey(subBlock) : null;
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (isNaN(latitude) || isNaN(longitude)) {
        alert('Неверный формат координат');
        return;
    }

    const newPlace = {
        id: Date.now(),
        type: translatedBlockType,
        subBlock: translatedSubBlock,
        name: name,
        description: description || '',
        link: link,
        coords: [latitude, longitude]
    };

    // Добавляем в массив динамических данных
    dynamicGeoData.push(newPlace);
    await setStorageItem('dynamic_geo_data', JSON.stringify(dynamicGeoData));
    
    console.log('✓ Добавлено новое место:', newPlace);
    
    // Добавляем в общий массив для немедленного рендеринга
    allGeoData.push(newPlace);
    
    // Создаём кнопку и добавляем в нужный контейнер
    const newId = allGeoData.length - 1;
    let container = null;
    
    // Определяем контейнер
    if (translatedBlockType === 'cafe' && translatedSubBlock) {
        container = document.querySelector(`.cafe-sub-block[data-subblock-name="${translatedSubBlock}"]`);
    } else if (translatedBlockType === 'temple') {
        container = document.querySelector('.geo-temples .geo-items-container');
    } else if (translatedBlockType === 'playground') {
        container = document.querySelector('.geo-playgrounds .geo-items-container');
    } else if (translatedBlockType === 'park') {
        container = document.querySelector('.geo-parks .geo-items-container');
    }
    
    if (!container) {
        alert('❌ Контейнер не найден для типа: ' + blockType);
        console.error('Не найден контейнер для:', translatedBlockType, translatedSubBlock);
        return;
    }
    
    // Создаём кнопку
    const button = document.createElement('button');
    button.className = 'geo-item-btn';
    button.dataset.type = translatedBlockType;
    button.dataset.id = newId;
    
    // Формируем HTML
    if (translatedBlockType === 'cafe') {
        button.innerHTML = `
            <div class="cafe-line">
                <span class="cafe-rating">⭐</span>
                <strong>${name}</strong>
            </div>
            <span class="cafe-description">- ${description}</span>
        `;
    } else {
        const icon = getIconForType(translatedBlockType);
        button.innerHTML = `<span class="icon">${icon}</span><strong>${name}</strong>`;
    }
    
    // Добавляем в контейнер перед кнопкой "Добавить место"
    const addBtn = container.querySelector('.add-place-btn');
    if (addBtn) {
        container.insertBefore(button, addBtn);
    } else {
        container.appendChild(button);
    }
    
    if (!button.geoInit) {
      initGeoItemButton(button);
    }
    
    closeAddPlaceModal();
    alert('✅ Место успешно добавлено!');
    input.value = ''; // Очищаем поле
}

// Рендеринг динамических мест при загрузке страницы
function renderDynamicPlaces() {
    if (dynamicGeoData.length === 0) {
        console.log('Нет динамических мест для отображения');
        return;
    }
    
    console.log('Отображение динамических мест:', dynamicGeoData.length);
    
    dynamicGeoData.forEach((place, index) => {
        allGeoData.push(place);
        const newId = allGeoData.length - 1;

        let container = null;
        if (place.type === 'cafe' && place.subBlock) {
            container = document.querySelector(`.cafe-sub-block[data-subblock-name="${place.subBlock}"]`);
        } else if (place.type === 'temple') {
            container = document.querySelector('.geo-temples .geo-items-container');
        } else if (place.type === 'playground') {
            container = document.querySelector('.geo-playgrounds .geo-items-container');
        } else if (place.type === 'park') {
            container = document.querySelector('.geo-parks .geo-items-container');
        }

        if (!container) {
            console.error('Контейнер не найден для:', place.type, place.subBlock);
            return;
        }

        const button = document.createElement('button');
        button.className = 'geo-item-btn';
        button.dataset.type = place.type;
        button.dataset.id = newId;

        if (place.type === 'cafe') {
            button.innerHTML = `
                <div class="cafe-line">
                    <span class="cafe-rating"></span>
                    <strong>${place.name}</strong>
                </div>
                <span class="cafe-description">➜ ${place.description}</span>
            `;
        } else {
            const icon = getIconForType(place.type);
            button.innerHTML = `<span class="icon">${icon}</span><strong>${place.name}</strong>`;
        }

        const addBtn = container.querySelector('.add-place-btn');
        if (addBtn) {
            container.insertBefore(button, addBtn);
        } else {
            container.appendChild(button);
        }

        // 🔴 УБРАЛИ ЭТОТ ВЫЗОВ: initGeoItemButton(button);
        // Инициализация будет в initGeoFeatures()
        
        console.log('Добавлено место:', place.name);
    });
}

// Вспомогательная функция для иконок
function getIconForType(type) {
    const icons = {
        'cafe': '☕',
        'temple': '⛩️',
        'playground': '🎠',
        'park': '🌳'
    };
    return icons[type] || '📍';
}

// Обновите функцию renderGeoItems для включения динамических мест
function renderGeoItemsWithDynamic() {
    const container = document.getElementById('geoGrid');
    if (!container) return;

    // Объединяем статические и динамические данные
    const allData = [...allGeoData, ...dynamicGeoData];
    
    // Фильтруем по активному фильтру
    let filtered = allData;
    if (activeGeoFilter && activeGeoFilter !== 'all') {
        filtered = allData.filter(item => {
            if (item.type === 'cafe' && item.subBlock) {
                return item.subBlock === activeGeoFilter;
            }
            return item.type === activeGeoFilter;
        });
    }

    // Генерируем HTML
    let html = '';
    filtered.forEach((item, index) => {
        const btnClass = `geo-item-btn ${item.type === 'cafe' ? 'cafe-item' : ''}`;
        const displayName = item.name || `Место ${index + 1}`;
        
        html += `<button class="${btnClass}" data-id="${item.id || index}">${displayName}</button>`;
    });

    // Добавляем кнопку "Добавить место" в конец
    html += `<button class="geo-item-btn add-place-btn" onclick="openAddPlaceModal()">➕ Добавить место</button>`;

    container.innerHTML = html;

    // Инициализируем обработчики для всех кнопок
    container.querySelectorAll('.geo-item-btn:not(.add-place-btn)').forEach(btn => {
        initGeoItemButton(btn);
    });
}

function addAddPlaceButton() {
    // Находим все контейнеры с кнопками
    const containers = [
        document.querySelector('.geo-parks .geo-items-container') // Добавляем в конец блока Парки
    ];

    containers.forEach(container => {
        if (container && !container.querySelector('.add-place-btn')) {
            const addBtn = document.createElement('button');
            addBtn.className = 'geo-item-btn add-place-btn';
            addBtn.textContent = '➕ Добавить место';
            addBtn.onclick = openAddPlaceModal;
            container.appendChild(addBtn);
        }
    });
}

// ===== ВРЕМЯ СЛЕДУЮЩЕГО ОБНОВЛЕНИЯ КУРСОВ ЦБ РФ =====
// ЦБ РФ публикует официальные курсы один раз в рабочий день;
// считаем, что обновление происходит в 17:31 по Москве (UTC+3).
const MSK_OFFSET_MS = 3 * 60 * 60 * 1000; // Москва постоянно в UTC+3.

function calcNextCbrUpdate(nowMs = Date.now()) {
  const nowUtc = nowMs;

  // Текущее "московское" время (через сдвиг UTC+3)
  const nowMsk = new Date(nowUtc + MSK_OFFSET_MS);

  const year = nowMsk.getUTCFullYear();
  const month = nowMsk.getUTCMonth();     // 0-11
  const day = nowMsk.getUTCDate();        // 1-31
  const dow = nowMsk.getUTCDay();         // 0=вс, 1=пн, ..., 6=сб

  // 17:31 МСК -> 14:31 UTC для текущего дня
  const todayUpdateUtc = Date.UTC(year, month, day, 11, 31, 0);

  const isWorkDay = dow >= 1 && dow <= 5; // пн–пт

  // Если сегодня рабочий день и 17:31 МСК ещё не наступило —
  // следующее обновление считаем сегодня в 17:31 МСК.
  if (isWorkDay && nowUtc < todayUpdateUtc) {
    return todayUpdateUtc;
  }

  // Иначе ищем следующий рабочий день (пропускаем сб/вс) и ставим там 17:31 МСК.
  let nextDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
  while (true) {
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    const d = nextDate.getUTCDay(); // 0–6
    if (d >= 1 && d <= 5) {
      return Date.UTC(
        nextDate.getUTCFullYear(),
        nextDate.getUTCMonth(),
        nextDate.getUTCDate(),
        14,
        31,
        0
      );
    }
  }
}


// ===== КУРСЫ ЦБ РФ: THB / USD / CNY -> RUB =====
// Берём официальный ежедневный курс из https://www.cbr-xml-daily.ru/daily_json.js. [web:226]
// Для каждой валюты:  Value = сколько RUB за Nominal единиц валюты. [web:226]
// Нам нужен курс 1 base -> RUB: rate = Value / Nominal. [web:226]
async function fetchFxRate(base) {
  const now = Date.now();
  const cache = fxCache[base];

  // Кэш по базе с TTL 30 минут (можно увеличить до суток при желании).
  if (cache && (now - cache.ts) < FX_TTL_MS) {
    return {
      rate: cache.rate,
      inverse: cache.inverse,
      updatedAt: cache.updatedAt,
      nextUpdateAt: cache.nextUpdateAt,
    };
  }

  if (!FX_BASES.includes(base)) {
    throw new Error(`Unsupported base ${base}`);
  }
  if (base === 'RUB') {
    throw new Error('Base cannot be RUB');
  }

  const url = 'https://www.cbr-xml-daily.ru/daily_json.js'; // JSON‑обёртка ЦБ. [web:226]
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`CBR ${resp.status}`);
  }

  const data = await resp.json();

  if (!data || !data.Valute) {
    throw new Error('CBR response invalid');
  }

  const node = data.Valute[base];
  if (!node || !Number.isFinite(node.Value) || !Number.isFinite(node.Nominal)) {
    throw new Error(`CBR: no rate for ${base}`);
  }

  // Официальный курс: Value RUB за Nominal единиц валюты. [web:226]
  const rate = node.Value / node.Nominal; // 1 base -> RUB
  const inverse = rate > 0 ? 1 / rate : null; // RUB -> base

  // Время, на которое установлен курс (поле Date) или Timestamp. [web:226]
  // Это дата в часовом поясе МСК; для "когда обновили" достаточно перевести в ms.
  let updatedAt = now;
  if (typeof data.Timestamp === 'string') {
    const ts = Date.parse(data.Timestamp);
    if (!Number.isNaN(ts)) {
      updatedAt = ts;
    }
  } else if (typeof data.Date === 'string') {
    const ts = Date.parse(data.Date);
    if (!Number.isNaN(ts)) {
      updatedAt = ts;
    }
  }

  // Следующее обновление: логически 17:31 МСК ближайшего рабочего дня. [web:231][web:238]
  const nextUpdateAt = calcNextCbrUpdate(now);

  fxCache[base] = {
    rate,
    inverse,
    ts: now,
    updatedAt,
    nextUpdateAt,
  };

  return {
    rate,
    inverse,
    updatedAt,
    nextUpdateAt,
  };
}

// НОВОЕ: форматирование чисел
function fmtAmount(x, digits = 2) {
  if (x == null || !Number.isFinite(x)) return '—';
  return x.toLocaleString('ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function fmtUpdated(ts) {
  if (!ts) return '—';
  const diffMin = Math.floor((Date.now() - ts) / 60000);
  if (diffMin < 1) return 'Обновлено только что';
  if (diffMin === 1) return 'Обновлено 1 мин назад';
  return `Обновлено ${diffMin} мин назад`;
}

// ===== ФОРМАТИРОВАНИЕ ВРЕМЕНИ СЛЕДУЮЩЕГО ОБНОВЛЕНИЯ =====
function fmtNextUpdate(ts) {
  if (!ts) {
    return 'Время следующего обновления неизвестно';
  }

  const now = Date.now();
  const diffMs = ts - now;
  const date = new Date(ts); // автоматически конвертируется в локальный часовой пояс

  const timeStr = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (diffMs <= 0) {
    return `Курс скоро обновится (ориентировочно в ${timeStr})`;
  }

  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) {
    return `Следующее обновление в ${timeStr} (через ${diffMin} мин)`;
  }

  const diffHours = Math.round(diffMin / 60);
  return `Следующее обновление в ${timeStr} (через ~${diffHours} ч)`;
}

// ===== ПЕРЕРАСЧЁТ КУРСА И ОБНОВЛЕНИЕ UI =====
function recalcFxUI() {
  const amountEl = document.getElementById('rateAmount');
  const resultEl = document.getElementById('rateResultValue');
  const detailsEl = document.getElementById('rateDetails');
  const statusEl = document.getElementById('rateStatusText');
  const baseBadge = document.getElementById('rateBaseBadge');

  if (!amountEl || !resultEl || !detailsEl || !statusEl || !baseBadge) {
    return;
  }

  const raw = (amountEl.value || '').toString().replace(',', '.');
  const amount = parseFloat(raw) || 0;

  baseBadge.textContent = fxState.base;

  if (fxState.rate != null) {
    const rub = amount * fxState.rate;
    resultEl.textContent = fmtAmount(rub, 2);

    detailsEl.textContent =
      `1 ${fxState.base} = ${fmtAmount(fxState.rate, 4)} RUB • ` +
      `1 RUB = ${fmtAmount(fxState.inverse, 6)} ${fxState.base}`;

    // Вместо "Обновлено N мин назад" показываем информацию о следующем обновлении
    statusEl.textContent = fmtNextUpdate(fxState.nextUpdateAt);
  } else {
    resultEl.textContent = '—';
    detailsEl.textContent = 'Курс не загружен';
    statusEl.textContent = 'Время следующего обновления неизвестно';
  }
}


// НОВОЕ: инициализация UI конвертера
function initFxUI() {
  const openBtn = document.getElementById('rateFetchBtn');
  const card = document.getElementById('rateCard');
  const chipsWrap = document.getElementById('baseCurrencyChips');
  const amountEl = document.getElementById('rateAmount');
  const refreshBtn = document.getElementById('rateRefreshBtn');

  if (!openBtn || !card) return;

  // Раскрытие/сворачивание карточки
  openBtn.addEventListener('click', async () => {
    card.style.display = (card.style.display === 'none' || card.style.display === '') ? 'block' : 'none';
    if (card.style.display === 'block') {
      await ensureFxLoaded(); // при первом открытии подгрузим курс
      recalcFxUI();
    }
  });

  // Переключение базовой валюты
  if (chipsWrap) {
    chipsWrap.addEventListener('click', async (e) => {
      const btn = e.target.closest('button.chip');
      if (!btn) return;
      const cur = btn.getAttribute('data-cur');
      if (!FX_BASES.includes(cur)) return;

      // визуальное выделение
      chipsWrap.querySelectorAll('button.chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      fxState.base = cur;
      await ensureFxLoaded(true); // под текущую базу
      recalcFxUI();
    });
  }

  // Ввод суммы
  if (amountEl) {
    amountEl.addEventListener('input', () => recalcFxUI());
  }

  // Обновить курс принудительно
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'Обновление…';
      try {
        // очистить кэш конкретной базы и запросить заново
        delete fxCache[fxState.base];
        await ensureFxLoaded(true);
      } catch (e) {
        console.error(e);
      } finally {
        recalcFxUI();
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Обновить курс';
      }
    });
  }
}

// ===== ОБЕСПЕЧИТЬ НАЛИЧИЕ КУРСА ДЛЯ ТЕКУЩЕЙ БАЗЫ =====
async function ensureFxLoaded(force = false) {
  try {
    if (force) {
      delete fxCache[fxState.base];
    }

    const { rate, inverse, updatedAt, nextUpdateAt } = await fetchFxRate(fxState.base);

    fxState.rate = rate;
    fxState.inverse = inverse;
    // Локальное время нашего удачного запроса
    fxState.updatedAt = updatedAt || Date.now();
    // Время следующего обновления по данным провайдера (UTC -> ms)
    fxState.nextUpdateAt = nextUpdateAt || null;
  } catch (err) {
    console.error('FX error:', err);
    // При ошибке не трогаем старый fxState, чтобы не ломать отображение
  }
}


// ИНИЦИАЛИЗАЦИЯ КОНВЕРТЕРА ПОСЛЕ ЗАГРУЗКИ DOM
document.addEventListener('DOMContentLoaded', () => {
  // Если есть ваши существующие init-функции — вызовите их здесь же.
  // Инициализация интерфейса курса валют:
  initFxUI();
});

