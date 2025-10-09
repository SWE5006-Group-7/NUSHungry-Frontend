<template>
  <Teleport to="body">
    <Transition name="viewer-fade">
      <div v-if="visible" class="image-viewer" @click.self="handleClose">
        <!-- 关闭按钮 -->
        <div class="viewer-close" @click="handleClose">
          <CloseOutlined />
        </div>

        <!-- 工具栏 -->
        <div class="viewer-toolbar">
          <!-- 缩放 -->
          <div class="toolbar-item" @click="handleZoomIn" title="放大">
            <ZoomInOutlined />
          </div>
          <div class="toolbar-item" @click="handleZoomOut" title="缩小">
            <ZoomOutOutlined />
          </div>
          <div class="toolbar-item" @click="handleResetZoom" title="重置">
            <RedoOutlined />
          </div>

          <!-- 旋转 -->
          <div class="toolbar-divider"></div>
          <div class="toolbar-item" @click="handleRotateLeft" title="向左旋转">
            <RotateLeftOutlined />
          </div>
          <div class="toolbar-item" @click="handleRotateRight" title="向右旋转">
            <RotateRightOutlined />
          </div>

          <!-- 下载 -->
          <div class="toolbar-divider"></div>
          <div class="toolbar-item" @click="handleDownload" title="下载">
            <DownloadOutlined />
          </div>

          <!-- 图片计数 -->
          <div v-if="images.length > 1" class="toolbar-counter">
            {{ currentIndex + 1 }} / {{ images.length }}
          </div>
        </div>

        <!-- 上一张 -->
        <div
          v-if="images.length > 1"
          class="viewer-arrow viewer-arrow-left"
          @click="handlePrev"
        >
          <LeftOutlined />
        </div>

        <!-- 下一张 -->
        <div
          v-if="images.length > 1"
          class="viewer-arrow viewer-arrow-right"
          @click="handleNext"
        >
          <RightOutlined />
        </div>

        <!-- 图片容器 -->
        <div class="viewer-canvas" @wheel.prevent="handleWheel">
          <img
            :src="currentImage"
            :style="imageStyle"
            @load="handleImageLoad"
            @error="handleImageError"
            @mousedown="handleMouseDown"
            alt="预览图片"
          />

          <!-- 加载中 -->
          <div v-if="loading" class="viewer-loading">
            <LoadingOutlined style="font-size: 48px; color: #fff" />
          </div>

          <!-- 加载失败 -->
          <div v-if="error" class="viewer-error">
            <CloseCircleOutlined style="font-size: 48px; color: #fff; margin-bottom: 16px" />
            <div>图片加载失败</div>
          </div>
        </div>

        <!-- 缩略图列表（多图时显示） -->
        <div v-if="images.length > 1 && showThumbnails" class="viewer-thumbnails">
          <div
            v-for="(img, index) in images"
            :key="index"
            class="thumbnail-item"
            :class="{ active: index === currentIndex }"
            @click="handleSelectImage(index)"
          >
            <img :src="img" alt="缩略图" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  CloseOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RedoOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
  LoadingOutlined,
  CloseCircleOutlined
} from '@ant-design/icons-vue'

const props = defineProps({
  // 是否显示查看器
  visible: {
    type: Boolean,
    default: false
  },
  // 图片列表（单图或多图）
  images: {
    type: Array,
    default: () => []
  },
  // 初始图片索引
  initialIndex: {
    type: Number,
    default: 0
  },
  // 是否显示缩略图
  showThumbnails: {
    type: Boolean,
    default: true
  },
  // 缩放步长
  zoomStep: {
    type: Number,
    default: 0.2
  },
  // 最小缩放
  minZoom: {
    type: Number,
    default: 0.1
  },
  // 最大缩放
  maxZoom: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['update:visible', 'close', 'change'])

// 状态
const currentIndex = ref(props.initialIndex)
const scale = ref(1)
const rotate = ref(0)
const translateX = ref(0)
const translateY = ref(0)
const loading = ref(true)
const error = ref(false)

// 拖拽状态
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartTranslateX = ref(0)
const dragStartTranslateY = ref(0)

// 计算属性
const currentImage = computed(() => {
  return props.images[currentIndex.value] || ''
})

const imageStyle = computed(() => {
  return {
    transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value}) rotate(${rotate.value}deg)`,
    transition: isDragging.value ? 'none' : 'transform 0.3s ease',
    cursor: isDragging.value ? 'grabbing' : 'grab'
  }
})

// 监听 visible 变化，重置状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetTransform()
    currentIndex.value = props.initialIndex
    // 锁定 body 滚动
    document.body.style.overflow = 'hidden'
  } else {
    // 恢复 body 滚动
    document.body.style.overflow = ''
  }
})

// 监听当前图片变化
watch(currentImage, () => {
  loading.value = true
  error.value = false
  resetTransform()
})

// 关闭查看器
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

// 上一张
const handlePrev = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    emit('change', currentIndex.value)
  } else {
    currentIndex.value = props.images.length - 1
  }
}

// 下一张
const handleNext = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
    emit('change', currentIndex.value)
  } else {
    currentIndex.value = 0
  }
}

// 选择图片
const handleSelectImage = (index) => {
  currentIndex.value = index
  emit('change', index)
}

// 放大
const handleZoomIn = () => {
  const newScale = scale.value + props.zoomStep
  if (newScale <= props.maxZoom) {
    scale.value = newScale
  }
}

// 缩小
const handleZoomOut = () => {
  const newScale = scale.value - props.zoomStep
  if (newScale >= props.minZoom) {
    scale.value = newScale
  }
}

// 重置缩放
const handleResetZoom = () => {
  resetTransform()
}

// 向左旋转
const handleRotateLeft = () => {
  rotate.value -= 90
}

// 向右旋转
const handleRotateRight = () => {
  rotate.value += 90
}

// 下载图片
const handleDownload = () => {
  const link = document.createElement('a')
  link.href = currentImage.value
  link.download = `image-${currentIndex.value + 1}.jpg`
  link.click()
}

// 鼠标滚轮缩放
const handleWheel = (event) => {
  const delta = event.deltaY
  if (delta < 0) {
    handleZoomIn()
  } else {
    handleZoomOut()
  }
}

// 鼠标拖拽
const handleMouseDown = (event) => {
  isDragging.value = true
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  dragStartTranslateX.value = translateX.value
  dragStartTranslateY.value = translateY.value

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (event) => {
  if (!isDragging.value) return

  const deltaX = event.clientX - dragStartX.value
  const deltaY = event.clientY - dragStartY.value

  translateX.value = dragStartTranslateX.value + deltaX
  translateY.value = dragStartTranslateY.value + deltaY
}

const handleMouseUp = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// 图片加载完成
const handleImageLoad = () => {
  loading.value = false
  error.value = false
}

// 图片加载失败
const handleImageError = () => {
  loading.value = false
  error.value = true
}

// 重置变换
const resetTransform = () => {
  scale.value = 1
  rotate.value = 0
  translateX.value = 0
  translateY.value = 0
}

// 键盘事件
const handleKeyDown = (event) => {
  if (!props.visible) return

  switch (event.key) {
    case 'Escape':
      handleClose()
      break
    case 'ArrowLeft':
      handlePrev()
      break
    case 'ArrowRight':
      handleNext()
      break
    case '+':
    case '=':
      handleZoomIn()
      break
    case '-':
    case '_':
      handleZoomOut()
      break
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.image-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 关闭按钮 */
.viewer-close {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.viewer-close:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.viewer-close svg {
  font-size: 24px;
  color: #fff;
}

/* 工具栏 */
.viewer-toolbar {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 24px;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.toolbar-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.toolbar-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.toolbar-item svg {
  font-size: 18px;
  color: #fff;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 0 4px;
}

.toolbar-counter {
  padding: 0 12px;
  color: #fff;
  font-size: 14px;
  margin-left: 4px;
}

/* 箭头 */
.viewer-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
}

.viewer-arrow:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%) scale(1.1);
}

.viewer-arrow svg {
  font-size: 24px;
  color: #fff;
}

.viewer-arrow-left {
  left: 24px;
}

.viewer-arrow-right {
  right: 24px;
}

/* 图片容器 */
.viewer-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.viewer-canvas img {
  max-width: 90%;
  max-height: 90%;
  user-select: none;
  -webkit-user-drag: none;
}

/* 加载中 */
.viewer-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 加载失败 */
.viewer-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  text-align: center;
  font-size: 16px;
}

/* 缩略图列表 */
.viewer-thumbnails {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  max-width: 80%;
  overflow-x: auto;
  z-index: 10;
}

.thumbnail-item {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  flex-shrink: 0;
}

.thumbnail-item:hover {
  border-color: rgba(255, 255, 255, 0.5);
}

.thumbnail-item.active {
  border-color: #1890ff;
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 动画 */
.viewer-fade-enter-active,
.viewer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.viewer-fade-enter-from,
.viewer-fade-leave-to {
  opacity: 0;
}
</style>
