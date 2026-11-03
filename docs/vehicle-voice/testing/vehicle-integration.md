# 语音车机集成测试导航

车机软件、车辆网络和台架分别对应不同集成知识点：

- [车载 CAN 信号测试](./can-signal-testing)：DBC、信号编码、状态回读和安全边界。
- [车载语音 HIL 测试](./hil-testing)：台架资源、故障注入和状态恢复。
- [Android 车机与 ADB 测试](./android-adb-testing)：设备、应用、日志和 UI 自动化。
- [车载以太网与服务接口测试](./ethernet-service-testing)：请求/事件、超时、重连和网络故障。
- [车辆与业务状态断言](./vehicle-state-assertions)：验证业务动作的独立结果。

按项目接口增加 Android/车机、Ethernet 或诊断专题；运行前确认权限与台架隔离。
