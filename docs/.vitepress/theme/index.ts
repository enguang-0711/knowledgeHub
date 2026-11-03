import DefaultTheme from 'vitepress/theme'
import { defineComponent, h } from 'vue'
import VideoLearningPanel from './VideoLearningPanel.vue'
import HomeModelY from './HomeModelY.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: defineComponent({
    name: 'KnowledgeBaseLayout',
    setup() {
      return () => h(DefaultTheme.Layout, null, {
        'aside-top': () => h('div', { class: 'video-aside-slot' }, [
          h(VideoLearningPanel, { instance: 'aside' })
        ]),
        'home-hero-image': () => h(HomeModelY),
        'doc-after': () => h('div', { class: 'video-mobile-slot' }, [
          h(VideoLearningPanel, { instance: 'mobile' })
        ])
      })
    }
  })
}
