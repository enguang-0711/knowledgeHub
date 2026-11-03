<script setup>
import { withBase } from 'vitepress'

const modelUrl = withBase('/vehicle-vision-adas-calibration.html')
</script>

# ADAS 前视相机标定台 3D 展示

这个交互模型把前视相机、双轴安装支架、视觉 ECU、显示器和棋盘格标定靶放在同一工作台上。拖动模型可观察安装姿态；偏航角、俯仰角滑杆会同步转动相机，并更新视线在靶面上的落点和理想针孔模型的像素偏移。

<iframe :src="modelUrl" title="ADAS 前视相机标定台交互式 3D 模型" loading="lazy" style="width:100%;height:820px;border:0;border-radius:12px;background:#f5f5f2"></iframe>

## 模型说明

- 世界坐标约定：`x` 沿车辆前向，`y` 沿车辆横向，`z` 向上；偏航绕 `z` 轴，俯仰绕相机横向轴。
- 绿色视线与靶面的交点随姿态变化。读数中的 `Δu`、`Δv` 使用固定焦距的理想针孔关系近似计算：`Δu = -fx · tan(yaw) / cos(pitch)`，`Δv = fx · tan(pitch)`。
- 这里的相机内参焦距是教学参数，模型没有拟合镜头畸变，也没有从真实角点观测解算外参。实际标定还要处理内参、畸变、靶标尺寸、坐标系转换、多姿态观测、重投影误差和温度/装配变化。
- 可用滑杆或键盘方向键改变角度，点击“回正相机”恢复初始姿态；启用减少动态效果的系统设置时，模型会保持静止。

## 本地构建

项目使用 `.nvmrc` 指定 Node 版本。安装好依赖后，在仓库根目录运行：

```sh
source ~/.nvm/nvm.sh
nvm use
npm run model:adas-calibration
npm run model:adas-calibration:verify
npm run docs:build
```

构建脚本位于 `tools/vehicle-vision-anatomy/build.mjs`，生成独立页面 `docs/public/vehicle-vision-adas-calibration.html`，由本页 iframe 加载。该模型使用 [Anatomy](https://github.com/wheresryan22/anatomy) 的 SVG 与 3D 运行时工具包；其 MIT 许可副本见 `tools/vehicle-vision-anatomy/vendor/anatomy/LICENSE`。
