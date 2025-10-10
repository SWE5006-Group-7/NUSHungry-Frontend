<template>
  <div class="search-bar-container" ref="containerRef">
    <a-input-search
      v-model:value="searchKeyword"
      allow-clear
      :style="searchStyle"
      size="large"
      placeholder="搜索食堂、摊位或菜品..."
      @search="handleSearch"
      @focus="showSuggestions = true"
      @input="handleInput"
      @keydown.down.prevent="handleKeyDown"
      @keydown.up.prevent="handleKeyUp"
      @keydown.enter.prevent="handleEnter"
    />

    <!-- 搜索建议下拉框 -->
    <transition name="slide-fade">
      <div
        v-if="showSuggestions && (hasSuggestions || hasHistory)"
        class="suggestions-dropdown"
        :style="{ width: dropdownWidth }"
      >
        <!-- 最近搜索 -->
        <div v-if="recentSearches.length > 0" class="suggestion-section">
          <div class="suggestion-header">
            <span>最近搜索</span>
            <a-button type="link" size="small" @click="clearRecentSearches">
              清除
            </a-button>
          </div>
          <div
            v-for="(keyword, index) in recentSearches"
            :key="`recent-${index}`"
            class="suggestion-item"
            :class="{ active: selectedIndex === index }"
            @click="selectSuggestion(keyword)"
            @mouseenter="selectedIndex = index"
          >
            <ClockCircleOutlined class="suggestion-icon" />
            <span class="suggestion-text">{{ keyword }}</span>
          </div>
        </div>

        <!-- 搜索建议 -->
        <div v-if="suggestions.length > 0" class="suggestion-section">
          <div class="suggestion-header">搜索建议</div>
          <div
            v-for="(suggestion, index) in suggestions"
            :key="`suggestion-${index}`"
            class="suggestion-item"
            :class="{ active: selectedIndex === recentSearches.length + index }"
            @click="selectSuggestion(suggestion.text)"
            @mouseenter="selectedIndex = recentSearches.length + index"
          >
            <SearchOutlined class="suggestion-icon" />
            <span class="suggestion-text">
              <span v-html="highlightKeyword(suggestion.text)"></span>
            </span>
            <a-tag
              v-if="suggestion.type !== 'KEYWORD'"
              size="small"
              :color="getTagColor(suggestion.type)"
              class="suggestion-tag"
            >
              {{ getTypeLabel(suggestion.type) }}
            </a-tag>
          </div>
        </div>

        <!-- 热门搜索 -->
        <div v-if="popularKeywords.length > 0 && !searchKeyword" class="suggestion-section">
          <div class="suggestion-header">热门搜索</div>
          <div class="popular-keywords">
            <a-tag
              v-for="(keyword, index) in popularKeywords.slice(0, 10)"
              :key="`popular-${index}`"
              :color="index < 3 ? 'red' : 'default'"
              style="cursor: pointer; margin: 4px;"
              @click="selectSuggestion(keyword)"
            >
              {{ index < 3 ? `${index + 1}. ` : '' }}{{ keyword }}
            </a-tag>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { SearchOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';
import { searchService } from '@/services/searchService';

const props = defineProps({
  searchStyle: {
    type: Object,
    default: () => ({})
  }
});

const router = useRouter();

// 搜索关键词
const searchKeyword = ref('');

// 搜索建议
const suggestions = ref([]);
const recentSearches = ref([]);
const popularKeywords = ref([]);

// UI状态
const showSuggestions = ref(false);
const selectedIndex = ref(-1);
const containerRef = ref(null);
const dropdownWidth = ref('720px');

// 防抖定时器
let debounceTimer = null;

// 计算属性
const hasSuggestions = computed(() => suggestions.value.length > 0);
const hasHistory = computed(() => recentSearches.value.length > 0 || popularKeywords.value.length > 0);

// 处理输入
const handleInput = () => {
  // 防抖加载建议
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    if (searchKeyword.value.trim()) {
      await loadSuggestions();
    } else {
      suggestions.value = [];
    }
  }, 300);
};

// 加载搜索建议
const loadSuggestions = async () => {
  try {
    const result = await searchService.getSearchSuggestions(searchKeyword.value);
    suggestions.value = result.suggestions || [];
    recentSearches.value = result.recentSearches || [];
    popularKeywords.value = result.popularKeywords || [];
  } catch (error) {
    console.error('加载搜索建议失败:', error);
  }
};

// 加载热门关键词
const loadPopularKeywords = async () => {
  try {
    const keywords = await searchService.getPopularKeywords(10);
    popularKeywords.value = keywords;
  } catch (error) {
    console.error('加载热门关键词失败:', error);
  }
};

// 处理搜索
const handleSearch = (value) => {
  if (value && value.trim()) {
    performSearch(value);
  }
};

// 执行搜索
const performSearch = (keyword) => {
  showSuggestions.value = false;
  router.push({
    path: '/search',
    query: { q: keyword }
  });
};

// 选择建议
const selectSuggestion = (text) => {
  searchKeyword.value = text;
  performSearch(text);
};

// 键盘导航
const handleKeyDown = () => {
  const totalItems = recentSearches.value.length + suggestions.value.length;
  if (totalItems > 0) {
    selectedIndex.value = (selectedIndex.value + 1) % totalItems;
  }
};

const handleKeyUp = () => {
  const totalItems = recentSearches.value.length + suggestions.value.length;
  if (totalItems > 0) {
    selectedIndex.value = selectedIndex.value <= 0 ? totalItems - 1 : selectedIndex.value - 1;
  }
};

const handleEnter = () => {
  if (selectedIndex.value >= 0) {
    // 选择建议项
    const totalRecent = recentSearches.value.length;
    if (selectedIndex.value < totalRecent) {
      selectSuggestion(recentSearches.value[selectedIndex.value]);
    } else {
      const suggestionIndex = selectedIndex.value - totalRecent;
      selectSuggestion(suggestions.value[suggestionIndex].text);
    }
  } else if (searchKeyword.value.trim()) {
    // 直接搜索
    handleSearch(searchKeyword.value);
  }
};

// 高亮关键词
const highlightKeyword = (text) => {
  if (!searchKeyword.value) return text;
  const keyword = searchKeyword.value.trim();
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.replace(regex, '<strong style="color: #1890ff;">$1</strong>');
};

// 获取标签颜色
const getTagColor = (type) => {
  const colorMap = {
    STALL_NAME: 'blue',
    CAFETERIA_NAME: 'green',
    CUISINE_TYPE: 'orange'
  };
  return colorMap[type] || 'default';
};

// 获取类型标签
const getTypeLabel = (type) => {
  const labelMap = {
    STALL_NAME: '摊位',
    CAFETERIA_NAME: '食堂',
    CUISINE_TYPE: '菜系'
  };
  return labelMap[type] || '';
};

// 清除最近搜索
const clearRecentSearches = () => {
  recentSearches.value = [];
  // TODO: 调用API清除后端的搜索历史
};

// 点击外部关闭建议框
const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    showSuggestions.value = false;
    selectedIndex.value = -1;
  }
};

// 更新下拉框宽度
const updateDropdownWidth = () => {
  if (containerRef.value) {
    const inputWidth = containerRef.value.querySelector('.ant-input-search')?.offsetWidth;
    if (inputWidth) {
      dropdownWidth.value = `${inputWidth}px`;
    }
  }
};

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  loadPopularKeywords();
  updateDropdownWidth();
  window.addEventListener('resize', updateDropdownWidth);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', updateDropdownWidth);
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
});

// 监听显示状态变化
watch(showSuggestions, async (newVal) => {
  if (newVal) {
    await nextTick();
    updateDropdownWidth();
    // 加载建议
    if (searchKeyword.value.trim()) {
      await loadSuggestions();
    } else {
      await loadPopularKeywords();
    }
  }
});
</script>

<style scoped>
.search-bar-container {
  position: relative;
}

.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-section {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-section:last-child {
  border-bottom: none;
}

.suggestion-header {
  padding: 8px 16px;
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestion-item {
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.suggestion-item:hover,
.suggestion-item.active {
  background-color: #f5f5f5;
}

.suggestion-icon {
  color: #8c8c8c;
  font-size: 14px;
}

.suggestion-text {
  flex: 1;
  font-size: 14px;
  color: #262626;
}

.suggestion-tag {
  margin-left: auto;
}

.popular-keywords {
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
}

/* 动画 */
.slide-fade-enter-active {
  transition: all 0.2s ease;
}

.slide-fade-leave-active {
  transition: all 0.15s ease;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-5px);
  opacity: 0;
}

/* 滚动条样式 */
.suggestions-dropdown::-webkit-scrollbar {
  width: 6px;
}

.suggestions-dropdown::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.suggestions-dropdown::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.suggestions-dropdown::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
