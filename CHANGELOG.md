# Changelog

## 2.0.0

- switched to native `<dialog>` element to simplify the code
- removed `<hx>` tags to avoid heading hierarchy issues for SEO reasons

Breaking changes in custom styling selectors:

- `h2` needs to be replaced with `.consent-banner-heading`
- `#consent-banner-wall` is removed and can be replaced with `#consent-banner-modal::backdrop` or `#consent-banner-settings::backdrop`

## 1.2.3

- fixed consent settings modal closing issue
- improved consent settings opener event listener

## 1.2.2

- fixed appearance issues on mobile devices

## 1.2.1

- changed the element on which the 'consent-banner.ready' event is called from document.body to window

## 1.2.0

- added 'consent-banner.ready' event triggered immediate after library loading
- reduced library file size for improved performance

## 1.1.1

- introduced bundled version with CSS included

## 1.1.0

- prevent showing buttons if their text is empty
- added close button (with the change above you can control which buttons you use providing or not their text)
- introduced changelog
- fixed examples linking
- dropped JSON styling (require adding separate CSS stylesheet, we will provide bundle JS soon)