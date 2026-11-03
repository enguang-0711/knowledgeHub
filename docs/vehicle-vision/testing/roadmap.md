# 车载视觉测试学习路线

本路线与[车载语音测试路线](/vehicle-voice/testing/roadmap)分开。学习目标是理解摄像头图像如何变成车端感知与功能结果，并建立从离线数据集到仿真、ECU/台架和场地验证的分层测试能力。周期可按每周 6–10 小时估算，验收以产物为准。

## 路线总览

| 阶段 | 建议时间 | 学习主题 | 可验收产物 |
|---|---:|---|---|
| 0 | 1 周 | 系统族、功能边界与证据链 | 系统链路图和风险清单 |
| 1 | 2 周 | 数字图像、相机成像、坐标和标定 | 图像元数据检查器、标定记录 |
| 2 | 2–3 周 | 数据集、标注、隐私、切分与场景覆盖 | 版本化 manifest、标签 QA 和覆盖矩阵 |
| 3 | 2–3 周 | 分类/检测/跟踪/分割与指标 | 可复跑的分层评测报告 |
| 4 | 2–3 周 | 选一个功能族深入：ADAS、AVM 或 DMS/OMS | 端到端专题用例与证据链 |
| 5 | 2 周 | 视频回放、仿真、SIL/HIL | 固定场景回放和差异报告 |
| 6 | 2–3 周 | ECU 实时性、稳定性、资源与 CI | 端侧运行记录和回归流水线 |
| 7 | 持续 | AI 辅助、质量治理与持续改进 | 冻结集、错误聚类和质量趋势 |

每阶段预计每周投入 6–10 小时。可并行补工具，但不要跳过数据、评测口径和边界记录。路线中的阶段任务必须选择一种系统族；前视 ADAS、环视/泊车与 DMS/OMS 的数据、标签、指标和需求分别维护。

## 阶段 0：界定被测视觉系统

先区分前视 ADAS、环视/泊车和舱内 DMS/OMS。画出摄像头、ISP、同步/标定、模型、跟踪/融合、功能逻辑和 HMI 的实际数据流，标注本次测试的起点、终点、接口、版本和能独立观察的证据。

**重难点：**不要把感知模型输出等同于最终车辆功能；确定哪些组件被离线数据绕过。前视检测、环视几何和舱内状态分类需要不同场景和判定指标。

**练习与验收：**选一种功能，画系统边界图，列出至少三个会造成相似表象但根因不同的故障，如镜头遮挡、标定漂移、模型漏检、下游过滤。

**专题文档：**[视觉测试导览](/vehicle-vision/testing/) · [前视 ADAS](/vehicle-vision/testing/adas-front-camera) · [环视影像](/vehicle-vision/testing/surround-camera-test) · [泊车感知](/vehicle-vision/testing/parking-perception-test) · [DMS](/vehicle-vision/testing/dms-testing) · [OMS](/vehicle-vision/testing/oms-testing)

**学习资料：**[视觉测试导览](/vehicle-vision/testing/)；[B 站：ADAS 摄像头感知与功能链路](https://search.bilibili.com/all?keyword=ADAS%20%E6%91%84%E5%83%8F%E5%A4%B4%20%E6%84%9F%E7%9F%A5%20%E5%8A%9F%E8%83%BD%E9%93%BE%E8%B7%AF)。

## 阶段 1：图像、相机与坐标系

理解像素、分辨率、颜色空间、帧率、曝光、动态范围、畸变、内参和外参。能够读取图像/视频的尺寸、编码、时间戳和帧间隔；解释图像像素坐标如何映射到相机坐标和车辆坐标。

**重难点：**不同相机 ID、镜头、安装位置和标定版本会改变几何意义；滚动快门、自动曝光和 HDR 可能改变动态目标外观。离线 jpg 指标不会暴露所有成像链路问题。

**练习与验收：**用 OpenCV 检查图片/视频元信息；在公开标定样例上运行标定，保存输入、参数、重投影误差和配置说明。

**专题文档：**[相机成像](/vehicle-vision/testing/camera-imaging-test) · [相机标定](/vehicle-vision/testing/calibration-test) · [坐标几何](/vehicle-vision/testing/geometry-test) · [多相机同步](/vehicle-vision/testing/camera-sync-test)

**学习资料：**[OpenCV 相机标定](https://docs.opencv.org/4.x/dc/dbb/tutorial_py_calibration.html)；[B 站：OpenCV 相机标定和内外参](https://search.bilibili.com/all?keyword=OpenCV%20%E7%9B%B8%E6%9C%BA%E6%A0%87%E5%AE%9A%20%E5%86%85%E5%8F%82%20%E5%A4%96%E5%8F%82)。

## 阶段 2：数据集、标签、隐私与场景覆盖

设计 manifest：样本哈希、帧/视频来源、相机配置、时间戳、场景标签、标注版本、许可和数据切分。掌握框、类别、轨迹、车道线或分割标签的 schema；检查空标签、越界框、重复帧、标签不一致和训练/评估数据泄漏。

场景维度包括目标类别和尺度、距离、遮挡、天气、昼夜、隧道、逆光、镜头污损、道路类型及 ODD 边界。将高风险和长尾样本作为可检索切片，记录采集或仿真的条件。

**重难点：**连续视频帧高度相关，随机帧切分会让测试集混入训练场景；标注本身也会有歧义。标注规范、复核策略和冻结集版本都要明确。

**练习与验收：**对许可清楚的数据建立 manifest 和标签 QA 脚本，按行程/地点隔离数据集，并完成一轮双人抽样复核。

**学习资料：**[CVAT 文档](https://docs.cvat.ai/docs/)；[ASAM OpenSCENARIO](https://www.asam.net/standards/detail/openscenario/)；[B 站：自动驾驶数据集标注和场景库](https://search.bilibili.com/all?keyword=%E8%87%AA%E5%8A%A8%E9%A9%BE%E9%A9%B6%20%E6%95%B0%E6%8D%AE%E9%9B%86%E6%A0%87%E6%B3%A8%20%E5%9C%BA%E6%99%AF%E5%BA%93)。

**专题文档：**[数据集版本](/vehicle-vision/testing/dataset-versioning-test) · [标注质量](/vehicle-vision/testing/annotation-quality-test) · [ODD 定义](/vehicle-vision/testing/odd-definition) · [场景矩阵](/vehicle-vision/testing/scenario-matrix)

## 阶段 3：指标与离线评估

先判断任务是分类、目标检测、跟踪、分割、车道线还是几何估计，再实现相应指标。至少会解释混淆矩阵、precision/recall/F1、IoU、AP/mAP、IDF1/HOTA、IoU/mIoU、时延与丢帧率的定义、匹配规则、分母和限制。

**重难点：**mAP 汇总不能替代关键类别、近/远距离和夜间分层；不同 IoU 阈值或类别集会改变结果；模型置信度阈值也必须绑定版本。

**练习与验收：**对一组预测输出逐样本保存预测与标注可视化，计算总体和按类别/目标尺寸分层指标；人工核对几个 TP/FP/FN。

**学习资料：**[COCO Detection Evaluation](https://cocodataset.org/#detection-eval)；[B 站：IoU AP mAP 目标检测评价指标实战](https://search.bilibili.com/all?keyword=IoU%20AP%20mAP%20%E7%9B%AE%E6%A0%87%E6%A3%80%E6%B5%8B%E8%AF%84%E4%BB%B7%E6%8C%87%E6%A0%87%E5%AE%9E%E6%88%98)。

**专题文档：**[分类指标](/vehicle-vision/testing/classification-metrics) · [检测指标](/vehicle-vision/testing/detection-metrics) · [跟踪指标](/vehicle-vision/testing/tracking-metrics) · [分割指标](/vehicle-vision/testing/segmentation-metrics)

## 阶段 4：选择一个视觉功能族深入

从前视 ADAS、环视/泊车、舱内 DMS/OMS 中选一个作为练习主线。先读对应专题的系统边界和输出契约，再选该功能适用的数据集与标签、定义场景矩阵和业务断言，最后画出感知结果到 HMI/车辆状态的证据链。其余两个系统族只做差异对照，避免把它们的数据 schema 和通过标准合并。

**练习与验收：**建立至少 10 个该系统族的场景用例，每条写明需求/风险来源、输入、预期输出、判定窗口、失败证据和被旁路组件；抽取 3 个用例形成可执行的离线、仿真或台架测试。报告须标注目前没有覆盖的硬件/整车环节。

**专题文档：**[前视 ADAS](/vehicle-vision/testing/adas-front-camera) · [环视影像](/vehicle-vision/testing/surround-camera-test) · [泊车感知](/vehicle-vision/testing/parking-perception-test) · [DMS](/vehicle-vision/testing/dms-testing) · [OMS](/vehicle-vision/testing/oms-testing)

## 阶段 5：视频时序、仿真与回放

从单帧扩展到帧顺序、同步、跟踪状态和短暂漏检。学习固定场景 ID、传感器配置、随机种子、输入视频和仿真版本；区分图片回归、传感器回放、SIL 仿真、硬件台架和道路采集的覆盖边界。

**重难点：**单帧准确率可能无法捕捉 ID 切换、抖动、丢帧、响应延迟和时序错位；仿真与实采存在域差异，仿真覆盖不能自动替代现实验证。

**练习与验收：**固定一段许可明确的视频和推理配置，比较两次版本的轨迹、事件时间和短时漏检；保存可重放的场景描述及差异报告。

**学习资料：**[ASAM OpenSCENARIO](https://www.asam.net/standards/detail/openscenario/)；[B 站：自动驾驶仿真测试 SIL HIL 场景回放](https://search.bilibili.com/all?keyword=%E8%87%AA%E5%8A%A8%E9%A9%BE%E9%A9%B6%E4%BB%BF%E7%9C%9F%E6%B5%8B%E8%AF%95%20SIL%20HIL%20%E5%9C%BA%E6%99%AF%E5%9B%9E%E6%94%BE)。

**专题文档：**[视频回放](/vehicle-vision/testing/video-replay-test) · [视觉仿真](/vehicle-vision/testing/simulation-test) · [SIL/HIL](/vehicle-vision/testing/sil-hil-test)

## 阶段 6：目标硬件与端侧验证

在获授权的 ECU/台架环境测量实际模型、预处理和后处理的端到端时延、帧率、丢帧、内存、加速器利用率、温度和长时间稳定性。记录固件、模型、标定、输入分辨率、功耗/温度状态和负载配置。

**重难点：**台式 GPU 离线速度不能代表车规 ECU；热降频、并发传感器、数据搬运和预处理都可能改变时延。测试错误不能为了通过门槛静默丢样或无限重试。

**练习与验收：**在模拟器或获授权目标设备上运行短时冒烟和长时测试，输出 p50/p95 时延、FPS、丢帧和资源曲线；无法接入真硬件时明确标成模拟结果。

**学习资料：**[设备测试与 CI 参考](/ci-quality)；[B 站：自动驾驶感知模型车端部署性能测试](https://search.bilibili.com/all?keyword=%E8%87%AA%E5%8A%A8%E9%A9%BE%E9%A9%B6%E6%84%9F%E7%9F%A5%E6%A8%A1%E5%9E%8B%20%E8%BD%A6%E7%AB%AF%E9%83%A8%E7%BD%B2%20%E6%80%A7%E8%83%BD%E6%B5%8B%E8%AF%95)。

**专题文档：**[ECU 性能](/vehicle-vision/testing/ecu-performance-test) · [回归与 CI](/vehicle-vision/testing/regression-ci)

## 阶段 7：回归、CI 与 AI 治理

对代码、模型、预处理、标注、标定和运行环境分别做版本追踪；用冻结集跑快回归，用场景切片分析退化。AI 可辅助候选场景生成、结果聚类和错误摘要；标签、通过/失败、安全策略仍由明确规则或人工确认。

**重难点：**同一个总体分数可能掩盖安全关键类别退化；模型自动生成的标签/场景描述要校验并记录来源；涉及车内图像时应按数据授权、隐私和保留策略处理。

**练习与验收：**建立离线 PR 回归工作流，上传机器可读指标、版本清单和新增 FP/FN 列表；模拟数据集版本变化并确认趋势可解释。

**学习资料：**[CI 与质量趋势](/ci-quality)、[大模型应用测试](/llm-testing)；[B 站：自动驾驶感知回归测试数据闭环 CI](https://search.bilibili.com/all?keyword=%E8%87%AA%E5%8A%A8%E9%A9%BE%E9%A9%B6%E6%84%9F%E7%9F%A5%E5%9B%9E%E5%BD%92%E6%B5%8B%E8%AF%95%20CI%20%E6%95%B0%E6%8D%AE%E9%97%AD%E7%8E%AF)。

**专题文档：**[回归与 CI](/vehicle-vision/testing/regression-ci) · [ECU 性能](/vehicle-vision/testing/ecu-performance-test)

## 完成标准

完成路线后，能够选择一个明确的视觉功能，说明其系统链路和测试覆盖边界；构造有版本、标注与授权信息的数据集；用匹配的指标和场景切片解释结果；复放一次性能或精度退化；并说明离线、仿真、硬件和道路验证各自尚未覆盖的部分。
