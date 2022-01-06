const { BrowserWindow, app } = require('electron');
const fs = require('fs-extra');
const pie = require('puppeteer-in-electron');
const puppeteer = require('puppeteer-core');
const YAML = require('yaml');

const { FetchWeb } = require('./fetchweb');

!(async () => {
  app.commandLine.appendSwitch('--ignore-certificate-errors');
  app.commandLine.appendSwitch('--disable-gpu');

  console.log('argv is', process.argv);

  await pie.initialize(app);
  const browser = await pie.connect(app, puppeteer);
  app.on('window-all-closed', () => {
    console.log('all window closed, bye.');
    app.quit();
  });

  app.on('browser-window-created', (_, win) => {
    win.maximize();
    win.show();
  });

  const window = new BrowserWindow({ show: false, hasShadow: false });
  await window.loadURL('about:blank');

  const fetchWeb = new FetchWeb(browser, window);
  try {
    const scriptYml = fs.readFileSync('demo.yml', 'utf-8');
    const script = YAML.parse(scriptYml);

    await fetchWeb.run(script);
  } catch (err) {
    console.error(err);
  } finally {
    window.destroy();
  }
})();
