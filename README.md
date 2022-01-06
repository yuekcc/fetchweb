# fetchweb

🚧🚧 概念产品，请勿直接用于生产环境 🚧🚧

基于 electron + puppeteer 的 ui 自动化工具。

- [x] 基于 puppeteer 实现页面操作
- [x] 可以集成到 electron
  - Linux 环境需要 Xvfb 支持
- [x] DSL

## 脚本示例

使用 yaml 语法描述的脚本。如：

```yaml
---
name: fetch-demo-site
steps:
  - type: openUrl
    url: http://localhost:10086/
  - type: findAndClick
    selector: # selector 总是从根窗口开始
      - window:
          src: http://localhost:10086/
      - xpath: /html/body/a
  - type: getText # 获取文本
    selector:
      - window:
          src: http://localhost:10086/iframe-1.html
      - xpath: /html/body/iframe
      - xpath: /html/body/div
  - type: assert # 断言
    method: eq # 比较方法，目前只支持字符串相等（==）
    expect: 'iframe-inner-1'
    selector:
      - window:
          src: http://localhost:10086/iframe-1.html
      - xpath: /html/body/iframe
      - xpath: /html/body/div
```
更新说明 TBA

## 体验

```sh
$ npm run serve-demo-site&
$ npm start
```


## LICENSE

[MIT](LICENSE)
