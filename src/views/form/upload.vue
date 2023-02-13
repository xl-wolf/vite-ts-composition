<template>
  <div class="container">
    <div class="content-title">支持拖拽</div>
    <el-upload class="upload-com" ref="uploadRef" v-model:file-list="fileList" :on-change="handleChange" drag
      :auto-upload="false" multiple>
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>

    <div class="divider" />
    <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
      <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
      <el-table-column prop="name" label="用户名"></el-table-column>
      <el-table-column label="账户余额">
        <template #default="scope">￥{{ scope.row.money }}</template>
      </el-table-column>
      <el-table-column prop="address" label="地址"></el-table-column>
      <el-table-column label="状态" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.state === '成功' ? 'success' : scope.row.state === '失败' ? 'danger' : ''">
            {{ scope.row.state }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="date" label="注册时间"></el-table-column>
      <el-table-column label="操作" width="220" align="center" v-if="0 && canOperate">
        <template #default="scope">
          <el-button text :icon="Edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button text :icon="Delete" class="red" @click="handleDelete(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="divider" />
    <el-button type="primary" @click="exportXlsx">导出Excel</el-button>
  </div>


</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElButton, ElIcon, ElMessage, ElTable, ElTableColumn, ElTag, ElUpload, UploadFile, UploadProps, UploadUserFile } from 'element-plus'
import { UploadFilled, Edit, Delete } from '@element-plus/icons-vue';
import { usePermissStore } from '../../store/permiss';
import * as XLSX from 'xlsx';


const fileList = ref<UploadFile[]>([])
const handleChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
  console.log(fileList.value, 'fileList.vlaue', uploadFiles)
  const name = uploadFile.name;
  if (fileList.value.some((tempfile: UploadFile) => tempfile.name === uploadFile.name)) {
    ElMessage.warning({ message: `${uploadFile.name}已上传过！` });
    return false
  }
  fileList.value.push(uploadFile)
  console.log(fileList.value, 'fileList.vlaue', uploadFiles)

  if (!name.includes('xlsx')) {
    ElMessage.warning({ message: '目前只支持上传xlsx后缀名的excel文件' });
    return false
  }
}

const list = [['序号', '姓名', '学号', '班级', '年龄', '性别']];
const exportXlsx = () => {
  tableData.value.map((item: any, i: number) => {
    const arr: any[] = [i + 1];
    arr.push(...[item.name, item.sno, item.class, item.age, item.sex]);
    list.push(arr);
  });
  let WorkSheet = XLSX.utils.aoa_to_sheet(list);
  let new_workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(new_workbook, WorkSheet, '第一页');
  XLSX.writeFile(new_workbook, `表格.xlsx`);
};

const permiss = usePermissStore()
const canOperate = computed(() => JSON.stringify(permiss.key) === JSON.stringify(permiss.defaultList.admin))

const handleEdit = (index: number, row: any) => {
  console.log(index, row)
};
const handleDelete = (index: number) => {
  console.log(index)
};

interface TableItem {
  id: number;
  name: string;
  money: number;
  state: string;
  date: string;
  address: string;
}
const tableData = ref<TableItem[]>([]);
const pageTotal = ref(0);
// 获取表格数据
const getData = () => {
  const res = {
    list: [{
      "id": 1,
      "name": "张三",
      "money": 123,
      "address": "广东省东莞市长安镇",
      "state": "成功",
      "date": "2019-11-1",

    },
    {
      "id": 2,
      "name": "李四",
      "money": 456,
      "address": "广东省广州市白云区",
      "state": "成功",
      "date": "2019-10-11",
    },
    {
      "id": 3,
      "name": "王五",
      "money": 789,
      "address": "湖南省长沙市",
      "state": "失败",
      "date": "2019-11-11",
    },
    {
      "id": 4,
      "name": "赵六",
      "money": 1011,
      "address": "福建省厦门市鼓浪屿",
      "state": "成功",
      "date": "2019-10-20",
    }],
    pageTotal: 4
  }
  tableData.value = res.list;
  pageTotal.value = res.pageTotal || 50;

};
getData();

</script>

<style scoped>
.content-title {
  font-weight: 400;
  line-height: 50px;
  margin: 10px 0;
  font-size: 22px;
  color: #1f2f3d;
}

.upload-com {
  width: 360px;
}

.divider {
  margin-top: 20px;
}

.red {
  color: #F56C6C;
}
</style>
