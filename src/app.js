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

function applySimpleMarkdown(text) {
  return (text || '')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*\s?([^\n]+)\*\*/g, '<b>$1</b>')
    .replace(/\_\_\s?([^\n]+)\_\_/g, '<b>$1</b>')
    .replace(/\*\s?([^\n]+)\*/g, '<i>$1</i>')
    .replace(/\_\s?([^\n]+)\_/g, '<i>$1</i>');
}

function createAndApplyButton(name, text, parent) {
  if (text === undefined || text === null || text === '') {
    return;
  }
  var btn = document.createElement('a');
  btn.setAttribute('href', '#' + name);
  btn.classList.add('consent-banner-button');
  btn.textContent = text;
  parent.appendChild(btn);
}

function addEventListener(elements, event, callback) {
  if (elements === null) {
    return null;
  }
  if (elements.addEventListener) {
    elements.addEventListener(event, callback)
  }
  if (elements.forEach) {
    elements.forEach(el => el.addEventListener(event, callback));
  }
}

function dispatchBodyEvent(eventName) {
  document.body.dispatchEvent(new CustomEvent('consent-banner.' + eventName));
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
function createMain(config) {
  var main = document.createElement("div");
  main.setAttribute('id', 'consent-banner-main');
  main.setAttribute('data-mode', config.display.mode);
  main.setAttribute('data-wall', config.display.wall ?? false);
  main.style.display = 'none';
  return main;
}

function createWall(config) {
  var wall = document.createElement("div");
  wall.setAttribute('id', 'consent-banner-wall');
  return wall;
}

function createModal(config) {
  var modal = document.createElement("div");
  modal.style.display = 'none';
  modal.setAttribute('id', 'consent-banner-modal');
  modal.innerHTML = '<div class="consent-banner-modal-wrapper"><div><h2></h2><p></p></div><div class="consent-banner-modal-buttons"></div></div>';
  modal.querySelector('h2').textContent = config.modal.title;
  modal.querySelector('p').innerHTML = applySimpleMarkdown(config.modal.description);
  var buttons = modal.querySelector('.consent-banner-modal-buttons');

  createAndApplyButton('settings', config.modal.buttons.settings, buttons);
  createAndApplyButton('close', config.modal.buttons.close, buttons);
  createAndApplyButton('reject', config.modal.buttons.reject, buttons);
  createAndApplyButton('accept', config.modal.buttons.accept, buttons);
  return modal;
}

function createSettings(config, existingConsentState) {
  var isConsentProvided = isConsentStateProvided(existingConsentState);

  var settings = document.createElement("div");
  settings.setAttribute('id', 'consent-banner-settings');
  settings.style.display = 'none';
  settings.innerHTML = '<div><form><h2></h2><div><p></p><ul></ul></div><div class="consent-banner-settings-buttons"></div></form></div>';

  settings.querySelector('h2').textContent = config.settings.title;
  settings.querySelector('p').innerHTML = applySimpleMarkdown(config.settings.description);

  var buttons = settings.querySelector('.consent-banner-settings-buttons');

  createAndApplyButton('reject', config.settings.buttons.reject, buttons);
  createAndApplyButton('close', config.settings.buttons.close, buttons);
  createAndApplyButton('save', config.settings.buttons.save, buttons);
  createAndApplyButton('accept', config.settings.buttons.accept, buttons);

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

    if (isConsentProvided && 'denied' === existingConsentState[consentTypes[key].name]
      || !isConsentProvided && 'denied' === consentTypes[key].default) {
      listItemCheckbox.removeAttribute('checked');
    }

    if (consentTypes[key].default === 'required') {
      listItemCheckbox.setAttribute('checked', 'checked');
      listItemCheckbox.setAttribute('disabled', 'disabled');
      listItemHidden.setAttribute('value', 'granted');
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

function updateSettings(settings, config, existingConsentState) {
  var isConsentProvided = isConsentStateProvided(existingConsentState);
  var consentTypes = config.consent_types;
  for (var key of Object.keys(consentTypes || {})) {
    var listItemCheckbox = settings.querySelector('[type="checkbox"][name="'+consentTypes[key].name+'"]');
    if (isConsentProvided && 'granted' === existingConsentState[consentTypes[key].name]
      || !isConsentProvided && 'granted' === consentTypes[key].default) {
      listItemCheckbox.setAttribute('checked', 'checked');
    }
    if (isConsentProvided && 'denied' === existingConsentState[consentTypes[key].name]
      || !isConsentProvided && 'denied' === consentTypes[key].default) {
      listItemCheckbox.removeAttribute('checked');
    }

    if (consentTypes[key].default === 'required') {
      listItemCheckbox.setAttribute('checked', 'checked');
      listItemCheckbox.setAttribute('disabled', 'disabled');
    }
  }
}


function hideMain(main) {
  main.style.display = 'none';
  hideWall(main);
}

function showWall(main) {
  var wall = main.querySelector('#consent-banner-wall');
  wall.style.background = 'rgba(0, 0, 0, .7)';
  wall.style.position = 'fixed';
  wall.style.top = '0';
  wall.style.right = '0';
  wall.style.left = '0';
  wall.style.bottom = '0';
}

function hideWall(main) {
  var wall = main.querySelector('#consent-banner-wall');
  wall.style.position = 'static';
  wall.style.background = 'none';
}

function showModal(main) {
  main.style.display = 'block';
  main.querySelector('#consent-banner-modal').style.display = 'block';
}

function hideModal(main) {
  main.style.display = 'block';
  main.querySelector('#consent-banner-modal').style.display = 'none';
}

function showSettings(main) {
  main.style.display = 'block';
  main.querySelector('#consent-banner-settings').style.display = 'block';
  showWall(main)
}

function hideSettings(main) {
  main.style.display = 'block';
  main.querySelector('#consent-banner-settings').style.display = 'none';
  if ('true' !== main.getAttribute('data-wall') || isConsentStateProvided(loadConsentState())) {
    hideWall(main);
  }
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
  addEventListener(settings.querySelector('[href="#accept"]'), 'click', function(ev) {
    ev.preventDefault();
    var consentTypes = config.consent_types;
    var consentState = {};
    for (var key of Object.keys(consentTypes || {})) {
      var consentTypeName = consentTypes[key].name;
      consentState[consentTypeName] = 'granted';
    }
    updateSettings(settings, config, consentState);
    saveConsentState(consentState);
    hideMain(main);
    dispatchBodyEvent('hidden');
  });

  addEventListener(modal.querySelector('[href="#accept"]'), 'click', function(ev) {
    ev.preventDefault();
    var consentTypes = config.consent_types;
    var consentState = {};
    for (var key of Object.keys(consentTypes || {})) {
      var consentTypeName = consentTypes[key].name;
      consentState[consentTypeName] = 'granted';
    }
    updateSettings(settings, config, consentState);
    saveConsentState(consentState);
    hideMain(main);
    dispatchBodyEvent('hidden');
  });

  addEventListener(settings.querySelector('[href="#close"]'), 'click', function(ev) {
    ev.preventDefault();
    hideSettings(main);
    if (!isConsentStateProvided(loadConsentState())) {
      showModal(main);
    } else {
      dispatchBodyEvent('hidden');
    }
  });

  addEventListener(modal.querySelector('[href="#settings"]'), 'click', function(ev) {
    ev.preventDefault();
    hideModal(main);
    showSettings(main);
    dispatchBodyEvent('shown');
  });

  addEventListener(modal.querySelector('[href="#reject"]'),'click', function(ev) {
    ev.preventDefault();
    var consentTypes = config.consent_types;
    var consentState = {};
    for (var key of Object.keys(consentTypes || {})) {
      var consentTypeName = consentTypes[key].name;
      consentState[consentTypeName] = 'denied';
    }
    saveConsentState(consentState);
    updateSettings(settings, config, consentState);
    hideMain(main);
    dispatchBodyEvent('hidden');
  });

  addEventListener(settings.querySelector('[href="#reject"]'), 'click', function(ev) {
    ev.preventDefault();
    var consentTypes = config.consent_types;
    var consentState = {};
    for (var key of Object.keys(consentTypes || {})) {
      var consentTypeName = consentTypes[key].name;
      consentState[consentTypeName] = 'denied';
    }
    saveConsentState(consentState);
    updateSettings(settings, config, consentState);
    hideMain(main);
    dispatchBodyEvent('hidden');
  });


  addEventListener(settings.querySelector('[href="#save"]'), 'click', function(ev) {
    ev.preventDefault();
    settings.querySelector('form').requestSubmit();
  });

  addEventListener(settings.querySelector('form'), "submit", function(ev) {
    ev.preventDefault();
    const formData = new FormData(ev.target);

    consentState = Object.fromEntries(formData);
    saveConsentState(consentState);
    updateSettings(settings, config, consentState);
    hideMain(main);
    dispatchBodyEvent('hidden');
  });

  addEventListener(body.querySelectorAll('[href$="#consent-banner-settings"]'), 'click', function(ev) {
    ev.preventDefault();
    showSettings(main);
    hideModal(main);
    dispatchBodyEvent('shown');
  });

  addEventListener(body, 'consent-banner.show-settings', function(ev) {
    ev.preventDefault();
    showSettings(main);
    hideModal(main);
    dispatchBodyEvent('shown');
  });

  body.appendChild(main);

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

      applyStyles(modal.querySelector('.consent-banner-modal-buttons'), {
        'margin-left': '20px'
      });
      showModal(main);
      dispatchBodyEvent('shown');
    }

    if ('modal' === config.display.mode) {
      applyStyles(modal, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      applyStyles(modal.querySelector('.consent-banner-modal-wrapper'), {
        display: 'block'
      });
      showModal(main);
      dispatchBodyEvent('shown');
    }

    if ('settings' === config.display.mode) {
      showSettings(main);
      dispatchBodyEvent('shown');
    }
  }

}

window.cookiesBannerJs = function(overrideLoadConsentState, overrideSaveConsentState, config) {
  loadConsentState = overrideLoadConsentState;
  saveConsentState = overrideSaveConsentState;
  ready(consentBannerJsMain.bind(null, config));
}

window.dispatchEvent(new CustomEvent('consent-banner.ready'));
