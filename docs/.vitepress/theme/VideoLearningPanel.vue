<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

defineProps<{ instance: 'aside' | 'mobile' }>()

type Topic = { title: string; query: string }

const topics: Record<string, Topic> = {
  'knowledge-map': { title: '测试与质量工程知识地图', query: '软件测试 质量工程 学习路线' },
  'vehicle-cases': { title: '车载测试领域案例', query: '车载语音测试 车载视觉测试' },
  'vehicle-voice-testing': { title: '车载语音测试专题', query: '车载语音自动化测试 ASR NLU HIL' },
  'vehicle-voice-roadmap': { title: '车载语音测试学习路线', query: '车载语音测试 ASR NLU 自动化学习' },
  'vehicle-voice-development-roadmap': { title: '车载语音开发学习路线', query: '车载语音开发 音频 DSP ASR TTS 车载部署' },
  'vehicle-voice/development': { title: '车载语音开发知识点', query: '车载语音开发 C++ 音频处理 ASR NLU TTS' },
  'vehicle-voice/development/system-architecture-and-requirements': { title: '语音需求与系统架构', query: '语音系统架构 需求分析 车载语音端到端' },
  'vehicle-voice/development/cpp-audio-runtime': { title: 'C++ 与实时音频工程', query: 'C++ 实时音频 回调 音频缓冲区 并发' },
  'vehicle-voice/development/python-audio': { title: 'Python 音频数据处理', query: 'Python librosa NumPy SciPy 音频处理' },
  'vehicle-voice/development/linux-git-debugging': { title: 'Linux、Git 与音频调试', query: 'Linux 音频调试 gdb perf ALSA' },
  'vehicle-voice/development/math-dsp': { title: '语音开发数学与信号处理基础', query: '数字信号处理 DSP 傅里叶变换 卷积 语音' },
  'vehicle-voice/development/digital-audio': { title: '数字音频格式与预处理', query: 'PCM 采样率 位深 重采样 音频预处理' },
  'vehicle-voice/development/acoustics-audio-front-end': { title: '车内声学与音频前端', query: '车内声学 麦克风阵列 回声 噪声 音频前端' },
  'vehicle-voice/development/audio-front-end': { title: 'AEC、降噪、增益与波束形成', query: 'AEC 回声消除 降噪 AGC 波束形成' },
  'vehicle-voice/development/wake-vad-endpoint': { title: '唤醒词、VAD 与端点检测', query: '语音唤醒 KWS VAD 端点检测' },
  'vehicle-voice/development/speaker-multizone': { title: '多音区与说话人处理', query: '车载语音 多音区定位 说话人识别' },
  'vehicle-voice/development/asr-models-decoding': { title: 'ASR 模型与解码', query: 'ASR CTC RNN-T Attention 语音识别解码' },
  'vehicle-voice/development/asr-training-adaptation': { title: 'ASR 语料、训练与领域适配', query: 'ASR 语料训练 领域适配 热词' },
  'vehicle-voice/development/speech-data-evaluation': { title: '语音数据集与评估', query: '语音数据集 WER CER 语音识别评估' },
  'vehicle-voice/development/nlu-intent-slots': { title: 'NLU 意图与槽位', query: '语音 NLU 意图识别 槽位抽取' },
  'vehicle-voice/development/dialogue-management': { title: '对话管理与上下文状态', query: '对话管理 多轮对话 状态机 槽位' },
  'vehicle-voice/development/tts-synthesis': { title: 'TTS、发音与韵律', query: 'TTS 文本转语音 韵律 声码器' },
  'vehicle-voice/development/streaming-voice-services': { title: '流式语音服务与交互协议', query: '流式 ASR TTS 首包延迟 barge-in 语音服务' },
  'vehicle-voice/development/vehicle-voice-functions': { title: '车载语音业务与车辆接口', query: '车载语音 业务接口 车辆信号 服务调用' },
  'vehicle-voice/development/system-integration': { title: '车机语音系统集成', query: '车机语音系统集成 Android Automotive 音频 HAL' },
  'vehicle-voice/development/model-deployment': { title: '语音模型部署与边缘推理', query: '语音模型部署 ONNX Runtime 端侧推理' },
  'vehicle-voice/development/performance-optimization': { title: '实时性能与优化', query: '语音推理性能优化 实时延迟 内存 profiling' },
  'vehicle-voice/development/reliability-data-loop': { title: '可靠性、隐私与数据闭环', query: '语音系统可靠性 隐私 数据闭环 监控' },
  'vehicle-vision': { title: '车载视觉系统测试', query: '车载视觉测试 ADAS 感知 摄像头' },
  'vehicle-vision/development-roadmap': { title: '车载视觉开发学习路线', query: '车载视觉算法开发 C++ 深度学习 模型部署' },
  'vehicle-vision/development': { title: '车载视觉开发知识点', query: '计算机视觉 C++ 深度学习 目标检测 相机标定 模型部署' },
  'vehicle-vision/roadmap': { title: '车载视觉测试学习路线', query: '自动驾驶视觉感知测试 数据集 评估指标' },
  'vehicle-vision/camera-imaging-calibration': { title: '摄像头成像与标定', query: '车载摄像头 ISP 相机内外参 标定' },
  'vehicle-vision/dataset-and-annotation': { title: '视觉数据集与标注质量', query: '自动驾驶视觉数据集 标注规范 CVAT 数据质量' },
  'vehicle-vision/perception-tasks-metrics': { title: '视觉任务与评估指标', query: '目标检测 AP mAP 跟踪分割 评估指标' },
  'vehicle-vision/scenario-coverage': { title: '视觉场景覆盖与 ODD', query: '自动驾驶 ODD 长尾场景 覆盖率测试' },
  'vehicle-vision/adas-front-camera': { title: '前视 ADAS 感知测试', query: '前视摄像头 ADAS 感知测试 车道线 目标跟踪' },
  'vehicle-vision/surround-view-parking': { title: '环视与泊车视觉', query: 'AVM 环视拼接 标定 泊车感知测试' },
  'vehicle-vision/cabin-vision-dms-oms': { title: '舱内 DMS / OMS', query: 'DMS OMS 驾驶员乘员监测 视觉测试' },
  'vehicle-vision/simulation-replay': { title: '视觉仿真与回放', query: '自动驾驶视觉 SIL HIL 视频回放 场景仿真' },
  'vehicle-vision/ecu-performance-ci': { title: '视觉 ECU 性能与 CI', query: '车载 ECU 感知模型 性能测试 CI 回归' },
  architecture: { title: '端到端语音架构', query: '车载语音端到端系统架构 ASR NLU' },
  metrics: { title: '语音质量指标', query: 'WER CER 语音识别评测指标' },
  'audio-acoustics': { title: '音频与车内声学', query: '车载语音音频声学 SNR 人工嘴测试' },
  'corpus-tts': { title: '测试语料与 TTS', query: 'TTS 语音测试语料生成管理' },
  'asr-nlu-dialogue': { title: 'ASR、NLU 与多轮对话', query: 'ASR NLU 多轮对话管理语音测试' },
  'vehicle-integration': { title: '车机、CAN 与 HIL', query: 'ADB CAN DBC HIL 车载自动化测试' },
  'multimodal-assertions': { title: '日志、UI 与总线断言', query: '车载语音日志 UI OCR CAN 自动化测试' },
  'automation-framework': { title: 'Python 自动化框架', query: 'Python pytest Robot Framework 自动化测试' },
  'ci-quality': { title: 'CI 与质量趋势', query: 'GitHub Actions CI 自动化回归测试' },
  'llm-testing': { title: '大模型辅助测试', query: 'LLM Judge RAG 大模型测试评估' },
  projects: { title: '车载语音测试实战', query: '车载语音自动化测试 实战项目' },
  roadmap: { title: '测试与质量工程学习路线', query: '软件测试工程师 学习路线 自动化测试' },
  glossary: { title: '测试与工程术语词典', query: '软件测试 自动化测试 术语讲解' },
  'knowledge-base-plan': { title: '知识库建设方法', query: '技术知识库 GitHub Pages VitePress' },
  'tools-and-resources': { title: '测试工具与技术栈', query: 'Python pytest FFmpeg jiwer 语音测试工具' },
  templates: { title: '测试用例与语料模板', query: '语音自动化测试用例 数据驱动模板' }
}

const route = useRoute()
const slug = computed(() => route.path
  .replace(/\.html$/, '')
  .replace(/\/$/, '')
  .split('/')
  .filter(Boolean)
  .join('/') || 'index'
)
const topic = computed(() => topics[slug.value] ?? {
  title: '本页主题',
  query: '软件测试与质量工程'
})
const searchUrl = computed(() =>
  `https://search.bilibili.com/all?keyword=${encodeURIComponent(topic.value.query)}`
)
const storageKey = computed(() => `car-voice-learning-video:${slug.value}`)

const input = ref('')
const playingBvid = ref('')
const error = ref('')

const extractedBvid = computed(() => {
  const match = input.value.trim().match(/BV[0-9A-Za-z]{10}/i)
  return match ? `BV${match[0].slice(2)}` : ''
})

const playerUrl = computed(() => playingBvid.value
  ? `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(playingBvid.value)}&page=1&autoplay=0&danmaku=0`
  : '')

const sourceUrl = computed(() => playingBvid.value
  ? `https://www.bilibili.com/video/${playingBvid.value}/`
  : '')

function restoreVideo() {
  const saved = localStorage.getItem(storageKey.value) || ''
  input.value = saved
  playingBvid.value = saved
  error.value = ''
}

onMounted(restoreVideo)
watch(() => route.path, restoreVideo)

function playVideo() {
  if (!extractedBvid.value) {
    error.value = '请输入 BV 号，或粘贴完整的 B 站视频链接。'
    return
  }

  input.value = extractedBvid.value
  playingBvid.value = extractedBvid.value
  localStorage.setItem(storageKey.value, extractedBvid.value)
  error.value = ''
}

function clearVideo() {
  input.value = ''
  playingBvid.value = ''
  localStorage.removeItem(storageKey.value)
  error.value = ''
}
</script>

<template>
  <section class="video-learning-panel" aria-label="视频学习区">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">VIDEO LEARNING</p>
        <h2>视频学习区</h2>
      </div>
      <span class="topic-badge">{{ topic.title }}</span>
    </div>

    <div class="player-frame" :class="{ 'is-empty': !playerUrl }">
      <iframe
        v-if="playerUrl"
        :key="playerUrl"
        :src="playerUrl"
        :title="`${topic.title} · Bilibili 视频播放器`"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      />
      <div v-else class="empty-state">
        <span class="play-icon" aria-hidden="true">▶</span>
        <strong>播放本专题视频</strong>
        <span>从 B 站复制视频链接或 BV 号</span>
      </div>
    </div>

    <form class="video-controls" @submit.prevent="playVideo">
      <label class="sr-only" :for="`video-id-${slug}-${instance}`">B 站视频链接或 BV 号</label>
      <div class="input-row">
        <input
          :id="`video-id-${slug}-${instance}`"
          v-model="input"
          type="text"
          autocomplete="off"
          placeholder="粘贴 B 站链接或 BV 号"
          @input="error = ''"
        />
        <button class="play-button" type="submit">播放</button>
      </div>
      <p v-if="error" class="input-error" role="alert">{{ error }}</p>
    </form>

    <div class="panel-links">
      <a :href="searchUrl" target="_blank" rel="noreferrer">搜索本页主题 ↗</a>
      <a v-if="sourceUrl" :href="sourceUrl" target="_blank" rel="noreferrer">在 B 站打开 ↗</a>
      <button v-if="playingBvid" type="button" @click="clearVideo">清除</button>
    </div>

    <p class="panel-note">视频由 B 站提供。播放记录仅保存在当前浏览器。</p>
  </section>
</template>

<style scoped>
.video-learning-panel {
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  box-shadow: 0 8px 28px rgb(0 0 0 / 5%);
}

.panel-heading {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 14px 14px 12px;
}

.eyebrow {
  margin: 0 0 3px;
  color: var(--vp-c-brand-1);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.13em;
}

h2 {
  margin: 0;
  font-size: 16px;
  line-height: 1.3;
}

.topic-badge {
  max-width: 100%;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 4px 8px;
  color: var(--vp-c-text-2);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-frame {
  position: relative;
  display: grid;
  aspect-ratio: 16 / 9;
  place-items: center;
  overflow: hidden;
  background: #11131a;
}

.player-frame iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 12px;
  color: #f2f4f8;
  text-align: center;
}

.empty-state strong {
  font-size: 13px;
}

.empty-state span:last-child {
  color: #b9bfcb;
  font-size: 11px;
}

.play-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 42%);
  border-radius: 50%;
  color: #fff;
  font-size: 12px;
  padding-left: 2px;
}

.video-controls {
  padding: 12px 12px 0;
}

.input-row {
  display: flex;
  gap: 6px;
}

.input-row input {
  min-width: 0;
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  outline: none;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  padding: 8px 9px;
  font-size: 11px;
}

.input-row input:focus {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.play-button {
  flex: 0 0 auto;
  border: 0;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.play-button:hover {
  background: var(--vp-c-brand-2);
}

.input-error {
  margin: 7px 0 0;
  color: var(--vp-c-danger-1);
  font-size: 11px;
}

.panel-links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding: 11px 12px 0;
  font-size: 11px;
}

.panel-links a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
}

.panel-links a:hover {
  text-decoration: underline;
}

.panel-links button {
  border: 0;
  background: transparent;
  color: var(--vp-c-text-3);
  padding: 0;
  font: inherit;
  cursor: pointer;
}

.panel-note {
  margin: 9px 12px 12px;
  color: var(--vp-c-text-3);
  font-size: 10px;
  line-height: 1.5;
}

.sr-only {
  position: absolute;
  overflow: hidden;
  width: 1px;
  height: 1px;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

@media (max-width: 1279px) {
  .video-learning-panel {
    max-width: 560px;
  }

  .panel-heading {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
