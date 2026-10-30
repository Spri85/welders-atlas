export const exportCopy = {
  ua: {
    settings: 'Налаштування PDF', close: 'Закрити',
    paper: 'Папір', download: 'Завантажити PDF', busy: 'Створення PDF…', error: 'Не вдалося створити PDF. Перевірте розміри (до 200 сторінок) і повторіть спробу.',
    actualSize: 'Друкуйте у масштабі 100% / натуральна величина. Вимкніть підгонку.',
    assemble: 'Перекриття 10 мм. Сумістіть хрестики сусідніх аркушів.',
    scale: 'Перевірка масштабу 50 мм', zero: 'Без припусків на товщину, різ та шов.',
    unverified: 'Фізично не перевірено. Виміряйте шкалу та складіть паперовий зразок.',
    row: 'Ряд', column: 'Стовпець', cut: 'Суцільна — різ, пунктир — згин / орієнтир, штрихпунктир — побудова.',
  },
  ru: {
    settings: 'Настройки PDF', close: 'Закрыть',
    paper: 'Бумага', download: 'Скачать PDF', busy: 'Создание PDF…', error: 'Не удалось создать PDF. Проверьте размеры (до 200 страниц) и повторите попытку.',
    actualSize: 'Печатайте в масштабе 100% / натуральная величина. Отключите подгонку.',
    assemble: 'Перекрытие 10 мм. Совместите крестики соседних листов.',
    scale: 'Проверка масштаба 50 мм', zero: 'Без припусков на толщину, рез и шов.',
    unverified: 'Физически не проверено. Измерьте шкалу и соберите бумажный образец.',
    row: 'Ряд', column: 'Столбец', cut: 'Сплошная — рез, пунктир — сгиб / ориентир, штрихпунктир — построение.',
  },
  en: {
    settings: 'PDF settings', close: 'Close',
    paper: 'Paper', download: 'Download PDF', busy: 'Creating PDF…', error: 'Could not create PDF. Check the dimensions (up to 200 pages) and try again.',
    actualSize: 'Print at 100% / actual size. Disable fit to page.',
    assemble: '10 mm overlap. Match crosses on adjacent sheets.',
    scale: '50 mm scale check', zero: 'Zero allowance for thickness, kerf and seams.',
    unverified: 'Physically unverified. Measure the scale and assemble a paper sample.',
    row: 'Row', column: 'Column', cut: 'Solid = cut / dashed = fold or reference / dash-dot = construction.',
  },
};
export type Language = keyof typeof exportCopy;
