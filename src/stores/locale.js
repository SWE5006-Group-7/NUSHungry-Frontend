import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

export const useLocaleStore = defineStore('locale', () => {
  const currentLocale = ref(localStorage.getItem('locale') || 'zh-CN')

  const isZhCN = computed(() => currentLocale.value === 'zh-CN')
  const isEnUS = computed(() => currentLocale.value === 'en-US')
  
  const localeName = computed(() => {
    return currentLocale.value === 'zh-CN' ? '中文' : 'English'
  })

  function setLocale(locale) {
    currentLocale.value = locale
    localStorage.setItem('locale', locale)
  }

  function toggleLocale() {
    const newLocale = currentLocale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
    setLocale(newLocale)
  }

  return {
    currentLocale,
    isZhCN,
    isEnUS,
    localeName,
    setLocale,
    toggleLocale
  }
})
