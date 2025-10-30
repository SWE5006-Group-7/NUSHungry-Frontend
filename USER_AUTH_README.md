# 用户认证功能说明

## 功能概述

本次更新为 NUSHungry 前端应用添加了完整的用户认证和个人中心功能,包括:

1. **用户注册和登录**
2. **个人信息页面** (我的评价、我的收藏)
3. **设置页面** (修改个人信息、修改密码、退出登录)
4. **路由守卫** (保护需要登录才能访问的页面)

## 新增文件

### Services (API服务)
- `src/services/authService.js` - 用户认证相关的API调用服务

### Stores (状态管理)
- `src/stores/user.js` - 用户状态管理 (Pinia store)

### Pages (页面组件)
- `src/pages/LoginPage.vue` - 登录页面
- `src/pages/RegisterPage.vue` - 注册页面
- `src/pages/ProfilePage.vue` - 个人信息页面
- `src/pages/SettingsPage.vue` - 设置页面

### 更新的文件
- `src/router/index.js` - 添加了新路由和路由守卫
- `src/components/Header.vue` - 添加了登录/登出状态显示

## 路由说明

### 公开路由 (无需登录)
- `/` - 首页
- `/canteens/:id` - 食堂详情
- `/stalls/:id` - 档口详情

### 访客专用路由 (已登录用户不能访问)
- `/login` - 登录页面
- `/register` - 注册页面

### 受保护路由 (需要登录)
- `/profile` - 个人中心
- `/settings` - 设置页面

## 功能详解

### 1. 用户注册 (`/register`)
- 输入用户名、邮箱、密码
- 前端验证:
  - 用户名: 3-20个字符
  - 邮箱: 有效的邮箱格式
  - 密码: 至少6个字符
  - 确认密码: 必须与密码一致
- 注册成功后自动登录并跳转到首页

### 2. 用户登录 (`/login`)
- 输入用户名和密码
- 登录成功后:
  - JWT token 存储在 localStorage
  - 用户信息存储在 localStorage 和 Pinia store
  - 如果有 redirect 参数,跳转到之前访问的页面,否则跳转到首页

### 3. 个人中心 (`/profile`)
包含两个标签页:
- **我的评价**: 显示用户的所有评价,可以删除评价
- **我的收藏**: 显示用户收藏的档口,可以取消收藏,点击卡片跳转到档口详情

### 4. 设置页面 (`/settings`)
包含三个标签页:
- **个人信息**: 修改邮箱 (用户名不可修改)
- **修改密码**: 输入当前密码、新密码和确认新密码
- **账户管理**: 退出登录

### 5. Header 组件更新
- **未登录状态**: 显示 "登录" 和 "注册" 按钮
- **已登录状态**: 显示用户头像和用户名,点击后显示下拉菜单:
  - 个人中心
  - 设置
  - 退出登录

## 技术实现

### 状态管理 (Pinia)
使用 Pinia store 管理用户状态:
```javascript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 访问用户信息
console.log(userStore.username)
console.log(userStore.isAuthenticated)

// 调用方法
await userStore.login({ username, password })
userStore.logout()
```

### API 服务
所有API调用都通过 `authService.js` 进行:
- 自动在请求头中添加 JWT token
- 自动处理 401 错误 (token过期)
- 统一的错误处理

### 路由守卫
在路由配置中使用 `beforeEach` 守卫:
- 检查用户是否已登录
- 未登录用户访问受保护路由时,重定向到登录页
- 已登录用户访问登录/注册页时,重定向到首页

## 后端API要求

前端需要后端提供以下API endpoints:

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户相关
- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/profile` - 更新用户信息
- `PUT /api/user/password` - 修改密码
- `GET /api/user/favorites` - 获取用户收藏列表
- `GET /api/user/reviews` - 获取用户评价列表

## 使用示例

### 在组件中访问用户信息
```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 检查是否登录
if (userStore.isAuthenticated) {
  console.log('用户已登录:', userStore.username)
}
</script>
```

### 调用API
```javascript
import authService from '@/services/authService'

// 获取用户收藏
const favorites = await authService.getUserFavorites()

// 获取用户评价
const reviews = await authService.getUserReviews()
```

## 待完成功能

以下功能在页面中已预留,但后端API需要实现:

1. **删除评价**: ProfilePage.vue 中的 `handleDeleteReview`
2. **取消收藏**: ProfilePage.vue 中的 `handleRemoveFavorite`

## 本地存储

应用使用 localStorage 存储以下数据:
- `token`: JWT token
- `user`: 用户基本信息 (JSON字符串)

退出登录时会清除这些数据。

## 安全注意事项

1. JWT token 存储在 localStorage 中
2. 所有需要认证的API请求都会自动添加 Authorization header
3. Token过期时会自动清除并重定向到登录页
4. 密码在传输前应由后端进行哈希处理

## 测试建议

1. 测试注册流程
2. 测试登录流程
3. 测试路由守卫 (尝试在未登录时访问 /profile)
4. 测试token过期处理
5. 测试退出登录功能
6. 测试个人中心的各个标签页
7. 测试修改密码功能

## 开发和构建

```bash
# 开发模式
npm run dev

# 生产构建
npm run build
```
