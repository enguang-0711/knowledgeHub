# 车载开发与测试领域导航

车载语音与车载视觉各有开发和测试任务。本导航把四条内容线分别列出；它们可以复用通用工程能力，但分别维护领域知识、数据、指标和验收目标。

| 内容线 | 工作范围 | 主要输入或证据 | 独立入口 |
|---|---|---|---|
| 车载语音开发 | 语音算法、服务、车机功能、模型部署 | 音频流、模型/语料、意图与业务接口 | [开发路线](/vehicle-voice/development/roadmap) · [知识点目录](/vehicle-voice/development/) |
| 车载语音测试 | 唤醒、ASR/NLU、多轮对话、业务执行和语音反馈验证 | 真人录音/TTS、声学条件、ASR/NLU 事件、业务状态、HMI/TTS、CAN/Ethernet | [测试导览](/vehicle-voice/testing/) · [测试路线](/vehicle-voice/testing/roadmap) |
| 车载视觉开发 | 成像几何、感知算法、模型训练和车端部署 | 图像/视频、模型、传感器配置和车机接口 | [开发路线](/vehicle-vision/development/roadmap) · [知识点目录](/vehicle-vision/development/) |
| 车载视觉测试 | 摄像头、ADAS/环视/DMS/OMS 的场景与系统验证 | 场景数据、标注、感知输出、时延、车辆/HMI 状态 | [测试导览](/vehicle-vision/testing/) · [测试路线](/vehicle-vision/testing/roadmap) |

## 开发与测试的边界

- **开发路线**以实现算法、服务和车机功能为目标，产物是可运行的软件、模型或集成方案。
- **测试路线**以验证需求、质量和运行行为为目标，产物是测试集、评估报告、故障证据和回归闭环。
- **共享工程文档**讨论 Python、pytest、测试分层、报告、CI 和 AI 评估。通用能力入口见[学习路线](/roadmap)和[工程框架](/automation-framework)。

视觉测试专题分为[成像与标定](/vehicle-vision/testing/camera-imaging-calibration)、[数据与标注](/vehicle-vision/testing/dataset-and-annotation)、[指标](/vehicle-vision/testing/perception-tasks-metrics)、[场景覆盖](/vehicle-vision/testing/scenario-coverage)、[前视 ADAS](/vehicle-vision/testing/adas-front-camera)、[环视/泊车](/vehicle-vision/testing/surround-view-parking)、[舱内 DMS/OMS](/vehicle-vision/testing/cabin-vision-dms-oms)、[仿真回放](/vehicle-vision/testing/simulation-replay)和[ECU/CI](/vehicle-vision/testing/ecu-performance-ci)。

语音与视觉可能出现在同一辆车、同一次驾驶场景或同一融合 ECU 中，但系统观测点、数据格式、标注方式和通过标准不同。只有在测试目标明确涉及跨模态交互时，才通过单独的系统级场景把两者组合；不要把一个领域的指标直接套用到另一个领域。
