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
  'Shattered Worlds',
  'Tears of Guthix'
];

const monthly = [
  'Giant Oyster',
  'God Statues',
  'Troll Invasion'
];

const underscoreText = text => text.replace(/ /g, '_');

const startUpdatingTimers = () => {
  const updateTimer = () => {
    const now = new Date();

    const minute = now.getUTCMinutes();
    const hour = now.getUTCHours();
    const day = now.getUTCDay();
    const date = now.getUTCDate();

    const minutesUntilReset = 60 - minute;
    const hoursUntilReset = 23 - hour;
    const daysUntilReset = day > 2 ? 9 - day : 2 - day;
    const monthsUntilReset = 30 - date;

    $('#Daily').text(`${hoursUntilReset}:${minutesUntilReset} hours`);
    $('#Weekly').text(`${daysUntilReset} days`);
    $('#Monthly').text(`${monthsUntilReset} days`);
  };

  setInterval(updateTimer, 1000);
};

const handleClick = ($checkbox, $link, e) => {
  if (e.target.className === 'checkbox') {
    $link.toggleClass('strikethrough');
    return;
  }
  $checkbox.prop('checked', !$checkbox.prop('checked'));
  $link.toggleClass('strikethrough');
};

const handleReset = e => {
  $('.checkbox', $(e.target).closest('.section')).prop('checked', false);
  $('.link', $(e.target).closest('.section')).removeClass('strikethrough');
}

const renderSection = () => (
  $('<section></section>', {
    class: 'section'
  })
);

const renderHeader = () => (
  $('<div></div>', {
    class: 'header'
  })
);

const renderTitle = title => (
  $('<h1></h1>', {
    class: 'title',
    text: title
  })
);

const renderReset = () => (
  $('<span></span>', {
    class: 'reset',
    text: 'reset'
  })
);

const renderResetTimer = (title) => (
  $('<span></span>', {
    id: title,
    class: 'timer',
    text: ''
  })
);

const renderItem = () => (
  $('<div></div>', {
    class: 'item'
  })
);

const renderCheckbox = (item, checked) => (
  $('<input></input>', {
    id: `${item}`,
    type: 'checkbox',
    class: 'checkbox',
    checked
  })
);

const renderLink = text => (
  $('<a></a>', {
    class: 'link',
    text,
    href: `https://runescape.wiki/w/${underscoreText(text)}`,
    target: '_blank'
  })
);

const Section = (title, items, data) => {
  const $section = renderSection();
  const $header = renderHeader();
  const $title = renderTitle(title);
  const $reset = renderReset();
  const $resetTimer = renderResetTimer(title);

  $reset.on('click', handleReset);

  $header.append($title);
  $header.append($reset);
  $header.append($resetTimer);
  $section.append($header);

  items.forEach(item => {
    const $item = renderItem();
    const $checkbox = renderCheckbox(item, data[item]);
    const $link = renderLink(item);

    if (data[item]) {
      $link.addClass('strikethrough');
    }

    $item.append($checkbox);
    $item.append($link);
    $item.on('click', (e) => handleClick($checkbox, $link, e));

    $section.append($item);
  });

  return $section;
};

const startSaving = () => {
  const save = () => {
    const $items = $('.checkbox');
    const data = Object.values($items)
      .filter(item => item.id)
      .reduce((result, { id, checked }) => {
        result[id] = checked;
        return result;
      }, {});
    const jsoned = JSON.stringify(data);
    localStorage.setItem('state', jsoned);
  };
  setInterval(save, 1000);
};

const load = () => {
  const state = localStorage.getItem('state');
  return JSON.parse(state);
};

$().ready(() => {
  const $root = $('#root');

  const data = load() || {};

  $root.append(Section('Daily', daily, data));
  $root.append(Section('Weekly', weekly, data));
  $root.append(Section('Monthly', monthly, data));

  startUpdatingTimers();
  startSaving();
});
