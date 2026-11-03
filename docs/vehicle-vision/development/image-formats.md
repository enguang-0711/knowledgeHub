# 视觉图像格式与内存布局

## 像素表示

常见格式包括 RGB/BGR、灰度、NV12/I420 等 YUV、RAW Bayer 及压缩 JPEG/H.264。格式决定通道顺序、采样方式、颜色范围和转换方式。图像对象还包含宽高、位深、stride、平面数、对齐与内存位置。

## 内存访问

每行数据未必等于 `width × bytes_per_pixel`；硬件缓冲常有额外 padding。多平面 YUV 的亮度/色度 stride 和对齐也可能不同。解析时按接口元数据访问，不能默认缓冲紧密连续。

## 颜色转换

RGB/BGR 混淆、全/限幅 YUV 范围、色彩空间和 gamma 约定都会影响模型输入。核对相机/ISP、预处理库、模型训练配置和推理输入保持一致。

## 练习与验收

读取多种像素格式，按 stride 显示或转为统一模型输入，检查通道色块和棋盘图。记录转换前后范围、输出格式和每行字节数。

## 输入解码与缓冲区验证

接口要显式携带 width/height、像素格式、plane 数、每 plane stride/offset、dtype、有效范围和内存地址类型。NV12/NV21 的 UV 顺序、I420 多平面偏移、RAW Bayer 排列和压缩帧解码状态都应通过格式枚举表达，不能靠调用方猜测。

构造色条、灰阶、棋盘和奇数宽度图像，分别验证通道顺序、行跨度、色度采样和颜色范围；用带 padding 的 buffer 检查代码是否错误地按 `width × bytes_per_pixel` 连续寻址。

**验收产物：**输出输入帧元数据与转换后张量抽样值，并在 CPU/硬件路径做同帧比对。若颜色偏移，依次检查 YUV range、UV 排列、stride 和转换矩阵，不要先用模型阈值掩盖格式错误。

## 延伸阅读

[图像预处理](./image-preprocessing) · [相机成像模型](./camera-imaging-and-lens-models) · [视觉问题调试](./vision-debugging)
