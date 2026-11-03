# 车载视觉开发知识点目录

本目录把[车载视觉开发学习路线](/vehicle-vision/development/roadmap)拆成可单独阅读和练习的专题文档。建议先从系统和工程基础开始，再学习成像几何、算法、领域方向和端侧交付。每篇文档包含关键概念、工程检查点、常见问题和练习；完成标准以能解释、实现和定位问题为主。

## 系统与工程基础

- [功能需求与视觉系统架构](./system-architecture-and-requirements)
- [C++、CMake 与资源管理](./cpp-cmake-resource-management)
- [Python、NumPy 与视觉数据处理](./python-numpy)
- [Linux、Git 与调试工具](./linux-git-debugging)
- [计算机视觉数学基础](./math-for-vision)

## 图像、成像与几何

- [图像格式与预处理](./image-formats-preprocessing)
- [相机成像与镜头模型](./camera-imaging-and-lens-models)
- [坐标变换、标定与时间同步](./camera-geometry-calibration-sync)
- [经典计算机视觉方法](./classical-vision)
- [视频时序与流式处理](./video-temporal-processing)

## 深度学习与视觉任务

- [深度学习基础与训练机制](./deep-learning-foundations)
- [视觉数据、训练与评估](./vision-data-and-training)
- [图像分类](./classification)
- [目标检测](./object-detection)
- [语义与实例分割](./segmentation)
- [多目标跟踪](./tracking)
- [关键点与姿态估计](./keypoints-pose)
- [深度估计与几何感知](./depth-estimation-geometry)

## 车载视觉方向

- [前视 ADAS 感知开发](./adas-perception-development)
- [环视与泊车视觉开发](./surround-view-development)
- [舱内 DMS/OMS 视觉开发](./cabin-vision-development)

## 部署与系统交付

- [模型导出与推理部署](./model-export-inference)
- [端侧优化与量化](./edge-optimization)
- [端到端性能剖析](./performance-profiling)
- [视觉系统集成](./system-integration)
- [可靠性、可观测性与数据闭环](./reliability-data-loop)

## 开发路线

- [开发学习路线](/vehicle-vision/development/roadmap)

本目录只组织视觉算法、数据管线、模型和车端功能的开发知识。测试内容由独立的测试路线和专题目录维护；开发与测试的总入口见[车载视觉专题](/vehicle-vision/)。具体项目的接口、硬件和数据授权约束以项目正式定义为准。
