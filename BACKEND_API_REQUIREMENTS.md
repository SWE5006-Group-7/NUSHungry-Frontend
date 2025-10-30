# 后端API需求文档

## 概述
前端用户认证系统需要后端提供以下API endpoints。所有需要认证的API都应该验证JWT token。

## Base URL
```
http://localhost:8080/api
```

## 认证相关 API

### 1. 用户注册
**Endpoint:** `POST /api/auth/register`

**请求体:**
```json
{
  "username": "string (3-20字符)",
  "email": "string (有效邮箱)",
  "password": "string (至少6字符)"
}
```

**成功响应 (200):**
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

**错误响应:**
- 400: 用户名已存在
- 400: 邮箱已被使用
- 400: 验证失败

---

### 2. 用户登录
**Endpoint:** `POST /api/auth/login`

**请求体:**
```json
{
  "username": "string",
  "password": "string"
}
```

**成功响应 (200):**
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

**错误响应:**
- 401: 用户名或密码错误
- 400: 请求参数错误

---

## 用户信息相关 API

### 3. 获取用户信息
**Endpoint:** `GET /api/user/profile`

**请求头:**
```
Authorization: Bearer {token}
```

**成功响应 (200):**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**错误响应:**
- 401: 未授权 (token无效或过期)

---

### 4. 更新用户信息
**Endpoint:** `PUT /api/user/profile`

**请求头:**
```
Authorization: Bearer {token}
```

**请求体:**
```json
{
  "email": "newemail@example.com"
}
```

**成功响应 (200):**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "newemail@example.com",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**错误响应:**
- 401: 未授权
- 400: 邮箱格式错误或已被使用

---

### 5. 修改密码
**Endpoint:** `PUT /api/user/password`

**请求头:**
```
Authorization: Bearer {token}
```

**请求体:**
```json
{
  "currentPassword": "string",
  "newPassword": "string (至少6字符)"
}
```

**成功响应 (200):**
```json
{
  "message": "密码修改成功"
}
```

**错误响应:**
- 401: 未授权
- 400: 当前密码错误
- 400: 新密码格式不正确

---

## 用户收藏相关 API

### 6. 获取用户收藏列表
**Endpoint:** `GET /api/user/favorites`

**请求头:**
```
Authorization: Bearer {token}
```

**成功响应 (200):**
```json
[
  {
    "id": 1,
    "stallId": 10,
    "stallName": "Western Food",
    "stallImage": "http://example.com/image.jpg",
    "cafeteriaName": "Engineering Canteen",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**错误响应:**
- 401: 未授权

---

### 7. 添加收藏
**Endpoint:** `POST /api/user/favorites`

**请求头:**
```
Authorization: Bearer {token}
```

**请求体:**
```json
{
  "stallId": 10
}
```

**成功响应 (200):**
```json
{
  "id": 1,
  "stallId": 10,
  "userId": 1,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**错误响应:**
- 401: 未授权
- 400: 档口不存在
- 400: 已经收藏过该档口

---

### 8. 取消收藏
**Endpoint:** `DELETE /api/user/favorites/{favoriteId}`

**请求头:**
```
Authorization: Bearer {token}
```

**成功响应 (200):**
```json
{
  "message": "取消收藏成功"
}
```

**错误响应:**
- 401: 未授权
- 404: 收藏不存在

---

## 用户评价相关 API

### 9. 获取用户评价列表
**Endpoint:** `GET /api/user/reviews`

**请求头:**
```
Authorization: Bearer {token}
```

**成功响应 (200):**
```json
[
  {
    "id": 1,
    "stallId": 10,
    "stallName": "Western Food",
    "rating": 5,
    "comment": "Very good!",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**错误响应:**
- 401: 未授权

---

### 10. 添加评价
**Endpoint:** `POST /api/user/reviews`

**请求头:**
```
Authorization: Bearer {token}
```

**请求体:**
```json
{
  "stallId": 10,
  "rating": 5,
  "comment": "Very good!"
}
```

**成功响应 (200):**
```json
{
  "id": 1,
  "stallId": 10,
  "userId": 1,
  "rating": 5,
  "comment": "Very good!",
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**错误响应:**
- 401: 未授权
- 400: 档口不存在
- 400: 评分必须在1-5之间

---

### 11. 删除评价
**Endpoint:** `DELETE /api/user/reviews/{reviewId}`

**请求头:**
```
Authorization: Bearer {token}
```

**成功响应 (200):**
```json
{
  "message": "删除评价成功"
}
```

**错误响应:**
- 401: 未授权
- 404: 评价不存在
- 403: 无权删除该评价

---

## JWT Token 规范

### Token 格式
- 使用 JWT (JSON Web Token)
- 在 HTTP 请求头中传递: `Authorization: Bearer {token}`

### Token 内容
建议在 JWT payload 中包含:
```json
{
  "userId": 1,
  "username": "testuser",
  "exp": 1234567890,  // 过期时间戳
  "iat": 1234567890   // 签发时间戳
}
```

### Token 过期处理
- 建议token有效期: 24小时或7天
- 前端会在收到 401 响应时自动清除token并重定向到登录页
- 后端应该在token过期时返回 401 状态码

---

## 错误响应格式

建议使用统一的错误响应格式:

```json
{
  "error": "错误类型",
  "message": "详细错误信息",
  "statusCode": 400
}
```

### 常见HTTP状态码
- 200: 成功
- 201: 创建成功
- 400: 请求参数错误
- 401: 未授权 (token无效或过期)
- 403: 禁止访问
- 404: 资源不存在
- 500: 服务器内部错误

---

## CORS 配置

后端需要配置 CORS 以允许前端访问:

```java
// Spring Boot 示例
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

---

## 测试建议

### 使用 Postman 或类似工具测试

1. **测试注册**
   - POST /api/auth/register
   - 验证用户名重复、邮箱重复等情况

2. **测试登录**
   - POST /api/auth/login
   - 保存返回的token用于后续测试

3. **测试需要认证的API**
   - 在请求头中添加 Authorization: Bearer {token}
   - 测试token过期情况

4. **测试收藏和评价功能**
   - 添加、获取、删除操作
   - 验证权限控制

---

## 数据库表结构建议

### Users 表
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- 加密后的密码
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Favorites 表
```sql
CREATE TABLE favorites (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  stall_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (stall_id) REFERENCES stalls(id),
  UNIQUE KEY unique_favorite (user_id, stall_id)
);
```

### Reviews 表
```sql
CREATE TABLE reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  stall_id BIGINT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (stall_id) REFERENCES stalls(id)
);
```

---

## 安全建议

1. **密码存储**: 使用 BCrypt 或类似算法加密密码
2. **JWT 密钥**: 使用强随机密钥,不要硬编码在代码中
3. **输入验证**: 验证所有用户输入,防止SQL注入和XSS攻击
4. **Rate Limiting**: 对登录和注册接口实施速率限制
5. **HTTPS**: 生产环境必须使用HTTPS

---

## 联系方式

如有问题,请联系前端开发团队。
