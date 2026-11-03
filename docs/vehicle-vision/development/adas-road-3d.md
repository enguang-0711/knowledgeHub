<script setup>
import { withBase } from 'vitepress'

const modelUrl = withBase('/vehicle-vision-adas-road.html')
</script>

# 前视 ADAS 道路验证台

交互模型把前视感知测试放进一段两车道的实体道路试验台。可切换前车跟踪、相邻车道切入和遮挡行人，再拖动距离滑杆观察目标移动，并读取模型使用的几何真值距离。

<iframe :src="modelUrl" title="前视 ADAS 道路验证台交互式 3D 模型" loading="lazy" style="width:100%;height:1080px;border:0;border-radius:12px;background:#f5f5f2"></iframe>

## 如何阅读模型

- 世界坐标以毫米表示：`x` 沿道路方向，`y` 横向，`z` 向上。测试车位于道路上，车头朝向 `+x`；距离从测试车前端到目标最近边缘计算。
- 距离范围为 8–24 m。切入车辆位于相邻车道方向；遮挡场景显示近处前车和更远的行人。场景尺寸和距离是教学参数，不代表真实道路法规、量产车型或传感器性能。
- 控制台屏幕和右下角真值读数来自同一份模型。目标位置改变时，车辆/行人、前视视线和显示距离同步更新。
- 图中的相机视线和目标框用于说明几何关系，不是实际相机渲染、检测输出或精确视场模拟。模型没有模拟相机内外参、镜头畸变、目标运动动力学、道路坡度、天气和光照。
- 用于算法验证还需真实传感器模型、带标注数据、ODD 边界场景及可复现的评测流程。

## 相关专题

[前视 ADAS 感知开发](./adas-perception-development) · [前视 ADAS 摄像头感知测试](/vehicle-vision/testing/adas-front-camera) · [车载视觉场景矩阵](/vehicle-vision/testing/scenario-matrix) · [视觉仿真测试](/vehicle-vision/testing/simulation-test)

## 本地构建

```sh
npm run model:adas-road
npm run model:adas-road:verify
npm run model:adas-road:audit
npm run docs:build
```

构建器、纯模型和实体清单位于 `tools/vehicle-vision-adas-road/`；生成的独立 HTML 位于 `docs/public/vehicle-vision-adas-road.html`。Anatomy kit 用于创建等距 SVG 实体、阴影和页面卡片。
