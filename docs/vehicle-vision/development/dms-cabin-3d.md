<script setup>
import { withBase } from 'vitepress'

const modelUrl = withBase('/vehicle-vision-dms-cabin.html')
</script>

# 驾驶员监测 DMS 座舱试验台

交互模型展示开放式座舱切面、可调座椅、驾驶员姿态、方向盘、仪表台和近红外 DMS 相机。选择输入标签或移动座椅滑杆，可以观察眼睛到镜头的几何距离，以及对应的示意状态。

<iframe :src="modelUrl" title="驾驶员监测 DMS 座舱试验台交互式 3D 模型" loading="lazy" style="width:100%;height:1080px;border:0;border-radius:12px;background:#f5f5f2"></iframe>

## 如何阅读模型

- 世界坐标以毫米表示：`x` 沿座舱纵向、驾驶员面向 `+x`，`y` 为座舱横向，`z` 向上。滑杆模拟座椅沿纵向的 −120 至 +120 mm 行程，DMS 相机固定在仪表台上沿。
- 镜头中心到眼睛位置的距离由同一份几何模型计算；约 0.82–1.58 m 的范围只是本教学试验台的示意布置参数，不代表车型规格、法规限值或量产检测阈值。
- 四个按钮分别指定正常注视、视线偏离、闭眼样本和镜头遮挡标签。状态面板只展示输入标签；镜头被遮挡时把传感器输入标成无效，不运行疲劳/分心检测，也不生成告警时序。
- 绿色视场和注视线用于说明几何关系，不是光学仿真或相机成像结果。模型未模拟红外成像、镜头畸变、头部姿态估计、算法性能或隐私处理。

算法开发还需结合适用车型的相机安装规范、经授权的数据、标注协议和目标产品的接口定义；算法测试边界见 [DMS 驾驶员监测开发](/vehicle-vision/development/dms-development) 与 [DMS 测试](/vehicle-vision/testing/dms-testing)。

## 本地构建

```sh
npm run model:dms-cabin
npm run model:dms-cabin:verify
npm run model:dms-cabin:audit
npm run docs:build
```

纯模型、构建器、交互脚本和实体清单位于 `tools/vehicle-vision-dms-cabin/`；生成的独立 HTML 位于 `docs/public/vehicle-vision-dms-cabin.html`。模型由 Anatomy kit 的等距 SVG 几何与卡片组件生成。
