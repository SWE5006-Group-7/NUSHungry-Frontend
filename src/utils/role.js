/**
 * 角色工具函数
 * 用于判断用户角色和权限
 */

// 角色枚举
export const UserRole = {
  USER: 'ROLE_USER',
  ADMIN: 'ROLE_ADMIN'
};

/**
 * 从JWT token中解析用户信息
 * @param {string} token JWT token
 * @returns {object|null} 解析后的用户信息
 */
export function parseToken(token) {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
}

/**
 * 获取当前用户的角色
 * @returns {string|null} 用户角色
 */
export function getCurrentUserRole() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const decoded = parseToken(token);
  return decoded?.role || null;
}

/**
 * 检查用户是否为管理员
 * @returns {boolean}
 */
export function isAdmin() {
  const role = getCurrentUserRole();
  return role === UserRole.ADMIN;
}


/**
 * 检查用户是否为普通用户
 * @returns {boolean}
 */
export function isRegularUser() {
  const role = getCurrentUserRole();
  return role === UserRole.USER;
}

/**
 * 检查用户是否有指定角色
 * @param {string|string[]} roles 角色或角色数组
 * @returns {boolean}
 */
export function hasRole(roles) {
  const currentRole = getCurrentUserRole();
  if (!currentRole) return false;

  if (Array.isArray(roles)) {
    return roles.includes(currentRole);
  }
  return currentRole === roles;
}

/**
 * 检查用户是否有访问权限
 * 管理员可以访问所有内容
 * @param {string|string[]} requiredRoles 需要的角色
 * @returns {boolean}
 */
export function hasAccess(requiredRoles) {
  const currentRole = getCurrentUserRole();
  if (!currentRole) return false;

  // 管理员有所有权限
  if (currentRole === UserRole.ADMIN) return true;

  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(currentRole);
  }
  return currentRole === requiredRoles;
}

/**
 * 获取角色显示名称
 * @param {string} role 角色标识
 * @returns {string} 角色显示名称
 */
export function getRoleName(role) {
  switch (role) {
    case UserRole.ADMIN:
      return '管理员';
    case UserRole.USER:
      return '普通用户';
    default:
      return '未知';
  }
}

export default {
  UserRole,
  parseToken,
  getCurrentUserRole,
  isAdmin,
  isRegularUser,
  hasRole,
  hasAccess,
  getRoleName
};