import { defineConfig } from 'vitepress'

const base = process.env.VITEPRESS_BASE || '/'
const githubRepo = process.env.GITHUB_REPOSITORY

export default defineConfig({
  lang: 'zh-CN',
  title: '车载语音自动化测试知识库',
  description: '面向 AI 大模型时代的车载语音端到端自动化学习路线、工程实践与参考资料',
  base,
  lastUpdated: true,
  themeConfig: {
    siteTitle: '车载语音测试知识库',
    nav: [
      { text: '学习路线', link: '/roadmap' },
      { text: '技术知识', link: '/architecture' },
      { text: '实战项目', link: '/projects' },
      { text: '知识库建设', link: '/knowledge-base-plan' },
      { text: '工具与资料', link: '/tools-and-resources' }
    ],
    sidebar: {
      '/': [
        {
          text: '开始学习',
          items: [
            { text: '知识库首页', link: '/' },
            { text: '学习路线与阶段验收', link: '/roadmap' },
            { text: '知识库分阶段建设', link: '/knowledge-base-plan' }
          ]
        },
        {
          text: '系统与指标',
          items: [
            { text: '端到端系统架构', link: '/architecture' },
            { text: '质量指标与统计方法', link: '/metrics' }
          ]
        },
        {
          text: '语音与算法',
          items: [
            { text: '音频链路与声学测试', link: '/audio-acoustics' },
            { text: '语料资产与 TTS 注入', link: '/corpus-tts' },
            { text: 'ASR、NLU 与对话管理', link: '/asr-nlu-dialogue' }
          ]
        },
        {
          text: '车载集成与自动化',
          items: [
            { text: '车机、总线与 HIL', link: '/vehicle-integration' },
            { text: '日志、UI 与多模态断言', link: '/multimodal-assertions' },
            { text: 'Python、Pytest 与 Robot Framework', link: '/automation-framework' },
            { text: 'CI、报告与趋势治理', link: '/ci-quality' }
          ]
        },
        {
          text: 'AI 时代的测试方法',
          items: [
            { text: '大模型辅助测试', link: '/llm-testing' },
            { text: '实战项目与验收', link: '/projects' },
            { text: '模板与检查清单', link: '/templates' },
            { text: '工具栈与参考资料', link: '/tools-and-resources' }
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
      copyright: '车载语音自动化测试知识库 · MIT'
    }
  }
})
