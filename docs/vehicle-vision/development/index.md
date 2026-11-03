# 车载视觉开发知识点目录

本目录把视觉研发路线细化为单项知识点文档，涵盖工程基础、成像几何、算法、数据和部署。开发与测试内容各自独立；测试文档见[车载视觉测试目录](/vehicle-vision/testing/)。专题导览页只组织阅读路径，每个知识点都链接到单独文件。

## 需求和工程基础

- [车载视觉需求工程](./requirements-engineering)
- [车载视觉系统架构](./system-architecture)
- [C++ 资源生命周期](./cpp-resource-lifecycle)
- [视觉项目 CMake 构建系统](./cmake-build-system)
- [Python、NumPy 与视觉数据处理](./python-numpy)
- [Linux 视觉开发环境](./linux-vision-development)
- [视觉代码与数据版本管理](./git-dataset-versioning)
- [车载视觉问题调试](./vision-debugging)
- [计算机视觉数学基础](./math-for-vision)

## 图像、相机与几何

- [视觉图像格式与内存布局](./image-formats)
- [视觉图像预处理](./image-preprocessing)
- [相机成像与镜头模型](./camera-imaging-and-lens-models)
- [相机标定](./camera-calibration)
- [视觉坐标系与几何变换](./coordinate-frames)
- [多相机时间同步](./camera-time-sync)
- [经典计算机视觉方法](./classical-vision)
- [视频时序与流式处理](./video-temporal-processing)

## 深度学习和视觉任务

- [深度学习基础与训练机制](./deep-learning-foundations)
- [视觉数据集工程](./dataset-engineering)
- [视觉标注质量](./annotation-quality)
- [视觉模型训练与评估](./model-training-evaluation)
- [图像分类](./classification)
- [目标检测](./object-detection)
- [语义分割](./semantic-segmentation)
- [实例分割](./instance-segmentation)
- [多目标跟踪](./tracking)
- [关键点与姿态估计](./keypoints-pose)
- [深度估计与几何感知](./depth-estimation-geometry)

## 车载视觉应用方向

- [前视 ADAS 感知开发](./adas-perception-development)
- [环视成像与鸟瞰图开发](./surround-view-imaging-development)
- [泊车感知开发](./parking-perception-development)
- [驾驶员监测 DMS 开发](./dms-development)
- [乘员监测 OMS 开发](./oms-development)

## 部署、性能和运行质量

- [视觉模型导出](./model-export)
- [视觉推理运行时](./inference-runtime)
- [视觉模型量化](./quantization)
- [车载视觉端侧推理优化](./edge-optimization)
- [车载视觉系统可靠性](./reliability-engineering)
- [端到端性能剖析](./performance-profiling)
- [视觉系统集成](./system-integration)
- [视觉可观测性与数据闭环](./observability-data-loop)

## 学习路线

- [车载视觉开发学习路线](/vehicle-vision/development/roadmap)

不同应用方向会复用基础算法，但各自的传感器、坐标和验收条件不同；具体项目以正式需求、接口和数据授权为准。

## 交互式 3D 展示

- [ADAS 前视相机标定台](./adas-calibration-3d)
- [环视泊车验证台](./surround-view-parking-3d)
- [前视 ADAS 道路验证台](./adas-road-3d)
- [驾驶员监测 DMS 座舱试验台](./dms-cabin-3d)
