# 图片组件使用指南

本文档介绍如何使用 NUSHungry 前端项目中的图片相关组件。

---

## 组件概述

### 1. ImageUpload.vue - 图片上传组件
通用的图片上传组件，支持拖拽上传、图片预览、批量上传等功能。

### 2. ImageViewer.vue - 图片查看器
强大的图片查看器，支持缩放、旋转、拖拽、键盘操作等。

### 3. ImageGallery.vue - 图片画廊
展示图片列表，支持网格布局和点击预览。

---

## ImageUpload 组件

### 基础用法

```vue
<template>
  <ImageUpload
    v-model="imageUrls"
    :max-count="5"
    @change="handleChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import ImageUpload from '@/components/ImageUpload.vue'

const imageUrls = ref([])

const handleChange = (urls) => {
  console.log('已上传的图片:', urls)
}
</script>
```

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | v-model 绑定的图片URL列表 | Array | [] |
| multiple | 是否支持多图上传 | Boolean | true |
| maxCount | 最大上传数量 | Number | 9 |
| maxSize | 最大文件大小（MB） | Number | 10 |
| accept | 接受的文件类型 | String | 'image/*' |
| generateThumbnail | 是否生成缩略图 | Boolean | true |
| compress | 是否压缩图片 | Boolean | true |
| disabled | 是否禁用 | Boolean | false |
| mainText | 主文本 | String | '点击或拖拽上传图片' |
| subText | 副文本 | String | '支持 JPG、PNG、GIF、WebP 格式' |
| tip | 提示信息 | String | '' |
| showFileName | 是否显示文件名 | Boolean | false |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 图片列表变化时触发 | (urls: string[]) |
| preview | 点击预览图片时触发 | (item: Object) |
| delete | 删除图片时触发 | (item: Object) |

### 完整示例

```vue
<template>
  <div>
    <h3>上传评价图片</h3>
    <ImageUpload
      v-model="reviewImages"
      :max-count="9"
      :max-size="5"
      main-text="上传评价图片"
      sub-text="最多上传9张图片，每张不超过5MB"
      tip="提示：图片将自动压缩，建议上传清晰的原图"
      show-file-name
      @change="handleImageChange"
      @preview="handlePreview"
    />

    <!-- 图片查看器 -->
    <ImageViewer
      v-model:visible="viewerVisible"
      :images="reviewImages"
      :initial-index="viewerIndex"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageUpload from '@/components/ImageUpload.vue'
import ImageViewer from '@/components/ImageViewer.vue'

const reviewImages = ref([])
const viewerVisible = ref(false)
const viewerIndex = ref(0)

const handleImageChange = (urls) => {
  console.log('图片已更新:', urls)
}

const handlePreview = (item) => {
  viewerIndex.value = reviewImages.value.indexOf(item.url)
  viewerVisible.value = true
}
</script>
```

---

## ImageViewer 组件

### 基础用法

```vue
<template>
  <div>
    <a-button @click="showViewer">查看图片</a-button>

    <ImageViewer
      v-model:visible="visible"
      :images="images"
      :initial-index="0"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageViewer from '@/components/ImageViewer.vue'

const visible = ref(false)
const images = ref([
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg'
])

const showViewer = () => {
  visible.value = true
}
</script>
```

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| visible | 是否显示查看器 | Boolean | false |
| images | 图片列表 | Array | [] |
| initialIndex | 初始图片索引 | Number | 0 |
| showThumbnails | 是否显示缩略图 | Boolean | true |
| zoomStep | 缩放步长 | Number | 0.2 |
| minZoom | 最小缩放 | Number | 0.1 |
| maxZoom | 最大缩放 | Number | 5 |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| close | 关闭查看器时触发 | - |
| change | 切换图片时触发 | (index: number) |

### 功能特性

- ✅ 鼠标滚轮缩放
- ✅ 拖拽移动图片
- ✅ 图片旋转（左转/右转）
- ✅ 下载图片
- ✅ 键盘快捷键支持：
  - `Esc` - 关闭查看器
  - `←` / `→` - 切换上一张/下一张
  - `+` / `-` - 放大/缩小
- ✅ 缩略图导航（多图时）

---

## ImageGallery 组件

### 基础用法

```vue
<template>
  <ImageGallery
    :images="galleryImages"
    :columns="4"
    item-height="200px"
  />
</template>

<script setup>
import { ref } from 'vue'
import ImageGallery from '@/components/ImageGallery.vue'

const galleryImages = ref([
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
  'https://example.com/image3.jpg',
  // ... 更多图片
])
</script>
```

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| images | 图片列表（支持字符串数组或对象数组） | Array | [] |
| columns | 每行显示的列数 | Number | 4 |
| itemHeight | 图片项高度 | String | '200px' |
| maxDisplay | 最多显示的图片数量（0表示全部） | Number | 0 |
| showLoadMore | 是否显示"查看更多"按钮 | Boolean | true |
| useThumbnail | 是否使用缩略图 | Boolean | true |
| showThumbnails | 是否在查看器中显示缩略图列表 | Boolean | true |
| emptyText | 空状态文本 | String | '暂无图片' |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| click | 点击图片时触发 | (index: number, image: any) |
| load-more | 点击"查看更多"时触发 | - |

### 高级用法

```vue
<template>
  <div>
    <h3>摊位图片（{{ stallImages.length }}）</h3>
    <ImageGallery
      :images="stallImages"
      :columns="3"
      item-height="250px"
      :max-display="6"
      show-load-more
      use-thumbnail
      empty-text="该摊位暂无图片"
      @click="handleImageClick"
      @load-more="handleLoadMore"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageGallery from '@/components/ImageGallery.vue'

// 支持对象数组格式
const stallImages = ref([
  {
    id: 1,
    url: 'https://example.com/image1.jpg',
    thumbnailUrl: 'https://example.com/thumb1.jpg'
  },
  {
    id: 2,
    url: 'https://example.com/image2.jpg',
    thumbnailUrl: 'https://example.com/thumb2.jpg'
  }
  // ... 更多图片
])

const handleImageClick = (index, image) => {
  console.log('点击了第', index + 1, '张图片:', image)
}

const handleLoadMore = () => {
  console.log('点击了查看更多')
}
</script>
```

---

## 集成示例：在摊位详情页使用

```vue
<template>
  <div class="stall-detail">
    <!-- 摊位信息 -->
    <div class="stall-info">
      <h1>{{ stall.name }}</h1>
      <p>{{ stall.description }}</p>
    </div>

    <!-- 图片上传（仅管理员或已登录用户） -->
    <div v-if="canUpload" class="upload-section">
      <h3>上传图片</h3>
      <ImageUpload
        v-model="uploadedImages"
        :max-count="9"
        main-text="分享您拍摄的美食照片"
        @change="handleUploadChange"
      />
    </div>

    <!-- 图片画廊 -->
    <div class="gallery-section">
      <h3>顾客分享（{{ stall.images?.length || 0 }}张）</h3>
      <ImageGallery
        :images="stall.images || []"
        :columns="4"
        item-height="200px"
        :max-display="8"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import ImageUpload from '@/components/ImageUpload.vue'
import ImageGallery from '@/components/ImageGallery.vue'
import { imageService } from '@/services/imageService'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()

const stall = ref({})
const uploadedImages = ref([])

const canUpload = computed(() => {
  return userStore.isAuthenticated
})

const handleUploadChange = async (urls) => {
  console.log('用户上传了图片:', urls)

  // 这里可以调用 API 将图片关联到摊位
  // 例如：await imageService.uploadStallImage(stall.value.id, ...)

  message.success('图片上传成功！')
}
</script>
```

---

## API 服务

### uploadService.js

新增的上传服务提供以下方法：

```javascript
import { uploadService } from '@/services/uploadService'

// 上传单张图片
const result = await uploadService.uploadImage(
  file,
  generateThumbnail = true,
  compress = true,
  onProgress = (percent) => console.log(percent)
)

// 批量上传图片
const results = await uploadService.uploadImages(
  files,
  generateThumbnail = true,
  compress = true,
  onProgress = (percent) => console.log(percent)
)

// 删除图片
await uploadService.deleteImage(imageUrl)

// 批量删除图片
await uploadService.deleteImages(imageUrls)

// 获取图片信息
const info = await uploadService.getImageInfo(file)

// 验证图片
const validation = uploadService.validateImage(file, maxSize = 10)
```

---

## 注意事项

1. **图片格式**：支持 JPG、PNG、GIF、WebP 格式
2. **文件大小**：默认最大 10MB，可通过 `maxSize` 属性调整
3. **自动压缩**：上传时会自动压缩图片，超过 2048px 会等比例缩放
4. **缩略图**：可选择生成 300x300 的缩略图，用于列表展示
5. **性能优化**：
   - 使用 `lazy loading` 加载图片
   - 缩略图优先显示
   - 图片查看器使用 Teleport 渲染到 body
6. **响应式**：所有组件都支持响应式布局

---

## 常见问题

### Q1: 如何自定义上传区域样式？
A: 可以通过 props 自定义文本，或者直接修改组件的 scoped 样式。

### Q2: 如何限制上传图片的尺寸？
A: 可以在上传前使用 `uploadService.getImageInfo()` 获取图片尺寸并进行验证。

### Q3: 图片查看器支持哪些格式？
A: 支持所有浏览器能显示的图片格式。

### Q4: 如何实现图片懒加载？
A: ImageGallery 组件已内置 `loading="lazy"` 属性。

---

## 更新日志

- **2025-10-09**: 初始版本发布
  - ✅ ImageUpload 组件
  - ✅ ImageViewer 组件
  - ✅ ImageGallery 组件
  - ✅ uploadService API 服务
