<template>
  <div class="container">
    <div class="content-title">支持拖拽</div>
    <el-upload class="upload-com" ref="uploadRef" :before-upload="beforeUpload" :http-request="handleUpload" drag
      :auto-upload="false" multiple>
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <div class="button-group">
      <el-button type="primary" @click="uploadAction('收款单')">上传收款单</el-button>
      <el-button type="primary" @click="uploadAction('付款单')">上传付款单</el-button>
      <el-button type="primary" @click="uploadAction('售后单')">上传售后单</el-button>
      <el-button type="primary" @click="uploadAction('源数据')">上传源数据</el-button>
    </div>

    <div class="success-list">
        已上传成功文件记录：
        <div v-for="(file,index) in uploadedFileList">
            {{`${index+1}、${file.name}`}}
            <el-button type="danger" size="small" @click="delAction(file)">删除</el-button>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { uploadApi } from '../../api/upload';
import { ref } from 'vue'
import { ElMessage, UploadInstance } from 'element-plus'

const handleUpload = (params: any) => {
  const formData = new FormData()
  formData.append('file', params.file)
  formData.append('fileType', fileType.value)
  uploadApi(formData).then(res => {
    if (res) {
      ElMessage.success({ message: '上传成功' });
      uploadRef.value!.clearFiles()
    }
  })
};

const uploadRef = ref<UploadInstance>()
const fileType = ref('')
const uploadAction = (type: string) => {
  fileType.value = type
  uploadRef.value!.submit()
}

const uploadedFileList = ref([])
// 上传前校验
const beforeUpload = (file: File) => {
  console.log(file)
  const name = file.name;
  if(uploadedFileList.value.some((tempfile:File)=>tempfile.name === file.name)){
     ElMessage.warning({ message: `${file.name}已上传成功过！` });
     return false
  }
  uploadedFileList.value.push(file)
  console.log(uploadedFileList.value,'uploadedFileList.vlaue')

  if (!name.includes('xlsx')) {
    ElMessage.warning({ message: '目前只支持上传xlsx后缀名的excel文件' });
    return false
  }
};

// 删除方法
const delAction = (file: File)=>{
    console.log(file)
}

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

.button-group{
  margin-top: 50px;
}

.success-list{
    margin-top: 20px;
}

</style>
