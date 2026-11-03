# 视觉图像格式与内存布局

## 像素表示

常见格式包括 RGB/BGR、灰度、NV12/I420 等 YUV、RAW Bayer 及压缩 JPEG/H.264。格式决定通道顺序、采样方式、颜色范围和转换方式。图像对象还包含宽高、位深、stride、平面数、对齐与内存位置。

## 内存访问

每行数据未必等于 `width × bytes_per_pixel`；硬件缓冲常有额外 padding。多平面 YUV 的亮度/色度 stride 和对齐也可能不同。解析时按接口元数据访问，不能默认缓冲紧密连续。

## 颜色转换

RGB/BGR 混淆、全/限幅 YUV 范围、色彩空间和 gamma 约定都会影响模型输入。核对相机/ISP、预处理库、模型训练配置和推理输入保持一致。

## 练习与验收

读取多种像素格式，按 stride 显示或转为统一模型输入，检查通道色块和棋盘图。记录转换前后范围、输出格式和每行字节数。

## 延伸阅读

[图像预处理](./image-preprocessing) · [相机成像模型](./camera-imaging-and-lens-models) · [视觉问题调试](./vision-debugging)
