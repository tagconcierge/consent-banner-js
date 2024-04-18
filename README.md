# Consent Banner JS

> <p align="center">A zero-dependency, lightweight (~1.9kB), consent platform agnostic, cookie banner for any website.</p>

![Consent Banner as a bottom bar](assets/consent-banner-js-demo.gif "Consent Banner Demo")

## Get started

Obviously, it's easy to get started.

First include simple CSS for the banner in the `<head>` of the page:
```html
<link rel="stylesheet" href="https://public-assets.tagconcierge.com/cookies-banner-js/1.0.0/styles/light.css" />
```

Then in the footer you can include the actual JS:

```html
<script src="https://public-assets.tagconcierge.com/cookies-banner-js/1.0.0/consent-banner.min.js"></script>
<script>
    cookiesBannerJs(
        loadConsentState,
        saveConsentState
        config
    );
</script>
```

In a nutshell you need to:

1. Load the styles CSS and `consent-banner.min.js` (obviously)
2. Call the global function called `cookiesBannerJs` with 3 parameters

**INFO:** You can call the `cookiesBannerJs` function whenever, wherever you want, inside it is wrapped with DOM Ready thingy.

To make that work you need to prepare **three** things:

1. A function to load the consent state from somewhere, for instance `localStorage` (see [examples](#examples))
2. A function to do something when the user provides their consent, for instance save it in `localStorage` (see [examples](#examples))
3. A config object that contains complete configuration for the whole thing (see [examples](#examples))


## Config Object


```js
{
    display: {
        mode: 'modal', // you can use 'modal' or 'bar'
        wall: true // covers the page with opaque layer to prevent user interactions
    },
    consent_types: [{
        name: 'ad_storage', // internal name of consent type, used for final JSON
        title: 'Ad Storage', // user facing title for consent type
        description: 'Cookies used for advertising purposes', // description visible in the settings view
        default: 'denied', // what should be the default state when user decides to customize the settings
        require: false // if set to true it won't be possible to save consent without this granted
    }],
    settings: {
        title: '',
        description: '',
        buttons: {
            save: '',
            close: ''
        }
    },
    modal: {
        title: '',
        description: '',
        buttons: {
            accept: '',
            settings: ''
        }
    }
}
```

## Styling

This banner comes with mininal set of CSS with all elements prefixed with `consent-banner-`.
Main elements have their IDs:

- `#consent-banner-main` - main wrapper element
- `#consent-banner-modal` - first view, centered modal or bottom bar
- `#consent-banner-settings` - shown when user clicks "settings" button

Buttons can be styles using following CSS selectors:

- `.consent-banner-button` - for all buttons
- `.consent-banner-button[href="#accept"]` - for approval buttons

## Examples

[Bottom bar without "wall"](./www/bar.html)

[Central modal with "wall"](./www/modal.html)

[Some snippets for Google Tag thing](./www/gtm.html)


## Installation

Just include the JS and optionally CSS in the page html.

There is a cool way to do it with Workers@Edge for instance CloudFlare Workers though. Check out this [example](./www/worker.js) to see how to quickly inject on any page without touching the source code.


## Development

We like docker so that's how get local dev server:

`docker-compose up -d dev`

But first, we need to install dependencies:

`docker-compose run dev npm i`

And if we need `node` cli we get into the a shell like that:

`docker-compose run --rm dev bash`

Finally, to build minified JS file we run:

`docker-compose run dev npm run build`
