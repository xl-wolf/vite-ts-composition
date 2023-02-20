<template>
  <el-dialog v-model="dialogVisible" title="用户详情" width="800px" draggable :close-on-click-modal="false">
    <div class="user-detail-scroll-area">
      <div>{{ userInfo.name }}</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
      <div>It's a draggable Dialog</div>
    </div>
</el-dialog>
</template>

<script setup lang="ts" name="import">
import { ref } from 'vue'
import { eventhub } from '../../utils/useEventbus';
import { TableItem } from './interface';

const dialogVisible = ref(false)
const userInfo = ref()
eventhub.on('showDetail', (row: TableItem) => {
  console.log(row)
  userInfo.value = row
  dialogVisible.value = true
})

</script>

<style scoped>
.user-detail-scroll-area {
  max-height: 50vh;
  overflow: auto;
}
</style>
