# Perso Live SDK sample guide(node.js)

## Development Environment
Visual Studio Code  
Node.js (This sample was developed in Node.js v20.11.0)  

## Components
routes/+page.svelte - Sample page  
routes/session/+server.ts - GET /api/v1/session/  
routes/ices/+server.ts - GET /api/v1/session/{sessionId}/ice-servers/  
hooks.server.ts - Server side configuration  
static/favicon.png, static/global.css, static/index.js - Components of routes/+page.svelte  
https://est-perso-live.github.io/perso-live-sdk/js/v1.0.0/perso-live-sdk.js - PersoLiveSDK for JavaScript(v1.0.0)  

## Developing
Installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server.
```bash
npm install
```
```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building
To create a production version of this sample:
```bash
npm run build
```

You can preview the production build with `npm run preview`.
```bash
npm run preview
```

## PersoLiveSDK
[[PersoLiveSDK v1.0.0 README](https://est-perso-live.github.io/perso-live-sdk/js/v1.0.0)]