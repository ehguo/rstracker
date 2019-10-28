$().ready(() => {
  const $root = $('#root');

  const data = load('state') || {};

  const $dailySection = RepeatableSection('Daily', daily, data);
  const $weeklySection = RepeatableSection('Weekly', weekly, data);
  const $monthlySection = RepeatableSection('Monthly', monthly, data);

  $root.append($dailySection, $weeklySection, $monthlySection);

  startUpdatingTimers();
});

/******************************************************************************
 * Time functions
 */
const resetTypes = { day: 'day', week: 'week', month: 'month' };

const getDaysInMonth = now => new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0).getDate();

const getTimersUntilReset = now => {
  const year = now.getUTCFullYear();
  const daysInMonth = getDaysInMonth(now);
  const month = now.getUTCMonth();
  const day = now.getUTCDate();
  const dayOfWeek = now.getUTCDay();

  const monthEnd = new Date(Date.UTC(year, month, daysInMonth, 24));
  const weekEnd = new Date(Date.UTC(year, month, (dayOfWeek <= 2 ? day + (2 - dayOfWeek) : day + (9 - dayOfWeek)), 24));
  const dayEnd = new Date(Date.UTC(year, month, day, 24));

  const dailyTimer = dayEnd - now;
  const weeklyTimer = weekEnd - now;
  const monthlyTimer = monthEnd - now;

  return {
    dayEnd,
    dailyTimer,
    weekEnd,
    weeklyTimer,
    monthEnd,
    monthlyTimer
  };
};

const getTimerString = timer => {
  let ms = timer;

  const msInDay = 1000*60*60*24;
  const msInHour = 1000*60*60;
  const msInMinute = 1000*60;

  const days = `${Math.floor(ms / msInDay)}`;
  ms %= msInDay;

  const hours = `${Math.floor(ms / msInHour)}`.padStart(2, '0');
  ms %= msInHour;

  const minutes = `${Math.floor(ms / msInMinute)}`.padStart(2, '0');
  ms %= msInMinute;

  return days < 1
    ? `${hours}:${minutes}`
    : `${days} days`;
};

const updateTimers = () => {
  const now = new Date();
  const {
    dayEnd,
    dailyTimer,
    weekEnd,
    weeklyTimer,
    monthEnd,
    monthlyTimer
  } = getTimersUntilReset(now);

  const dailyString = getTimerString(dailyTimer);
  const weeklyString = getTimerString(weeklyTimer);
  const monthlyString = getTimerString(monthlyTimer);

  const storedDayEnd = load('dayEnd') || 0;
  const storedWeekEnd = load('weekEnd') || 0;
  const storedMonthEnd = load('monthEnd') || 0;

  if (!storedDayEnd) {
    save('dayEnd', dayEnd);
  }
  if (!storedWeekEnd) {
    save('weekEnd', weekEnd);
  }
  if (!storedMonthEnd) {
    save('monthEnd', monthEnd);
  }

  if (now > new Date(storedDayEnd)) {
    resetDaily();
    save('dayEnd', dayEnd);
  }
  if (now > new Date(storedWeekEnd)) {
    resetWeekly();
    save('weekEnd', weekEnd);
  }
  if (now > new Date(storedMonthEnd)) {
    resetMonthly();
    save('monthEnd', monthEnd);
  }

  $('#Daily').text(dailyString);
  $('#Weekly').text(weeklyString);
  $('#Monthly').text(monthlyString);
};

const startUpdatingTimers = () => {
  updateTimers();
  setInterval(updateTimers, 3000);
};


/******************************************************************************
 * Storage functions
 */
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));
const load = key => JSON.parse(localStorage.getItem(key));


/******************************************************************************
 * Util functions
 */
const underscoreText = text => text.replace(/ /g, '_');
const generateIdDOM = text => text.replace(/ |\(|\)|'/g, '');
const generateWikiLink = item => `https://runescape.wiki/w/${underscoreText(item)}`;


/******************************************************************************
 * Render functions
 */
const Section = props => $('<section></section>', props);
const Div = props => $('<div></div>', props);
const H1 = props => $('<h1></h1>', props);
const Span = props => $('<span></span>', props);
const A = props => $('<a></a>', props);
const Input = props => $('<input></input>', props);

const RepeatableSection = (title, items, data) => {
  const $section = Section({ id: `${title}Section`, class: 'section' });

  const $header = Div({ class: 'header' });
  const $title = H1({ class: 'title', text: title });
  const $reset = Span({ class: 'reset', text: 'reset' });
  const $timer = Span({ id: title, class: 'timer', text: '' });
  $header.append($title, $reset, $timer);

  const $items = Div({ class: 'items' });
  items.forEach(item => {
    const id = generateIdDOM(item);
    const $item = Div({ id, class: 'item' });

    const $checkbox = Input({ class: 'checkbox', type: 'checkbox', checked: data[item] });
    const $link = A({
      class: 'link',
      href: generateWikiLink(item),
      target: '_blank',
      text: item
    });
    if (data[item]) $link.addClass('strikethrough');
    $item.append($checkbox, $link);
    $item.on('click', handleItemClick(id, item));

    $items.append($item);
  });

  $reset.on('click', handleReset($items, items));

  $section.append($header, $items);
  return $section;
};


/******************************************************************************
 * Event handlers
 */
const handleItemClick = (id, item) => (e) => {
  e.stopPropagation(e);
  const data = load('state') || {};
  if (e.target.className === 'link') return;
  data[item] = !data[item];

  const $item = $(`#${id}`);
  $('.checkbox', $item).prop('checked', data[item]);
  $('.link', $item).toggleClass('strikethrough', data[item]);

  save('state', data);
};

const handleReset = ($items, items) => () => {
  const data = load('state') || {};
  items.forEach(item => {
    data[item] = false;
  });
  $('.checkbox', $items).prop('checked', false);
  $('.link', $items).removeClass('strikethrough');
  save('state', data);
};

const resetDaily = () => {
  const data = load('state') || {};
  daily.forEach(item => {
    data[item] = false;
  });
  save('state', data);
  $('.checkbox', $('#DailySection')).prop('checked', false);
  $('.link', $('#DailySection')).removeClass('strikethrough');
};

const resetWeekly = () => {
  const data = load('state') || {};
  weekly.forEach(item => {
    data[item] = false;
  });
  save('state', data);
  $('.checkbox', $('#WeeklySection')).prop('checked', false);
  $('.link', $('#WeeklySection')).removeClass('strikethrough');
};

const resetMonthly = () => {
  const data = load('state') || {};
  monthly.forEach(item => {
    data[item] = false;
  });
  save('state', data);
  $('.checkbox', $('#MonthlySection')).prop('checked', false);
  $('.link', $('#MonthlySection')).removeClass('strikethrough');
};


/******************************************************************************
 * Default values
 */
const daily = [
  'Robin',
  'Jack of trades aura',
  'Nemi Forest',
  'Wicked hood',
  'Vis wax',
  'Gorajo resource dungeon',
  'Travelling Merchant\'s Shop',
  'Challenge System',
  'Crystal tree (Farming)',
  'Herbs',
  'Soul Reaper'
];

const weekly = [
  'Meg',
  'Aquarium',
  'Agoroth',
  'Herby Werby',
  'Totem (Anachronia)',
  'Penguin Hide and Seek',
  'Spirit pig',
  'Balthazar Beauregard\'s Big Top Bonanza',
  'Tears of Guthix',
  'Managing Miscellania',
  'Skeletal Horror',
  'Clan Citadel',
  'Shattered Worlds',
  'Familiarisation'
];

const monthly = [
  'Giant Oyster',
  'God Statues',
  'Troll Invasion'
];
