<template>
  <a-modal
    v-model:open="visible"
    title="裁剪头像"
    width="600px"
    @cancel="handleCancel"
  >
    <div class="cropper-container">
      <div class="cropper-wrapper">
        <img
          ref="imageRef"
          :src="imageSrc"
          style="max-width: 100%"
        />
      </div>
      <div class="cropper-actions">
        <a-space>
          <a-button @click="rotateLeft">
            <RotateLeftOutlined /> 左转
          </a-button>
          <a-button @click="rotateRight">
            <RotateRightOutlined /> 右转
          </a-button>
          <a-button @click="flipHorizontal">
            <SwapOutlined /> 水平翻转
          </a-button>
        </a-space>
      </div>
    </div>

    <template #footer>
      <a-space>
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" :loading="uploading" @click="handleConfirm">
          <UploadOutlined /> 确认上传
        </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import Cropper from 'cropperjs'
import {
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import apiClient from '@/utils/request'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  imageFile: {
    type: File,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(props.modelValue)
const imageSrc = ref('')
const imageRef = ref(null)
const uploading = ref(false)

let cropper = null

// 初始化裁剪器
const initCropper = () => {
  if (imageRef.value && imageSrc.value) {
    // 销毁旧的cropper实例
    if (cropper) {
      cropper.destroy()
    }

    // 创建新的cropper实例
    cropper = new Cropper(imageRef.value, {
      aspectRatio: 1, // 1:1比例(正方形)
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.8,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false
    })
  }
}

// 监听文件变化
watch(() => props.imageFile, (newFile) => {
  if (newFile) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imageSrc.value = e.target.result
      // 等待图片加载后初始化cropper
      setTimeout(() => {
        initCropper()
      }, 100)
    }
    reader.readAsDataURL(newFile)
  }
}, { immediate: true })

// 监听visible变化
watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val && cropper) {
    cropper.destroy()
    cropper = null
  }
})

// 左转
const rotateLeft = () => {
  if (cropper) {
    cropper.rotate(-90)
  }
}

// 右转
const rotateRight = () => {
  if (cropper) {
    cropper.rotate(90)
  }
}

// 水平翻转
const flipHorizontal = () => {
  if (cropper) {
    const data = cropper.getData()
    cropper.scaleX(data.scaleX === -1 ? 1 : -1)
  }
}

// 确认裁剪并上传
const handleConfirm = async () => {
  if (!cropper) return

  try {
    uploading.value = true

    // 获取裁剪数据
    const cropData = cropper.getData(true) // true表示返回整数坐标

    // 构建FormData
    const formData = new FormData()
    formData.append('file', props.imageFile)
    formData.append('x', Math.round(cropData.x))
    formData.append('y', Math.round(cropData.y))
    formData.append('width', Math.round(cropData.width))
    formData.append('height', Math.round(cropData.height))

    // 上传头像
    const response = await apiClient.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    message.success('头像上传成功')
    emit('success', response.data.avatarUrl)
    visible.value = false
  } catch (error) {
    console.error('Upload error:', error)
    message.error('上传失败,请重试')
  } finally {
    uploading.value = false
  }
}

// 取消
const handleCancel = () => {
  visible.value = false
}

// 组件卸载时销毁cropper
onUnmounted(() => {
  if (cropper) {
    cropper.destroy()
  }
})
</script>

<style>
@import 'cropperjs/dist/cropper.css';
</style>

<style scoped>
.cropper-container {
  margin: 20px 0;
}

.cropper-wrapper {
  max-height: 400px;
  overflow: hidden;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #f5f5f5;
}

.cropper-actions {
  margin-top: 16px;
  text-align: center;
}
</style>
