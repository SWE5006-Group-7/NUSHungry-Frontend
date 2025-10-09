<template>
  <a-modal
    v-model:open="visible"
    :title="title"
    :width="800"
    :footer="null"
    :destroy-on-close="true"
    @cancel="handleCancel"
  >
    <div class="upload-dialog-content">
      <!-- 上传区域 -->
      <div
        class="upload-area"
        :class="{ 'is-dragover': isDragOver, 'is-disabled': isMaxReached }"
        @drop.prevent="handleDrop"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @click="triggerFileInput"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          multiple
          :disabled="isMaxReached"
          @change="handleFileSelect"
          style="display: none"
        />

        <div class="upload-icon">
          <PlusOutlined style="font-size: 48px; color: #1890ff" />
        </div>
        <div class="upload-text">
          <p class="main-text">{{ mainText }}</p>
          <p class="sub-text">{{ subText }}</p>
        </div>

        <div v-if="isMaxReached" class="max-reached-text">
          已达到最大上传数量（{{ maxCount }}）
        </div>
      </div>

      <!-- 预览列表 -->
      <div v-if="previewFiles.length > 0" class="preview-section">
        <div class="preview-header">
          <span>已选择 {{ previewFiles.length }} 张图片</span>
          <a-button type="link" size="small" danger @click="handleClearAll">
            清空全部
          </a-button>
        </div>

        <div class="preview-list">
          <div
            v-for="(file, index) in previewFiles"
            :key="file.uid"
            class="preview-item"
          >
            <div
              class="preview-image"
              :style="{ backgroundImage: `url(${file.preview})` }"
            >
              <div class="preview-mask">
                <EyeOutlined @click="handlePreviewImage(index)" />
                <DeleteOutlined @click="handleRemoveFile(index)" />
              </div>
            </div>
            <div class="preview-info">
              <div class="file-name" :title="file.name">{{ file.name }}</div>
              <div class="file-size">{{ formatFileSize(file.size) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <a-alert
        v-if="tip"
        :message="tip"
        type="info"
        show-icon
        style="margin-top: 16px"
      />

      <!-- 操作按钮 -->
      <div class="dialog-footer">
        <a-button @click="handleCancel">取消</a-button>
        <a-button
          type="primary"
          :loading="uploading"
          :disabled="previewFiles.length === 0"
          @click="handleConfirm"
        >
          {{ uploading ? `上传中 ${uploadProgress}%` : `确认上传 (${previewFiles.length})` }}
        </a-button>
      </div>
    </div>

    <!-- 图片预览器 -->
    <ImageViewer
      v-model:visible="viewerVisible"
      :images="previewUrls"
      :initial-index="viewerIndex"
    />
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import { uploadService } from '@/services/uploadService'
import ImageViewer from './ImageViewer.vue'

const props = defineProps({
  // 是否显示对话框
  open: {
    type: Boolean,
    default: false
  },
  // 标题
  title: {
    type: String,
    default: '上传图片'
  },
  // 最大上传数量
  maxCount: {
    type: Number,
    default: 9
  },
  // 最大文件大小（MB）
  maxSize: {
    type: Number,
    default: 10
  },
  // 主文本
  mainText: {
    type: String,
    default: '点击或拖拽上传图片'
  },
  // 副文本
  subText: {
    type: String,
    default: '支持 JPG、PNG、GIF、WebP 格式'
  },
  // 提示信息
  tip: {
    type: String,
    default: '提示：图片将自动压缩优化，建议上传清晰的原图'
  },
  // 是否生成缩略图
  generateThumbnail: {
    type: Boolean,
    default: true
  },
  // 是否压缩图片
  compress: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:open', 'confirm', 'cancel'])

// 状态
const visible = ref(props.open)
const fileInputRef = ref(null)
const isDragOver = ref(false)
const previewFiles = ref([])
const uploading = ref(false)
const uploadProgress = ref(0)
const viewerVisible = ref(false)
const viewerIndex = ref(0)

// 计算属性
const isMaxReached = computed(() => {
  return previewFiles.value.length >= props.maxCount
})

const previewUrls = computed(() => {
  return previewFiles.value.map(file => file.preview)
})

// 监听 open 变化
watch(() => props.open, (newVal) => {
  visible.value = newVal
  if (newVal) {
    // 对话框打开时重置状态
    previewFiles.value = []
    uploading.value = false
    uploadProgress.value = 0
  }
})

watch(visible, (newVal) => {
  emit('update:open', newVal)
})

// 触发文件选择
const triggerFileInput = () => {
  if (!isMaxReached.value) {
    fileInputRef.value?.click()
  }
}

// 处理文件选择
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || [])
  if (files.length > 0) {
    addFiles(files)
  }
  // 清空 input
  event.target.value = ''
}

// 处理拖拽
const handleDragOver = () => {
  if (!isMaxReached.value) {
    isDragOver.value = true
  }
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event) => {
  isDragOver.value = false
  if (isMaxReached.value) return

  const files = Array.from(event.dataTransfer.files || [])
  addFiles(files)
}

// 添加文件
const addFiles = (files) => {
  // 检查数量限制
  const remainingCount = props.maxCount - previewFiles.value.length
  if (files.length > remainingCount) {
    message.warning(`最多还能选择 ${remainingCount} 张图片`)
    files = files.slice(0, remainingCount)
  }

  // 验证并添加文件
  for (const file of files) {
    const validation = uploadService.validateImage(file, props.maxSize)
    if (!validation.valid) {
      message.error(validation.error)
      continue
    }

    // 创建预览
    const fileItem = {
      uid: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      file: file,
      preview: URL.createObjectURL(file)
    }

    previewFiles.value.push(fileItem)
  }
}

// 移除文件
const handleRemoveFile = (index) => {
  const file = previewFiles.value[index]
  URL.revokeObjectURL(file.preview)
  previewFiles.value.splice(index, 1)
}

// 清空全部
const handleClearAll = () => {
  previewFiles.value.forEach(file => {
    URL.revokeObjectURL(file.preview)
  })
  previewFiles.value = []
}

// 预览图片
const handlePreviewImage = (index) => {
  viewerIndex.value = index
  viewerVisible.value = true
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 取消
const handleCancel = () => {
  handleClearAll()
  visible.value = false
  emit('cancel')
}

// 确认上传
const handleConfirm = async () => {
  if (previewFiles.value.length === 0) {
    message.warning('请先选择图片')
    return
  }

  uploading.value = true
  uploadProgress.value = 0

  try {
    const files = previewFiles.value.map(item => item.file)

    // 批量上传
    const result = await uploadService.uploadImages(
      files,
      props.generateThumbnail,
      props.compress,
      (progress) => {
        uploadProgress.value = progress
      }
    )

    if (result.successCount > 0) {
      message.success(`成功上传 ${result.successCount} 张图片！`)

      // 提取上传成功的URL
      const imageUrls = result.successList
        .filter(item => item.success)
        .map(item => item.url)

      const thumbnailUrls = result.successList
        .filter(item => item.success)
        .map(item => item.thumbnailUrl)

      // 触发确认事件
      emit('confirm', {
        imageUrls,
        thumbnailUrls,
        successCount: result.successCount,
        failureCount: result.failureCount
      })

      // 关闭对话框
      handleClearAll()
      visible.value = false
    }

    if (result.failureCount > 0) {
      message.warning(`${result.failureCount} 张图片上传失败`)
    }

  } catch (error) {
    console.error('Upload error:', error)
    message.error('上传失败，请重试')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}
</script>

<style scoped>
.upload-dialog-content {
  padding: 16px 0;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #fafafa;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #1890ff;
  background-color: #f0f7ff;
}

.upload-area.is-dragover {
  border-color: #1890ff;
  background-color: #e6f4ff;
}

.upload-area.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.upload-icon {
  margin-bottom: 16px;
}

.upload-text .main-text {
  font-size: 16px;
  color: #333;
  margin: 0 0 8px 0;
}

.upload-text .sub-text {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.max-reached-text {
  margin-top: 12px;
  color: #faad14;
  font-size: 14px;
}

/* 预览区域 */
.preview-section {
  margin-top: 24px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.preview-header span {
  font-weight: 500;
  color: #333;
}

.preview-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
  padding: 4px;
}

.preview-item {
  position: relative;
}

.preview-image {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  position: relative;
  overflow: hidden;
}

.preview-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0;
  transition: opacity 0.3s;
}

.preview-image:hover .preview-mask {
  opacity: 1;
}

.preview-mask > * {
  font-size: 20px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s;
}

.preview-mask > *:hover {
  transform: scale(1.2);
}

.preview-info {
  margin-top: 4px;
  text-align: center;
}

.file-name {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

/* 底部按钮 */
.dialog-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
