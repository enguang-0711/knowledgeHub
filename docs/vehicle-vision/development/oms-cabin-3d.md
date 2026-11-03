<script setup>
import { withBase } from 'vitepress'

const modelUrl = withBase('/vehicle-vision-oms-cabin.html')
</script>

# 乘员监测 OMS 多座位试验台

交互模型展示三座后排、顶置乘员监测相机和座位状态控制台。选择左、中或右座，再切换空座、成人、儿童座椅、空座物品、毯子遮挡或相机输入无效标签，可以观察样本移动、区域高亮和座位矩阵更新。

<iframe :src="modelUrl" title="乘员监测 OMS 多座位试验台交互式 3D 模型" loading="lazy" style="width:100%;height:1080px;border:0;border-radius:12px;background:#f5f5f2"></iframe>

## 如何阅读模型

- 世界坐标以毫米表示：`x` 沿座舱纵向，`y` 沿座舱横向，`z` 向上。左、中、右座位中心分别位于 `y=-920、0、+920 mm`；顶置相机镜头中心为 `(-900, 0, 2352) mm`。
- 座位矩阵显示预先指定的教学输入标签。非选中座位显示 `STANDBY`；选择相机输入无效时，三席都显示 `INPUT INVALID`。毯子遮挡保留为 `UNCERTAIN`，不会折算成空座或占用结论。
- 距离读数是相机到所选座位参考点的几何距离，约 0.78–1.60 m 仅为模型布置范围，不是产品规格或检测阈值。视场边界是几何示意，不代表图像、红外照明或 OMS 算法输出。
- 场景按钮直接指定标签，不运行乘员分类、人数统计、安全带判断、遗留儿童告警或其他量产感知逻辑。模型不使用真实乘员图像。

OMS 开发还需依据目标车型定义座位区域、传感器配置、标签协议和安全状态；验证边界见 [乘员监测 OMS 测试](/vehicle-vision/testing/oms-testing) 与 [舱内 DMS / OMS 综合测试](/vehicle-vision/testing/cabin-vision-dms-oms)。

## 本地构建

```sh
npm run model:oms-cabin
npm run model:oms-cabin:verify
npm run model:oms-cabin:audit
npm run docs:build
```

纯模型、构建器、交互脚本和实体清单位于 `tools/vehicle-vision-oms-cabin/`；生成的独立 HTML 位于 `docs/public/vehicle-vision-oms-cabin.html`。模型由 Anatomy kit 的等距 SVG 几何与卡片组件生成，包含 147 个实体。
