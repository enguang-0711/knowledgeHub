<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, withDefaults } from 'vue'
import { withBase } from 'vitepress'

const props = withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
const host = ref<HTMLDivElement | null>(null)
const loading = ref(true)
const error = ref('')
const modelUrl = withBase('/models/tesla-model-y.glb')

let renderer: import('three').WebGLRenderer | undefined
let controls: import('three/examples/jsm/controls/OrbitControls.js').OrbitControls | undefined
let scene: import('three').Scene | undefined
let camera: import('three').PerspectiveCamera | undefined
let resizeObserver: ResizeObserver | undefined
let intersectionObserver: IntersectionObserver | undefined
let animationFrame = 0
let resumeTimer: ReturnType<typeof setTimeout> | undefined
let destroyed = false
let isVisible = true
let reduceMotion = false
let visibilityHandler: (() => void) | undefined

function disposeScene() {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  if (resumeTimer) clearTimeout(resumeTimer)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  controls?.dispose()

  scene?.traverse((object) => {
    const mesh = object as import('three').Mesh
    if (!mesh.isMesh) return
    mesh.geometry.dispose()
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    materials.forEach((material) => {
      for (const value of Object.values(material)) {
        if (value && typeof value === 'object' && 'isTexture' in value && value.isTexture) {
          ;(value as import('three').Texture).dispose()
        }
      }
      material.dispose()
    })
  })
  renderer?.dispose()
  renderer?.domElement.remove()
}

onMounted(async () => {
  try {
    const THREE = await import('three')
    const [{ GLTFLoader }, { OrbitControls }] = await Promise.all([
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/controls/OrbitControls.js'),
    ])
    if (destroyed || !host.value) return

    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100)
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, props.compact ? 1.5 : 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.className = 'model-y-canvas'
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;outline:none;'
    renderer.domElement.setAttribute('role', 'img')
    renderer.domElement.setAttribute('aria-label', '可旋转和缩放的 Model Y 三维模型')
    host.value.append(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xf5f8ff, 0x606a78, 2.1))
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2)
    keyLight.position.set(-4, 7, 6)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xc8dcff, 1.6)
    fillLight.position.set(5, 3, -5)
    scene.add(fillLight)
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.1)
    rimLight.position.set(1, 4, 7)
    scene.add(rimLight)

    const loader = new GLTFLoader()
    const gltf = await loader.loadAsync(modelUrl)
    if (destroyed || !scene || !camera || !renderer || !host.value) {
      gltf.scene.traverse((object) => {
        const mesh = object as THREE.Mesh
        if (!mesh.isMesh) return
        mesh.geometry.dispose()
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        materials.forEach((material) => material.dispose())
      })
      return
    }

    const model = gltf.scene
    const modelFrame = new THREE.Group()
    modelFrame.add(model)
    const bounds = new THREE.Box3().setFromObject(modelFrame)
    const center = bounds.getCenter(new THREE.Vector3())
    const size = bounds.getSize(new THREE.Vector3())
    const longestSide = Math.max(size.x, size.y, size.z) || 1
    const scale = 2.6 / longestSide
    modelFrame.scale.setScalar(scale)
    modelFrame.position.copy(center).multiplyScalar(-scale)
    model.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = false
        mesh.receiveShadow = false
      }
    })
    scene.add(modelFrame)

    const scaledBounds = size.multiplyScalar(scale)
    const radius = Math.max(scaledBounds.length() * 0.5, 1)
    const distance = radius / Math.sin(THREE.MathUtils.degToRad(camera.fov * 0.5)) * (props.compact ? 0.68 : 0.84)
    const viewDirection = new THREE.Vector3(1, 0.48, 1).normalize()
    camera.position.copy(viewDirection.multiplyScalar(distance))
    camera.lookAt(0, 0, 0)
    camera.near = Math.max(distance / 100, 0.01)
    camera.far = distance * 20
    camera.updateProjectionMatrix()

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.enablePan = false
    controls.rotateSpeed = 0.62
    controls.zoomSpeed = 0.8
    controls.minDistance = distance * 0.55
    controls.maxDistance = distance * 2.2
    controls.minPolarAngle = 0.12
    controls.maxPolarAngle = Math.PI * 0.49
    controls.autoRotate = !reduceMotion
    controls.autoRotateSpeed = 0.65
    controls.target.set(0, 0, 0)
    controls.addEventListener('start', () => {
      if (!controls) return
      controls.autoRotate = false
      if (resumeTimer) clearTimeout(resumeTimer)
    })
    controls.addEventListener('end', () => {
      if (reduceMotion || !controls) return
      if (resumeTimer) clearTimeout(resumeTimer)
      resumeTimer = setTimeout(() => {
        if (controls && !destroyed) controls.autoRotate = true
      }, 2600)
    })

    const resize = () => {
      if (!host.value || !renderer || !camera) return
      const { width, height } = host.value.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.render(scene!, camera)
    }
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host.value)
    resize()

    let previousFrame = 0
    const animate = (now: number) => {
      animationFrame = 0
      if (destroyed || !isVisible || document.hidden || !renderer || !scene || !camera || !controls) return
      animationFrame = requestAnimationFrame(animate)
      const delta = previousFrame ? Math.min((now - previousFrame) / 1000, 0.05) : 0
      previousFrame = now
      controls.update(delta)
      renderer.render(scene, camera)
    }
    const startAnimation = () => {
      if (isVisible && !document.hidden && !animationFrame) animationFrame = requestAnimationFrame(animate)
    }
    intersectionObserver = new IntersectionObserver((entries) => {
      isVisible = entries[entries.length - 1]?.isIntersecting ?? true
      if (isVisible) startAnimation()
      else if (animationFrame) {
        cancelAnimationFrame(animationFrame)
        animationFrame = 0
      }
    }, { rootMargin: '80px' })
    intersectionObserver.observe(host.value)
    visibilityHandler = startAnimation
    document.addEventListener('visibilitychange', visibilityHandler)
    loading.value = false
  } catch (cause) {
    if (!destroyed) {
      error.value = cause instanceof Error && cause.message.includes('WebGL')
        ? '当前浏览器无法启用 WebGL。'
        : '模型加载失败，请刷新页面后重试。'
      loading.value = false
    }
  }
})

onBeforeUnmount(() => {
  destroyed = true
  if (visibilityHandler) document.removeEventListener('visibilitychange', visibilityHandler)
  disposeScene()
})
</script>

<template>
  <div class="model-y-viewer" :class="{ compact }">
    <div ref="host" class="model-y-stage" :aria-busy="loading">
      <div v-if="loading" class="model-y-status" role="status">正在加载 Model Y…</div>
      <div v-else-if="error" class="model-y-status model-y-error" role="alert">{{ error }}</div>
    </div>
    <div class="model-y-caption">
      <span>拖动旋转 <i aria-hidden="true">·</i> 滚轮缩放</span>
      <span class="model-y-credits">
        <a href="https://sketchfab.com/3d-models/tesla-model-y-3593508ee9764ad3b7016861ea97707a" target="_blank" rel="noreferrer">Tesla Model Y · Man City Fan</a>
        <i aria-hidden="true">·</i>
        <a href="https://sketchfab.com/TheBlockThatLivesInYourDoors" target="_blank" rel="noreferrer">A random piece of obsidian</a>
        <i aria-hidden="true">·</i>
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>
      </span>
    </div>
  </div>
</template>

<style scoped>
.model-y-viewer {
  --model-y-ink: #687386;
  position: relative;
  width: 100%;
  height: clamp(390px, 62vh, 680px);
  min-height: 360px;
  overflow: hidden;
  border-radius: 22px;
  background:
    radial-gradient(ellipse 62% 17% at 50% 76%, rgb(49 66 92 / 15%), transparent 72%),
    linear-gradient(145deg, #eef1f5, #f7f8fa 58%, #e8edf2);
  box-shadow: inset 0 0 0 1px rgb(46 60 81 / 8%);
}

.model-y-stage {
  position: absolute;
  inset: 0;
  touch-action: pan-y;
}

.model-y-canvas {
  display: block;
  width: 100%;
  height: 100%;
  outline: none;
}

.model-y-status {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #7c8796;
  font-size: 13px;
}

.model-y-error {
  padding: 24px;
  text-align: center;
}

.model-y-caption {
  position: absolute;
  right: 14px;
  bottom: 13px;
  left: 14px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--model-y-ink);
  font: 500 10px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: 0.01em;
  pointer-events: none;
}

.model-y-caption i {
  padding-inline: 3px;
  font-style: normal;
  opacity: 0.55;
}

.model-y-caption a {
  color: inherit;
  text-decoration: none;
  pointer-events: auto;
}

.model-y-caption a:hover {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.model-y-credits {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 4px;
}

.compact {
  height: 100%;
  min-height: 0;
  border-radius: 0;
  background:
    radial-gradient(ellipse 62% 16% at 50% 75%, rgb(49 66 92 / 15%), transparent 72%),
    transparent;
  box-shadow: none;
}

.compact .model-y-caption {
  right: 5px;
  bottom: 2px;
  left: 5px;
  color: #77808d;
  font-size: 9px;
}

@media (max-width: 640px) {
  .model-y-viewer:not(.compact) {
    height: min(64vh, 520px);
    min-height: 340px;
    border-radius: 16px;
  }
}
</style>
