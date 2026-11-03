# 测试工程、AI 与车载语音术语词典

本页收录通用测试工程、AI 评估和车载语音专题中的术语。每张卡片都给出定义、目标系统中的用途、重难点和学习入口；车载语音条目会明确其领域背景。B 站链接是按主题生成的站内搜索页，不代表对搜索结果中的某个具体视频作过审阅；学习标准和接口时，以正式文档为准。

## 语音链路与声学

### ASR — Automatic Speech Recognition（自动语音识别）

**是什么：**把输入语音转换为文字或词序列的技术。输入通常是采样后的音频帧；输出可能包含中间识别文本（partial）、最终文本（final）、时间戳和置信度。

**在车载测试中的作用：**检查口语经过真实麦克风或指定注入点后，系统“听成了什么”。ASR 正确只是语义理解的前提之一，不能单独证明业务已执行。

**重难点：**中文标点、数字、英文缩写如何归一化会改变分数；实时 partial 可能反复修订；最终文本正确也可能已经超时。必须同时保留原始输出、归一化版本和时延。

**学习资料：**[ASR 评测章节](/asr-nlu-dialogue)、[WER/CER 指标](/metrics)；[B 站：ASR 与语音识别](https://search.bilibili.com/all?keyword=ASR%E8%AF%AD%E9%9F%B3%E8%AF%86%E5%88%AB)。

### NLU — Natural Language Understanding（自然语言理解）

**是什么：**把识别文本映射到机器可执行语义的环节，通常输出意图（intent）、槽位（slot）、实体、置信度或拒识结果。

**在车载测试中的作用：**断言“系统是否理解了用户想做什么、对象和参数是什么”，并与 ASR 和业务执行分开定位。

**重难点：**文本相似不代表意图相同；否定、比较、方向、数值和单位经常只差一个词。测试要有成对样本，只改变一个语义要素，并对槽位值做精确校验。

**学习资料：**[ASR、NLU 与对话管理](/asr-nlu-dialogue)；[B 站：NLU 意图识别和槽位抽取](https://search.bilibili.com/all?keyword=NLU%E6%84%8F%E5%9B%BE%E8%AF%86%E5%88%AB%E6%A7%BD%E4%BD%8D%E6%8A%BD%E5%8F%96)。

### TTS — Text-to-Speech（文本转语音）

**是什么：**将文本合成为音频。作为测试输入时，TTS 负责把版本化文本语料转成可重复播放的声音；作为产品输出时，则是车机对用户的语音反馈。

**在车载测试中的作用：**批量产生测试输入，覆盖不同音色、语速和表达；也可采集产品播报用于反馈质量检查。

**重难点：**在线服务可能升级模型，同一文本不一定得到完全相同的波形；合成语音的韵律、口音和发音分布不等于真人。要保存合成后的音频、参数和哈希，并保留有授权的真人代表性数据。

**学习资料：**[语料资产与 TTS 注入](/corpus-tts)；[B 站：TTS 文本转语音与语音合成](https://search.bilibili.com/all?keyword=TTS%E6%96%87%E6%9C%AC%E8%BD%AC%E8%AF%AD%E9%9F%B3%E8%AF%AD%E9%9F%B3%E5%90%88%E6%88%90)。

### VAD — Voice Activity Detection（语音活动检测）

**是什么：**判断音频当前片段是否含有语音活动。它常参与确定何时开始听、何时判定用户说完。

**在车载测试中的作用：**帮助检查静音、噪声、停顿和连续说话下的录音开始/结束行为。

**重难点：**VAD 与唤醒词检测不是一回事；噪声可能被误判成语音，句中停顿也可能造成提前结束。观察窗口和端点事件要依据产品协议定义。

**学习资料：**[音频与声学测试](/audio-acoustics)；[B 站：VAD 语音端点检测](https://search.bilibili.com/all?keyword=VAD%E8%AF%AD%E9%9F%B3%E6%B4%BB%E5%8A%A8%E6%A3%80%E6%B5%8B%E7%AB%AF%E7%82%B9%E6%A3%80%E6%B5%8B)。

### AFE — Audio Front End（音频前端）

**是什么：**麦克风输入进入识别模型前的一组信号处理能力，具体组成因系统而异，常见有多通道处理、波束形成、AEC、降噪和增益控制。

**在车载测试中的作用：**说明音频从麦克风到 ASR 之间还经过哪些算法和硬件，并设计覆盖边界。

**重难点：**不同供应商对 AFE 的范围定义可能不同；软件文件注入常常绕过麦克风和部分前端。测试报告要标清注入点，不能把局部测试称为完整声学链路验证。

**学习资料：**[端到端架构](/architecture)、[音频链路与声学](/audio-acoustics)；[B 站：车载语音 AFE 音频前端](https://search.bilibili.com/all?keyword=%E8%BD%A6%E8%BD%BD%E8%AF%AD%E9%9F%B3AFE%E9%9F%B3%E9%A2%91%E5%89%8D%E7%AB%AF)。

### AEC — Acoustic Echo Cancellation（声学回声消除）

**是什么：**估计扬声器播放并被麦克风再次采集到的回声，再从麦克风信号中抵消它，降低 TTS/媒体声对语音输入的影响。

**在车载测试中的作用：**覆盖播报期间用户插话、媒体播放时识别和多扬声器环境。

**重难点：**AEC 依赖播放参考信号和声学路径估计；播放链路变化、双讲、非线性失真或路径突然变化都可能降低效果。不能只用安静环境单人朗读验证。

**学习资料：**[音频与声学测试](/audio-acoustics)；[B 站：AEC 声学回声消除](https://search.bilibili.com/all?keyword=AEC%E5%A3%B0%E5%AD%A6%E5%9B%9E%E5%A3%B0%E6%B6%88%E9%99%A4)。

### NS — Noise Suppression（噪声抑制）

**是什么：**通过传统信号处理或学习模型降低非目标噪声。降噪后信号更清晰，但也可能损伤语音中的弱辅音或尾音。

**在车载测试中的作用：**覆盖风噪、空调、胎噪和媒体等条件，并观察降噪与识别效果之间的关系。

**重难点：**“噪声越小越好”并不总成立；过强处理会产生音乐噪声或语音伪影。既要看 ASR 结果，也要保存实际回采和处理链状态。

**学习资料：**[音频与声学测试](/audio-acoustics)；[B 站：语音降噪与噪声抑制](https://search.bilibili.com/all?keyword=%E8%AF%AD%E9%9F%B3%E9%99%8D%E5%99%AA%E5%99%AA%E5%A3%B0%E6%8A%91%E5%88%B6)。

### AGC — Automatic Gain Control（自动增益控制）

**是什么：**根据输入电平自动调节增益，使较弱或较强的信号落在处理链的工作范围内。

**在车载测试中的作用：**检查不同说话距离、音量及背景声下的电平适配，识别削波、过度放大或音量抽动。

**重难点：**AGC 会改变动态范围，且可能需要一段时间收敛；播放设备音量档位不是麦克风端声压级。记录声学电平和增益状态，避免只记“音量 50%”。

**学习资料：**[数字音频与播放校准](/audio-acoustics)；[B 站：AGC 自动增益控制音频](https://search.bilibili.com/all?keyword=AGC%E8%87%AA%E5%8A%A8%E5%A2%9E%E7%9B%8A%E6%8E%A7%E5%88%B6%E9%9F%B3%E9%A2%91)。

### SNR — Signal-to-Noise Ratio（信噪比）

**是什么：**信号功率与噪声功率之比，通常以 dB 表示。功率口径下 `SNR_dB = 10 × log10(P_signal / P_noise)`。

**在车载测试中的作用：**描述语音与背景噪声的相对强弱，用于比较受控噪声实验条件。

**重难点：**SNR 不描述噪声的频谱、方向、时间变化或混响；相同 SNR 的风噪和音乐并非等价。还要区分数字混音所得 SNR 与座舱实际声学测量。

**学习资料：**[噪声与 SNR](/audio-acoustics)；[B 站：SNR 信噪比和语音噪声](https://search.bilibili.com/all?keyword=SNR%E4%BF%A1%E5%99%AA%E6%AF%94%E8%AF%AD%E9%9F%B3%E5%99%AA%E5%A3%B0)。

### SPL 与 dBFS — 声压级和数字满量程分贝

**是什么：**SPL（Sound Pressure Level）描述空气中的声压，通常用 dB SPL；dBFS 描述数字波形相对于系统最大满量程的电平。

**在车载测试中的作用：**SPL 用于记录人工嘴/扬声器在测量点的声学播放强度；dBFS 用于检查数字音频的峰值或 RMS 电平。

**重难点：**二者不是同一量，不能把某个 dBFS 数字直接当成车内声压。换算依赖播放设备、功放、距离和校准，需要参考麦克风与校准记录。

**学习资料：**[音频链路与校准](/audio-acoustics)；[B 站：dB SPL 与 dBFS 区别](https://search.bilibili.com/all?keyword=dB%20SPL%20dBFS%E5%8C%BA%E5%88%AB%E9%9F%B3%E9%A2%91)。

### PCM、采样率、位深与声道

**是什么：**PCM（Pulse-Code Modulation，脉冲编码调制）是数字音频样本的表示方式；采样率决定每秒采多少点，位深决定量化精度，声道描述并行音频通道。

**在车载测试中的作用：**保证注入音频符合设备接口格式，并正确解释多麦克风/多音区录音。

**重难点：**修改 WAV 头中的采样率标记不等于重采样；重采样需滤波。把多通道混成单声道会丢失空间信息。WAV 是容器格式，不保证其内部编码和参数相同。

**学习资料：**[数字音频基础](/audio-acoustics)；[FFmpeg 文档](https://ffmpeg.org/documentation.html)、[SoundFile 文档](https://python-soundfile.readthedocs.io/en/latest/)；[B 站：PCM 采样率 位深 声道](https://search.bilibili.com/all?keyword=PCM%E9%87%87%E6%A0%B7%E7%8E%87%E4%BD%8D%E6%B7%B1%E5%A3%B0%E9%81%93%E8%AE%B2%E8%A7%A3)。

## 指标与识别评测

### WER — Word Error Rate（词错误率）

**是什么：**将假设文本和参考文本对齐后，统计替换 S、删除 D、插入 I，再除以参考词数 N：`WER = (S + D + I) / N`。

**在车载测试中的作用：**度量 ASR 转写偏差，适合明确 tokenization 规则的语言和任务。

**重难点：**中文没有天然空格分词；分词器、数字归一化、标点和英文大小写都会改变结果。插入错误可能使 WER 超过 100%。跨版本比较必须固定评测口径。

**学习资料：**[质量指标与统计](/metrics)、[jiwer 文档](https://github.com/jitsi/jiwer)；[B 站：WER 词错误率 ASR 评测](https://search.bilibili.com/all?keyword=WER%E8%AF%8D%E9%94%99%E8%AF%AF%E7%8E%87ASR%E8%AF%84%E6%B5%8B)。

### CER — Character Error Rate（字错误率/字符错误率）

**是什么：**与 WER 计算方法类似，但对齐单位是字符：编辑错误数除以参考字符数。

**在车载中文语音中的作用：**避免汉语分词差异，提供直观的字级识别偏差指标。

**重难点：**按 Unicode 字符、汉字或规范化字符序列的定义会影响结果； CER 不能表达槽位或业务错误严重程度。温度“二十二度”转成“22 度”可能是字符不一致，但语义相同，因此需另报语义/业务指标。

**学习资料：**[质量指标与统计](/metrics)；[B 站：CER 字符错误率 中文 ASR](https://search.bilibili.com/all?keyword=CER%E5%AD%97%E7%AC%A6%E9%94%99%E8%AF%AF%E7%8E%87%E4%B8%AD%E6%96%87ASR)。

### 意图、槽位与 F1

**是什么：**意图表示用户要完成的动作类别；槽位是完成动作需要的参数/实体。Precision（精确率）关注预测为正的结果中有多少正确，Recall（召回率）关注真实正例中找回多少，F1 是两者调和平均。

**在车载测试中的作用：**验证 NLU 是否识别了正确动作和参数，例如 `SetTemperature(zone=driver, value=22)`。

**重难点：**总体准确率会被高频类别主导；宏平均和微平均有不同含义。关键槽位、非法值拦截和严格整句匹配要分开报告。

**学习资料：**[ASR/NLU 评测](/asr-nlu-dialogue)、[分类与槽位指标](/metrics)；[B 站：意图识别 槽位抽取 F1](https://search.bilibili.com/all?keyword=%E6%84%8F%E5%9B%BE%E8%AF%86%E5%88%AB%E6%A7%BD%E4%BD%8D%E6%8A%BD%E5%8F%96F1%E6%8C%87%E6%A0%87)。

### 唤醒率与误唤醒率

**是什么：**唤醒成功率统计目标唤醒机会中成功触发的比例；误唤醒率统计非目标音频/时间中错误触发的频率，常按每小时误唤醒次数表示。

**在车载测试中的作用：**分别衡量漏响应和无故打断，二者是不同的失效风险。

**重难点：**必须定义一次“机会”、成功时间窗、非目标暴露时长和负样本组成。只统计正例成功次数无法算误唤醒率；只按负样本条数也无法代表真实使用暴露时间。

**学习资料：**[语音链路架构](/architecture)、[唤醒与拒识](/metrics)；[B 站：语音唤醒率误唤醒率测试](https://search.bilibili.com/all?keyword=%E8%AF%AD%E9%9F%B3%E5%94%A4%E9%86%92%E7%8E%87%E8%AF%AF%E5%94%A4%E9%86%92%E7%8E%87%E6%B5%8B%E8%AF%95)。

### P95 / P99 与端到端时延

**是什么：**P95 表示 95% 的观测值不超过该值，P99 表示 99% 不超过；端到端时延是明确定义的起始事件到完成事件的时间差。

**在车载测试中的作用：**相比平均值，分位数更能暴露长尾等待；分段时延可定位识别、语义、业务执行和反馈瓶颈。

**重难点：**时钟域、起止事件、超时样本和样本量必须明确。跨设备时钟不同步时，毫秒级结论可能不可信；平均值不能代替尾部指标。

**学习资料：**[时延指标](/metrics)；[B 站：P95 P99 延迟性能测试](https://search.bilibili.com/all?keyword=P95%20P99%E5%BB%B6%E8%BF%9F%E6%80%A7%E8%83%BD%E6%B5%8B%E8%AF%95)。

## 对话与语义

### 对话管理 DM — Dialogue Management

**是什么：**根据当前输入、对话历史、产品策略和权限决定下一步动作，例如执行、补问、拒识、确认或取消。

**在车载测试中的作用：**验证多轮上下文、槽位补充、打断、超时、会话重置和跨音区隔离。

**重难点：**仅以单轮句子为单位无法覆盖状态残留和竞态。测试需保存每轮事件顺序和 session/zone id，并检查取消后是否仍产生副作用。

**学习资料：**[多轮对话评测](/asr-nlu-dialogue)；[B 站：对话管理 Dialogue State 语音助手](https://search.bilibili.com/all?keyword=%E5%AF%B9%E8%AF%9D%E7%AE%A1%E7%90%86Dialogue%20State%E8%AF%AD%E9%9F%B3%E5%8A%A9%E6%89%8B)。

### Intent / Slot（意图 / 槽位）

**是什么：**Intent 是请求类型；Slot 是该请求所需的值。比如“把副驾温度调到 20 度”可拆成意图 `SetTemperature` 和槽位 `zone=passenger`, `temperature=20°C`。

**重难点：**实体值可能要做单位、枚举和上下文归一化；少一个否定词或音区词会改变业务后果。为关键值设计成对边界样本和非法值样本。

**学习资料：**[NLU 评测](/asr-nlu-dialogue)；[B 站：意图槽位语义解析](https://search.bilibili.com/all?keyword=%E8%AF%AD%E4%B9%89%E8%A7%A3%E6%9E%90%E6%84%8F%E5%9B%BE%E6%A7%BD%E4%BD%8D)。

### Partial / Final（中间识别 / 最终识别）

**是什么：**流式 ASR 在用户说话时可能多次发布可修订的中间文本，检测语句结束后再发布最终文本。

**在车载测试中的作用：**检查交互是否及时、最终文本是否稳定、错误 partial 是否触发过早业务动作。

**重难点：**不能把任一 partial 当 final；必须定义 final 事件、修订窗口、端点和业务触发时机。保存原始时间序列才能排查时序错误。

**学习资料：**[流式识别判定](/asr-nlu-dialogue)；[B 站：流式 ASR partial final](https://search.bilibili.com/all?keyword=%E6%B5%81%E5%BC%8FASR%20partial%20final%E8%AF%86%E5%88%AB)。

## 汽车电子与观测

### ECU — Electronic Control Unit（电子控制单元）

**是什么：**车辆上的电子控制器，负责一个或多个车辆域/功能。车载语音可能经服务或网关向相关 ECU 传递请求。

**重难点：**语音服务收到请求不代表 ECU 接受或执行；需理解信号所属控制器、反馈周期和有效条件。具体架构随车型不同。

**学习资料：**[车机、总线与 HIL](/vehicle-integration)；[B 站：汽车 ECU 电子控制单元基础](https://search.bilibili.com/all?keyword=%E6%B1%BD%E8%BD%A6ECU%E7%94%B5%E5%AD%90%E6%8E%A7%E5%88%B6%E5%8D%95%E5%85%83%E5%9F%BA%E7%A1%80)。

### CAN — Controller Area Network（控制器局域网）

**是什么：**汽车常见的串行通信总线，节点通过帧传输标识符和数据。CAN 是总线协议；“空调温度”通常是帧内按数据库解释的信号。

**在车载测试中的作用：**订阅并解码业务结果信号，验证车辆状态是否真的改变。

**重难点：**监听到请求帧不等于状态落地；需检查响应信号、有效位、周期、超时、通道和数据库版本。总线写入需在获准隔离台架内。

**学习资料：**[CAN 信号测试](/vehicle-integration)、[python-can](https://python-can.readthedocs.io/)、[cantools](https://cantools.readthedocs.io/)；[B 站：CAN 总线基础与汽车测试](https://search.bilibili.com/all?keyword=CAN%E6%80%BB%E7%BA%BF%E5%9F%BA%E7%A1%80%E6%B1%BD%E8%BD%A6%E6%B5%8B%E8%AF%95)。

### DBC — CAN Database（CAN 数据库描述文件）

**是什么：**描述 CAN 帧和信号映射的数据库格式，通常包含帧 ID、信号位、长度、字节序、缩放、偏移和单位。

**在车载测试中的作用：**把原始总线字节解码成可读的物理量或状态。

**重难点：**DBC 版本必须与车型/ECU 软件匹配；错误字节序、缩放或偏移会制造“看似合理”的错误值。记录所用数据库版本和信号定义。

**学习资料：**[CAN/DBC 集成](/vehicle-integration)、[cantools 文档](https://cantools.readthedocs.io/)；[B 站：DBC 信号解析 CAN](https://search.bilibili.com/all?keyword=DBC%E4%BF%A1%E5%8F%B7%E8%A7%A3%E6%9E%90CAN)。

### ADB — Android Debug Bridge（Android 调试桥）

**是什么：**连接开发机与 Android 设备的命令行工具，可用于安装应用、采集日志、查询设备和执行调试操作。

**在车载测试中的作用：**发现和识别车机设备、获取 logcat、检查版本和辅助测试环境恢复。

**重难点：**多设备时必须明确序列号；设备未授权、断连或命令卡住要判为环境问题并保留错误输出。刷机/清数据属于改变环境的维护操作，需要检查和恢复流程。

**学习资料：**[Android 官方 ADB 文档](https://developer.android.com/tools/adb)、[车机集成](/vehicle-integration)；[B 站：ADB 常用命令 Android 自动化](https://search.bilibili.com/all?keyword=ADB%E5%B8%B8%E7%94%A8%E5%91%BD%E4%BB%A4Android%E8%87%AA%E5%8A%A8%E5%8C%96)。

### HIL — Hardware-in-the-Loop（硬件在环）

**是什么：**将真实 ECU/硬件接入实时仿真或台架环境，由仿真模型提供环境输入，并采集设备输出。

**在车载测试中的作用：**在可控环境下覆盖设备、总线和控制逻辑组合，降低道路实车测试风险并提高重复性。

**重难点：**HIL 不是“接上真机就算完成”；模型准确性、接口映射、时钟同步、资源锁、台架健康和状态恢复都会影响有效性。报告中要注明仿真与真实车辆的差异。

**学习资料：**[HIL 资源与状态恢复](/vehicle-integration)、[测试分层与 CI](/ci-quality)；[B 站：HIL 硬件在环汽车测试](https://search.bilibili.com/all?keyword=HIL%E7%A1%AC%E4%BB%B6%E5%9C%A8%E7%8E%AF%E6%B1%BD%E8%BD%A6%E6%B5%8B%E8%AF%95)。

### HMI — Human-Machine Interface（人机界面）与 OCR

**是什么：**HMI 是用户与系统交互的界面，包含屏幕、控件、反馈等；OCR（Optical Character Recognition）是从图像中识别文字的技术。

**在车载测试中的作用：**验证语音操作后目标屏幕是否更新、用户是否能看到预期状态。

**重难点：**OCR 文本正确也不能证明业务数据源正确；动画、缩放、动态区域会造成截图差异。优先使用 accessibility tree/控件状态，OCR 需做多帧稳定判定和低置信度处理。

**学习资料：**[多模态断言](/multimodal-assertions)、[OpenCV 文档](https://docs.opencv.org/4.x/)；[B 站：OpenCV OCR UI 自动化测试](https://search.bilibili.com/all?keyword=OpenCV%20OCR%20UI%E8%87%AA%E5%8A%A8%E5%8C%96%E6%B5%8B%E8%AF%95)。

### SOME/IP 与 DoIP

**是什么：**SOME/IP 是汽车以太网中常见的面向服务通信协议；DoIP（Diagnostics over Internet Protocol）用于基于 IP 的车辆诊断通信。具体使用取决于车型架构。

**在车载测试中的作用：**为跨 ECU 服务调用、事件订阅或诊断观测提供网络侧证据。

**重难点：**“网络能连通”不代表服务发现、实例、版本、订阅和业务状态正确；要按项目接口定义检查生命周期和超时。不要假设所有车载 Ethernet 都使用同一协议栈。

**学习资料：**[Ethernet 与服务接口](/vehicle-integration)、[ASAM 标准入口](https://www.asam.net/standards/)；[B 站：SOME/IP DoIP 汽车以太网](https://search.bilibili.com/all?keyword=SOME%2FIP%20DoIP%E6%B1%BD%E8%BD%A6%E4%BB%A5%E5%A4%AA%E7%BD%91)。

## 自动化与 AI 测试

### Pytest fixture / 参数化

**是什么：**fixture 为测试提供可复用资源和前后置清理；参数化让同一测试逻辑按多组数据执行。

**在车载测试中的作用：**管理设备连接、会话重置、语料变体和清理流程。

**重难点：**fixture 生命周期过长可能让状态跨用例污染；硬件失败不能被普通 teardown 吞掉。参数要包含数据版本和环境标签，报告中能反查。

**学习资料：**[pytest 官方文档](https://docs.pytest.org/en/stable/)、[自动化框架](/automation-framework)；[B 站：pytest fixture 参数化](https://search.bilibili.com/all?keyword=pytest%20fixture%E5%8F%82%E6%95%B0%E5%8C%96%E6%B5%8B%E8%AF%95)。

### Robot Framework 关键字驱动

**是什么：**用可读关键字组织测试流程，底层由 Python Library 实现复杂的设备接口和逻辑。

**在车载测试中的作用：**让测试流程对跨职能团队更易审阅，同时复用 Python 设备适配器。

**重难点：**不要把流程包装成没有信息量的“大关键字”；关键字参数、超时和失败信息要清晰。Python 与 Robot 不要重复维护同一业务断言。

**学习资料：**[Robot Framework 用户指南](https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html)、[自动化框架](/automation-framework)；[B 站：Robot Framework 自动化测试](https://search.bilibili.com/all?keyword=Robot%20Framework%E8%87%AA%E5%8A%A8%E5%8C%96%E6%B5%8B%E8%AF%95Python)。

### CI/CD — Continuous Integration / Continuous Delivery

**是什么：**持续集成/持续交付流水线，将代码变更、构建、自动检查、测试结果和制品发布按规则自动串联。

**在车载测试中的作用：**让离线评测、模拟器测试和受控设备冒烟可重复触发，并积累版本趋势。

**重难点：**真实台架有独占性、网络和安全边界，不能当普通共享 runner；重试不能把产品失败刷成绿灯；必须保留测试数据、模型/固件版本和失败工件。

**学习资料：**[CI 与趋势治理](/ci-quality)、[GitHub Actions 文档](https://docs.github.com/actions)；[B 站：GitHub Actions CI CD 入门](https://search.bilibili.com/all?keyword=GitHub%20Actions%20CI%20CD%E5%85%A5%E9%97%A8)。

### LLM Judge（大模型裁判）

**是什么：**让大语言模型按照评判标准比较输入/输出，给出标签或理由，例如判断两种口语表达是否语义等价。

**在车载测试中的作用：**可辅助处理自由表达、日志总结和失败聚类，不适合未经校准地独立决定关键功能是否通过。

**重难点：**模型可能对否定、数字、单位和顺序敏感；提示、模型版本会导致结果漂移。要用专家标注集测误判率、按风险分层，并保留引用证据和人工复核。

**学习资料：**[大模型辅助测试](/llm-testing)、[OpenAI Evals 指南](https://platform.openai.com/docs/guides/evals)；[B 站：LLM Judge 大模型评估](https://search.bilibili.com/all?keyword=LLM%20Judge%E5%A4%A7%E6%A8%A1%E5%9E%8B%E8%AF%84%E4%BC%B0)。

### RAG — Retrieval-Augmented Generation（检索增强生成）

**是什么：**先从知识源检索相关片段，再让生成模型基于这些片段作答。

**在知识库中的作用：**未来可用于按项目规范回答接口、测试策略和术语问题，并附带来源和版本。

**重难点：**答案流畅不代表检索到正确版本；需评估召回率、引用准确率、权限隔离和过期内容处理。静态 Pages 搜索和企业级 RAG 是不同能力。

**学习资料：**[LLM 知识问答与 RAG](/llm-testing)；[B 站：RAG 检索增强生成入门](https://search.bilibili.com/all?keyword=RAG%E6%A3%80%E7%B4%A2%E5%A2%9E%E5%BC%BA%E7%94%9F%E6%88%90%E5%85%A5%E9%97%A8)。

### ETSI ES 202 396-1

**是什么：**ETSI（European Telecommunications Standards Institute，欧洲电信标准协会）发布的标准系列中的一部分，涉及背景噪声仿真技术及相关数据库主题。使用时必须查明具体版本、标题和适用条款。

**在车载测试中的作用：**可作为噪声仿真实验设计的参考来源之一，帮助规范噪声条件和方法描述。

**重难点：**不能仅凭标准编号推断其覆盖所有车内声场或可直接作为车厂验收门槛；正式项目要求和标准版本需要单独核实。

**学习资料：**[ETSI 官方标准检索](https://www.etsi.org/standards-search#page=1&search=ES%20202%20396-1)、[声学与噪声测试](/audio-acoustics)；[B 站：ETSI ES 202 396 车载噪声仿真](https://search.bilibili.com/all?keyword=ETSI%20ES%20202%20396%20%E5%99%AA%E5%A3%B0%E4%BB%BF%E7%9C%9F)。

## 怎么使用这本词典

读到新术语时，先从本页建立最小心智模型，再进入对应的深度页，最后完成页内动手练习。对于标准、工具命令和评测指标，记录版本及测量口径；对于 B 站课程，建议在笔记中补充所选视频的标题、UP 主、发布日期、链接和自己核验的结论，形成经过筛选的个人书签集。全站主题分类见[知识地图](/knowledge-map)。
