const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printPage: () => ipcRenderer.send('print-page'),
  isDesktop: true
});
