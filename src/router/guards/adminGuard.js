/**
 * 管理员路由守卫
 * 用于保护管理员页面路由
 */

import { isAdmin, hasRole } from '@/utils/role';
import { ElMessage } from 'element-plus';

/**
 * 管理员路由守卫
 * @param {Object} to 目标路由
 * @param {Object} from 来源路由
 * @param {Function} next 路由跳转函数
 */
export function adminGuard(to, from, next) {
  // 检查是否需要管理员权限
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    const token = localStorage.getItem('token');

    if (!token) {
      // 未登录，跳转到登录页
      ElMessage.warning('请先登录');
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
      return;
    }

    if (!isAdmin()) {
      // 没有管理员权限
      ElMessage.error('无权访问管理员页面');
      next({
        path: '/403',
        replace: true
      });
      return;
    }
  }


  // 检查是否需要特定角色
  if (to.matched.some(record => record.meta.requiredRoles)) {
    const token = localStorage.getItem('token');
    const requiredRoles = to.meta.requiredRoles;

    if (!token) {
      // 未登录，跳转到登录页
      ElMessage.warning('请先登录');
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
      return;
    }

    if (!hasRole(requiredRoles)) {
      ElMessage.error('无权访问此页面');
      next({
        path: '/403',
        replace: true
      });
      return;
    }
  }

  next();
}

/**
 * 设置路由守卫
 * @param {Router} router Vue Router实例
 */
export function setupAdminGuard(router) {
  router.beforeEach(adminGuard);
}

export default adminGuard;