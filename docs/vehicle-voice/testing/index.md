# 车载语音测试专题

车载语音是本知识库收录的一个领域案例。它用于演示如何把通用的测试设计、自动化框架、质量度量和 AI 评估方法应用到一个跨越声学、语音算法、车机软件与车辆信号的复杂系统。

本专题不是知识库的全部范围。不了解汽车电子也可以先从[通用学习路线](/roadmap)开始；已有测试开发经验的读者可以直接进入本专题，再按需要补齐[通用工程能力](/automation-framework)。

## 要验证的系统链路

```text
文本/真人语音 → TTS 或录音 → 声学播放/音频注入 → 麦克风与音频前端
→ 唤醒/VAD → ASR → NLU 与对话管理 → 业务执行
→ 车辆/应用状态 → HMI/TTS 反馈 → 证据汇总与质量报告
```

测试设计要标出音频从哪里注入、哪些系统部件实际经过、每一层由什么独立证据证明。文件级注入、软件接口注入和座舱声学播放覆盖的链路不同，应在报告中明确标注。

## 专项学习路径

1. 阅读[专题学习路线](/vehicle-voice/testing/roadmap)，确认前置知识与阶段产物。
2. 通过[端到端架构](/vehicle-voice/testing/architecture)划分被测对象、台架、事件和业务边界。
3. 学习[音频与声学](/vehicle-voice/testing/audio-acoustics)、[语料与 TTS](/vehicle-voice/testing/corpus-tts)，建立输入资产和实验条件。
4. 学习[ASR、NLU 与对话管理](/vehicle-voice/testing/asr-nlu-dialogue)及[语音质量指标](/vehicle-voice/testing/metrics)，完成算法层评估。
5. 学习[车机、总线与 HIL](/vehicle-voice/testing/vehicle-integration)和[多模态断言](/vehicle-voice/testing/multimodal-assertions)，验证真实业务结果。
6. 通过[实战项目](/vehicle-voice/testing/projects)把单项能力组合为可追踪的回归闭环。

## 案例模块

| 模块 | 核心问题 | 页面 |
|---|---|---|
| 系统架构 | 一次语音请求经过哪些组件，边界如何观测？ | [端到端架构](/vehicle-voice/testing/architecture) |
| 音频与声学 | 注入方式覆盖什么路径？噪声与校准如何控制？ | [音频链路与声学测试](/vehicle-voice/testing/audio-acoustics) |
| 语料与 TTS | 测试语料怎样版本化、追溯和复现？ | [语料资产与 TTS 注入](/vehicle-voice/testing/corpus-tts) |
| 语音算法 | 如何区分识别、语义和对话状态错误？ | [ASR、NLU 与对话管理](/vehicle-voice/testing/asr-nlu-dialogue) |
| 指标与统计 | WER/CER、槽位指标、时延如何定义和切片？ | [质量指标](/vehicle-voice/testing/metrics) |
| 车端集成 | 如何通过设备、总线和 HIL 获取独立证据？ | [车机、总线与 HIL](/vehicle-voice/testing/vehicle-integration) |
| 多模态断言 | 怎样关联日志、UI、总线和执行结果？ | [多模态断言](/vehicle-voice/testing/multimodal-assertions) |
| 项目实践 | 如何从离线评测走到设备闭环与 CI？ | [项目与验收](/vehicle-voice/testing/projects) |

## 推荐先修能力

- 能将需求拆成前置条件、触发、期望状态、超时和恢复规则。
- 掌握基础 Python、Git、测试数据建模和自动化断言。
- 理解音频文件的采样率、声道、幅度和数字/声学注入差别。
- 能说明每个指标的分子、分母、样本范围与版本。
- 车端或台架操作必须在获得授权、隔离且可恢复的环境内进行；涉及车辆控制时遵循项目安全流程。

如果上述基础还不稳，先按[通用测试学习路线](/roadmap)学习；如已具备基础，可从[语音测试学习路线](/vehicle-voice/testing/roadmap)开始逐项验收。
