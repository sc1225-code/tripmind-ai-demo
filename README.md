# TripMind AI Demo

这是 Inspire Group 差旅项目的 AI Coding 可交互原型与作业文档。

## 在线 Demo

GitHub Pages 启用后，可以通过仓库 Pages 链接直接访问 Demo。仓库根目录的 `index.html` 会自动跳转到：

```text
deploy/github-pages/
```

## 本地预览

```bash
python3 -m http.server 5175 --directory deploy/github-pages
```

然后访问：

```text
https://sc1225-code.github.io/tripmind-ai-demo/deploy/github-pages/?v=20260709-2
```

## 主要目录

- `deploy/github-pages/`：用于 GitHub Pages 的静态 Demo。
- `docs/`：需求分析、PRD、页面原型和设计阐述。
- `docs/assets/`：页面原型截图。
- `assets/`：页面原型截图副本，用于兼容从项目根目录解析图片路径的 Markdown 预览器。
