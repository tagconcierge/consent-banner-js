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




function render() {

}

function applyStyles(el, styles) {
  if (null === el) return;
  for (var key of Object.keys(styles)) {
    el.style[key] = styles[key];
  }
}

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
  return config.content.modal.consent_types.reduce(function(agg, configType) {
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

function hideMain(main) {
  main.style.display = 'none';
  hideWall(main);
}

function showWall(main) {
  var wall = main.querySelector('#gtm-cookies-wall');
  wall.style.background = 'rgba(255, 255, 128, .5)';
  wall.style.position = 'absolute';
  wall.style.top = '0';
  wall.style.right = '0';
  wall.style.left = '0';
  wall.style.bottom = '0';
}

function hideWall(main) {
  var wall = main.querySelector('#gtm-cookies-wall');
  wall.style.position = 'relative';
  wall.style.background = 'none';
}

function showModal(main) {
  main.style.display = 'block';
  main.querySelector('#gtm-cookies-modal').style.display = 'block';
  main.querySelector('#gtm-cookies-bar').style.display = 'none';
}

function showBar(main) {
  main.style.display = 'block';
  main.querySelector('#gtm-cookies-modal').style.display = 'none';
  main.querySelector('#gtm-cookies-bar').style.display = 'block';
}


ready(function app() {

  var existingConsentState = loadConsentState();
  var consentState = (null !== existingConsentState) ? existingConsentState : getDefaultConsentState(gtmCookiesConfig);
  pushConsentState(consentState);

  var main = document.createElement("div");
  main.setAttribute('id', 'gtm-cookies-main');

  var wall = document.createElement("div");
  wall.setAttribute('id', 'gtm-cookies-wall');

  var bar = document.createElement("div");
  bar.setAttribute('id', 'gtm-cookies-bar');
  var barText = 'Our page is using cookies [accept all](#accept) [adjust settings](#modal).';

  bar.innerHTML = barText.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
  applyStyles(bar.querySelector('[href="#accept"]'), gtmCookiesConfig.styles.buttons);
  applyStyles(bar.querySelector('[href="#modal"]'), gtmCookiesConfig.styles.buttons);
  applyStyles(bar.querySelector('[href="#close"]'), gtmCookiesConfig.styles.buttons);

  bar.querySelector('[href="#accept"]').addEventListener('click', function(ev) {
    ev.preventDefault();
    setConsentState(consentState, 'granted');
    pushConsentState(consentState);
    saveConsentState(consentState);
    hideMain(main);
  });

  // bar.querySelector('[href="#accept"]').style.display = "inline-block"
  // bar.querySelector('[href="#accept"]').style['text-decoration'] = "none"
  // bar.querySelector('[href="#accept"]').style['border'] = "1px solid black"

  var modal = document.createElement("div");
  modal.setAttribute('id', 'gtm-cookies-modal');

  var title = document.createElement("h1");
  var form = document.createElement("form");
  title.textContent = "foo";
  modal.appendChild(title);
  modal.appendChild(form);

  var list = document.createElement("ul");

  var consentTypes = gtmCookiesConfig.content.modal.consent_types;
  for (var key of Object.keys(consentTypes)) {
    var listItem = document.createElement('li');
    var listItemTitle = document.createElement('h3');
    var listItemDescription = document.createElement('p');
    var listItemCheckbox = document.createElement('input');
    listItemCheckbox.setAttribute('type', 'checkbox');
    listItemCheckbox.setAttribute('name', consentTypes[key].name);
    listItemCheckbox.setAttribute('value', 'granted');

    listItemTitle.textContent = consentTypes[key].title;
    listItemDescription.textContent = consentTypes[key].description;
    listItem.appendChild(listItemTitle);
    listItem.appendChild(listItemDescription);
    listItem.appendChild(listItemCheckbox);
    list.appendChild(listItem);
  }
  form.appendChild(list);

  main.appendChild(wall);
  wall.appendChild(bar);
  wall.appendChild(modal);

  if (true === gtmCookiesConfig.display.wall) {
    showWall(main);
  }

  if (true === isConsentStateProvided()) {
    hideMain(main);
  }

  var body = document.querySelector('body');

  var settingsButton = body.querySelector('[href="#gtm-cookies-settings"]');
  if (null !== settingsButton) {
    settingsButton.addEventListener('click', function(ev) {
      ev.preventDefault();
      showModal(main);
    });
  }


  body.appendChild(main);
});