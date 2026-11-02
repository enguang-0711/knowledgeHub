# Python、Pytest 与 Robot Framework

建议以 Python 承载设备接口、数据处理、指标和报告；用 pytest 或 Robot Framework 表达用例。两个框架适合不同团队协作方式，可以共用 Python adapter 和数据模型。

## Python 工程结构

```text
voice_test/
  adapters/       # audio, adb, event bus, vehicle, hmi
  domain/         # case model, state model, result types
  evaluation/     # normalization, WER/CER, intent/slot metrics
  evidence/       # timestamped event, file store, manifest
  runners/        # local, simulator, HIL execution
tests/
  unit/           # parser/metric/adapter contract
  integration/    # simulator and device tests
corpus/
reports/
pyproject.toml
```

设备 I/O、业务期望和判定逻辑分开；把 `sleep(5)` 换成等待明确事件并设置最大超时；长时间资源用 context manager/finalizer 清理；异常需保留原始 stdout/stderr 和环境信息。

## Pytest 适用点

- 参数化表达同一意图的语料和声学条件。
- fixture 管理设备连接、临时文件、会话复位和清理顺序。
- marker 区分 `offline`、`simulator`、`smoke`、`hil`、`slow` 等执行层级。
- 自定义 report hook 附加 run id、case id、环境、阶段结果和证据地址。
- 对重复/抖动场景使用明确的重复执行统计；不要用无边界自动重试“修复”真实失败。

示意：

```python
def test_climate_temperature_voice_case(case, voice_system, evidence):
    voice_system.reset_session(case.session)
    voice_system.inject(case.audio, zone=case.zone)

    result = voice_system.wait_for_final_result(timeout=case.timeout_s)
    evidence.record("asr", result.asr_event)
    evidence.record("nlu", result.nlu_event)

    assert result.intent == case.expected.intent
    assert result.slots == case.expected.slots

    state = voice_system.wait_for_vehicle_state(
        case.expected.vehicle_state,
        timeout=case.business_timeout_s,
    )
    evidence.record("vehicle_state", state)
```

示例强调分层结果；真实适配器、线程安全、等待机制、状态回滚和安全检查必须按平台实现。不要照搬虚构的 `voice_system` API 作为现成车厂接口。

## Robot Framework 适用点

关键字驱动适合产品/系统测试人员审阅可读场景。把硬件细节封装在 Python Library 中，Robot 文件表达业务流程：

```text
*** Test Cases ***
驾驶员调整温度
    Given 测试台架处于已知状态
    When 在驾驶员音区播放语料    corpus/climate/driver-22c.wav
    Then 识别意图应为    SetClimateTemperature
    And 目标温度信号应为    22
    And 车机应显示    22°C
```

关键字要有清晰参数、超时和失败信息；不要把所有逻辑写进大关键字，也不要在 Python 和 Robot 两层重复断言同一事实。Library 应管理共享资源的生命周期并把证据路径返回到 Robot 报告。

## 如何选型

| 维度 | Pytest | Robot Framework |
|---|---|---|
| Python 开发者主导、复杂逻辑/评估 | 很适合 | 可调用 Python 库但表达较绕 |
| 测试用例供非开发角色阅读 | 需约定 DSL/数据表 | 关键字可读性较好 |
| 插件/参数化/fixture 生态 | 成熟灵活 | 关键字与测试数据生态成熟 |
| 建议定位 | 测试引擎和指标逻辑 | 面向流程的可读编排层 |

不必为“必须选一个”而重复建设：可以让 Robot 编排 HIL 业务流程、pytest 运行离线数据/单元评估，共用同一 Python 包与报告 schema。

## 失败结果类型

至少区分通过、产品失败、环境失败、数据无效、未判定和测试代码错误。报告必须同时存原始记录与解析记录。测试执行器不应吞掉 exception 后继续报告成功；恢复步骤失败要阻止依赖同一设备的后续测试。
