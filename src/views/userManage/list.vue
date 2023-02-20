<template>
  <div class="container">
    <!-- <div class="handle-box">
              <el-upload action="#" :limit="1" accept=".xlsx, .xls" :show-file-list="false" :before-upload="beforeUpload"
                :http-request="handleMany">
                <el-button class="mr10" type="success">批量导入</el-button>
              </el-upload>
              <el-link href="/template.xlsx" target="_blank">下载模板</el-link>
            </div> -->
    <el-table :data="tableData" border class="table" header-cell-class-name="table-header">
      <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
      <el-table-column prop="name" label="姓名"></el-table-column>
      <el-table-column prop="sno" label="学号"></el-table-column>
      <el-table-column prop="class" label="班级"></el-table-column>
      <el-table-column prop="age" label="年龄"></el-table-column>
      <el-table-column prop="sex" label="性别"></el-table-column>
      <el-table-column fixed="right" label="操作" width="120">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="showDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <detail></detail>
</div>
</template>

<script setup lang="ts" name="import">
import { eventhub } from '../../utils/useEventbus'
import { ref } from 'vue';
import detail from './detail.vue';
import { TableItem } from './interface';

const tableData = ref<TableItem[]>([]);
// 获取表格数据
const getData = () => {
  tableData.value = [
    {
      id: 1,
      name: '小明',
      sno: 'S001',
      class: '一班',
      age: '10',
      sex: '男',
    },
    {
      id: 2,
      name: '小红',
      sno: 'S002',
      class: '一班',
      age: '9',
      sex: '女',
    },
  ];
};
getData();

const showDetail = (row: TableItem) => eventhub.emit('showDetail', row)

</script>

<style scoped>
.handle-box {
  display: flex;
  margin-bottom: 20px;
}

.table {
  width: 100%;
  font-size: 14px;
}

.mr10 {
  margin-right: 10px;
}
</style>
