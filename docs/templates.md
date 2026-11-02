# 可复用模板与检查清单

以下模板是起点。先明确版本和 schema，再根据项目接口增加字段；不要把真实用户音频或未脱敏日志放入公开示例。

## 数据驱动用例 YAML

```yaml
schema_version: 1
case_id: climate.driver.set_temperature.001
title: 驾驶员音区设置空调温度
tags: [smoke, single_turn, climate]
severity: medium
locale: zh-CN
zone: driver
utterance: "把温度调到二十二度"
reference_text: "把温度调到22度"
audio:
  uri: corpus/audio/climate-001.wav
  sha256: "<replace-with-real-sha256>"
  sample_rate_hz: 16000
  channels: 1
  format: pcm_s16le
  duration_ms: 2200
  source:
    type: tts
    engine: "<engine-and-version>"
    voice: "<voice-id>"
    parameters: { rate: "<value>", style: "<value>" }
context:
  reset_before: true
  session_id: "generated-at-runtime"
expected:
  asr:
    match: normalized_exact
    text: "把温度调到22度"
  nlu:
    intent: SetClimateTemperature
    slots: { zone: driver, temperature_c: 22 }
  vehicle_state:
    signal: Climate.Driver.TargetTemperature
    value: 22
    unit: celsius
    timeout_ms: 3000
    stable_for_ms: 500
  hmi:
    visible_text: "22°C"
    timeout_ms: 2000
timeouts:
  wake_ms: 1500
  final_asr_ms: 4000
  total_ms: 8000
environment:
  mode: simulator # offline | simulator | bench | hil
  noise_profile: quiet
  calibration_id: "<calibration-record-or-not-applicable>"
provenance:
  owner: "<team-or-person>"
  license: "<license-or-internal-restriction>"
  reviewed_on: "YYYY-MM-DD"
```

严格匹配只是例子。若业务允许文本变体，显式定义匹配器和版本；车辆状态字段必须映射到项目实际信号字典。

## 测试实验记录

```markdown
# 实验：<问题或假设>

- 日期/负责人：
- 目的与假设：
- 被测应用/固件/模型/配置版本：
- 语料/音频/noise set 版本：
- 台架、播放/采集设备及校准：
- 控制变量：
- 自变量与水平：
- 样本量/重复次数：
- 指标定义与排除规则：
- 步骤及命令：
- 原始证据位置：
- 结果（含失败明细和不确定性）：
- 结论和适用范围：
- 混淆因素/限制：
- 后续验证：
```

## 缺陷报告

```markdown
## 摘要
<具体行为及影响>

## 环境与版本
- 应用/固件/模型：
- 设备/台架/通道：
- 语料与音频 SHA256：
- 噪声/音区/播放电平/校准：

## 复现步骤
1. <前置状态>
2. <输入和动作>

## 预期 / 实际
- 预期：
- 实际：
- 失败阶段：

## 证据
- ASR/NLU/业务事件：
- 日志/时间线：
- UI/截图/OCR：
- CAN/Ethernet trace：
- 原始音频/回采：

## 复现率与影响范围
- 运行次数/失败次数：
- 影响条件：
- 风险/严重度：
```

## 新增语料检查清单

- [ ] case_id 稳定且唯一；标签和预期标签经过审核。
- [ ] 参考文本保留原始表达并注明归一化规则。
- [ ] 音频可解码，格式/时长/电平检查通过，哈希记录。
- [ ] 语音来源、TTS 参数或录音设备完整；许可/授权允许当前用途。
- [ ] 噪声、播放音区和声学条件可复现。
- [ ] 多轮用例包含会话前置状态、逐轮期望和清理规则。
- [ ] 高风险动作只在授权隔离环境执行，并有硬联锁。
- [ ] 测试集/开发集无明显泄漏；公开仓库无敏感数据。

## 页面发布检查清单

- [ ] 标题说明解决的问题，目标读者和先修条件清楚。
- [ ] 指标定义包含分子、分母、窗口和边界条件。
- [ ] 命令/代码在声明的工具版本上验证，或明确标注伪代码。
- [ ] 结论注明适用范围、来源等级和最近验证日期。
- [ ] 内部链接有效；外部来源可访问或提供准确引用。
- [ ] `npm run docs:build` 通过。
