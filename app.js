// Исправленный счетчик и заголовок, карточки дня, горизонтальные табы, новый фильтр 'Досуг'

function getTripCounterString() {
    const today = new Date();
    const startTrip = new Date('2025-12-29');
    const endTrip = new Date('2026-01-26');
    if (today < startTrip) {
        // До поездки
        return { text: "До поездки:", days: Math.max(0, Math.ceil((startTrip - today) / (1000*60*60*24))) };
    } else if (today >= startTrip && today <= endTrip) {
        // До отъезда
        return { text: "До отъезда:", days: Math.max(0, Math.ceil((endTrip - today) / (1000*60*60*24))) };
    } else {
        // Поездка завершена
        return { text: "Поездка завершена!", days: 0 };
    }
}

// Вызов обновления счетчика
function updateCountdown() {
    const { text, days } = getTripCounterString();
    const textEl = document.getElementById('countdownText');
    const daysEl = document.getElementById('days');
    if (textEl) textEl.textContent = text;
    if (daysEl) daysEl.textContent = days > 0 ? days : (text==='Поездка завершена!' ? '✔' : '🎒');
    // Лейбл
    document.querySelector('.countdown-label').textContent = 'дней';
    if (text==='Поездка завершена!') {
      document.querySelector('.countdown-label').textContent = '';
    }
}

// Исправление названий пляжей
function correctBeachNames(activities) {
    for (let a of activities) {
        if (/джомтьен/i.test(a.text)) a.text = a.text.replace(/джомтьен/gi, 'Вонгамат');
        if (/паттайя/i.test(a.text)) a.text = a.text.replace(/паттайя/gi, 'Бамбу Бич');
    }
}

// Исправление названия кнопки "Достопримечательности" на "Досуг"
function fixFilterButtons() {
    document.querySelectorAll('.filter-btn[data-filter="sight"]').forEach(btn => btn.textContent = '🎡 Досуг');
}

// Исправление НЕ вертикальных табов
function fixTabsLayout() {
    const tabs = document.querySelector('.tabs');
    if (tabs) {
        tabs.style.display = 'flex';
        tabs.style.flexDirection = 'row';
        tabs.style.justifyContent = 'center';
    }
}

// Исправления основной логики
function applyCorrections() {
    if (window.appData && Array.isArray(window.appData.activities)) {
        correctBeachNames(window.appData.activities);
    }
    fixFilterButtons();
    fixTabsLayout();
    updateCountdown();
}

document.addEventListener('DOMContentLoaded', applyCorrections);
setInterval(updateCountdown, 60*60*1000); // Обновлять раз в час

// Экспорт функций глобально если требуется
window.updateCountdown = updateCountdown;
window.applyCorrections = applyCorrections;