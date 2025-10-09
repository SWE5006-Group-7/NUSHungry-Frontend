/**
 * 日期时间格式化工具函数
 */

/**
 * 格式化日期时间
 * @param {string|Date} date - 日期对象或日期字符串
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';

  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) {
    console.warn('Invalid date:', date);
    return '';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 格式化为相对时间（如：3分钟前）
 * @param {string|Date} date - 日期对象或日期字符串
 * @returns {string} 相对时间字符串
 */
export function formatRelativeTime(date) {
  if (!date) return '';

  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) {
    return `${years}年前`;
  } else if (months > 0) {
    return `${months}个月前`;
  } else if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else if (seconds > 0) {
    return `${seconds}秒前`;
  } else {
    return '刚刚';
  }
}

/**
 * 获取今天的日期范围
 * @returns {Array} [开始时间, 结束时间]
 */
export function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return [start, end];
}

/**
 * 获取本周的日期范围
 * @returns {Array} [开始时间, 结束时间]
 */
export function getWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 调整为周一开始

  const start = new Date(now);
  start.setDate(now.getDate() - diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setDate(now.getDate() + (6 - diff));
  end.setHours(23, 59, 59, 999);

  return [start, end];
}

/**
 * 获取本月的日期范围
 * @returns {Array} [开始时间, 结束时间]
 */
export function getMonthRange() {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return [start, end];
}

/**
 * 判断是否为今天
 * @param {string|Date} date - 日期对象或日期字符串
 * @returns {boolean}
 */
export function isToday(date) {
  if (!date) return false;

  const d = date instanceof Date ? date : new Date(date);
  const today = new Date();

  return d.getFullYear() === today.getFullYear() &&
         d.getMonth() === today.getMonth() &&
         d.getDate() === today.getDate();
}

/**
 * 获取日期的星期几
 * @param {string|Date} date - 日期对象或日期字符串
 * @returns {string} 星期几
 */
export function getDayOfWeek(date) {
  if (!date) return '';

  const d = date instanceof Date ? date : new Date(date);
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  return days[d.getDay()];
}

export default {
  formatDate,
  formatRelativeTime,
  getTodayRange,
  getWeekRange,
  getMonthRange,
  isToday,
  getDayOfWeek
};