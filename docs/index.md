---
layout: home
title: 软件测试与质量工程知识库
titleTemplate: AI 时代的测试方法、工程能力与行业实践
hero:
  name: 软件测试与质量工程
  text: 测试方法、AI 与行业实践
  tagline: 一套持续扩展的学习知识库，覆盖测试设计、自动化、质量度量、AI 应用评估和不同领域的实践案例。
  actions:
    - theme: brand
      text: 从通用学习路线开始
      link: /roadmap
    - theme: alt
      text: 浏览测试工程能力
      link: /automation-framework
    - theme: alt
      text: 浏览车载测试案例
      link: /vehicle-cases
features:
  - title: 通用测试与工程能力
    details: 学习测试分析、Python 自动化、框架设计、质量度量、CI、报告和可复现工程实践。
    link: /roadmap
  - title: AI 与智能系统测试
    details: 理解生成式 AI 应用的测试边界，学习用评测集、规则和人工审核控制模型输出质量。
    link: /llm-testing
  - title: 车载语音开发
    details: 按路线学习数字音频、音频前端、ASR/NLU/TTS、车机集成与端侧部署，并逐篇阅读开发知识点文档。
    link: /vehicle-voice/development/roadmap
  - title: 车载语音测试案例
    details: 独立学习音频链路、ASR/NLU、多轮对话、车机集成、多模态证据与 HIL 闭环。
    link: /vehicle-voice/testing/
  - title: 车载视觉开发
    details: 按路线学习视觉算法、成像几何、模型训练和车端部署，并逐篇阅读开发知识点文档。
    link: /vehicle-vision/development/roadmap
  - title: 车载视觉测试
    details: 按路线学习图像数据、感知评估、场景覆盖、仿真回放与车端验证。
    link: /vehicle-vision/testing/
  - title: 项目驱动学习
    details: 当前实战项目以车载语音为例，把概念、工具、测试数据和质量报告串成可验收闭环。
    link: /vehicle-voice/testing/projects
  - title: 可查证的学习资料
    details: 术语、官方文档、工具和视频学习入口集中整理，并区分定义、实践和待验证建议。
    link: /glossary
  - title: 持续扩展的知识地图
    details: 用统一页面模板、来源分级和维护流程增加新测试领域，避免站点被单一行业专题限定。
    link: /knowledge-base-plan
---

## 知识库定位

本库面向软件测试、测试开发和质量工程学习者，并提供车载语音与视觉专题。两个领域都把**开发**与**测试**拆成独立路线和文档目录：开发侧说明如何构建算法、服务和车机功能；测试侧说明如何验证系统边界、数据、指标和业务结果。通用工程能力由各方向按需复用。

语音侧聚焦声学、ASR、NLU 和对话链路；视觉侧聚焦成像、感知、场景数据和视觉指标。两者可以共享 Python、测试分层、证据管理和 CI 等工程能力，但各自保留独立文档、测试数据和指标定义。

## 推荐学习顺序

1. 先读[通用学习路线](/roadmap)，检查自己的测试设计、编程和工程化基础。
2. 学习[自动化框架](/automation-framework)、[CI 与质量趋势](/ci-quality)和[模板](/templates)，建立可复现的执行与报告习惯。
3. 选择感兴趣的方向：阅读[大模型应用测试](/llm-testing)，或从[车载领域案例导航](/vehicle-cases)进入语音/视觉开发或测试的独立文档。
4. 通过[实战项目](/vehicle-voice/testing/projects)完成端到端练习，并用[术语词典](/glossary)和[工具资料](/tools-and-resources)查缺补漏。

## 当前内容地图

| 层次 | 内容 | 当前状态 |
|---|---|---|
| 通用主干 | Python 测试工程、CI、测试模板、AI 应用测试、学习路线 | 已有基础内容，持续补充通用示例 |
| 车载语音开发 | 音频与 DSP、ASR/NLU/TTS、车机集成和部署 | [开发路线](/vehicle-voice/development/roadmap)与[知识点目录](/vehicle-voice/development/) |
| 车载语音测试 | 语料、评估、多轮对话、总线/HIL | [测试导览](/vehicle-voice/testing/)与[测试路线](/vehicle-voice/testing/roadmap) |
| 车载视觉开发 | 摄像头成像、ADAS/环视/DMS/OMS 算法及车端部署 | [开发路线](/vehicle-vision/development/roadmap)与[知识点目录](/vehicle-vision/development/) |
| 车载视觉测试 | 场景数据、感知评估、标注、仿真回放和端侧验证 | [测试导览](/vehicle-vision/testing/)与[测试路线](/vehicle-vision/testing/roadmap) |
| 知识资产 | 术语词典、工具资料、项目练习、内容建设规范 | 持续维护 |
| 后续扩展 | API/服务测试、Web/移动端测试、性能与可靠性、安全与数据治理等 | 按学习需求逐步建设，不将目录当作已完成内容 |

## 学习与引用约定

每个主题尽量给出术语定义、前置知识、分步解释、重难点、动手练习和学习入口。外部课程链接用于发现学习材料；标准、接口和工具行为以适用版本的正式文档为准。事实、实测经验和建议分开标注，涉及版本和指标时说明适用范围。
