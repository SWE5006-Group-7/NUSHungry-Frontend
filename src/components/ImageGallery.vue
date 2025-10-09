<template>
  <div class="image-gallery">
    <!-- 图片网格 -->
    <div class="gallery-grid" :class="`grid-${columns}`">
      <div
        v-for="(image, index) in displayImages"
        :key="index"
        class="gallery-item"
        :style="{ height: itemHeight }"
        @click="handleImageClick(index)"
      >
        <!-- 图片 -->
        <img
          :src="useThumbnail && image.thumbnailUrl ? image.thumbnailUrl : (image.url || image)"
          :alt="`图片 ${index + 1}`"
          class="gallery-image"
          loading="lazy"
        />

        <!-- 遮罩层 -->
        <div class="gallery-overlay">
          <EyeOutlined class="overlay-icon" />
        </div>

        <!-- 更多图片提示 -->
        <div v-if="hasMore && index === displayImages.length - 1" class="more-overlay">
          <div class="more-text">+{{ images.length - maxDisplay }}</div>
        </div>
      </div>
    </div>

    <!-- 查看更多按钮 -->
    <div v-if="hasMore && showLoadMore" class="load-more">
      <a-button @click="handleLoadMore">
        查看全部 {{ images.length }} 张图片
      </a-button>
    </div>

    <!-- 空状态 -->
    <div v-if="images.length === 0" class="gallery-empty">
      <PictureOutlined style="font-size: 48px; color: #d9d9d9; margin-bottom: 16px" />
      <div class="empty-text">{{ emptyText }}</div>
    </div>

    <!-- 图片查看器 -->
    <ImageViewer
      v-model:visible="viewerVisible"
      :images="viewerImages"
      :initial-index="viewerIndex"
      :show-thumbnails="showThumbnails"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { EyeOutlined, PictureOutlined } from '@ant-design/icons-vue'
import ImageViewer from './ImageViewer.vue'

const props = defineProps({
  // 图片列表（支持字符串数组或对象数组）
  images: {
    type: Array,
    default: () => []
  },
  // 每行显示的列数
  columns: {
    type: Number,
    default: 4,
    validator: (value) => [2, 3, 4, 5, 6].includes(value)
  },
  // 图片项高度
  itemHeight: {
    type: String,
    default: '200px'
  },
  // 最多显示的图片数量（0表示显示全部）
  maxDisplay: {
    type: Number,
    default: 0
  },
  // 是否显示"查看更多"按钮
  showLoadMore: {
    type: Boolean,
    default: true
  },
  // 是否使用缩略图
  useThumbnail: {
    type: Boolean,
    default: true
  },
  // 是否在查看器中显示缩略图列表
  showThumbnails: {
    type: Boolean,
    default: true
  },
  // 空状态文本
  emptyText: {
    type: String,
    default: '暂无图片'
  },
  // 图片点击事件
  onClick: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['click', 'load-more'])

// 状态
const viewerVisible = ref(false)
const viewerIndex = ref(0)
const showAll = ref(false)

// 计算属性
const displayImages = computed(() => {
  if (showAll.value || props.maxDisplay === 0 || props.images.length <= props.maxDisplay) {
    return props.images
  }
  return props.images.slice(0, props.maxDisplay)
})

const hasMore = computed(() => {
  return props.maxDisplay > 0 && props.images.length > props.maxDisplay && !showAll.value
})

// 提取图片 URL 用于查看器
const viewerImages = computed(() => {
  return props.images.map(img => {
    if (typeof img === 'string') {
      return img
    }
    return img.url || img.imageUrl || ''
  })
})

// 处理图片点击
const handleImageClick = (index) => {
  if (props.onClick) {
    props.onClick(index, props.images[index])
  } else {
    viewerIndex.value = index
    viewerVisible.value = true
  }
  emit('click', index, props.images[index])
}

// 查看更多
const handleLoadMore = () => {
  showAll.value = true
  emit('load-more')
}
</script>

<style scoped>
.image-gallery {
  width: 100%;
}

/* 图片网格 */
.gallery-grid {
  display: grid;
  gap: 12px;
}

.gallery-grid.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.gallery-grid.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.gallery-grid.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

.gallery-grid.grid-5 {
  grid-template-columns: repeat(5, 1fr);
}

.gallery-grid.grid-6 {
  grid-template-columns: repeat(6, 1fr);
}

/* 响应式 */
@media (max-width: 1200px) {
  .gallery-grid.grid-6,
  .gallery-grid.grid-5 {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .gallery-grid.grid-6,
  .gallery-grid.grid-5,
  .gallery-grid.grid-4 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 图片项 */
.gallery-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background-color: #f5f5f5;
  transition: all 0.3s;
}

.gallery-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

/* 图片 */
.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 遮罩层 */
.gallery-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.overlay-icon {
  font-size: 32px;
  color: #fff;
}

/* 更多图片遮罩 */
.more-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-text {
  font-size: 32px;
  font-weight: bold;
  color: #fff;
}

/* 查看更多按钮 */
.load-more {
  margin-top: 24px;
  text-align: center;
}

/* 空状态 */
.gallery-empty {
  padding: 64px 24px;
  text-align: center;
  color: #999;
}

.empty-text {
  font-size: 16px;
}
</style>
