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

function createModal(config) {
  var modal = document.createElement("dialog");
  modal.setAttribute('id', 'consent-banner-modal');
  modal.setAttribute('closedby', 'none');
  modal.innerHTML = '<div class="consent-banner-modal-wrapper"><div><span class="consent-banner-heading"></span><p></p></div><div class="consent-banner-modal-buttons"></div></div>';
  modal.querySelector('.consent-banner-heading').textContent = config.modal.title;
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

  var settings = document.createElement("dialog");
  settings.setAttribute('id', 'consent-banner-settings');
  settings.setAttribute('closedby', 'none');
  settings.innerHTML = '<div><form><span class="consent-banner-heading"></span><div><p></p><ul></ul></div><div class="consent-banner-settings-buttons"></div></form></div>';

  settings.querySelector('.consent-banner-heading').textContent = config.settings.title;
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
  var modal = main.querySelector('#consent-banner-modal');
  var settings = main.querySelector('#consent-banner-settings');
  modal.close();
  settings.close();
  main.style.display = 'none';
}

function showModal(main) {
  main.style.display = 'block';
  var modal = main.querySelector('#consent-banner-modal');
  if (main.getAttribute('data-mode') === 'bar' && main.getAttribute('data-wall') !== 'true') {
    modal.show();
  } else {
    modal.showModal();
  }
}

function hideModal(main) {
  var modal = main.querySelector('#consent-banner-modal');
  modal.close();
  if (!main.querySelector('#consent-banner-settings').open) {
    main.style.display = 'none';
  }
}

function showSettings(main) {
  main.style.display = 'block';
  var settings = main.querySelector('#consent-banner-settings');
  if (main.getAttribute('data-mode') === 'bar' && main.getAttribute('data-wall') !== 'true') {
    settings.show();
  } else {
    settings.showModal();
  }
}

function hideSettings(main) {
  var settings = main.querySelector('#consent-banner-settings');
  settings.close();
  if (!main.querySelector('#consent-banner-modal').open) {
    main.style.display = 'none';
  }
}


function consentBannerJsMain(config) {
  var body = document.querySelector('body');

  var existingConsentState = loadConsentState();

  // create all components
  var main = createMain(config);
  var modal = createModal(config);
  var settings = createSettings(config, existingConsentState);

  main.appendChild(modal);
  main.appendChild(settings);


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

    const consentState = Object.fromEntries(formData);
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
      // showWall(main); // This line is removed as per the edit hint
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
        'border-radius': '0',
        'padding': '5px'
      });
      applyStyles(modal.querySelector('.consent-banner-heading'), {
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

window.cookiesBannerJs = function(overrideLoadConsentState, overrideSaveConsentState, config, disableDomReadyHandler = false) {
  loadConsentState = overrideLoadConsentState;
  saveConsentState = overrideSaveConsentState;
  if (false === disableDomReadyHandler) {
    ready(consentBannerJsMain.bind(null, config));
  } else {
    consentBannerJsMain(config);
  }
}

window.dispatchEvent(new CustomEvent('consent-banner.ready'));
