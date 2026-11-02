# 车载语音自动化测试知识库

这是一个中文、Markdown 优先的车载语音自动化测试学习知识库，面向从测试开发基础走到端到端闭环、HIL 集成和 AI 辅助质量工程的学习者。站点使用 VitePress，GitHub Actions 自动构建并部署到 GitHub Pages。

## 本地预览

需要 Node.js 20 或更高版本。首次运行：

```bash
npm ci
npm run docs:dev
```

本地生产构建：

```bash
npm run docs:build
npm run docs:preview
```

## 发布到 GitHub Pages

1. 将目录推送到 GitHub 仓库的 `main` 分支。
2. 在仓库 **Settings → Pages → Build and deployment** 中，将来源设为 **GitHub Actions**。
3. 等待 **Actions → Build and deploy knowledge base** 成功，站点会发布到 `https://<owner>.github.io/<repository>/`。

工作流会按仓库名设置 VitePress 的 `base`，因此仓库改名后重新运行即可。若使用 `username.github.io` 用户/组织站点仓库或自定义域名，请把 `.github/workflows/pages.yml` 中的 `VITEPRESS_BASE` 改为 `/`。

## 目录约定

- `docs/`：面向读者的知识正文，按学习顺序组织。
- `docs/knowledge-base-plan.md`：知识库本身的分阶段建设计划、验收门槛和维护机制。
- `docs/templates.md`：可复制的测试用例、语料清单、实验记录和缺陷报告模板。
- `.github/workflows/pages.yml`：Pages 构建、PR 校验和部署流程。

## 内容贡献原则

把事实、经验和建议分开写；指标必须给出定义、分母和适用条件；工具步骤尽量提供可运行版本与验证方法；外部标准标注编号、标题、版本和访问日期。未经来源支持的效率提升或行业普及率不要写成事实。提交前运行 `npm run docs:build`。
