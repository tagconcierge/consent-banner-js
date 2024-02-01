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
  for (var key of Object.keys(styles || {})) {
    el.style[key] = styles[key];
  }
}

function JSONtoStyles(rootEl, styles) {
  for (var param in styles) {
    const selector = param.replace(/([A-Z])/g, '-$1');
    const elements = rootEl.querySelectorAll(param);
    elements.forEach(function(el) {
      applyStyles(el, styles[param]);
    });
  }
}

function applySimpleMarkdown(text) {
  return (text || '')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*\s?([^\n]+)\*\*/g, '<b>$1</b>')
    .replace(/\_\_\s?([^\n]+)\_\_/g, '<b>$1</b>')
    .replace(/\*\s?([^\n]+)\*/g, '<i>$1</i>')
    .replace(/\_\s?([^\n]+)\_/g, '<i>$1</i>');

}

// State Management
function isConsentStateProvided(consentState) {
  return null !== consentState;
}

function loadConsentState() {
  console.warn("ConsentBannerJS: loadConsentState function is not provided");
  return null;
}

function saveConsentState(consentState) {
  console.warn("ConsentBannerJS: saveConsentState function is not provided");
  return null;
}

// Components
function createMain(gtmCookiesConfig) {
  var main = document.createElement("div");
  main.setAttribute('id', 'consent-banner-js-main');
  main.style.display = 'none';
  return main;
}

function createWall(gtmCookiesConfig) {
  var wall = document.createElement("div");
  wall.setAttribute('id', 'consent-banner-js-wall');
  return wall;
}

function createModal(config) {
  var modal = document.createElement("div");
  modal.style.display = 'none';
  modal.setAttribute('id', 'consent-banner-js-modal');
  modal.innerHTML = '<div class="consent-banner-js-modal-wrapper"><div><h2></h2><p></p></div><div class="consent-banner-js-modal-buttons"><a class="button" href="#accept"></a><a class="button" href="#settings"></a></div></div>';
  modal.querySelector('h2').textContent = config.modal.title;
  modal.querySelector('p').innerHTML = applySimpleMarkdown(config.modal.description);
  modal.querySelector('[href="#accept"]').textContent = config.modal.buttons.accept;
  modal.querySelector('[href="#settings"]').textContent = config.modal.buttons.settings;
  return modal;
}

function createSettings(config, existingConsentState) {
  var isConsentProvided = isConsentStateProvided(existingConsentState);

  var settings = document.createElement("div");
  settings.setAttribute('id', 'consent-banner-js-settings');
  settings.style.display = 'none';
  settings.innerHTML = '<div><h2></h2><p></p><form><ul></ul><div class="consent-banner-js-settings-buttons"><a class="button" href="#save"></a><a class="button" href="#close"></a></div></form></div>';

  settings.querySelector('h2').textContent = config.settings.title;
  settings.querySelector('p').innerHTML = applySimpleMarkdown(config.settings.description);

  settings.querySelector('[href="#save"]').textContent = config.settings.buttons.save;
  settings.querySelector('[href="#close"]').textContent = config.settings.buttons.close;

  var consentTypes = config.consent_types;
  for (var key of Object.keys(consentTypes || {})) {
    var listItem = document.createElement('li');
    var listItemTitle = document.createElement('label');
    var listItemDescription = document.createElement('p');
    var listItemHidden = document.createElement('input');
    listItemHidden.setAttribute('type', 'hidden');
    listItemHidden.setAttribute('name', consentTypes[key].name);
    listItemHidden.setAttribute('value', 'denied');
    var listItemCheckbox = document.createElement('input');
    listItemCheckbox.setAttribute('type', 'checkbox');
    listItemCheckbox.setAttribute('name', consentTypes[key].name);
    listItemCheckbox.setAttribute('value', 'granted');
    listItemCheckbox.setAttribute('id', consentTypes[key].name);

    if (isConsentProvided && 'granted' === existingConsentState[consentTypes[key].name]
      || !isConsentProvided && 'granted' === consentTypes[key].default) {
      listItemCheckbox.setAttribute('checked', 'checked');
    }

    listItemTitle.textContent = consentTypes[key].title;
    listItemTitle.setAttribute('for', consentTypes[key].name);
    listItemDescription.innerHTML = applySimpleMarkdown(consentTypes[key].description);
    listItem.appendChild(listItemHidden);
    listItem.appendChild(listItemCheckbox);
    listItem.appendChild(listItemTitle);
    listItem.appendChild(listItemDescription);
    settings.querySelector('ul').appendChild(listItem);
  }


  return settings;
}


function hideMain(main) {
  main.style.display = 'none';
  hideWall(main);
}

function showWall(main) {
  var wall = main.querySelector('#consent-banner-js-wall');
  wall.style.background = 'rgba(0, 0, 0, .7)';
  wall.style.position = 'fixed';
  wall.style.top = '0';
  wall.style.right = '0';
  wall.style.left = '0';
  wall.style.bottom = '0';
}

function hideWall(main) {
  var wall = main.querySelector('#consent-banner-js-wall');
  wall.style.position = 'static';
  wall.style.background = 'none';
}

function showModal(main) {
  main.style.display = 'block';
  main.querySelector('#consent-banner-js-modal').style.display = 'block';
}

function hideModal(main) {
  main.style.display = 'block';
  main.querySelector('#consent-banner-js-modal').style.display = 'none';
}

function showSettings(main) {
  main.style.display = 'block';
  main.querySelector('#consent-banner-js-settings').style.display = 'block';
  showWall(main)
}

function hideSettings(main) {
  main.style.display = 'block';
  main.querySelector('#consent-banner-js-settings').style.display = 'none';
  hideWall(main)
}


function consentBannerJsMain(config) {
  var body = document.querySelector('body');

  var existingConsentState = loadConsentState();

  // create all components
  var main = createMain(config);
  var wall = createWall(config);
  var modal = createModal(config);
  var settings = createSettings(config, existingConsentState);

  main.appendChild(wall);
  wall.appendChild(modal);
  wall.appendChild(settings);


  // apply actions
  main.querySelector('[href="#accept"]').addEventListener('click', function(ev) {
    ev.preventDefault();
    var consentTypes = config.consent_types;
    var consentState = {};
    for (var key of Object.keys(consentTypes || {})) {
      var consentTypeName = consentTypes[key].name;
      consentState[consentTypeName] = 'granted';
    }
    saveConsentState(consentState);
    hideMain(main);
  });

  settings.querySelector('[href="#close"]').addEventListener('click', function(ev) {
    ev.preventDefault();
    hideSettings(main);
    if (!isConsentStateProvided(existingConsentState)) {
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
    settings.querySelector('form').requestSubmit();
  });

  settings.querySelector('form').addEventListener("submit", function(ev) {
    ev.preventDefault();
    const formData = new FormData(ev.target);

    consentState = Object.fromEntries(formData);
    saveConsentState(consentState);
    hideMain(main);
  });

  var settingsButton = body.querySelector('[href="#consent-banner-js-settings"]');
  if (null !== settingsButton) {
    settingsButton.addEventListener('click', function(ev) {
      ev.preventDefault();
      showSettings(main);
    });
  }

  body.appendChild(main);

  JSONtoStyles(main, config.styles);

  if (true !== isConsentStateProvided(existingConsentState)) {
    if (true === config.display.wall) {
      showWall(main);
    }

    if ('bar' === config.display.mode) {
      applyStyles(modal, {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        'border-bottom': 'none',
        'border-left': 'none',
        'border-right': 'none',
        'padding': '5px'
      });
      applyStyles(modal.querySelector('h2'), {
        display: 'none'
      });

      applyStyles(modal.querySelector('.consent-banner-js-modal-buttons'), {
        'margin-left': '20px'
      });
      showModal(main);
    }

    if ('modal' === config.display.mode) {
      applyStyles(modal, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      applyStyles(modal.querySelector('.consent-banner-js-modal-wrapper'), {
        display: 'block'
      });
      showModal(main);
    }

    if ('settings' === config.display.mode) {
      showSettings(main);
    }
  }

}

window.cookiesBannerJs = function(overrideLoadConsentState, overrideSaveConsentState, config) {
  loadConsentState = overrideLoadConsentState;
  saveConsentState = overrideSaveConsentState;
  ready(consentBannerJsMain.bind(null, config));
}



