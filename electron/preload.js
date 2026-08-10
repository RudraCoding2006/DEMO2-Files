import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  printPage: () => ipcRenderer.send('print-page'),
  isDesktop: true
});
