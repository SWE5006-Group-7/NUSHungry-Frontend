<template>
  <div class="image-upload">
    <!-- 上传区域 -->
    <div
      class="upload-area"
      :class="{ 'is-dragover': isDragOver, 'is-disabled': disabled || isMaxReached }"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @click="triggerFileInput"
    >
      <input
        ref="fileInputRef"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled || isMaxReached"
        @change="handleFileSelect"
        style="display: none"
      />

      <div class="upload-icon">
        <PlusOutlined v-if="!uploading" style="font-size: 32px; color: #1890ff" />
        <LoadingOutlined v-else style="font-size: 32px; color: #1890ff" />
      </div>

      <div class="upload-text">
        <div v-if="!uploading">
          <p class="main-text">{{ mainText }}</p>
          <p class="sub-text">{{ subText }}</p>
        </div>
        <div v-else>
          <p class="main-text">上传中... {{ uploadProgress }}%</p>
          <a-progress :percent="uploadProgress" :show-info="false" />
        </div>
      </div>

      <div v-if="isMaxReached" class="max-reached-text">
        已达到最大上传数量（{{ maxCount }}）
      </div>
    </div>

    <!-- 图片预览列表 -->
    <div v-if="previewList.length > 0" class="preview-list">
      <TransitionGroup name="list">
        <div
          v-for="(item, index) in previewList"
          :key="item.uid"
          class="preview-item"
        >
          <!-- 图片 -->
          <div
            class="preview-image"
            :style="{ backgroundImage: `url(${item.url})` }"
            @click="handlePreview(item)"
          >
            <!-- 上传中的遮罩 -->
            <div v-if="item.status === 'uploading'" class="uploading-mask">
              <LoadingOutlined style="font-size: 24px; color: #fff" />
              <div style="margin-top: 8px; color: #fff">{{ item.progress }}%</div>
            </div>

            <!-- 上传失败的遮罩 -->
            <div v-if="item.status === 'error'" class="error-mask">
              <CloseCircleOutlined style="font-size: 24px; color: #fff" />
              <div style="margin-top: 8px; color: #fff">上传失败</div>
            </div>

            <!-- 操作按钮 -->
            <div v-if="item.status === 'done'" class="preview-actions">
              <EyeOutlined @click.stop="handlePreview(item)" />
              <DeleteOutlined @click.stop="handleDelete(item, index)" />
            </div>
          </div>

          <!-- 文件名 -->
          <div v-if="showFileName" class="preview-name" :title="item.name">
            {{ item.name }}
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- 提示信息 -->
    <div v-if="tip" class="upload-tip">
      <InfoCircleOutlined style="margin-right: 4px" />
      {{ tip }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  LoadingOutlined,
  EyeOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue'
import { uploadService } from '@/services/uploadService'

const props = defineProps({
  // v-model 绑定的图片URL列表
  modelValue: {
    type: Array,
    default: () => []
  },
  // 是否支持多图上传
  multiple: {
    type: Boolean,
    default: true
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
  // 接受的文件类型
  accept: {
    type: String,
    default: 'image/*'
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
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
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
    default: ''
  },
  // 是否显示文件名
  showFileName: {
    type: Boolean,
    default: false
  },
  // 列表类型
  listType: {
    type: String,
    default: 'picture-card', // 'picture-card' | 'picture' | 'text'
    validator: (value) => ['picture-card', 'picture', 'text'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'preview', 'delete'])

// 引用
const fileInputRef = ref(null)

// 状态
const isDragOver = ref(false)
const uploading = ref(false)
const uploadProgress = ref(0)
const previewList = ref([])

// 计算属性
const isMaxReached = computed(() => {
  return previewList.value.length >= props.maxCount
})

// 监听 modelValue 变化，初始化预览列表
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && newVal.length > 0) {
      previewList.value = newVal.map((url, index) => ({
        uid: `init-${index}`,
        name: `image-${index + 1}`,
        url: url,
        status: 'done'
      }))
    } else {
      previewList.value = []
    }
  },
  { immediate: true }
)

// 触发文件选择
const triggerFileInput = () => {
  if (!props.disabled && !isMaxReached.value) {
    fileInputRef.value?.click()
  }
}

// 处理文件选择
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || [])
  if (files.length > 0) {
    handleFiles(files)
  }
  // 清空 input，允许重复上传同一文件
  event.target.value = ''
}

// 处理拖拽上传
const handleDragOver = () => {
  if (!props.disabled && !isMaxReached.value) {
    isDragOver.value = true
  }
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (event) => {
  isDragOver.value = false

  if (props.disabled || isMaxReached.value) {
    return
  }

  const files = Array.from(event.dataTransfer.files || [])
  handleFiles(files)
}

// 处理文件列表
const handleFiles = async (files) => {
  // 检查数量限制
  const remainingCount = props.maxCount - previewList.value.length
  if (files.length > remainingCount) {
    message.warning(`最多还能上传 ${remainingCount} 张图片`)
    files = files.slice(0, remainingCount)
  }

  // 验证文件
  const validationResult = uploadService.validateImages(files, props.maxSize)
  if (!validationResult.valid) {
    message.error(validationResult.errors[0])
    return
  }

  // 上传文件
  if (props.multiple && files.length > 1) {
    await uploadMultipleFiles(files)
  } else {
    for (const file of files) {
      await uploadSingleFile(file)
    }
  }
}

// 上传单个文件
const uploadSingleFile = async (file) => {
  const uid = `${Date.now()}-${Math.random()}`

  // 创建预览对象
  const fileItem = {
    uid,
    name: file.name,
    url: URL.createObjectURL(file),
    status: 'uploading',
    progress: 0
  }

  previewList.value.push(fileItem)

  try {
    // 上传文件
    const result = await uploadService.uploadImage(
      file,
      props.generateThumbnail,
      props.compress,
      (progress) => {
        fileItem.progress = progress
      }
    )

    if (result.success) {
      // 更新状态
      fileItem.status = 'done'
      fileItem.url = result.url
      fileItem.thumbnailUrl = result.thumbnailUrl

      // 触发变更事件
      emitChange()

      message.success('图片上传成功')
    } else {
      fileItem.status = 'error'
      message.error(result.message || '图片上传失败')
    }
  } catch (error) {
    console.error('Upload error:', error)
    fileItem.status = 'error'
    message.error('图片上传失败')
  }
}

// 批量上传文件
const uploadMultipleFiles = async (files) => {
  uploading.value = true
  uploadProgress.value = 0

  try {
    const result = await uploadService.uploadImages(
      files,
      props.generateThumbnail,
      props.compress,
      (progress) => {
        uploadProgress.value = progress
      }
    )

    if (result.successCount > 0) {
      // 添加成功上传的图片到预览列表
      result.successList.forEach((item, index) => {
        if (item.success) {
          previewList.value.push({
            uid: `batch-${Date.now()}-${index}`,
            name: files[index].name,
            url: item.url,
            thumbnailUrl: item.thumbnailUrl,
            status: 'done',
            progress: 100
          })
        }
      })

      emitChange()
      message.success(`成功上传 ${result.successCount} 张图片`)
    }

    if (result.failureCount > 0) {
      message.warning(`${result.failureCount} 张图片上传失败`)
    }
  } catch (error) {
    console.error('Batch upload error:', error)
    message.error('批量上传失败')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

// 预览图片
const handlePreview = (item) => {
  emit('preview', item)
}

// 删除图片
const handleDelete = async (item, index) => {
  try {
    // 如果是已上传的图片，调用删除接口
    if (item.status === 'done' && item.url) {
      await uploadService.deleteImage(item.url)
    }

    // 从列表中移除
    previewList.value.splice(index, 1)
    emitChange()

    emit('delete', item)
    message.success('图片已删除')
  } catch (error) {
    console.error('Delete error:', error)
    message.error('删除失败')
  }
}

// 触发变更事件
const emitChange = () => {
  const urls = previewList.value
    .filter(item => item.status === 'done')
    .map(item => item.url)

  emit('update:modelValue', urls)
  emit('change', urls)
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #fafafa;
  padding: 32px;
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
  background-color: #f5f5f5;
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

/* 预览列表 */
.preview-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 16px;
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
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.preview-image:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 上传中遮罩 */
.uploading-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 错误遮罩 */
.error-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 77, 79, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 操作按钮 */
.preview-actions {
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

.preview-image:hover .preview-actions {
  opacity: 1;
}

.preview-actions > * {
  font-size: 20px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s;
}

.preview-actions > *:hover {
  transform: scale(1.2);
}

/* 文件名 */
.preview-name {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 提示信息 */
.upload-tip {
  margin-top: 12px;
  font-size: 14px;
  color: #999;
  display: flex;
  align-items: center;
}

/* 列表动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
