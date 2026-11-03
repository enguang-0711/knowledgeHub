# 车载语音开发知识点目录

本目录把[车载语音开发学习路线](/vehicle-voice-development-roadmap)拆成可独立学习和验收的专题。建议先从系统边界、编程和信号处理开始，再依次学习音频前端、ASR/NLU/TTS、车载服务和端侧部署。每篇说明关键概念、工程流程、常见问题和练习。

## 系统与开发基础

- [语音需求与系统架构](./system-architecture-and-requirements)
- [C++ 与实时音频工程](./cpp-audio-runtime)
- [Python 音频数据处理](./python-audio)
- [Linux、Git 与音频调试](./linux-git-debugging)
- [语音开发数学与信号处理基础](./math-dsp)

## 音频与前端

- [数字音频格式与预处理](./digital-audio)
- [车内声学与音频前端](./acoustics-audio-front-end)
- [AEC、降噪、增益与波束形成](./audio-front-end)
- [唤醒词、VAD 与端点检测](./wake-vad-endpoint)
- [多音区与说话人处理](./speaker-multizone)

## 语音算法与交互

- [ASR 模型与解码](./asr-models-decoding)
- [ASR 语料、训练与领域适配](./asr-training-adaptation)
- [语音数据集与评估](./speech-data-evaluation)
- [NLU 意图与槽位](./nlu-intent-slots)
- [对话管理与上下文状态](./dialogue-management)
- [TTS、发音与韵律](./tts-synthesis)
- [流式语音服务与交互协议](./streaming-voice-services)

## 车载集成与部署

- [车载语音业务与车辆接口](./vehicle-voice-functions)
- [车机语音系统集成](./system-integration)
- [语音模型部署与边缘推理](./model-deployment)
- [实时性能与优化](./performance-optimization)
- [可靠性、隐私与数据闭环](./reliability-data-loop)

## 配套路线与资料

- [开发学习路线](/vehicle-voice-development-roadmap)
- [语音测试学习路线](/vehicle-voice-roadmap)
- [端到端语音架构与测试边界](/architecture)
- [音频链路与声学测试](/audio-acoustics)
- [ASR、NLU 与对话评测](/asr-nlu-dialogue)
- [语料资产与 TTS 测试](/corpus-tts)
- [车机、总线与 HIL 测试](/vehicle-integration)

开发专题解释如何构建算法和服务；配套测试页面说明如何验证输入、事件、总线、HMI 与业务状态。实时车机操作和车辆控制只应在项目授权、隔离且可恢复的环境中进行。
