<template>
  <div :style="{ 
    padding: '16px 0',
    borderBottom: '1px solid #f1f5f9'
  }">
    <!-- 用户信息和评分 -->
    <div :style="{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }">
      <div :style="{ display: 'flex', alignItems: 'center' }">
        <a-avatar 
          :src="review.user.avatar" 
          :size="32"
          :style="{ marginRight: '12px' }"
        />
        <div>
          <a-typography-text strong :style="{ color: '#1f2937', fontSize: '14px' }">
            {{ review.user.name }}
          </a-typography-text>
          <br />
          <a-typography-text type="secondary" :style="{ fontSize: '12px' }">
            {{ review.date }}
          </a-typography-text>
        </div>
      </div>
      
      <div :style="{ display: 'flex', alignItems: 'center' }">
        <a-rate :value="review.rating" disabled :style="{ fontSize: '12px', marginRight: '8px' }" />
        <a-typography-text strong :style="{ color: '#f7931e', fontSize: '14px' }">
          {{ review.rating }}
        </a-typography-text>
      </div>
    </div>

    <!-- 商户名称 -->
    <a-typography-text 
      strong 
      :style="{ 
        color: '#667eea', 
        fontSize: '13px',
        display: 'block',
        marginBottom: '8px'
      }"
    >
      @{{ review.merchant }}
    </a-typography-text>

    <!-- 评价内容 -->
    <a-typography-paragraph 
      :style="{ 
        margin: '0 0 12px 0',
        color: '#374151',
        fontSize: '13px',
        lineHeight: '1.5'
      }"
    >
      {{ review.content }}
    </a-typography-paragraph>

    <!-- 图片区域 -->
    <div v-if="review.images && review.images.length > 0" :style="{ marginBottom: '12px' }">
      <a-space :size="8">
        <div 
          v-for="(image, index) in review.images" 
          :key="index"
          :style="{ 
            width: '60px',
            height: '60px',
            borderRadius: '8px',
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            cursor: 'pointer'
          }"
        />
      </a-space>
    </div>

    <!-- 点赞和操作 -->
    <div :style="{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }">
      <div :style="{ display: 'flex', alignItems: 'center' }">
        <a-button 
          type="text" 
          size="small"
          :style="{ 
            color: '#64748b',
            padding: '4px 8px',
            height: 'auto'
          }"
        >
          <template #icon>
            <HeartOutlined :style="{ fontSize: '12px' }" />
          </template>
          {{ review.likes }}
        </a-button>
      </div>
      
      <a-space :size="12">
        <a-button type="link" size="small" :style="{ color: '#64748b', fontSize: '12px' }">回复</a-button>
        <a-button type="link" size="small" :style="{ color: '#64748b', fontSize: '12px' }">分享</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { HeartOutlined } from '@ant-design/icons-vue'

const props = defineProps({
  review: {
    type: Object,
    required: true
  }
})
</script>