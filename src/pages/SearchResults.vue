<template>
  <a-layout style="min-height: 100vh; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
    <Header />

    <a-layout-content style="padding: 96px 24px 32px;">
      <div style="max-width: 1400px; margin: 0 auto;">
        <!-- 搜索统计信息 -->
        <div style="margin-bottom: 24px;">
          <a-card :style="cardStyle">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <a-typography-title :level="4" style="margin: 0;">
                  搜索结果: "{{ keyword }}"
                </a-typography-title>
                <a-typography-text type="secondary">
                  找到 {{ totalCount }} 个结果
                  <span v-if="searchTime"> (耗时 {{ searchTime }}ms)</span>
                </a-typography-text>
              </div>
              <a-space>
                <a-select
                  v-model:value="searchType"
                  style="width: 120px"
                  @change="handleSearch"
                >
                  <a-select-option value="ALL">全部</a-select-option>
                  <a-select-option value="STALL">摊位</a-select-option>
                  <a-select-option value="CAFETERIA">食堂</a-select-option>
                </a-select>
                <a-select
                  v-model:value="sortBy"
                  style="width: 150px"
                  @change="handleSearch"
                >
                  <a-select-option value="RELEVANCE">相关度</a-select-option>
                  <a-select-option value="RATING">评分</a-select-option>
                  <a-select-option value="REVIEW_COUNT">评价数</a-select-option>
                  <a-select-option value="NAME">名称</a-select-option>
                </a-select>
              </a-space>
            </div>
          </a-card>
        </div>

        <a-row :gutter="[24, 24]">
          <!-- 筛选面板 -->
          <a-col :xs="24" :lg="6">
            <a-space direction="vertical" :style="{ width: '100%', position: 'sticky', top: '96px' }">
              <!-- 菜系类型筛选 -->
              <a-card :style="cardStyle" title="菜系类型">
                <a-checkbox-group v-model:value="selectedCuisines" @change="handleSearch">
                  <a-space direction="vertical">
                    <a-checkbox
                      v-for="cuisine in cuisineTypes"
                      :key="cuisine"
                      :value="cuisine"
                    >
                      {{ cuisine }}
                    </a-checkbox>
                  </a-space>
                </a-checkbox-group>
              </a-card>

              <!-- 评分筛选 -->
              <a-card :style="cardStyle" title="评分">
                <div style="padding: 0 8px;">
                  <a-slider
                    range
                    :min="0"
                    :max="5"
                    :step="0.5"
                    v-model:value="ratingRange"
                    @change="handleSearch"
                  />
                  <div style="display: flex; justify-content: space-between; margin-top: 8px;">
                    <span>{{ ratingRange[0] }}星</span>
                    <span>{{ ratingRange[1] }}星</span>
                  </div>
                </div>
              </a-card>

              <!-- Halal筛选 -->
              <a-card :style="cardStyle" title="其他选项">
                <a-checkbox v-model:checked="halalOnly" @change="handleSearch">
                  仅显示Halal
                </a-checkbox>
              </a-card>

              <!-- 食堂筛选 (仅当搜索类型为摊位时显示) -->
              <a-card
                v-if="searchType === 'STALL' || searchType === 'ALL'"
                :style="cardStyle"
                title="所在食堂"
              >
                <a-select
                  v-model:value="selectedCafeteriaId"
                  style="width: 100%"
                  placeholder="选择食堂"
                  allow-clear
                  @change="handleSearch"
                >
                  <a-select-option
                    v-for="[id, name] in cafeteriaOptions"
                    :key="id"
                    :value="id"
                  >
                    {{ name }}
                  </a-select-option>
                </a-select>
              </a-card>

              <!-- 清空筛选 -->
              <a-button block type="dashed" @click="clearFilters">
                清空筛选
              </a-button>
            </a-space>
          </a-col>

          <!-- 搜索结果列表 -->
          <a-col :xs="24" :lg="18">
            <a-spin :spinning="loading">
              <div v-if="results.length === 0 && !loading">
                <a-empty description="没有找到匹配的结果">
                  <a-button type="primary" @click="clearFilters">
                    清空筛选条件
                  </a-button>
                </a-empty>
              </div>

              <a-space direction="vertical" :style="{ width: '100%' }" :size="16">
                <div
                  v-for="item in results"
                  :key="`${item.id}-${item.name}`"
                >
                  <!-- 摊位卡片 -->
                  <StallCard
                    v-if="isStall(item)"
                    :stall="item"
                    @click="goToStallDetail(item.id)"
                  />

                  <!-- 食堂卡片 -->
                  <CafeteriaCard
                    v-else
                    :cafeteria="item"
                    @click="goToCafeteriaDetail(item.id)"
                  />
                </div>
              </a-space>

              <!-- 分页 -->
              <div v-if="results.length > 0" style="margin-top: 32px; text-align: center;">
                <a-pagination
                  v-model:current="currentPage"
                  v-model:page-size="pageSize"
                  :total="totalCount"
                  :show-total="(total) => `共 ${total} 条结果`"
                  :show-size-changer="true"
                  :page-size-options="['10', '20', '50', '100']"
                  @change="handlePageChange"
                />
              </div>
            </a-spin>
          </a-col>
        </a-row>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import Header from '@/components/Header.vue';
import StallCard from '@/components/StallCard.vue';
import CafeteriaCard from '@/components/CafeteriaCard.vue';
import { searchService } from '@/services/searchService';

const route = useRoute();
const router = useRouter();

// 样式
const cardStyle = {
  borderRadius: '12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  border: '1px solid rgba(0,0,0,0.03)'
};

// 搜索参数
const keyword = ref('');
const searchType = ref('ALL');
const selectedCuisines = ref([]);
const ratingRange = ref([0, 5]);
const halalOnly = ref(false);
const selectedCafeteriaId = ref(null);
const sortBy = ref('RELEVANCE');
const sortDirection = ref('DESC');
const currentPage = ref(1);
const pageSize = ref(20);

// 搜索结果
const results = ref([]);
const totalCount = ref(0);
const searchTime = ref(null);
const loading = ref(false);

// 筛选选项
const cuisineTypes = ref([]);
const cafeteriaOptions = ref([]);

// 判断结果类型
const isStall = (item) => {
  return 'cuisineType' in item || 'cafeteria' in item;
};

// 执行搜索
const performSearch = async () => {
  loading.value = true;
  try {
    const searchRequest = {
      keyword: keyword.value,
      searchType: searchType.value,
      cuisineTypes: selectedCuisines.value.length > 0 ? selectedCuisines.value : null,
      minRating: ratingRange.value[0],
      maxRating: ratingRange.value[1],
      halalOnly: halalOnly.value || null,
      cafeteriaId: selectedCafeteriaId.value,
      sortBy: sortBy.value,
      sortDirection: sortDirection.value,
      page: currentPage.value - 1, // 后端从0开始
      size: pageSize.value
    };

    // 验证参数
    const errors = searchService.validateSearchParams(searchRequest);
    if (errors.length > 0) {
      message.error(errors[0]);
      return;
    }

    const result = await searchService.search(searchRequest);

    results.value = result.results || [];
    totalCount.value = result.totalCount || 0;
    searchTime.value = result.searchTime;

    // 更新URL参数
    updateUrlParams();
  } catch (error) {
    console.error('搜索失败:', error);
    message.error('搜索失败,请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 加载筛选选项
const loadFilterOptions = async () => {
  try {
    const options = await searchService.getFilterOptions();
    cuisineTypes.value = options.cuisineTypes || [];

    // 将食堂数据转换为 [id, name] 格式
    if (options.cafeterias && Array.isArray(options.cafeterias)) {
      cafeteriaOptions.value = options.cafeterias;
    }
  } catch (error) {
    console.error('加载筛选选项失败:', error);
  }
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
  performSearch();
};

// 处理分页变化
const handlePageChange = () => {
  performSearch();
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 清空筛选
const clearFilters = () => {
  selectedCuisines.value = [];
  ratingRange.value = [0, 5];
  halalOnly.value = false;
  selectedCafeteriaId.value = null;
  sortBy.value = 'RELEVANCE';
  currentPage.value = 1;
  handleSearch();
};

// 更新URL参数
const updateUrlParams = () => {
  const query = {
    q: keyword.value,
    type: searchType.value,
    page: currentPage.value,
    size: pageSize.value
  };

  if (selectedCuisines.value.length > 0) {
    query.cuisines = selectedCuisines.value.join(',');
  }

  if (ratingRange.value[0] > 0 || ratingRange.value[1] < 5) {
    query.minRating = ratingRange.value[0];
    query.maxRating = ratingRange.value[1];
  }

  if (halalOnly.value) {
    query.halal = '1';
  }

  if (selectedCafeteriaId.value) {
    query.cafeteriaId = selectedCafeteriaId.value;
  }

  if (sortBy.value !== 'RELEVANCE') {
    query.sort = sortBy.value;
  }

  router.replace({ query });
};

// 从URL加载参数
const loadFromUrl = () => {
  const query = route.query;

  keyword.value = query.q || '';
  searchType.value = query.type || 'ALL';
  currentPage.value = parseInt(query.page) || 1;
  pageSize.value = parseInt(query.size) || 20;

  if (query.cuisines) {
    selectedCuisines.value = query.cuisines.split(',');
  }

  if (query.minRating || query.maxRating) {
    ratingRange.value = [
      parseFloat(query.minRating) || 0,
      parseFloat(query.maxRating) || 5
    ];
  }

  if (query.halal === '1') {
    halalOnly.value = true;
  }

  if (query.cafeteriaId) {
    selectedCafeteriaId.value = parseInt(query.cafeteriaId);
  }

  if (query.sort) {
    sortBy.value = query.sort;
  }
};

// 导航到详情页
const goToStallDetail = (id) => {
  router.push(`/stalls/${id}`);
};

const goToCafeteriaDetail = (id) => {
  router.push(`/cafeterias/${id}`);
};

// 监听路由变化
watch(() => route.query, () => {
  if (route.path === '/search') {
    loadFromUrl();
    performSearch();
  }
});

// 初始化
onMounted(async () => {
  loadFromUrl();
  await loadFilterOptions();
  if (keyword.value) {
    performSearch();
  }
});
</script>

<style scoped>
:deep(.ant-card-head-title) {
  font-weight: 600;
  font-size: 14px;
}

:deep(.ant-checkbox-group) {
  width: 100%;
}
</style>
