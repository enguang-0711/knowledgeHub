<script setup>
import { withBase } from 'vitepress'

const modelUrl = withBase('/vehicle-vision-surround-parking.html')
</script>

# 环视泊车验证台 3D 展示

交互模型用一台小型泊车验证台串起车位、车辆、四路环视相机和 BEV 鸟瞰图。拖动场景或调整滑杆可横向移动车辆，查看相机覆盖范围和最近几何间距；也可切换低矮障碍与坡道反光场景。

<iframe :src="modelUrl" title="环视泊车验证台交互式 3D 模型" loading="lazy" style="width:100%;height:1080px;border:0;border-radius:12px;background:#f5f5f2"></iframe>

## 如何阅读模型

- 世界坐标以毫米表示，`x` 沿车辆前后方向，`y` 沿车辆横向，`z` 向上。模型车身尺寸、车位尺寸和障碍物位置是教学场景参数。
- “最近几何间距”根据车身、车位边界和当前障碍物的示意尺寸计算。坡道场景没有模拟非平面地面对环视投影的误差，反光区域也只是可视提示。
- 前、后、左、右视锥帮助理解相机覆盖与盲区。BEV 显示屏是示意图，不是实际鱼眼图像拼接；模型不包含镜头畸变、曝光、同步误差或真实相机标定。
- 演示适合讲解几何关系和交互逻辑。用作算法仿真时，还需真实传感器模型、物理合理的渲染、自动真值标签和实采数据对照。

## 相关专题

[环视成像与鸟瞰图开发](./surround-view-imaging-development) · [泊车感知开发](./parking-perception-development) · [泊车感知测试](/vehicle-vision/testing/parking-perception-test) · [视觉仿真测试](/vehicle-vision/testing/simulation-test)

## 本地构建

```sh
npm run model:surround-parking
npm run model:surround-parking:verify
npm run model:surround-parking:audit
npm run docs:build
```

构建器和模型参数位于 `tools/vehicle-vision-parking/`；生成的独立 HTML 页面位于 `docs/public/vehicle-vision-surround-parking.html`。几何图使用项目中 Anatomy kit 的 SVG 实体和投影工具。
