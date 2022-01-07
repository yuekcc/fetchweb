# fetchweb

🚧🚧 概念产品，请勿直接用于生产环境 🚧🚧

基于 electron + puppeteer 的 ui 自动化工具。

- [x] 基于 puppeteer 实现页面操作
- [x] 集成到 electron
- [x] 基于 yaml 的 DSL

## 脚本示例

```yaml
---
name: fetch-demo-site
steps:
  # 表示开始
  - type: start
  # 进入 URL
  - type: openUrl
    url: http://localhost:10086/
  # 点击某个元素
  - type: click
    selector: # selector 总是从根窗口开始
      - window:
          src: http://localhost:10086/
      - xpath: /html/body/a
  # 在打印某个元素文本数据（到日志）
  - type: print
    selector:
      - window:
          src: http://localhost:10086/iframe-1.html
      - xpath: /html/body/iframe
      - xpath: /html/body/div
  # 断言
  - type: assert
    method: eq # 比较方法，目前只支持字符串相等（==）
    expect: 'iframe-inner-1'
    selector:
      - window:
          src: http://localhost:10086/iframe-1.html
      - xpath: /html/body/iframe
      - xpath: /html/body/div
  # 表示结束
  - type: end
```

## 体验

```sh
$ npm run serve-demo-site&
$ npm start
```

## LICENSE

[MIT](LICENSE)
