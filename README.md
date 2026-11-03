# 软件测试与质量工程知识库

这是一个中文、Markdown 优先的软件测试与质量工程学习知识库，覆盖测试设计、自动化工程、质量度量、CI、AI 应用测试，以及车载语音和视觉的开发/测试专题。站点使用 VitePress，GitHub Actions 自动构建并部署到 GitHub Pages。

## 本地预览

需要 Node.js 20 或更高版本。首次运行：

```bash
npm ci
npm run docs:dev
```

安装 Git hooks，让每次本地提交前自动构建：

```bash
npm run hooks:install
```

安装依赖后，每次 `git commit` 都会运行 `npm run docs:build`；构建失败时提交会被阻止。每个新 clone 需要执行一次安装命令。紧急情况下可以用 `git commit --no-verify` 跳过 hook，但应随后补跑构建。

本地生产构建：

```bash
npm run docs:build
npm run docs:preview
```

## 发布到 GitHub Pages

1. 将目录推送到 GitHub 仓库。每次分支 push 和 Pull Request 都会运行构建检查；只有 `main` 分支会部署 Pages。
2. 在仓库 **Settings → Pages → Build and deployment** 中，将来源设为 **GitHub Actions**。
3. 等待 **Actions → Build and deploy knowledge base** 成功，站点会发布到 `https://<owner>.github.io/<repository>/`。

工作流会按仓库名设置 VitePress 的 `base`，因此仓库改名后重新运行即可。若使用 `username.github.io` 用户/组织站点仓库或自定义域名，请把 `.github/workflows/pages.yml` 中的 `VITEPRESS_BASE` 改为 `/`。

## 目录约定

- `docs/`：面向读者的知识正文，按通用能力、AI 测试和领域专题组织。
- `docs/knowledge-map.md`：全站主题分类、内容范围与成熟度。
- `docs/vehicle-cases.md`：车载语音、视觉两个独立案例的导航与边界说明。
- `docs/vehicle-voice/`：车载语音专题总览；`development/` 与 `testing/` 分别存放开发、测试路线和知识点文档。
- `docs/vehicle-voice/development/`：车载语音开发路线及逐知识点拆分的开发专题文档。
- `docs/vehicle-voice/testing/`：车载语音测试导览、路线、评估专题和实战项目。
- `docs/vehicle-vision/`：车载视觉专题总览；`development/` 与 `testing/` 分别存放开发和测试路线及文档。
- `docs/knowledge-base-plan.md`：知识库本身的分阶段建设、验收门槛和维护机制。
- `docs/templates.md`：可复制的测试用例、语料清单、实验记录和缺陷报告模板。
- `.github/workflows/pages.yml`：Pages 构建、PR 校验和部署流程。

## 内容贡献原则

把事实、经验和建议分开写；指标必须给出定义、分母和适用条件；工具步骤尽量提供可运行版本与验证方法；外部标准标注编号、标题、版本和访问日期。未经来源支持的效率提升或行业普及率不要写成事实。提交前运行 `npm run docs:build`。
