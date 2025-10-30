# 快速入门指南

## 前端用户认证功能

### 已完成的功能 ✅

1. ✅ 用户注册和登录系统
2. ✅ JWT token认证
3. ✅ 个人中心页面 (我的评价、我的收藏)
4. ✅ 设置页面 (修改信息、修改密码、退出登录)
5. ✅ 路由守卫 (保护需要登录的页面)
6. ✅ Header组件集成登录状态

---

## 新增文件一览

```
NUSHungry-Frontend/
├── src/
│   ├── services/
│   │   └── authService.js          # 用户认证API服务
│   ├── stores/
│   │   └── user.js                 # 用户状态管理 (Pinia)
│   ├── pages/
│   │   ├── LoginPage.vue           # 登录页面
│   │   ├── RegisterPage.vue        # 注册页面
│   │   ├── ProfilePage.vue         # 个人中心
│   │   └── SettingsPage.vue        # 设置页面
│   ├── router/
│   │   └── index.js                # 更新: 添加路由和守卫
│   └── components/
│       └── Header.vue              # 更新: 添加用户菜单
├── USER_AUTH_README.md             # 功能说明文档
├── BACKEND_API_REQUIREMENTS.md     # 后端API需求文档
└── QUICK_START.md                  # 本文件
```

---

## 启动应用

### 1. 启动前端开发服务器
```bash
cd NUSHungry-Frontend
npm run dev
```

访问: http://localhost:5173

### 2. 启动后端服务器 (如果已实现)
```bash
cd NUSHungry-Backend
# 根据后端技术栈运行相应命令
```

---

## 功能演示流程

### 场景 1: 新用户注册
1. 访问首页 http://localhost:5173
2. 点击 Header 中的 "注册" 按钮
3. 填写注册信息:
   - 用户名: testuser (3-20字符)
   - 邮箱: test@example.com
   - 密码: 123456 (至少6字符)
   - 确认密码: 123456
4. 点击 "注册" 按钮
5. 注册成功后自动登录并跳转到首页

### 场景 2: 用户登录
1. 点击 Header 中的 "登录" 按钮
2. 输入用户名和密码
3. 点击 "登录" 按钮
4. 登录成功后,Header 显示用户头像和用户名

### 场景 3: 访问个人中心
1. 登录后,点击 Header 中的用户头像
2. 在下拉菜单中选择 "个人中心"
3. 查看 "我的评价" 和 "我的收藏" 标签页

### 场景 4: 修改密码
1. 点击用户头像,选择 "设置"
2. 切换到 "修改密码" 标签页
3. 输入当前密码和新密码
4. 点击 "修改密码" 按钮

### 场景 5: 退出登录
1. 点击用户头像,选择 "退出登录"
2. 或在设置页面的 "账户管理" 标签页中点击 "退出登录"
3. 退出后自动跳转到首页,Header 显示 "登录" 和 "注册" 按钮

### 场景 6: 路由守卫测试
1. 未登录状态下,直接访问 http://localhost:5173/profile
2. 自动重定向到登录页: http://localhost:5173/login?redirect=/profile
3. 登录成功后,自动跳转回 /profile 页面

---

## 路由说明

### 公开路由 (无需登录)
| 路径 | 说明 |
|------|------|
| `/` | 首页 |
| `/canteens/:id` | 食堂详情 |
| `/stalls/:id` | 档口详情 |

### 访客路由 (已登录用户不能访问)
| 路径 | 说明 |
|------|------|
| `/login` | 登录页面 |
| `/register` | 注册页面 |

### 受保护路由 (需要登录)
| 路径 | 说明 |
|------|------|
| `/profile` | 个人中心 |
| `/settings` | 设置页面 |

---

## 在组件中使用用户状态

### 检查登录状态
```vue
<template>
  <div v-if="userStore.isAuthenticated">
    <p>欢迎, {{ userStore.username }}!</p>
  </div>
  <div v-else>
    <p>请先登录</p>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>
```

### 调用登录/注册
```javascript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 登录
const result = await userStore.login({
  username: 'testuser',
  password: '123456'
})

if (result.success) {
  console.log('登录成功', result.user)
} else {
  console.error('登录失败', result.message)
}

// 注册
const result = await userStore.register({
  username: 'newuser',
  email: 'new@example.com',
  password: '123456'
})
```

### 调用API
```javascript
import authService from '@/services/authService'

// 获取用户收藏
const favorites = await authService.getUserFavorites()

// 获取用户评价
const reviews = await authService.getUserReviews()
```

---

## 后端集成

### 当前状态
前端已完全实现,但需要后端提供API支持。

### 后端需要实现的API
详见 `BACKEND_API_REQUIREMENTS.md` 文档,主要包括:

1. **认证**: `/api/auth/register`, `/api/auth/login`
2. **用户信息**: `/api/user/profile`, `/api/user/password`
3. **收藏**: `/api/user/favorites` (GET, POST, DELETE)
4. **评价**: `/api/user/reviews` (GET, POST, DELETE)

### API Base URL 配置
在 `src/services/authService.js` 中:
```javascript
const API_BASE_URL = 'http://localhost:8080/api'
```

如果后端端口不同,请修改此配置。

---

## 测试清单

在集成后端之前,可以使用 mock 数据进行前端测试:

- [ ] 注册页面显示正常
- [ ] 登录页面显示正常
- [ ] 表单验证工作正常
- [ ] 路由守卫正常工作
- [ ] Header 根据登录状态显示正确内容
- [ ] 个人中心页面布局正确
- [ ] 设置页面各标签页正常切换

后端集成后:

- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] JWT token 正确保存和使用
- [ ] Token 过期自动处理
- [ ] 获取用户收藏列表
- [ ] 获取用户评价列表
- [ ] 修改密码功能
- [ ] 退出登录功能

---

## 本地存储

应用使用 localStorage 存储:
- `token`: JWT token
- `user`: 用户信息 (JSON字符串)

### 查看存储的数据
打开浏览器开发者工具:
1. 按 F12
2. 切换到 "Application" 或 "存储" 选项卡
3. 选择 "Local Storage" > "http://localhost:5173"

---

## 常见问题

### Q: 为什么登录后刷新页面还是登录状态?
A: 用户信息和token保存在localStorage中,即使刷新页面也会自动恢复登录状态。

### Q: Token过期怎么办?
A: authService 会自动处理401错误,清除本地存储并重定向到登录页。

### Q: 如何测试未实现的功能?
A: 可以在对应的方法中添加console.log或使用mock数据进行前端测试。

### Q: CORS错误怎么办?
A: 确保后端正确配置了CORS,允许来自 http://localhost:5173 的请求。

---

## 下一步

1. **实现后端API** - 参考 `BACKEND_API_REQUIREMENTS.md`
2. **测试集成** - 前后端联调
3. **完善功能** - 实现删除评价、取消收藏等功能
4. **添加更多功能** - 如找回密码、邮箱验证等

---

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **UI库**: Ant Design Vue 4
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **构建工具**: Vite

---

## 文档索引

- [用户认证功能说明](USER_AUTH_README.md) - 详细功能说明
- [后端API需求](BACKEND_API_REQUIREMENTS.md) - 完整的API文档
- [快速入门](QUICK_START.md) - 本文件

---

## 支持

如有问题或建议,请联系开发团队。

祝使用愉快! 🎉
