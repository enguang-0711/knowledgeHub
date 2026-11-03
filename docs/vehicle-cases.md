# 车载测试领域案例导航

车载软件测试包含多种不同的系统和证据链。本库把车载语音测试与车载视觉测试拆成两条独立内容线：共享通用测试设计、自动化、数据治理和 CI 工程方法，各自保留领域架构、测试数据、指标口径、风险和学习路线。

| 领域案例 | 被测能力 | 核心输入 | 主要结果证据 | 独立文档 |
|---|---|---|---|---|
| 车载语音测试 | 唤醒、语音识别、语义理解、多轮对话、业务执行和语音反馈 | 真人录音/TTS、声学条件、对话上下文 | ASR/NLU 事件、业务状态、HMI/TTS、CAN/Ethernet | [语音案例导览](/vehicle-voice-testing) · [语音学习路线](/vehicle-voice-roadmap) |
| 车载视觉测试 | 摄像头成像、目标/车道感知、环视泊车、驾驶员/乘员监测 | 图像/视频、传感器配置、场景和标注 | 检测/跟踪/分割输出、标注对齐、时延、车辆/HMI 状态 | [视觉案例导览](/vehicle-vision/) · [视觉学习路线](/vehicle-vision/roadmap) · [专题目录](/vehicle-vision/) |

## 两条内容线如何分开

- **语音文档**讨论声学播放、麦克风/音频前端、唤醒/VAD、ASR、NLU、对话状态、TTS 和声音/总线证据。入口在[车载语音案例](/vehicle-voice-testing)。
- **视觉文档**讨论相机/成像链路、图像数据、视觉模型输出、场景覆盖、标注质量、感知指标和视觉仿真/回放。入口在[车载视觉案例](/vehicle-vision/)。
- **共享工程文档**讨论 Python、pytest、测试分层、报告、CI 和 AI 评估。通用能力入口见[学习路线](/roadmap)和[工程框架](/automation-framework)。

视觉专题进一步分成[成像与标定](/vehicle-vision/camera-imaging-calibration)、[数据与标注](/vehicle-vision/dataset-and-annotation)、[指标](/vehicle-vision/perception-tasks-metrics)、[场景覆盖](/vehicle-vision/scenario-coverage)、[前视 ADAS](/vehicle-vision/adas-front-camera)、[环视/泊车](/vehicle-vision/surround-view-parking)、[舱内 DMS/OMS](/vehicle-vision/cabin-vision-dms-oms)、[仿真回放](/vehicle-vision/simulation-replay)和[ECU/CI](/vehicle-vision/ecu-performance-ci)。

语音与视觉可能出现在同一辆车、同一次驾驶场景或同一融合 ECU 中，但系统观测点、数据格式、标注方式和通过标准不同。只有在测试目标明确涉及跨模态交互时，才通过单独的系统级场景把两者组合；不要把一个领域的指标直接套用到另一个领域。
