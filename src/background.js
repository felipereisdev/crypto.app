'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

import Store from 'electron-store';

import {api, service} from "@/api";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
    },
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

const store = new Store();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  try {
    await getAllPairs();
  } catch (e) {
    console.log(e);
  }

  createWindow()
})

async function getAllPairs() {
  const pairsExists = store.get('all_cryptos_pairs');

  if (pairsExists) {
    return pairsExists;
  }

  const response = await api.get('/exchangeInfo?permissions=SPOT');

  const allCryptosPairs = response.data.symbols ? response.data.symbols.map(pair => {
    let locale = '';
    let cash = '';

    switch (pair.quoteAsset) {
      case 'BRL':
        locale = 'pt-BR';
        cash = 'BRL';
        break;
      case 'EUR':
        locale = 'pt-PT';
        cash = 'EUR';
        break;
      default:
        locale = '';
        cash = '';
    }

    if ((!locale || !cash) && ['BUSD', 'USDC', 'USDT', 'DAI'].includes(pair.quoteAsset)) {
      locale = 'en-US';
      cash = 'USD';
    }

    return {
      symbol: pair.symbol,
      asset: `${pair.baseAsset}/${pair.quoteAsset}`,
      locale,
      cash
    }
  }) : [];

  store.set('all_cryptos_pairs', allCryptosPairs);

  return store.get('all_cryptos_pairs');
}

ipcMain.handle('get-database', (event, key) => {
  return store.get(key);
})

ipcMain.handle('set-database', (event, key) => {
  store.set(key[0], key[1]);
})

ipcMain.handle('delete-database', (event, key) => {
  store.delete(key);
})

ipcMain.handle('get-prices', async () => {
  try {
      const myPairs = store.get('my_cryptos_pairs');
      const parseMyPairs = myPairs.map(pair => `"${pair.symbol}"`);
      const response = await api.get(`/ticker/24hr?symbols=[${parseMyPairs.join(',')}]`);

      return response.data;
  } catch (e) {
    console.log(e);
  }
})

ipcMain.handle('get-news', async (event, url) => {
  const newsExists = store.get('news');

  if (newsExists) {
    return newsExists;
  }

  try {
    const response = await service.get(`https://api.rss2json.com/v1/api.json?rss_url=${url}`);

    if (response && response.data && response.data.items) {
      store.set('news', response.data.items);

      return store.get('news');
    }
  } catch (e) {
    console.log(e);
  }
})

ipcMain.handle('get-all-pairs', async () => {
  try {
    return await getAllPairs();
  } catch (e) {
    console.log(e);
  }
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}