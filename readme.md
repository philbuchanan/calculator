# Calculator

**A calculator iOS web app.**

## Support

The current version has been fully tested on iOS 15 running on iPhone 12.

## Features

- full standard calculator functions
- brackets
- invert individual numbers (+/-)
- backspace
- calculation history
- HTML5 app caching (so it'll work offline)

### History

Every time you tap the equals button the result of the current equation is saved to the history list. The number of history items saved can be set in settings.

Any history item can be used in the current equation by simply tapping on it in the history list.

The history can be cleared in settings.

### HTML5 App Caching

The app will function completely without any sort of internet connection. The entire app state is saved between app runs as well.

If an internet connection is present, the app will automatically check for updates. If any updates are available it will download them and new bug fixes and features will be available on the next app run.

## Privacy

I take privacy seriously. Absolutely no personal or identifiable information is tracked. As such, if you decide to use the app, please let me know.

## Questions / Suggestions / Bug Reports

If you'd like to get in touch please find me on my website [philbuchanan.com](https://philbuchanan.com).

## Deploy

```
git subtree push --prefix build origin gh-pages
```
