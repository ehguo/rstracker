$().ready(() => {
  const $root = $('#root');

  const data = load('state') || {};

  $root.append(RepeatableSection('Daily', daily, data));
  $root.append(RepeatableSection('Weekly', weekly, data));
  $root.append(RepeatableSection('Monthly', monthly, data));

  startUpdatingTimers();
  // startSaving();

  // setInterval(() => {
  //   const now = new Date();
  //   console.log(getTimeUntilReset(now))
  // }, 1000);
});

/******************************************************************************
 * Time functions
 */
const resetTypes = { day: 'day', week: 'week', month: 'month' };

const getDaysInMonth = now => new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0).getDate();

const getTimeUntilReset = now => {
  const minutes = 60 - now.getUTCMinutes();
  const hours = 23 - now.getUTCHours();
  const daysWeek = now.getUTCDay() <= 2 ? 2 - now.getUTCDay() : 9 - now.getUTCDay();
  const daysMonth = getDaysInMonth(now) - now.getUTCDate();

  const dailyString = `${hours > 9 ? '' : '0'}${hours}:${minutes > 9 ? '' : '0'}${minutes} hours`;
  const weeklyString = daysWeek > 1 ? `${daysWeek} days` : dailyString;
  const monthlyString = daysMonth > 0 ? `${daysMonth} days` : dailyString;

  return { dailyString, weeklyString, monthlyString };
};

const startUpdatingTimers = () => {
  const updateTimers = () => {
    const now = new Date();
    const { dailyString, weeklyString, monthlyString } = getTimeUntilReset(now);
  
    $('#Daily').text(dailyString);
    $('#Weekly').text(weeklyString);
    $('#Monthly').text(monthlyString);
  };

  setInterval(updateTimers, 1000);
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
  const $section = Section({ class: 'section' });

  const $header = Div({ class: 'header' });
  const $title = H1({ class: 'title', text: title });
  const $reset = Span({ class: 'reset', text: 'reset' });
  const $timer = Span({ id: title, class: 'timer', text: '' });
  $reset.on('click', handleReset);
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
    $item.on('click', handleItemClick(id, item, data));

    $items.append($item);
  });

  $section.append($header, $items);
  return $section;
};


/******************************************************************************
 * Event handlers
 */
const handleItemClick = (id, item, data) => (e) => {
  e.stopPropagation(e);
  if (e.target.className === 'link') return;
  data[item] = !data[item];

  const $item = $(`#${id}`);
  $('.checkbox', $item).prop('checked', data[item]);
  $('.link', $item).toggleClass('strikethrough', data[item]);

  save('state', data);
};


/******************************************************************************
 * Default values
 */
const daily = [
  'Arhein',
  'Battlestaff',
  'Bert',
  'Bork',
  'Challenge System',
  'Geoffrey',
  'Jack of trades aura',
  'Jade vine',
  'Nemi Forest',
  'Robin',
  'Skill outfit add-ons',
  'Soul obelisk (Menaphos)',
  'Vis wax',
  'Wicked hood',
  'Wizard Cromperty'
];

const weekly = [
  'Agoroth',
  'Balthazar Beauregard\'s Big Top Bonanza',
  'Broken Home',
  'Clan Citadel',
  'Familiarisation',
  'Hanky points',
  'Managing Miscellania',
  'Meg',
  'Penguin Hide and Seek',
  'Rush of Blood',
  'Shattered Heart',
  'Shattered Worlds',
  'Skeletal Horror',
  'Tears of Guthix'
];

const monthly = [
  'Giant Oyster',
  'God Statues',
  'Troll Invasion'
];

// const handleClick = ($checkbox, $link, e) => {
//   if (e.target.className === 'link') {
//     return;
//   }
//   if (e.target.className === 'checkbox') {
//     $link.toggleClass('strikethrough');
//     return;
//   }
//   $checkbox.prop('checked', !$checkbox.prop('checked'));
//   $link.toggleClass('strikethrough');
// };

// const handleReset = e => {
//   $('.checkbox', $(e.target).closest('.section')).prop('checked', false);
//   $('.link', $(e.target).closest('.section')).removeClass('strikethrough');
// }

