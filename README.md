# Asimov AI Writing Assistant

A GitHub Pages-ready static frontend for a cyberpunk-style AI writing and translation assistant.

## Files

- `index.html` - Home page with mode selection.
- `translate.html` - Translation mode.
- `writing.html` - English writing mode.
- `style.css` - Shared cyberpunk visual styles.
- `app.js` - Shared frontend logic and backend proxy placeholder.
- `assets/` - Put visual assets here, including `home-bg.png`.

## Local Preview

Open `index.html` directly in a browser, or serve the folder with any static server.

## GitHub Pages

1. Push this folder to a GitHub repository.
2. Open the repository settings.
3. Go to Pages.
4. Choose the branch and root folder.
5. Save, then wait for GitHub Pages to publish the site.

## DeepSeek Backend Proxy

Open `app.js` and replace:

```js
const API_URL = "YOUR_BACKEND_PROXY_URL";
```

with your own backend or serverless proxy URL.

For security, do not expose your DeepSeek API key in frontend code. Keep the API key on your backend server or cloud function, and let this frontend call only your own proxy endpoint.
