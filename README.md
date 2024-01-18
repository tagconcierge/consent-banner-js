# Consent Banner JS

> <p align="center">A zero-dependency, lightweight (~1.9kB), consent platform agnostic, cookie banner for any website.</p>

![Consent Banner as a bottom bar](assets/banner-example-modal.png "Consent Banner Example")

## Get started

Obviously, it's easy:

```html
<script src="https://public-assets.tagconcierge.com/consent-banner.min.js"></script>
<script>
    cookiesBannerJs(
        loadConsentState,
        saveConsentState
        config
    );
</script>
```

In a nutshell you need to:

1. Load the `consent-banner.min.js` (obviously)
2. Call the function it register on the `window` object called `cookiesBannerJs`

**INFO:** You can call the `cookiesBannerJs` function whenever, wherever you want, inside it is wrapped with DOM Ready thing.

To make that work you need to prepare **three** things:

1. A function to load the consent state from somewhere, for instance `localStorage` (see [examples](#examples))
2. A function to do something when the user provides their consent, for instance save it in `localStorage` (see [examples](#examples))
3. A config object that contains complete configuration for the whole thing (see [examples](#examples))

## Styling

The goal for this project was to have one, single JS file to drop "somewhere" on a page and be done with minimal consent UI.
At the same time it does not include any defaults, no default content and no default styles.

A little extreme thing we did is to allow styling via JSON config file. It accepts parameter key as CSS selector and value which is an object of CSS properties and their final values. Please see [examples](#examples) (it is the fourth time I'm referring to them and I'm only on the line 37th so I hope they help).

## Examples

[Bottom bar without "wall"](./www/bar.html)

[Central modal with "wall"](./www/modal.html)

[Some snippets for Google Tag thing](./www/gtm.html)


## Development

We like docker so that's how get local dev server:

`docker-compose up -d dev`

And if we need `node` we get into the a shell like that:

`docker-compose run --rm dev bash`
