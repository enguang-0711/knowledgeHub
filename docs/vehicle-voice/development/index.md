# 车载语音开发知识点目录

本目录把语音研发路线落实为独立专题文件。复合主题已拆成单项知识点；每篇都包含概念、工程方法、常见问题和练习验收。开发与测试分别维护，测试入口见[车载语音测试目录](/vehicle-voice/testing/)。

## 需求、架构与工程基础

- [语音需求工程](./requirements-engineering)
- [车载语音系统架构](./system-architecture)
- [C++ 与实时音频工程](./cpp-audio-runtime)
- [Python 音频数据处理](./python-audio)
- [Linux 音频开发环境](./linux-audio-development)
- [语音代码与模型版本管理](./git-model-versioning)
- [车载音频链路调试](./audio-debugging)
- [语音开发数学基础](./speech-math-foundations)
- [语音数字信号处理](./speech-signal-processing)

## 数字音频、声学与前端算法

- [语音数字音频格式](./audio-formats)
- [语音音频预处理](./audio-preprocessing)
- [车内声学](./cabin-acoustics)
- [声学回声消除 AEC](./echo-cancellation)
- [语音降噪 NS](./noise-reduction)
- [自动增益控制 AGC](./gain-control)
- [麦克风阵列与波束形成](./beamforming)
- [唤醒词检测](./wake-word)
- [语音活动检测 VAD](./vad)
- [语音端点检测](./endpoint-detection)
- [车载多音区语音](./multi-zone-audio)
- [说话人归属与区分](./speaker-attribution)

## ASR、NLU、对话与 TTS

- [ASR 声学模型架构](./asr-model-architectures)
- [ASR 解码与文本输出](./asr-decoding)
- [ASR 训练语料](./asr-corpus)
- [ASR 模型训练](./asr-training)
- [车载语音领域适配](./domain-adaptation)
- [语音数据集与评估](./speech-data-evaluation)
- [NLU 意图识别](./intent-classification)
- [NLU 槽位抽取与归一化](./slot-filling)
- [对话管理与上下文状态](./dialogue-management)
- [TTS 文本规范化](./text-normalization)
- [发音词典与音素转换](./pronunciation-lexicon)
- [TTS 韵律与语音合成](./prosody-synthesis)
- [流式语音服务与交互协议](./streaming-voice-services)

## 车载集成、部署与运维

- [车载语音业务与车辆接口](./vehicle-voice-functions)
- [车机语音系统集成](./system-integration)
- [语音模型部署与边缘推理](./model-deployment)
- [实时性能与优化](./performance-optimization)
- [语音系统可靠性与降级](./reliability-engineering)
- [语音可观测性与数据闭环](./observability-data-loop)
- [语音隐私与数据治理](./privacy-governance)

## 学习路线

- [车载语音开发学习路线](/vehicle-voice/development/roadmap)

每个链接对应一篇单独的知识点文档；专题导览页只负责串联学习顺序。实时车机操作和车辆控制只应在项目授权、隔离且可恢复的环境中进行。
