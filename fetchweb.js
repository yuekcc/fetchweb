const pie = require('puppeteer-in-electron');

function sleep(timeout = 5000) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

const actions = {};
function regAction(name, impl) {
  actions[name] = impl;
}

regAction('openUrl', async ({ page, url }) => {
  await page.goto(url);
  await page.waitForNetworkIdle();
});

async function findAll({ browser, selector }) {
  const selectors = Array.isArray(selector) ? selector : [selector];

  // the obj maybe Target/Page/ElementHandle
  let obj;
  for (const s of selectors) {
    if (s.window) {
      const targetList = await browser.targets();
      const target = targetList.find(target => {
        console.log('find target by url, current url: %s, want: %s', target?.url(), s.window.src);
        return target.url && target.url() === s.window.src;
      });
      if (target) {
        obj = await target.page();
        continue;
      }
    }

    if (s.xpath && obj) {
      console.log('test xpath: %s, el is %s', s.xpath, obj.constructor?.name);

      const handle = Array.isArray(obj) ? obj[0] : obj;
      obj = await handle.$x(s.xpath);

      const _handle = Array.isArray(obj) ? obj[0] : obj;
      if (_handle.contentFrame && typeof _handle.contentFrame === 'function') {
        const frame = await _handle.contentFrame();
        if (frame) {
          obj = frame;
          console.log('find an iframe');
        }
      }

      continue;
    }
  }

  return obj;
}

async function findOne({ browser, selector }) {
  const el = await findAll({ browser, selector });
  return Array.isArray(el) ? el[0] : el;
}

regAction('findAndClick', async ({ browser, selector }) => {
  let _el = await findOne({ browser, selector });
  if (_el) {
    const waitForTarget = () => new Promise(resolve => browser.once('targetcreated', t => resolve(t)));
    const emitClick = () => _el.click();

    await Promise.all([emitClick(), waitForTarget()]);
  }
});

async function getText({ browser, selector }) {
  let _el = await findOne({ browser, selector });
  if (_el) {
    const text = await _el.evaluate(node => node.innerText);
    console.log('result: %s', text);

    return text;
  }
}

regAction('getText', getText);

regAction('assert', async ({ browser, selector, method, expect }) => {
  const actual = await getText({ browser, selector });
  const result = actual === expect;
  console.log('assert, method: %s, expect: %s, actual: %s, result is: %s', method, expect, actual, result);
});

class Command {
  constructor(params) {
    this.params = params;
  }
  async execute() {
    const f = actions[this.params.type];
    if (f) {
      console.log('[CMD] run action: %s', this.params.type);
      await f(this.params);
    } else {
      console.log('[CMD] not support action: %s', this.params.type);
    }
  }
}

exports.FetchWeb = class {
  /**
   * FetchWeb
   * @param {import('puppeteer-core').Browser} browser
   * @param {import('electron').BrowserWindow} window
   * @param {Record<string, any>} options
   */
  constructor(browser, window, options) {
    this._browser = browser;
    this._window = window;
    this._options = options;
  }

  async run(script) {
    const browser = this._browser;
    const window = this._window;

    const page = await pie.getPage(browser, window);

    console.log(`running fetch-web script, name: %s`, script.name);

    for (const step of script.steps) {
      const command = new Command({
        browser,
        page,
        window,
        ...step,
      });

      await command.execute();
    }

    await sleep(1000);
  }
};
