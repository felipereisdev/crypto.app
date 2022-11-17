const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        "productName": "Crypto",
        "appId": "com.crypto.app",
        "mac": {
          "icon": "public/icon.png"
        },
        "win": {
          "icon": "public/icon.png"
        },
        "linux": {
          "icon": "public/icon.png"
        }
      }
    }
  }
})
