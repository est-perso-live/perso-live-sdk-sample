# Perso Live SDK sample guide(node.js)

## Development Environment
Visual Studio Code  
Node.js (This sample was developed in Node.js v20.11.0)  

## Components
routes/+page.svelte - Sample page  
hooks.server.ts - Server side configuration  
static/favicon.png, static/global.css, static/index.js - Components of routes/+page.svelte  
static/wav-recorder.js - Used for mediastream recording  
https://est-perso-live.github.io/perso-live-sdk/js/v1.0.8/perso-live-sdk.js - PersoLiveSDK for JavaScript(v1.0.8)  

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
[[PersoLiveSDK v1.0.8 README](https://est-perso-live.github.io/perso-live-sdk/js/v1.0.8)]