<template>
    <a-row gutter={16} class="picture-row">
    <a-col v-for="item in props.pictureList" :key="item.id" :span="6" class="picture-col">
      <a-card hoverable style="width: 200px">
        <template #cover>
          <img alt="example" :src="item.url" />
        </template>
        <a-card-meta>
          <template #description>{{ item.title }}</template>
        </a-card-meta>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { withDefaults, defineProps } from 'vue';

interface Props {
    pictureList: any[];
}

const props = withDefaults(defineProps<Props>(), {
    pictureList: () => [],
});

</script>

<style scoped>

.picture-row {
  margin-bottom: 16px; /* 行之间的间距 */
}

.picture-col {
  margin-bottom: 16px; /* 列之间的间距 */
}

.picture-card {
  width: 200px;
}

.shitou {
    width: 80px;
    height: 80px;
}
</style>
