# 车载语音测试目录

本目录聚焦语音测试开发、算法评估和车机验证，与[语音开发目录](/vehicle-voice/development/)分开维护。测试专题按知识点拆成独立文件，每篇提供测试对象、方法、判定依据和练习。

## 系统边界和资产

- [端到端系统架构与测试边界](./architecture)
- [语音测试数据集管理](./voice-dataset-test)
- [TTS 语音注入测试](./tts-injection-test)
- [数字音频格式测试](./audio-format-test)
- [车载语音音频注入](./audio-injection)
- [车内声学测试设计](./acoustic-test-design)
- [噪声与信噪比测试](./noise-snr-testing)

## 算法与对话评估

- [ASR 识别评测](./asr-evaluation)
- [NLU 意图与槽位评测](./nlu-evaluation)
- [对话管理与多轮测试](./dialogue-evaluation)

## 指标

- [WER 与 CER](./wer-cer-metrics)
- [唤醒与误唤醒评估](./wake-word-metrics)
- [语音时延与实时性指标](./latency-metrics)
- [语音鲁棒性与稳定性指标](./robustness-metrics)

## 车机证据和集成

- [语音日志与事件断言](./log-assertions)
- [车机界面断言](./ui-assertions)
- [车辆与业务状态断言](./vehicle-state-assertions)
- [车载 CAN 信号测试](./can-signal-testing)
- [车载语音 HIL 测试](./hil-testing)
- [Android 车机与 ADB 测试](./android-adb-testing)
- [车载以太网与服务接口测试](./ethernet-service-testing)

## 路线与项目

- [车载语音测试学习路线](./roadmap)
- [车载语音实战项目](./projects)

路线页组织阶段顺序，项目页组织跨知识点实战；知识点本身以本目录中的独立专题文件为准。涉及车端控制的练习应在项目授权、隔离且可恢复的环境执行。
