# Asimov AI Writing Assistant

A GitHub Pages-ready static frontend for a cyberpunk-style AI writing and translation assistant.

## Files

- `index.html` - Home page with mode selection.
- `translate.html` - Translation mode.
- `writing.html` - English writing mode.
- `style.css` - Shared cyberpunk visual styles.
- `app.js` - Shared frontend logic and backend proxy placeholder.
- `space-bg.js` - Three.js cyberpunk particle background for the home page.
- `assets/` - Put visual assets here, including `home-bg.jpg`.
- `server/` - Tencent Cloud Serverless DeepSeek proxy.

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

## Tencent Cloud Function Deployment

The backend proxy is in `server/` and is designed for Tencent Cloud Cloud Function / Serverless with API Gateway.

1. Open Tencent Cloud Serverless Cloud Function.
2. Create a new function.
3. Choose Node.js 18 or newer.
4. Use the `server/` folder as the function source code.
5. Set the entry file to `index.js`.
6. Set the handler to:

```text
index.main
```

7. Add an environment variable:

```text
DEEPSEEK_API_KEY=your_deepseek_api_key
```

8. Create an API Gateway trigger for HTTP access.
9. Enable POST and OPTIONS requests if the console asks for methods.
10. Deploy the function and copy the public access URL.

Then open `app.js` and replace:

```js
const API_URL = "YOUR_BACKEND_PROXY_URL";
```

with your Tencent Cloud function/API Gateway URL, for example:

```js
const API_URL = "https://your-api-gateway-url";
```

The frontend sends:

```json
{
  "mode": "translate",
  "input": "User text"
}
```

The cloud function returns:

```json
{
  "answer": "AI response text"
}
```

Never put your DeepSeek API key in `app.js`, HTML, CSS, or any browser-side file.
