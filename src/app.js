// Utilities
function ready(fn) {
  if (document.readyState != 'loading') {
    fn();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState != 'loading')
        fn();
    });
  }
}

function isObject(obj) {
  return typeof obj === 'object' && obj !== null;
}

function applyStyles(el, styles) {
  if (null === el) return;
  for (var key of Object.keys(styles)) {
    el.style[key] = styles[key];
  }
}

function JSONtoStyles(rootEl, styles) {
  for (var param in styles) {
    const elements = rootEl.querySelectorAll(param);
    elements.forEach(function(el) {
      applyStyles(el, styles[param]);
    });
  }
}

function mergeObject(defObj, apply){
    var result = JSON.parse(JSON.stringify(defObj));
    for (var attr in apply) {
      if (isObject(defObj[attr]) && isObject(apply[attr])) {
        result[attr] = mergeObject(defObj[attr], apply[attr]);
      } else {
        result[attrname] = apply[attrname];
      }
    }
    return result;
}

function applySimpleMarkdown(text) {
  return text
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*\s?([^\n]+)\*\*/g, '<b>$1</b>')
    .replace(/\_\_\s?([^\n]+)\_\_/g, '<b>$1</b>')
    .replace(/\*\s?([^\n]+)\*/g, '<i>$1</i>')
    .replace(/\_\s?([^\n]+)\_/g, '<i>$1</i>');

}

// State Management

function saveConsentState(consentState) {
  localStorage.setItem('gtmCookiesConsentState', JSON.stringify(consentState));
}

function isConsentStateProvided() {
  return null !== localStorage.getItem('gtmCookiesConsentState');
}

function loadConsentState() {
  var value = localStorage.getItem('gtmCookiesConsentState');
  if (null !== value) {
    return JSON.parse(value);
  }
  return null;
}

function pushConsentState(consentState) {
  window.dataLayer = window.dataLayer || [];
  dataLayer.push({
    event: 'tag_concierge_consent',
    consent_state: consentState
  });
}

function getDefaultConsentState(config) {
  return config.content.settings.consent_types.reduce(function(agg, configType) {
    agg[configType.name] = configType.default;
    return agg;
  }, {})
}

function setConsentTypeState(consentState, consentTypeName, consentTypeState) {
  consentState[consentStateName] = consentTypeState;
  return consentState;
}

function setConsentState(consentState, consentTypeState) {
  for (var key of Object.keys(consentState)) {
    consentState[key] = consentTypeState;
  }
  return consentState;
}


// Components

function createMain(gtmCookiesConfig) {
  var main = document.createElement("div");
  main.setAttribute('id', 'gtm-cookies-main');
  main.style.display = 'none';
  return main;
}

function createWall(gtmCookiesConfig) {
  var wall = document.createElement("div");
  wall.setAttribute('id', 'gtm-cookies-wall');
  return wall;
}

function createModal(gtmCookiesConfig) {
  var modal = document.createElement("div");
  modal.style.display = 'none';
  modal.setAttribute('id', 'gtm-cookies-modal');
  modal.innerHTML = '<div class="gtm-cookies-modal-wrapper"><div><p></p></div><div class="gtm-cookies-modal-buttons"><a class="button" href="#accept"></a><a class="button" href="#settings"></a></div></div>';
  modal.querySelector('p').textContent = applySimpleMarkdown(gtmCookiesConfig.content.modal.text);
  modal.querySelector('[href="#accept"]').textContent = gtmCookiesConfig.content.modal.buttons.accept.text;
  modal.querySelector('[href="#settings"]').textContent = gtmCookiesConfig.content.modal.buttons.settings.text;
  // var modalText = 'Our page is using cookies [accept all](#accept) [adjust settings](#modal).';
  // modal.innerHTML = applySimpleMarkdown(gtmCookiesConfig.content.modal.text);
  return modal;
}

function createSettings(gtmCookiesConfig) {
  var existingConsentState = loadConsentState();

  var settings = document.createElement("div");
  settings.setAttribute('id', 'gtm-cookies-settings');
  settings.style.display = 'none';
  settings.innerHTML = '<div><h2></h2><p></p><form><ul></ul><a class="button" href="#save"></a><a class="button" href="#close"></a></form></div>';

  settings.querySelector('h2').textContent = gtmCookiesConfig.content.settings.title;
  settings.querySelector('p').textContent = gtmCookiesConfig.content.settings.description;

  settings.querySelector('[href="#save"]').textContent = gtmCookiesConfig.content.settings.buttons.save.text;
  settings.querySelector('[href="#close"]').textContent = gtmCookiesConfig.content.settings.buttons.close.text;

  var consentTypes = gtmCookiesConfig.content.settings.consent_types;
  for (var key of Object.keys(consentTypes)) {
    var listItem = document.createElement('li');
    var listItemTitle = document.createElement('h3');
    var listItemDescription = document.createElement('p');
    var listItemHidden = document.createElement('input');
    listItemHidden.setAttribute('type', 'hidden');
    listItemHidden.setAttribute('name', consentTypes[key].name);
    listItemHidden.setAttribute('value', 'denied');
    var listItemCheckbox = document.createElement('input');
    listItemCheckbox.setAttribute('type', 'checkbox');
    listItemCheckbox.setAttribute('name', consentTypes[key].name);
    listItemCheckbox.setAttribute('value', 'granted');

    if (isConsentStateProvided() && 'granted' === existingConsentState[key]
      || !isConsentStateProvided() && 'granted' === consentTypes[key].propose) {
      listItemCheckbox.setAttribute('checked', 'checked');
    }

    listItemTitle.textContent = consentTypes[key].title;
    listItemDescription.textContent = consentTypes[key].description;
    listItem.appendChild(listItemTitle);
    listItem.appendChild(listItemDescription);
    listItem.appendChild(listItemHidden);
    listItem.appendChild(listItemCheckbox);
    settings.querySelector('ul').appendChild(listItem);
  }


  return settings;
}


function hideMain(main) {
  main.style.display = 'none';
  hideWall(main);
}

function showWall(main) {
  var wall = main.querySelector('#gtm-cookies-wall');
  wall.style.background = 'rgba(0, 0, 0, .7)';
  wall.style.position = 'absolute';
  wall.style.top = '0';
  wall.style.right = '0';
  wall.style.left = '0';
  wall.style.bottom = '0';
}

function hideWall(main) {
  var wall = main.querySelector('#gtm-cookies-wall');
  wall.style.position = 'static';
  wall.style.background = 'none';
}

function showModal(main) {
  main.style.display = 'block';
  main.querySelector('#gtm-cookies-modal').style.display = 'block';
}

function hideModal(main) {
  main.style.display = 'block';
  main.querySelector('#gtm-cookies-modal').style.display = 'none';
}

function showSettings(main) {
  main.style.display = 'block';
  main.querySelector('#gtm-cookies-settings').style.display = 'block';
  showWall(main)
}

function hideSettings(main) {
  main.style.display = 'block';
  main.querySelector('#gtm-cookies-settings').style.display = 'none';
  hideWall(main)
}


function getDefaultGtmCookiesConfig() {

}

// Actions

function grantAllConsentTypes() {

}


function app() {
  const defaultStyles = {
    '#gtm-cookies-modal .gtm-cookies-modal-wrapper': {
      margin: '0 auto',
      display: 'flex',
      'justify-content': 'center'
    },
    '#gtm-cookies-modal .gtm-cookies-modal-buttons': {
      margin: '12px'
    },
    '#gtm-cookies-settings': {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      // border: '1px solid rgba(0, 0, 0, 0.8)',
      background: '#fff',
      'box-shadow': '0 0 10px 10px rgba(0, 0, 0, .1)',
      'border-radius': '5px',
      padding: '10px 20px 30px'
    },
    '#gtm-cookies-settings': {

    },
    '.button': {
        'text-decoration': 'none',
        background: 'none',
        color: '#333333',
        padding: '2px 6px 2px 6px',
        'border': '1px solid #000',
        margin: '0 5px'
    }
  };

  var body = document.querySelector('body');

  // create all components
  var main = createMain(gtmCookiesConfig);
  var wall = createWall(gtmCookiesConfig);
  var modal = createModal(gtmCookiesConfig);
  var settings = createSettings(gtmCookiesConfig);

  main.appendChild(wall);
  wall.appendChild(modal);
  wall.appendChild(settings);


  // apply actions
  main.querySelector('[href="#accept"]').addEventListener('click', function(ev) {
    ev.preventDefault();
    var consentTypes = gtmCookiesConfig.content.settings.consent_types;
    var consentState = {};
    for (var key of Object.keys(consentTypes)) {
      consentState[key] = 'granted';
    }
    pushConsentState(consentState);
    saveConsentState(consentState);
    hideMain(main);
  });

  settings.querySelector('[href="#close"]').addEventListener('click', function(ev) {
    ev.preventDefault();
    hideSettings(main);
    if (!isConsentStateProvided()) {
      showModal(main);
    }
  });

  modal.querySelector('[href="#settings"]').addEventListener('click', function(ev) {
    ev.preventDefault();
    hideModal(main);
    showSettings(main);
  });


  settings.querySelector('[href="#save"]').addEventListener('click', function(ev) {
    ev.preventDefault();
    settings.querySelector('form').submit();
  });

  settings.querySelector('form').addEventListener("submit", function(ev) {
    ev.preventDefault();
    const formData = new FormData(ev.target);

    consentState = Object.fromEntries(formData);
    pushConsentState(consentState);
    saveConsentState(consentState);
    hideMain(main);
  });

  var settingsButton = body.querySelector('[href="#gtm-cookies-settings"]');
  if (null !== settingsButton) {
    settingsButton.addEventListener('click', function(ev) {
      ev.preventDefault();
      showSettings(main);
    });
  }

  body.appendChild(main);

  JSONtoStyles(main, defaultStyles);

  if (true !== isConsentStateProvided()) {
    if (true === gtmCookiesConfig.display.wall) {
      showWall(main);
    }

    if ('bar' === gtmCookiesConfig.display.mode) {
      applyStyles(modal, {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        'border-top': '1px solid black'
      });
      showModal(main);
    }

    if ('modal' === gtmCookiesConfig.display.mode) {
      applyStyles(modal, {
        position: 'fixed',
        padding: '30px',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        'border': '1px solid black',
        background: "#fff"
      });
      showModal(main);
    }

    if ('settings' === gtmCookiesConfig.display.mode) {
      showSettings(main);
    }
  }

}

(function gtmCookies() {
  // first check if we have existing ConsentState and push it to datalayer
  var existingConsentState = loadConsentState();
  if (null !== existingConsentState) {
    pushConsentState(existingConsentState);
  }
  ready(app);
})();

