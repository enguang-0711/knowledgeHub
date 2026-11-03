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
      { text: '领域案例', link: '/vehicle-voice-testing' },
      { text: '实战项目', link: '/projects' },
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
          text: '领域案例：车载语音测试',
          items: [
            { text: '专题导览', link: '/vehicle-voice-testing' },
            { text: '专题学习路线', link: '/vehicle-voice-roadmap' },
            { text: '端到端架构与测试边界', link: '/architecture' },
            { text: '音频链路与声学测试', link: '/audio-acoustics' },
            { text: '语料资产与 TTS 注入', link: '/corpus-tts' },
            { text: 'ASR、NLU 与对话管理', link: '/asr-nlu-dialogue' },
            { text: '质量指标与统计方法', link: '/metrics' },
            { text: '车机、总线与 HIL', link: '/vehicle-integration' },
            { text: '日志、UI 与多模态断言', link: '/multimodal-assertions' },
            { text: '实战项目与验收', link: '/projects' }
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
