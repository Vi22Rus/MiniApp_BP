(function(){
  'use strict';

  function ready(run){
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run, { once:true });
    } else { run(); }
  }

  ready(function init(){
    const $ = (s,r)=> (r||document).querySelector(s);
    const $$ = (s,r)=> (r||document).querySelectorAll(s);
    const on = (e,t,c,o)=>{ if(e) e.addEventListener(t,c,o||false); };

    // Telegram
    const tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;
    if (tg){ tg.expand && tg.expand(); tg.ready && tg.ready(); }

    // DOM refs
    const cardsWrap = $('#cards'), skeletons = $('#skeletons'), emptyState = $('#emptyState');
    const filters = $$('.filter'), tabs = $$('.tab');
    const overlay = $('#overlay'), details = $('#details'), closeBtn = $('#closeBtn');
    const detailsTitle = $('#detailsTitle'), detailsMeta = $('#detailsMeta'), scheduleList = $('#scheduleList');
    const detailsTransport = $('#detailsTransport'), detailsLunch = $('#detailsLunch'), detailsTips = $('#detailsTips');
    const detailsLinks = $('#detailsLinks'), footerVer = $('#appVersionFooter');
    const statusLabel = $('#statusLabel'), statusDays = $('#statusDays'), statusBarFill = $('#statusBarFill');

    if (footerVer) footerVer.textContent = document.body.dataset.version || 'v0.0.0';

    // Время utils
    const add = (hh,mm,addMin)=>{ const d=new Date(2000,0,1,hh,mm,0); d.setMinutes(d.getMinutes()+addMin); return (`0${d.getHours()}`).slice(-2)+':'+(`0${d.getMinutes()}`).slice(-2); };
    const parseTime = (s)=>{ const a=s.split(':'); return {h:+a[0], m:+a[1]}; };
    const parseDMY = (dmy)=>{ const m=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(dmy); if(!m) return null; return new Date(+m[3],+m[2]-1,+m[1],0,0,0,0); };

    // Иконки
    const ICONS = { sea:['🏖️','🌊','🐠','⛱️','🛶'], sight:['🏛️','🗿','🗺️','🏯','📸'] };
    const pickIcon = (type, i)=> (ICONS[type]||['📌'])[ i % (ICONS[type]||['📌']).length ];

    // Активности (конкретика + русские ссылки)
    const activities = [
      { type:'sea',   date:'29.12.2025', title:'Пляж Джомтьен',
        transport:['Сонгтео центр↔Джомтьен: 10–20 бат (маршруты по Beach/Second Rd)'],
        lunch:['The Glass House: морепродукты'],
        tips:['Лучшее время: до 11:00 и после 16:00']
      },
      { type:'sea',   date:'30.12.2025', title:'Пляж Вонгамат',
        transport:['Сонгтео Second Rd → Naklua: 10–20 бат'],
        tips:['Спокойнее у северной части пляжа']
      },
      { type:'sight', date:'31.12.2025', title:'Ват Ян (Wat Yansangwararam)',
        url:'https://ru.wikipedia.org/wiki/%D0%92%D0%B0%D1%82_%D0%AF%D0%BD%D0%B0%D1%81%D0%B0%D0%BD%D0%B3%D0%B2%D0%B0%D1%80%D0%B0%D1%80%D0%B0%D0%BC_%D0%92%D0%BE%D1%80%D0%B0%D0%BC%D0%B0%D1%85%D0%B0%D0%B2%D0%B8%D1%85%D0%B0%D0%BD',
        transport:['Сонгтео: центр→Сукхумвит (10–20 бат), далее такси по месту'],
        tips:['Дресс‑код для храма; вода и головной убор']
      },
      { type:'sea',   date:'01.01.2026', title:'Пляж Паттайя',
        transport:['Сонгтео по Beach Rd: 10–20 бат']
      },
      { type:'sea',   date:'02.01.2026', title:'Остров Ко Лан (снорклинг)',
        url:'https://ru.wikipedia.org/wiki/%D0%9A%D0%BE_%D0%9B%D0%B0%D0%BD',
        transport:['Паром с пирса Бали Хай; далее тук‑тук по острову'],
        tips:['Уточнить расписание парома на день выезда']
      },
      { type:'sight', date:'03.01.2026', title:'Сад Нонг Нуч',
        url:'https://ru.wikipedia.org/wiki/%D0%9D%D0%BE%D0%BD%D0%B3_%D0%9D%D1%83%D1%87',
        transport:['Такси/Bolt/Grab по приложению (цена по приложению)'],
        tips:['Большая территория; детские зоны и прокат колясок (уточнить на месте)']
      },
      { type:'sea',   date:'04.01.2026', title:'Пляж Джомтьен' },
      { type:'sea',   date:'05.01.2026', title:'Пляж Вонгамат' },
      { type:'sight', date:'06.01.2026', title:'Ват Кхао Пхра Бат (обзорная)' },
      { type:'sea',   date:'07.01.2026', title:'Ко Сичанг (морская прогулка)' },
      { type:'sea',   date:'08.01.2026', title:'Пляж Паттайя' },
      { type:'sight', date:'09.01.2026', title:'Dolphin World (семейно)' },
      { type:'sea',   date:'10.01.2026', title:'Пляж Джомтьен' },
      { type:'sight', date:'11.01.2026', title:'Батискаф (аттракцион)' },
      { type:'sight', date:'12.01.2026', title:'Art in Paradise (3D‑музей)' },
      { type:'sea',   date:'13.01.2026', title:'Пляж Вонгамат' },
      { type:'sea',   date:'14.01.2026', title:'Пляж Паттайя' },
      { type:'sight', date:'15.01.2026', title:'Мини‑Сиам (макеты)' },
      { type:'sea',   date:'16.01.2026', title:'Ко Лан (повторно)' },
      { type:'sea',   date:'17.01.2026', title:'Пляж Джомтьен' },
      { type:'sight', date:'18.01.2026', title:'Sea Life Pattaya' },
      { type:'sea',   date:'19.01.2026', title:'Пляж Вонгамат' },
      { type:'sea',   date:'20.01.2026', title:'Пляж Паттайя' },
      { type:'sight', date:'21.01.2026', title:'Ват Пхра Яй (Большой Будда)' },
      { type:'sea',   date:'22.01.2026', title:'Пляж Джомтьен' },
      { type:'sea',   date:'23.01.2026', title:'Пляж Вонгамат' },
      { type:'sight', date:'24.01.2026', title:'Central Festival Pattaya',
        url:'https://pattaya-city.ru/shopping/central-festival/'
      },
      { type:'sea',   date:'25.01.2026', title:'Пляж Паттайя' },

      // Семейные активности (актуальные бренды и места)
      { type:'sight', date:'05.01.2026', title:'Columbia Pictures Aquaverse (семья)',
        url:'https://pattaya-city.ru/razvlecheniya/cartoon-network-amazone/',
        tips:['Бренд сменён: бывш. Cartoon Network Amazone — теперь Aquaverse (актуально)']
      },
      { type:'sight', date:'14.01.2026', title:'Harbor Land (крытая площадка)',
        url:'https://pattaya.zagranitsa.com/article/3248/harbor-pattaya-9-sposobov-razvlechsia-vsei-semei',
        tips:['Большая крытая зона для детей; носки для игр обязательны (часто требуется)']
      }
    ];

    // Сортировка по дате
    activities.sort((a,b)=> {
      const da = parseDMY(a.date), db = parseDMY(b.date);
      return (da && db) ? (da - db) : 0;
    });

    // Диапазон поездки (первая/последняя дата)
    const tripStart = parseDMY(activities[0].date);
    const tripEnd   = parseDMY(activities[activities.length - 1].date);

    // Статус поездки + прогресс
    function utcMidnight(d){ return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); } // MDN Date.UTC
    function updateTripStatus(){
      if (!statusLabel || !statusDays || !statusBarFill) return;
      const now = new Date();
      const today = utcMidnight(now);
      const start = utcMidnight(tripStart);
      const end   = utcMidnight(tripEnd);
      if (today < start){
        const days = Math.ceil((start - today)/86400000);
        statusLabel.textContent = 'До начала поездки';
        statusDays.textContent = `${days} дн.`;
        statusBarFill.style.width = '0%';
      } else if (today > end){
        statusLabel.textContent = 'Поездка завершена';
        statusDays.textContent = '0 дн.';
        statusBarFill.style.width = '100%';
      } else {
        const total = Math.max(1, Math.round((end - start)/86400000)+1);
        const passed = Math.round((today - start)/86400000)+1;
        const pct = Math.min(100, Math.max(0, Math.round((passed/total)*100)));
        statusLabel.textContent = 'Поездка идёт';
        statusDays.textContent = `${passed}/${total} дн.`;
        statusBarFill.style.width = pct + '%';
      }
    }
    updateTripStatus(); setInterval(updateTripStatus, 3600000); // раз в час

    // Рендер карточек (минимум: заголовок, дата, Подробнее)
    function renderCards(list){
      cardsWrap.innerHTML='';
      if (!list || list.length===0){
        emptyState.classList.remove('hidden');
        cardsWrap.classList.remove('hidden');
        cardsWrap.setAttribute('aria-busy','false');
        if (skeletons && skeletons.parentNode) skeletons.parentNode.removeChild(skeletons);
        return;
      }
      for (let i=0;i<list.length;i++){
        const a=list[i], card=document.createElement('article');
        card.className='card '+(a.type||''); card.setAttribute('data-index', String(i));

        const icon = pickIcon(a.type, i);
        const h = document.createElement('h3');
        h.className='card-header';
        h.textContent = `${icon} ${a.title||a.text||''}`;

        const date = document.createElement('div');
        date.className='card-date';
        date.textContent = a.date;

        const actions = document.createElement('div');
        actions.className='card-actions';
        const btn = document.createElement('button');
        btn.type='button'; btn.className='btn primary';
        btn.innerHTML = `<span class="material-symbols-outlined">open_in_new</span> Подробнее`;
        btn.addEventListener('click',(e)=>{ e.preventDefault(); e.stopPropagation(); openDetails(i); });
        actions.appendChild(btn);

        card.appendChild(h); card.appendChild(date); card.appendChild(actions);
        cardsWrap.appendChild(card);
      }
      emptyState.classList.add('hidden');
      cardsWrap.classList.remove('hidden');
      cardsWrap.setAttribute('aria-busy','false');
      if (skeletons && skeletons.parentNode) skeletons.parentNode.removeChild(skeletons);
    }
    renderCards(activities);

    // Фильтры + LocalStorage
    const FILTER_KEY='goinpattaya.filter';
    function applyFilter(type){
      // Кнопки ARIA
      for (let i=0;i<filters.length;i++){
        const is = (filters[i].dataset.filter===type);
        filters[i].setAttribute('aria-pressed', is?'true':'false');
        filters[i].classList.toggle('active', is);
      }
      // Карточки
      const cards = $$('.card', cardsWrap);
      let visible=0;
      for (let k=0;k<cards.length;k++){
        const show = (type==='all' || cards[k].classList.contains(type));
        cards[k].style.display = show ? 'flex' : 'none';
        if (show) visible++;
      }
      emptyState.classList.toggle('hidden', visible>0);
      // Сохранить в localStorage
      try { localStorage.setItem(FILTER_KEY, type); } catch(e){}
    }
    // init filter from storage
    let initialFilter='all';
    try { initialFilter = localStorage.getItem(FILTER_KEY) || 'all'; } catch(e){}
    applyFilter(initialFilter);
    for (let i=0;i<filters.length;i++){
      const btn=filters[i];
      btn.addEventListener('click', ()=> applyFilter(btn.dataset.filter));
    }

    // Модалка: только релевантные разделы
    function showModal(){
      overlay.classList.remove('hidden');
      details.classList.remove('hidden');
      overlay.style.display='block'; details.style.display='block';
      overlay.setAttribute('aria-hidden','false');
    }
    function hideModal(){
      overlay.classList.add('hidden'); details.classList.add('hidden');
      overlay.setAttribute('aria-hidden','true');
      overlay.style.display='none'; details.style.display='none';
    }
    function openDetails(idx){
      const a = activities[idx]; if(!a) return;
      detailsTitle.textContent = `${a.title||a.text||''} • ${a.date}`;
      // meta
      detailsMeta.innerHTML='';
      // links
      detailsLinks.innerHTML='';
      if (a.url){
        const l = document.createElement('a');
        l.href = a.url; l.className='ext-link'; l.target='_blank'; l.rel='noopener';
        l.innerHTML = `<span class="material-symbols-outlined">link</span> Открыть статью`;
        detailsLinks.appendChild(l);
      }
      // transport
      detailsTransport.innerHTML='';
      if (a.transport && a.transport.length){
        for (const t of a.transport){ const li=document.createElement('li'); li.textContent=t; detailsTransport.appendChild(li); }
        detailsTransport.parentElement.classList.remove('hidden');
      } else { detailsTransport.parentElement.classList.add('hidden'); }
      // lunch
      detailsLunch.innerHTML='';
      if (a.lunch && a.lunch.length){
        for (const t of a.lunch){ const li=document.createElement('li'); li.textContent=t; detailsLunch.appendChild(li); }
        detailsLunch.parentElement.classList.remove('hidden');
      } else { detailsLunch.parentElement.classList.add('hidden'); }
      // tips
      detailsTips.innerHTML='';
      if (a.tips && a.tips.length){
        for (const t of a.tips){ const li=document.createElement('li'); li.textContent=t; detailsTips.appendChild(li); }
        detailsTips.parentElement.classList.remove('hidden');
      } else { detailsTips.parentElement.classList.add('hidden'); }
      // schedule (содержимое краткое, детальные блоки — в аккордеонах)
      scheduleList.innerHTML='';
      const departAt='09:00', travel=(a.type==='sea')?40:30, arr=add(parseTime(departAt).h, parseTime(departAt).m, travel);
      const s1 = [`${departAt} — Выход из дома (вода, SPF, шляпы, наличные)`,
                  `${departAt}–${arr} — Дорога по маршруту`];
      for (const row of s1){ const li=document.createElement('li'); li.textContent=row; scheduleList.appendChild(li); }
      setTimeout(showModal, 0);
    }
    function closeDetails(){ hideModal(); }
    on(overlay,'click', (e)=>{ if(e.target===overlay) closeDetails(); });
    on(closeBtn,'click',(e)=>{ e.preventDefault(); e.stopPropagation(); closeDetails(); });

    // Внешние ссылки: открыть во встроенном браузере Telegram
    document.addEventListener('click', function(e){
      const a = e.target.closest && e.target.closest('.ext-link, .dish-link');
      if (!a) return;
      const url = a.getAttribute('href');
      if (!url) return;
      e.preventDefault();
      if (tg && typeof tg.openLink === 'function'){ tg.openLink(url); }
      else { window.open(url, '_blank', 'noopener'); }
    }, false);
  });
})();
