export const squareToRoundCopy = {
  ua: {
    pointLabels:
      'Усі точки наведені в таблиці координат; підписи на перегляді проріджено для читабельності.',
    layout: (center: number, last: number) =>
      `Позначте M посередині 1–2. Відкладіть h вертикально від M до точки ${center}. На висоті Hflat побудуйте лінію 3–${last} із центром над M. Позначте решту точок за координатами та ріжте послідовно від 3 до ${last}.`,
    heading: 'Перехід із квадрата на коло',
    intro: 'Центрований перехід із чотирьох однакових панелей.',
    width: 'Сторона квадратного входу',
    outlet: 'Діаметр круглого виходу',
    height: 'Висота',
    approximation:
      'Гранована апроксимація круглого краю. Виріжте 4 однакові панелі.',
    deviation: 'Максимальне відхилення форми',
    actualDeviation: 'Фактичне радіальне відхилення',
    perPanel: 'Сегментів на панель',
    toleranceHelp:
      'Відстань від середини сегмента до ідеального кола. Це геометричне відхилення, а не зазор під зварювання.',
    range:
      'Не вдалося побудувати розгортку. Збільште допустиме відхилення або зменште розміри; максимум 1024 сегменти.',
    folds:
      'Пунктиром позначені лінії згину. З’єднайте краї A сусідніх панелей.',
    copies: 'Кількість панелей',
    facets: 'Граней круглого краю',
    smaller: 'Круглий вихід має бути меншим за сторону квадратного входу.',
  },
  ru: {
    pointLabels:
      'Все точки приведены в таблице координат; подписи на просмотре прорежены для читаемости.',
    layout: (center: number, last: number) =>
      `Отметьте M посередине 1–2. Отложите h вертикально от M до точки ${center}. На высоте Hflat постройте линию 3–${last} с центром над M. Отметьте остальные точки по координатам и режьте последовательно от 3 до ${last}.`,
    heading: 'Переход с квадрата на круг',
    intro: 'Центрированный переход из четырёх одинаковых панелей.',
    width: 'Сторона квадратного входа',
    outlet: 'Диаметр круглого выхода',
    height: 'Высота',
    approximation:
      'Гранёная аппроксимация круглого края. Вырежьте 4 одинаковые панели.',
    deviation: 'Максимальное отклонение формы',
    actualDeviation: 'Фактическое радиальное отклонение',
    perPanel: 'Сегментов на панель',
    toleranceHelp:
      'Расстояние от середины сегмента до идеальной окружности. Это геометрическое отклонение, а не зазор под сварку.',
    range:
      'Не удалось построить развёртку. Увеличьте допустимое отклонение или уменьшите размеры; максимум 1024 сегмента.',
    folds:
      'Пунктиром обозначены линии сгиба. Соедините края A соседних панелей.',
    copies: 'Количество панелей',
    facets: 'Граней круглого края',
    smaller: 'Круглый выход должен быть меньше стороны квадратного входа.',
  },
  en: {
    pointLabels:
      'All points are listed in the coordinate table; preview labels are spaced out for readability.',
    layout: (center: number, last: number) =>
      `Mark M halfway along 1–2. Place ${center} vertically above M using h. At height Hflat, center the 3–${last} guide over M. Mark the remaining points from their coordinates and cut in order from 3 to ${last}.`,
    heading: 'Square-to-round transition',
    intro: 'A centered transition assembled from four matching panels.',
    width: 'Square inlet width',
    outlet: 'Round outlet diameter',
    height: 'Height',
    approximation:
      'Faceted approximation of the round rim. Cut 4 identical panels.',
    deviation: 'Maximum shape deviation',
    actualDeviation: 'Actual radial deviation',
    perPanel: 'Segments per panel',
    toleranceHelp:
      'Distance from the midpoint of a segment to the ideal circle. This is a geometric deviation, not a weld gap.',
    range:
      'Unable to develop this pattern. Increase the allowed deviation or reduce the dimensions; maximum 1024 segments.',
    folds: 'Dashed lines mark folds. Join edges A on adjacent panels.',
    copies: 'Panels to cut',
    facets: 'Round rim facets',
    smaller: 'Round outlet must be smaller than the square inlet width.',
  },
};
