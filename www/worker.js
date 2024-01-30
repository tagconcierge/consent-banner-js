addEventListener("fetch", (event) => {
    event.respondWith(
        handleRequest(event.request).catch(
            (err) => new Response(err.stack, { status: 500 })
        )
    );
});

class HeadHandler {
    element(element) {
        element.prepend(`<script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            // Set default consent to 'denied' as a placeholder
            // Determine actual values based on your own requirements
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied'
            });
            try {
                var consentPreferences = JSON.parse(localStorage.getItem('consent_preferences'));
                if (consentPreferences !== null) {
                   gtag('consent', 'update', consentPreferences);
                }
              } catch (error) {}
            </script>`, { html: true });
    }
}


class BodyHandler {
    element(element) {
        element.append(`<script>
            var config = {
                display: {
                    mode: "bar"
                },
                consent_types: [{
                    name: 'analytics_storage',
                    title: "Analytics storage",
                    description: 'These cookies help us understand how visitors interact with our website. Measure and analyze traffic to improve our service.',
                    default: 'denied'
                }, {
                    name: "ad_storage",
                    title: "Ads storage",
                    description: "These cookies help us run ads conversion tracking.",
                    default: 'denied'
                }, {
                    name: 'ad_user_data',
                    title: "User Data",
                    description: 'These cookies helps us optimise advertising campaigns by sharing some of the user data with 3rd party services',
                    default: 'denied'
                }, {
                    name: 'ad_personalization',
                    title: "Personalization",
                    description: 'These cookies allows us to personalise ads',
                    default: 'denied'
                }],
                settings: {
                    title: "Cookies Settings",
                    description: "We use cookies to improve user experience. Choose what cookie categories you allow us to use. You can read more about our [Privacy Policy](/privacy-policy)",
                    buttons: {
                        save: "Save preferences",
                        close: "Close"
                    }
                },
                modal: {
                    title: 'Cookies',
                    description: 'We are using various cookies files. Learn more in our [privacy policy](/privacy-policy) and make your choice.',
                    buttons: {
                        accept: 'Accept',
                        settings: 'Settings'
                    }
                },
                styles: {
                    '.button': {
                        'text-decoration': 'none',
                        background: 'none',
                        color: '#333333',
                        padding: '4px 10px',
                        'border': '1px solid #000',
                        'text-wrap': 'nowrap'
                    },
                    '#consent-banner-js-modal': {
                        background: "#fff",
                        padding: '10px 30px 30px',
                        'box-shadow': 'rgba(0, 0, 0, 0.4) 0 0 20px',
                        'z-index': '999',
                    },
                    '#consent-banner-js-modal .consent-banner-js-modal-wrapper': {
                      margin: '0 auto',
                      display: 'flex',
                      'justify-content': 'center'
                    },
                    '#consent-banner-js-modal .consent-banner-js-modal-buttons': {
                      'margin-top': '12px',
                      'text-align': 'right'
                    },
                    '#consent-banner-js-modal .consent-banner-js-modal-buttons [href="#accept"]': {
                        'color': 'rgb(255 255 255)',
                        'border': '1px solid #083b99',
                        'background-color': '#083b99'
                    },
                    '#consent-banner-js-modal .consent-banner-js-modal-buttons [href="#settings"]': {
                        'margin-left': '10px'
                    },
                    '#consent-banner-js-settings .consent-banner-js-settings-buttons': {
                      'margin-top': '12px',
                      'text-align': 'right'
                    },
                    '#consent-banner-js-settings .consent-banner-js-settings-buttons [href="#save"]': {
                        'color': 'rgb(255 255 255)',
                        'border': '1px solid #083b99',
                        'background-color': '#083b99'
                    },
                    '#consent-banner-js-settings .consent-banner-js-settings-buttons [href="#close"]': {
                        'margin-left': '10px'
                    },
                    '#consent-banner-js-settings': {
                      position: 'fixed',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      background: '#fff',
                      'box-shadow': 'rgba(0, 0, 0, 0.4) 0 0 20px',
                      padding: '10px 30px 30px',
                      'overflow-x': 'scroll',
                      'max-height': '100%',
                      'min-width': '250px'
                    },
                    '#consent-banner-js-settings ul': {
                      'list-style': 'none',
                      'padding-left': 0
                    },
                    '#consent-banner-js-settings ul label': {
                        'font-weight': 'bold',
                        'font-size': '1.1em',
                        'margin-left': '5px'
                    },
                    '#consent-banner-js-settings ul li': {
                        'border-bottom': '1px solid rgba(0, 0, 0, .2)',
                        'margin-bottom': '15px'
                    },
                    '#consent-banner-js-settings ul p': {
                        'margin-left': '25px'
                    },
                    '#consent-banner-js-wall': {
                        'z-index': '999',
                    }
                }
            };
            </script>
            <script src="https://public-assets.tagconcierge.com/consent-banner.min.js?v=1.0.0"></script>
            <script>
              cookiesBannerJs(
                function() {
                  try {
                    return JSON.parse(localStorage.getItem('consent_preferences'));
                  } catch (error) {
                    return null;
                  }
                },
                function(consentState) {
                  gtag('consent', 'update', consentState);
                  localStorage.setItem('consent_preferences', JSON.stringify(consentState));
                },
                config
              );
            </script>`, { html: true });
    }
}

async function handleRequest(request) {

    const url = new URL(request.url)
    const res = await fetch(request)

    return new HTMLRewriter()
      .on("head", new HeadHandler())
      .on("body", new BodyHandler())
      .transform(res)
}
