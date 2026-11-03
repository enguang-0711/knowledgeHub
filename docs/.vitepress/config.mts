import { defineConfig } from 'vitepress'

const base = process.env.VITEPRESS_BASE || '/'
const githubRepo = process.env.GITHUB_REPOSITORY

export default defineConfig({
  lang: 'zh-CN',
  title: '软件测试与质量工程知识库',
  description: '面向 AI 时代的软件测试、自动化工程、质量度量与行业实践知识库',
  base,
  lastUpdated: true,
  themeConfig: {
    outline: { label: '本页目录' },
    siteTitle: '测试与质量工程知识库',
    nav: [
      { text: '知识地图', link: '/knowledge-map' },
      { text: '学习路线', link: '/roadmap' },
      { text: '工程能力', link: '/automation-framework' },
      { text: '领域案例', link: '/vehicle-cases' },
      { text: '实战项目', link: '/vehicle-voice/testing/projects' },
      { text: '知识库建设', link: '/knowledge-base-plan' },
      { text: '术语词典', link: '/glossary' },
      { text: '工具与资料', link: '/tools-and-resources' }
    ],
    sidebar: {
      '/': [
        {
          text: '知识库导航',
          items: [
            { text: '知识库首页', link: '/' },
            { text: '知识地图与范围', link: '/knowledge-map' },
            { text: '通用学习路线', link: '/roadmap' },
            { text: '知识库建设方案', link: '/knowledge-base-plan' },
            { text: '测试与技术术语词典', link: '/glossary' }
          ]
        },
        {
          text: '测试工程能力',
          items: [
            { text: 'Python、Pytest 与 Robot Framework', link: '/automation-framework' },
            { text: 'CI、报告与质量趋势', link: '/ci-quality' },
            { text: '可复用模板与检查清单', link: '/templates' },
            { text: '工具栈与参考资料', link: '/tools-and-resources' }
          ]
        },
        {
          text: 'AI 与智能系统测试',
          items: [
            { text: '大模型应用测试与评估', link: '/llm-testing' }
          ]
        },
        {
          text: '车载语音专题',
          items: [
            { text: '专题总览', link: '/vehicle-voice/' }
          ]
        },
        {
          text: '车载语音开发',
          items: [
            { text: '开发学习路线', link: '/vehicle-voice/development/roadmap' },
            { text: '开发知识点文档', link: '/vehicle-voice/development/' }
          ]
        },
        {
          text: '车载语音测试',
          items: [
            { text: '测试专题导览', link: '/vehicle-voice/testing/' },
            { text: '测试学习路线', link: '/vehicle-voice/testing/roadmap' },
            { text: '端到端架构与测试边界', link: '/vehicle-voice/testing/architecture' },
            { text: '音频链路与声学测试', link: '/vehicle-voice/testing/audio-acoustics' },
            { text: '语料资产与 TTS 注入', link: '/vehicle-voice/testing/corpus-tts' },
            { text: 'ASR、NLU 与对话管理', link: '/vehicle-voice/testing/asr-nlu-dialogue' },
            { text: '质量指标与统计方法', link: '/vehicle-voice/testing/metrics' },
            { text: '车机、总线与 HIL', link: '/vehicle-voice/testing/vehicle-integration' },
            { text: '日志、UI 与多模态断言', link: '/vehicle-voice/testing/multimodal-assertions' },
            { text: '实战项目与验收', link: '/vehicle-voice/testing/projects' }
          ]
        },
        {
          text: '车载视觉专题',
          items: [
            { text: '专题总览', link: '/vehicle-vision/' }
          ]
        },
        {
          text: '车载视觉开发',
          items: [
            { text: '视觉开发学习路线', link: '/vehicle-vision/development/roadmap' },
            { text: '视觉开发知识点文档', link: '/vehicle-vision/development/' },
            { text: 'ADAS 标定台 3D 展示', link: '/vehicle-vision/development/adas-calibration-3d' },
            { text: '环视泊车验证台 3D 展示', link: '/vehicle-vision/development/surround-view-parking-3d' },
            { text: '前视 ADAS 道路验证台', link: '/vehicle-vision/development/adas-road-3d' },
            { text: '驾驶员监测 DMS 座舱试验台', link: '/vehicle-vision/development/dms-cabin-3d' }
          ]
        },
        {
          text: '车载视觉测试',
          items: [
            { text: '视觉测试专题导览', link: '/vehicle-vision/testing/' },
            { text: '视觉测试学习路线', link: '/vehicle-vision/testing/roadmap' },
            { text: '成像、坐标与标定', link: '/vehicle-vision/testing/camera-imaging-calibration' },
            { text: '数据集与标注质量', link: '/vehicle-vision/testing/dataset-and-annotation' },
            { text: '感知任务与评估指标', link: '/vehicle-vision/testing/perception-tasks-metrics' },
            { text: '场景覆盖与 ODD', link: '/vehicle-vision/testing/scenario-coverage' },
            { text: '前视 ADAS 感知', link: '/vehicle-vision/testing/adas-front-camera' },
            { text: '环视与泊车视觉', link: '/vehicle-vision/testing/surround-view-parking' },
            { text: '舱内 DMS / OMS', link: '/vehicle-vision/testing/cabin-vision-dms-oms' },
            { text: '仿真、回放与 SIL/HIL', link: '/vehicle-vision/testing/simulation-replay' },
            { text: 'ECU 性能、回归与 CI', link: '/vehicle-vision/testing/ecu-performance-ci' }
          ]
        }
      ]
    },
    search: { provider: 'local' },
    ...(githubRepo ? {
      repo: githubRepo,
      editLink: {
        pattern: `https://github.com/${githubRepo}/edit/main/docs/:path`,
        text: '在 GitHub 上编辑此页'
      },
      socialLinks: [
        { icon: 'github', link: `https://github.com/${githubRepo}` }
      ]
    } : {}),
    footer: {
      message: '持续验证、注明来源、保留证据。',
      copyright: '软件测试与质量工程知识库 · MIT'
    }
  }
})
