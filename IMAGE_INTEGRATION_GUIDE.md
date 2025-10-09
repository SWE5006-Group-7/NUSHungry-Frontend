# 图片组件集成指南

本文档记录了图片组件在 NUSHungry 项目中的集成情况和测试步骤。

---

## 📋 已集成页面

### 1. StallDetail.vue（摊位详情页）

**集成位置：** [src/pages/StallDetail.vue](src/pages/StallDetail.vue)

**集成内容：**
- ✅ 使用 `ImageUpload` 组件替换原有的简单上传按钮
- ✅ 使用 `ImageGallery` 组件展示摊位图片（3列网格布局）
- ✅ 集成 `ImageViewer` 自动预览功能
- ✅ 仅对已登录用户显示上传功能

**功能特性：**
- 支持拖拽上传摊位图片
- 最多上传 9 张图片
- 自动压缩和生成缩略图
- 3 列网格展示，最多显示 6 张，支持"查看更多"
- 点击图片可放大查看（缩放、旋转、下载）

**代码示例：**
```vue
<!-- 图片上传 -->
<ImageUpload
  v-model="uploadImages"
  :max-count="9"
  main-text="分享您拍摄的美食照片"
  sub-text="支持 JPG、PNG、GIF、WebP 格式，最多9张"
  tip="提示：图片将自动压缩优化"
  @change="handleImagesUploaded"
/>

<!-- 图片展示 -->
<ImageGallery
  :images="displayImages"
  :columns="3"
  item-height="180px"
  :max-display="6"
  show-load-more
  use-thumbnail
  empty-text="暂无图片，快来分享第一张吧！"
  @click="handleImageClick"
/>
```

---

### 2. CafeteriaDetail.vue（食堂详情页）

**集成位置：** [src/pages/CafeteriaDetail.vue](src/pages/CafeteriaDetail.vue)

**集成内容：**
- ✅ 使用 `ImageUpload` 组件替换原有的简单上传按钮
- ✅ 使用 `ImageGallery` 组件展示食堂图片（4列网格布局）
- ✅ 集成 `ImageViewer` 自动预览功能
- ✅ 所有用户可上传（根据实际业务调整）

**功能特性：**
- 支持拖拽上传食堂图片
- 最多上传 9 张图片
- 自动压缩和生成缩略图
- 4 列网格展示，最多显示 8 张，支持"查看更多"
- 点击图片可放大查看（缩放、旋转、下载）

**代码示例：**
```vue
<!-- 图片上传 -->
<ImageUpload
  v-model="uploadImages"
  :max-count="9"
  main-text="分享您拍摄的食堂照片"
  sub-text="支持 JPG、PNG、GIF、WebP 格式，最多9张"
  tip="提示：图片将自动压缩优化"
  @change="handleImagesUploaded"
/>

<!-- 图片展示 -->
<ImageGallery
  :images="displayImages"
  :columns="4"
  item-height="200px"
  :max-display="8"
  show-load-more
  use-thumbnail
  empty-text="暂无图片，快来分享第一张吧！"
  @click="handleImageClick"
/>
```

---

## 🧪 测试步骤

### 1. 启动项目

```bash
# 启动后端
cd nushungry-Backend
./mvnw spring-boot:run

# 启动前端
cd nushungry-Frontend
npm run dev
```

### 2. 测试 StallDetail.vue

1. **访问摊位详情页**
   - 导航到任意摊位详情页
   - 路径示例：`http://localhost:3000/stall/1`

2. **测试图片上传（需登录）**
   - 登录用户账号
   - 查看"Photos from Customers"区域
   - 应该看到 `ImageUpload` 组件的上传区域

3. **测试拖拽上传**
   - 拖拽一张或多张图片到上传区域
   - 观察上传进度
   - 验证上传成功提示

4. **测试点击上传**
   - 点击上传区域
   - 选择图片文件
   - 验证上传成功

5. **测试图片展示**
   - 上传成功后，查看 `ImageGallery` 是否显示图片
   - 验证网格布局（3列）
   - 验证最多显示 6 张

6. **测试图片预览**
   - 点击任意图片
   - 应该打开 `ImageViewer`
   - 测试以下功能：
     - ✅ 鼠标滚轮缩放
     - ✅ 拖拽移动
     - ✅ 旋转（左转/右转）
     - ✅ 下载
     - ✅ 左右箭头切换
     - ✅ 键盘快捷键（ESC、方向键、+/-）

7. **测试"查看更多"**
   - 如果图片超过 6 张
   - 点击"查看全部"按钮
   - 验证显示所有图片

### 3. 测试 CafeteriaDetail.vue

1. **访问食堂详情页**
   - 导航到任意食堂详情页
   - 路径示例：`http://localhost:3000/cafeteria/1`

2. **重复上述测试步骤**
   - 注意：食堂页面是 4 列网格，最多显示 8 张

### 4. 测试边界情况

1. **文件大小限制**
   - 尝试上传超过 10MB 的图片
   - 验证是否显示错误提示

2. **文件格式限制**
   - 尝试上传非图片文件（如 PDF、TXT）
   - 验证是否显示错误提示

3. **数量限制**
   - 尝试上传超过 9 张图片
   - 验证是否显示限制提示

4. **空状态**
   - 访问没有图片的摊位/食堂
   - 验证是否显示"暂无图片"提示

5. **批量上传**
   - 一次选择多张图片上传
   - 验证批量上传进度和成功提示

6. **图片删除**
   - 在上传列表中删除图片
   - 验证是否正确删除

---

## 🐛 已知问题

### 1. 图片上传后的关联问题

**问题描述：**
目前 `ImageUpload` 组件使用的是通用上传接口 `/api/upload/image`，上传成功后返回的是图片 URL，但没有自动关联到摊位或食堂。

**临时方案：**
- 上传完成后调用 `handleImagesUploaded`
- 在该函数中可以调用原有的 `imageService.uploadStallImage` 或 `imageService.uploadCafeteriaImage`
- 将图片 URL 关联到对应的实体

**永久方案（建议）：**
- 在后端添加新接口：
  - `POST /api/stalls/{stallId}/images` - 关联图片到摊位
  - `POST /api/cafeterias/{cafeteriaId}/images` - 关联图片到食堂
- 前端在 `handleImagesUploaded` 中调用这些接口

### 2. 缩略图支持

**问题描述：**
后端 `Image` 实体目前没有 `thumbnailUrl` 字段。

**解决方案：**
- 后端已经生成缩略图并保存到 `/uploads/thumbnails/` 目录
- 需要在 `Image` 实体中添加 `thumbnailUrl` 字段
- 在 `ImageService` 中保存缩略图 URL

---

## 📝 后续优化建议

### 1. 用户权限控制
- 在 `StallDetail.vue` 中根据用户角色显示上传功能
- 管理员和摊位所有者可编辑/删除图片
- 普通用户只能查看

### 2. 图片管理
- 添加图片举报功能
- 添加图片审核流程
- 添加图片标签功能

### 3. 性能优化
- 使用虚拟滚动优化大量图片展示
- 使用 CDN 加速图片加载
- 实现渐进式图片加载

### 4. 用户体验
- 添加图片上传进度条
- 添加上传失败重试功能
- 添加图片编辑功能（裁剪、滤镜）

---

## 📚 相关文档

- [图片组件使用指南](IMAGE_COMPONENTS_USAGE.md)
- [后端 API 文档](../nushungry-Backend/API.md)（如果存在）
- [Swagger API 文档](http://localhost:8080/swagger-ui.html)

---

## 🎯 集成检查清单

在部署到生产环境前，请确认以下检查项：

### 功能检查
- [ ] 图片上传功能正常
- [ ] 图片展示功能正常
- [ ] 图片预览功能正常
- [ ] 图片删除功能正常
- [ ] 文件大小限制生效
- [ ] 文件格式验证生效
- [ ] 上传数量限制生效

### 性能检查
- [ ] 图片压缩正常工作
- [ ] 缩略图生成正常
- [ ] 大图加载不影响页面性能
- [ ] 懒加载正常工作

### 用户体验检查
- [ ] 拖拽上传流畅
- [ ] 上传进度显示准确
- [ ] 错误提示友好
- [ ] 空状态展示正常
- [ ] 响应式布局正常

### 安全检查
- [ ] 用户权限控制正常
- [ ] 文件类型验证严格
- [ ] XSS 防护到位
- [ ] CSRF 防护到位

---

**最后更新：** 2025-10-09
**维护人：** AI Assistant
