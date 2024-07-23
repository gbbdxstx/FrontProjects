<template>
    <a-list item-layout="horizontal" :data-source="props.postList">
        <template #renderItem="{ item }">
            <a-list-item>
                <a-list-item-meta>
                    <template #title>
                        <div v-html="item.title"></div> <!-- 使用 v-html 渲染高亮的标题 -->
                    </template>
                    <template #description>
                        <div v-html="item.content"></div> <!-- 使用 v-html 渲染高亮的内容 -->
                    </template>
                    <template #avatar>
                        <a-avatar :src="shitou" />
                    </template>
                </a-list-item-meta>
            </a-list-item>
        </template>
    </a-list>
</template>

<script setup lang="ts">
import shitou from '../assets/shitou.png';
import { withDefaults, defineProps } from 'vue';

interface Props {
    postList: any[];
}

const props = withDefaults(defineProps<Props>(), {
    postList: () => [],
});

</script>

<style scoped>
.logo {
    width: 100px;
    height: 100px;
}
</style>
