/**
 * 摊位更新调试工具
 * 用于追踪摊位数据更新流程
 */

export function debugStallUpdate(stage, data) {
  const timestamp = new Date().toLocaleTimeString();

  console.group(`🔧 [${timestamp}] ${stage}`);

  switch(stage) {
    case 'FORM_SUBMIT':
      console.log('📋 表单数据:', data.formData);
      console.log('🏪 食堂ID:', data.formData.cafeteriaId);
      console.log('🔢 食堂ID类型:', typeof data.formData.cafeteriaId);
      console.log('📦 提交数据:', data.submitData);
      break;

    case 'API_REQUEST':
      console.log('🌐 请求方法:', data.method);
      console.log('🔗 请求URL:', data.url);
      console.log('📤 请求数据:', data.requestData);
      console.log('🏪 请求中的cafeteriaId:', data.requestData.cafeteriaId);
      break;

    case 'API_RESPONSE':
      console.log('✅ 响应状态:', data.status);
      console.log('📥 响应数据:', data.responseData);
      if (data.responseData?.stall) {
        console.log('🏪 返回的摊位食堂:', data.responseData.stall.cafeteria);
      }
      break;

    case 'API_ERROR':
      console.error('❌ 错误状态:', data.status);
      console.error('❌ 错误信息:', data.error);
      console.error('❌ 完整错误:', data.fullError);
      break;

    case 'DATA_REFRESH':
      console.log('🔄 刷新后的数据:', data.refreshedData);
      console.log('🏪 刷新后的食堂:', data.refreshedData?.cafeteria);
      break;
  }

  console.groupEnd();
}

// 导出到window方便浏览器控制台使用
if (typeof window !== 'undefined') {
  window.debugStallUpdate = debugStallUpdate;
}

export default debugStallUpdate;
