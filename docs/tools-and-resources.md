# 工具栈与参考资料

工具应该服务于测试问题。先固定输入、证据和验收指标，再选工具；采购工具不等于覆盖能力。商业设备、云服务和开源软件的授权/数据处理条款都要在项目中核实。

## 按能力选择工具

| 能力 | 建议先掌握 | 进阶/替代 | 选择与边界 |
|---|---|---|---|
| 主语言 | Python 3、虚拟环境、pytest | 类型检查、asyncio、包管理 | 设备库依赖 Python 版本时按项目锁版本 |
| 关键字用例 | Robot Framework + Python Library | 自定义 listener/report | 有跨职能读者时用可读关键字；设备逻辑留在 Python |
| 音频转换/校验 | FFmpeg、SoundFile | Pydub、Librosa | FFmpeg 做转码/混音方便；SoundFile 读写 PCM/WAV；Librosa 用于特征分析，不要对原始信号静默做归一化 |
| WER/CER | jiwer + 自定义中文归一化 | 自建编辑对齐器、其他评测脚本 | 库只负责编辑距离的一部分；中文 tokenizer、数值/单位策略必须受控 |
| TTS | 本地/可控 TTS 或获批的云 TTS | Azure、阿里云、讯飞等 | 批量生成前检查数据出境/留存条款；固化生成音频和参数，不在每次测试时在线漂移 |
| 车机控制 | ADB 与项目授权接口 | 厂商自动化 SDK | 设备序列号、权限、超时、日志归档和恢复流程必须显式 |
| 视觉 | OpenCV、可访问性接口 | PaddleOCR、EasyOCR、商业 OCR | 优先语义状态和控件树；OCR 对语言、分辨率、字体和阈值做实测校准 |
| CAN/总线 | 概念、DBC、解码/订阅工具 | Vector CANoe、python-can、cantools、项目自研接口 | 读写能力、硬件接口、授权和隔离要求各不相同；车控写入只能在批准台架和安全策略下执行 |
| 声学实验 | 播放/采集、参考麦克风、校准流程 | HEAD acoustics 等专业声学系统 | 先掌握校准和实验设计；设备品牌不是方法学的替代 |
| ASR 参考 | 固定版本的开源或自托管模型 | Whisper、SenseVoice、Qwen-ASR 等 | 作为参考模型或离线基线；目标车机产品验收仍需用其实际服务和版本 |
| CI/容器 | GitHub Actions/GitLab CI、Docker | Jenkins、私有制品库、HIL 调度器 | 容器可固定离线依赖，通常不能代替真实麦克风、总线硬件或需 USB/许可证的 host 环境 |

## 建议安装顺序

### 第一组：离线闭环

Python、pytest、FFmpeg、SoundFile、jiwer、YAML 解析和 JSON 报告。完成音频 manifest 校验、批量执行模型输出、计算 CER/WER 并留存逐条对齐。

### 第二组：语料和算法实验

接入选定 TTS 与一个可离线复现的 ASR；冻结依赖/模型版本；增加分层报告、文本归一化版本、数据切分和人工复核工具。注意某些 ASR/TTS 权重或 API 有不同许可证。

### 第三组：车端观测

ADB、日志收集、屏幕/可访问性状态查询，再接项目授权的音频注入和车辆状态订阅。把各适配器包在统一接口后再加 Robot Framework 关键字。

### 第四组：受控硬件与流水线

为声学设备、CAN 仪器和 HIL runner 建设备自检、独占锁、校准/版本登记、急停/收尾及审计。真实硬件执行在受控网络和 runner 上完成，不放在公开 GitHub-hosted runner。

## 大模型工具的选型问题

比模型排行榜更重要的问题包括：输入是否允许离开内网、保留策略和训练使用条款是什么、模型版本是否固定、结构化输出约束是否稳定、能否离线运行、如何评估中文/方言能力、一次请求成本/延迟、失败时如何人工回退。测试语料和日志要按敏感等级筛选，不能把客户数据粘贴到未经批准的在线服务。

## 参考资料入口

优先从官方文档和标准组织核对接口/版本。访问日期、标准版本和项目适用性要写入引用记录。这里的链接是学习入口，不代表项目已采用对应版本或商业产品。

### 标准、声学与汽车测试

- [ETSI 标准检索：ES 202 396-1](https://www.etsi.org/standards-search#page=1&search=ES%20202%20396-1) — 核对背景噪声仿真与数据库相关条款的版本和适用范围。
- [ISO 官网标准目录](https://www.iso.org/standards.html) — 用于按项目需求检索质量、功能安全、AI 治理等标准；正式文本可能需购买。
- [ASAM 标准目录](https://www.asam.net/standards/) — 仿真、测量和汽车测试接口相关标准入口。
- [Vector CANoe 产品入口](https://www.vector.com/int/en/products/products-a-z/software/canoe/) — 商业总线/网络测试工具参考；具体许可、接口和版本按项目确认。
- [HEAD acoustics 产品入口](https://www.head-acoustics.com/) — 专业声学/语音质量测试设备参考；重点学习测量链路和校准方法。
- [中汽中心](https://www.catarc.ac.cn/) 与 [i-VISTA](https://www.i-vista.org/) — 国内汽车测试和智能汽车评价活动入口。具体评价项目、版本和结果应引用对应正式材料。

### 开发与评测

- [Python 官方教程](https://docs.python.org/3/tutorial/)；[pytest 文档](https://docs.pytest.org/en/stable/)；[Robot Framework 用户指南](https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html)。
- [FFmpeg 文档](https://ffmpeg.org/documentation.html)；[SoundFile 文档](https://python-soundfile.readthedocs.io/en/latest/)；[Librosa 文档](https://librosa.org/doc/latest/)；[Pydub 项目](https://github.com/jiaaro/pydub)。
- [jiwer 项目](https://github.com/jitsi/jiwer) — WER/CER 编辑距离工具；先核对安装版本和归一化实现。
- [Android Debug Bridge 文档](https://developer.android.com/tools/adb)。
- [OpenCV 文档](https://docs.opencv.org/4.x/)；[PaddleOCR 文档](https://paddlepaddle.github.io/PaddleOCR/)；[EasyOCR 项目](https://github.com/JaidedAI/EasyOCR)。
- [python-can 文档](https://python-can.readthedocs.io/)；[cantools 文档](https://cantools.readthedocs.io/) — 用于对应硬件/DBC 协议的开发和离线解析练习，不自动赋予车控写入权限。
- [OpenAI Evals 指南](https://platform.openai.com/docs/guides/evals) — 作为 LLM 评估方法的厂商实现参考；评测思想可用于其他模型平台。

### 站点部署

- [VitePress 部署指南](https://vitepress.dev/guide/deploy)
- [GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## 资源纳入知识库时的记录模板

每个外部资源记录：组织/作者、标题、版本/发布日期、稳定 URL、访问日期、可引用范围/许可、对应知识页、是否在本地验证。社区文章可以提供线索，但关键结论尽量回到标准、官方接口、可复现实验或多源交叉验证。
