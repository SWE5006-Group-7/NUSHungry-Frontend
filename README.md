# NUSHungry - 校园食堂评价系统

<div align="center">

**一个现代化的校园食堂摊位评价与管理平台**

[English](#english) | [简体中文](#简体中文)

</div>

---

## 简体中文

### 📋 项目简介

NUSHungry 是一个为新加坡国立大学（NUS）校园设计的食堂摊位评价与管理系统。该系统提供了用户友好的界面，让学生能够浏览食堂信息、评价摊位、收藏喜欢的摊位，同时为管理员提供了强大的后台管理功能。

### ✨ 核心功能

#### 用户端功能
- 🏢 **食堂浏览** - 查看校园内所有食堂及其摊位信息
- 🗺️ **地图定位** - 基于 Leaflet 的交互式地图展示食堂位置
- ⭐ **评价系统** - 发布评价、上传图片、点赞和举报不当内容
- 💝 **收藏管理** - 收藏喜欢的摊位，支持拖拽排序
- 🔍 **智能搜索** - 按名称、菜系类型、清真认证等条件筛选摊位
- 📸 **图片上传** - 多图上传、裁剪、预览功能
- 👤 **个人中心** - 管理个人资料、头像、密码和我的评价
- 🌐 **多语言支持** - 中文/英文切换（基于 Vue I18n）

#### 管理员功能
- 📊 **数据仪表盘** - 可视化统计图表（基于 ECharts）
- 👥 **用户管理** - 用户查询、禁用/启用账户
- 🏪 **食堂管理** - CRUD 操作、营业时间设置
- 🍜 **摊位管理** - 摊位信息维护、图片管理
- 🔍 **内容审核** - 处理用户举报、审核评价和图片
- 📝 **评价管理** - 查看、编辑、删除用户评价
- 🖼️ **图片管理** - 批量管理和删除不当图片

### 🛠️ 技术栈

#### 前端技术
- **框架**: Vue 3.5.21（Composition API）
- **构建工具**: Vite 7.1.5
- **路由**: Vue Router 4.5.1
- **状态管理**: Pinia 2.1.7
- **UI 组件库**:
  - Ant Design Vue 4.0.0-rc.6（主要 UI 框架）
  - Element Plus 2.11.4（辅助组件）
- **HTTP 客户端**: Axios 1.4.0
- **国际化**: Vue I18n 9.14.5
- **图表库**: ECharts 6.0.0
- **地图**: Leaflet 1.9.4
- **图片处理**:
  - Cropper.js 1.6.2（头像裁剪）
  - 自定义图片上传组件
- **其他**:
  - vuedraggable 4.1.0（拖拽排序）
  - Less 4.4.2（样式预处理）

#### 后端技术（配套使用）
- **框架**: Spring Boot 3.2.3
- **安全**: Spring Security 6 + JWT
- **数据库**: MySQL 8.x + Spring Data JPA
- **认证**: JWT 0.11.5

### 📁 项目结构

```
nushungry-Frontend/
├── src/
│   ├── assets/              # 静态资源（图片、样式）
│   ├── components/          # 可复用组件
│   │   ├── admin/           # 管理后台组件
│   │   │   ├── AdminLayout.vue      # 后台布局组件
│   │   │   ├── StatCard.vue         # 统计卡片
│   │   │   ├── CafeteriaForm.vue    # 食堂表单
│   │   │   ├── StallForm.vue        # 摊位表单
│   │   │   ├── OpeningHoursInput.vue # 营业时间输入
│   │   │   └── charts/              # 图表组件
│   │   │       └── UserGrowthChart.vue
│   │   ├── CafeteriaCard.vue        # 食堂卡片
│   │   ├── StallCard.vue            # 摊位卡片
│   │   ├── ReviewCard.vue           # 评价卡片
│   │   ├── ReviewForm.vue           # 评价表单
│   │   ├── ReviewList.vue           # 评价列表
│   │   ├── ImageUpload.vue          # 图片上传
│   │   ├── ImageUploadDialog.vue    # 图片上传对话框
│   │   ├── ImageViewer.vue          # 图片查看器
│   │   ├── ImageGallery.vue         # 图片画廊
│   │   ├── AvatarCropper.vue        # 头像裁剪器
│   │   ├── MapSection.vue           # 地图组件
│   │   └── Header.vue               # 页面头部
│   ├── pages/               # 页面组件
│   │   ├── HomePage.vue             # 首页
│   │   ├── CafeteriaDetail.vue      # 食堂详情
│   │   ├── StallDetail.vue          # 摊位详情
│   │   ├── AllReviewsPage.vue       # 所有评价页
│   │   ├── LoginPage.vue            # 登录页
│   │   ├── RegisterPage.vue         # 注册页
│   │   ├── ForgotPassword.vue       # 忘记密码
│   │   ├── ProfilePage.vue          # 个人资料
│   │   ├── FavoritesPage.vue        # 收藏页（支持拖拽排序）
│   │   ├── MyReviewsPage.vue        # 我的评价
│   │   └── SettingsPage.vue         # 设置页
│   ├── views/admin/         # 管理后台页面
│   │   ├── AdminLogin.vue           # 管理员登录
│   │   ├── AdminDashboard.vue       # 数据仪表盘
│   │   ├── UserManagement.vue       # 用户管理
│   │   ├── CafeteriaManagement.vue  # 食堂管理
│   │   ├── StallManagement.vue      # 摊位管理
│   │   ├── ContentModeration.vue    # 内容审核
│   │   ├── ReviewManagement.vue     # 评价管理
│   │   ├── ImageManagement.vue      # 图片管理
│   │   ├── ChangePassword.vue       # 修改密码
│   │   └── TokenDebug.vue           # Token 调试
│   ├── services/            # API 服务层
│   │   ├── authService.js           # 认证服务
│   │   ├── cafeteriaService.js      # 食堂服务
│   │   ├── stallService.js          # 摊位服务
│   │   ├── reviewService.js         # 评价服务
│   │   ├── favoriteService.js       # 收藏服务
│   │   ├── imageService.js          # 图片服务
│   │   ├── uploadService.js         # 上传服务
│   │   ├── searchService.js         # 搜索服务
│   │   └── api/admin/               # 管理后台 API
│   │       └── moderation.js        # 审核服务
│   ├── stores/              # Pinia 状态管理
│   │   ├── user.js                  # 用户状态
│   │   ├── cafeteria.js             # 食堂状态
│   │   ├── stall.js                 # 摊位状态
│   │   └── locale.js                # 语言状态
│   ├── router/              # 路由配置
│   │   └── index.js                 # 路由定义和守卫
│   ├── locales/             # 国际化
│   │   ├── index.js                 # i18n 配置
│   │   ├── zh-CN.js                 # 中文翻译
│   │   └── en-US.js                 # 英文翻译
│   ├── utils/               # 工具函数
│   │   ├── request.js               # Axios 配置（JWT 拦截器）
│   │   └── role.js                  # 角色判断工具
│   ├── App.vue              # 根组件
│   ├── main.js              # 入口文件
│   └── style.css            # 全局样式
├── public/                  # 公共资源
├── .env                     # 环境变量
├── vite.config.js           # Vite 配置
├── package.json             # 项目依赖
└── index.html               # HTML 模板
```

### 🚀 快速开始

#### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0
- 配套的后端服务（Spring Boot）

#### 安装步骤

1. **克隆仓库**
```bash
git clone <repository-url>
cd nushungry-Frontend
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

创建 `.env` 文件（如果不存在）：
```env
# API 基础路径
VITE_API_BASE_URL=/api

# 后端服务地址（可选，默认 http://localhost:8080）
VITE_BACKEND_URL=http://localhost:8080
```

4. **启动开发服务器**
```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动

#### 构建生产版本
```bash
npm run build
npm run preview  # 预览生产构建
```

### 🔧 核心配置说明

#### API 请求配置
所有 API 请求通过 `src/utils/request.js` 统一管理：
- 自动注入 JWT Token
- 统一错误处理（401/403 自动跳转登录）
- Token 过期自动刷新
- 请求/响应拦截器

**⚠️ 重要约定**: 所有 Service 文件必须使用 `@/utils/request` 作为 API 客户端，禁止重复创建 axios 实例。

#### 路由守卫
位于 `src/router/index.js`:
- `requiresAuth`: 需要登录的页面
- `requiresAdmin`: 需要管理员权限的页面
- `requiresGuest`: 仅未登录用户可访问（登录/注册页）

#### 代理配置
开发环境通过 Vite 代理转发请求到后端（`vite.config.js`）：
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true
  },
  '/uploads': {
    target: 'http://localhost:8080',
    changeOrigin: true
  }
}
```

### 📝 开发规范

#### 组件开发
- 使用 Vue 3 Composition API
- 遵循单一职责原则（SRP）
- 组件命名使用 PascalCase
- Props 定义完整的类型和验证

#### API 服务
- 按功能模块划分服务文件
- 统一使用 `@/utils/request` 进行请求
- 错误处理在拦截器中统一完成
- 返回 Promise 便于异步处理

#### 状态管理
- 使用 Pinia 管理全局状态
- Store 按业务模块划分（user、cafeteria、stall、locale）
- 避免在组件中直接操作 localStorage

#### 样式规范
- 使用 scoped 样式避免污染
- 复用 Ant Design Vue 的设计令牌
- 响应式设计优先

### 🔐 认证与权限

#### JWT Token 管理
- Token 存储在 localStorage
- 自动在请求头添加 `Authorization: Bearer <token>`
- Token 过期时自动刷新或跳转登录

#### 角色权限
- `ROLE_USER`: 普通用户
- `ROLE_ADMIN`: 管理员

权限判断工具: `src/utils/role.js`

### 🌐 国际化支持

使用 Vue I18n 实现中英文切换：
- 翻译文件: `src/locales/zh-CN.js` 和 `src/locales/en-US.js`
- 语言切换: 通过 Header 组件的语言选择器
- 持久化: 选择的语言存储在 localStorage

### 📦 主要依赖说明

| 依赖 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5.21 | 核心框架 |
| Vite | 7.1.5 | 构建工具 |
| Vue Router | 4.5.1 | 路由管理 |
| Pinia | 2.1.7 | 状态管理 |
| Ant Design Vue | 4.0.0-rc.6 | UI 组件库 |
| Element Plus | 2.11.4 | 辅助 UI 组件 |
| Axios | 1.4.0 | HTTP 客户端 |
| Vue I18n | 9.14.5 | 国际化 |
| ECharts | 6.0.0 | 数据可视化 |
| Leaflet | 1.9.4 | 地图组件 |
| Cropper.js | 1.6.2 | 图片裁剪 |
| vuedraggable | 4.1.0 | 拖拽功能 |

### 🐛 常见问题

#### 1. API 请求 404 错误
- 检查后端服务是否启动（默认端口 8080）
- 确认 `.env` 中的 `VITE_BACKEND_URL` 配置正确
- 查看 `vite.config.js` 的代理配置

#### 2. Token 过期问题
- `utils/request.js` 会自动处理 401 错误
- 确保后端 JWT 配置与前端一致

#### 3. 图片上传失败
- 检查后端文件上传配置
- 确认 `/uploads` 路径正确代理

#### 4. 组件样式不生效
- 确保使用 `scoped` 属性
- 检查是否正确导入 Ant Design Vue 样式

### 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

#### 提交规范
- feat: 新功能
- fix: 修复 Bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建/工具链调整

### 📄 许可证

本项目采用 ISC 许可证。

---

## English

### 📋 Project Overview

NUSHungry is a modern canteen stall review and management system designed for the National University of Singapore (NUS) campus. The system provides a user-friendly interface for students to browse canteen information, review stalls, bookmark favorites, while offering administrators powerful backend management capabilities.

### ✨ Key Features

#### User Features
- 🏢 **Canteen Browsing** - View all canteens and stalls on campus
- 🗺️ **Map Integration** - Interactive Leaflet-based map showing canteen locations
- ⭐ **Review System** - Post reviews, upload images, like and report inappropriate content
- 💝 **Favorites Management** - Bookmark favorite stalls with drag-and-drop sorting
- 🔍 **Smart Search** - Filter stalls by name, cuisine type, halal certification, etc.
- 📸 **Image Upload** - Multi-image upload, cropping, and preview
- 👤 **User Profile** - Manage personal information, avatar, password, and reviews
- 🌐 **Multi-language** - Chinese/English switching (Vue I18n)

#### Admin Features
- 📊 **Dashboard** - Visual statistics with ECharts
- 👥 **User Management** - Query, enable/disable user accounts
- 🏪 **Canteen Management** - CRUD operations, opening hours settings
- 🍜 **Stall Management** - Maintain stall info and images
- 🔍 **Content Moderation** - Handle reports, review content and images
- 📝 **Review Management** - View, edit, delete user reviews
- 🖼️ **Image Management** - Batch manage and remove inappropriate images

### 🛠️ Tech Stack

#### Frontend
- **Framework**: Vue 3.5.21 (Composition API)
- **Build Tool**: Vite 7.1.5
- **Router**: Vue Router 4.5.1
- **State Management**: Pinia 2.1.7
- **UI Libraries**:
  - Ant Design Vue 4.0.0-rc.6 (Primary)
  - Element Plus 2.11.4 (Auxiliary)
- **HTTP Client**: Axios 1.4.0
- **Internationalization**: Vue I18n 9.14.5
- **Charts**: ECharts 6.0.0
- **Maps**: Leaflet 1.9.4
- **Image Processing**:
  - Cropper.js 1.6.2 (Avatar cropping)
  - Custom upload components
- **Others**:
  - vuedraggable 4.1.0 (Drag-and-drop)
  - Less 4.4.2 (CSS preprocessor)

#### Backend (Companion Service)
- **Framework**: Spring Boot 3.2.3
- **Security**: Spring Security 6 + JWT
- **Database**: MySQL 8.x + Spring Data JPA
- **Authentication**: JWT 0.11.5

### 🚀 Quick Start

#### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- Backend service (Spring Boot) running

#### Installation

1. **Clone Repository**
```bash
git clone <repository-url>
cd nushungry-Frontend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**

Create `.env` file (if not exists):
```env
# API base path
VITE_API_BASE_URL=/api

# Backend service URL (optional, defaults to http://localhost:8080)
VITE_BACKEND_URL=http://localhost:8080
```

4. **Start Development Server**
```bash
npm run dev
```

Application will be available at `http://localhost:5173`

#### Build for Production
```bash
npm run build
npm run preview  # Preview production build
```

### 🔧 Core Configuration

#### API Request Configuration
All API requests are managed through `src/utils/request.js`:
- Auto JWT Token injection
- Unified error handling (401/403 auto-redirect to login)
- Automatic token refresh on expiration
- Request/Response interceptors

**⚠️ Important**: All Service files must use `@/utils/request` as the API client. Do not create duplicate axios instances.

#### Route Guards
Located in `src/router/index.js`:
- `requiresAuth`: Pages requiring authentication
- `requiresAdmin`: Pages requiring admin privileges
- `requiresGuest`: Pages accessible only to unauthenticated users

#### Proxy Configuration
Development proxy forwards requests to backend (`vite.config.js`):
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true
  },
  '/uploads': {
    target: 'http://localhost:8080',
    changeOrigin: true
  }
}
```

### 📝 Development Guidelines

#### Component Development
- Use Vue 3 Composition API
- Follow Single Responsibility Principle (SRP)
- Use PascalCase for component names
- Define complete prop types and validation

#### API Services
- Organize service files by functional modules
- Use `@/utils/request` for all requests
- Handle errors in interceptors
- Return Promises for async operations

#### State Management
- Use Pinia for global state
- Organize stores by business modules (user, cafeteria, stall, locale)
- Avoid direct localStorage manipulation in components

### 🔐 Authentication & Authorization

#### JWT Token Management
- Tokens stored in localStorage
- Auto-added to request headers: `Authorization: Bearer <token>`
- Auto-refresh or redirect on token expiration

#### Roles
- `ROLE_USER`: Regular users
- `ROLE_ADMIN`: Administrators

Permission utilities: `src/utils/role.js`

### 🌐 Internationalization

Implemented with Vue I18n for Chinese/English switching:
- Translation files: `src/locales/zh-CN.js` and `src/locales/en-US.js`
- Language switcher: Available in Header component
- Persistence: Selected language stored in localStorage

### 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Vue | 3.5.21 | Core framework |
| Vite | 7.1.5 | Build tool |
| Vue Router | 4.5.1 | Routing |
| Pinia | 2.1.7 | State management |
| Ant Design Vue | 4.0.0-rc.6 | UI library |
| Element Plus | 2.11.4 | Supplementary UI |
| Axios | 1.4.0 | HTTP client |
| Vue I18n | 9.14.5 | Internationalization |
| ECharts | 6.0.0 | Data visualization |
| Leaflet | 1.9.4 | Maps |
| Cropper.js | 1.6.2 | Image cropping |
| vuedraggable | 4.1.0 | Drag-and-drop |

### 🐛 Troubleshooting

#### 1. API 404 Errors
- Verify backend service is running (default port 8080)
- Check `VITE_BACKEND_URL` in `.env`
- Review proxy config in `vite.config.js`

#### 2. Token Expiration Issues
- `utils/request.js` auto-handles 401 errors
- Ensure backend JWT config matches frontend

#### 3. Image Upload Failures
- Check backend file upload configuration
- Verify `/uploads` path is correctly proxied

#### 4. Component Styles Not Applied
- Ensure `scoped` attribute is used
- Check Ant Design Vue styles are imported

### 🤝 Contributing

Issues and Pull Requests are welcome!

#### Commit Conventions
- feat: New features
- fix: Bug fixes
- docs: Documentation updates
- style: Code formatting
- refactor: Refactoring
- test: Testing
- chore: Build/toolchain changes

### 📄 License

This project is licensed under the ISC License.

---

<div align="center">

**Built with ❤️ for NUS Community**

</div>
