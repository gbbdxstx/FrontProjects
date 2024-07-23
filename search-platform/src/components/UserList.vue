<template>
    <a-row gutter={16} class="user-row">
    <a-col v-for="item in props.userList" :key="item.id" :span="6" class="user-col">
      <a-card hoverable style="width: 200px">
        <template #cover>
          <img alt="example" :src="item.userAvatar" />
        </template>
        <a-card-meta>
          <template #title>
            <div v-html="item.userName"></div> <!-- 使用 v-html 渲染高亮的用户名 -->
          </template>
          <template #description>
            <div v-html="item.userProfile"></div> <!-- 使用 v-html 渲染高亮的用户简介 -->
          </template>
        </a-card-meta>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { withDefaults, defineProps } from 'vue';

interface Props {
    userList: any[];
}

const props = withDefaults(defineProps<Props>(), {
    userList: () => [],
});

</script>

<style scoped>

.highlight {
  color: red; /* 设置高亮文本颜色为红色 */
}

.user-row {
  margin-bottom: 16px; /* 行之间的间距 */
}

.user-col {
  margin-bottom: 16px; /* 列之间的间距 */
}

.user-card {
  width: 240px;
}

.shitou {
    width: 80px;
    height: 80px;
}
</style>
