# 车载视觉测试目录

本目录按知识点提供独立的视觉测试文档，覆盖相机输入、数据标签、任务指标、场景、仿真/回放、功能域和 ECU 工程。研发内容单独维护在[视觉开发目录](/vehicle-vision/development/)。此页作为索引与阅读入口，不替代各专题中的测试方法和验收练习。

## 相机和几何

- [车载相机成像测试](./camera-imaging-test)
- [车载相机标定测试](./calibration-test)
- [视觉坐标与几何测试](./geometry-test)
- [多摄像头同步测试](./camera-sync-test)

## 数据与指标

- [视觉数据集版本测试](./dataset-versioning-test)
- [视觉标注质量测试](./annotation-quality-test)
- [分类指标测试](./classification-metrics)
- [目标检测指标测试](./detection-metrics)
- [多目标跟踪指标测试](./tracking-metrics)
- [视觉分割指标测试](./segmentation-metrics)

## 场景、回放与台架

- [视觉系统 ODD 定义](./odd-definition)
- [车载视觉场景矩阵](./scenario-matrix)
- [视频回放测试](./video-replay-test)
- [视觉仿真测试](./simulation-test)
- [视觉 SIL 与 HIL 测试](./sil-hil-test)

## 功能专题

- [前视 ADAS 摄像头感知测试](./adas-front-camera)
- [驾驶员监测 DMS 测试](./dms-testing)
- [乘员监测 OMS 测试](./oms-testing)
- [环视影像测试](./surround-camera-test)
- [泊车感知测试](./parking-perception-test)

## ECU 与质量流水线

- [视觉 ECU 性能测试](./ecu-performance-test)
- [视觉回归与 CI](./regression-ci)

## 学习路线

- [车载视觉测试学习路线](./roadmap)

每个知识点文件包含测试对象、操作/评估方法、常见失效、练习和验收标准。专题总览用于跨页导航，安全相关测试应在经授权、可控的环境内执行。
