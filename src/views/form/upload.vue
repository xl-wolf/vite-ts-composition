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
      <el-button type="primary" @click="uploadAction('售后仓库退款单')">上传售后仓库退款单</el-button>
      <el-button type="primary" @click="uploadAction('售后渠道退款单')">上传售后渠道退款单</el-button>
      <el-button type="primary" @click="uploadAction('源数据')">上传源数据</el-button>
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

// 上传前校验
const beforeUpload = (file: File) => {
  console.log(file)
  const name = file.name;
  if (!name.includes('xlsx')) {
    ElMessage.warning({ message: '目前只支持上传xlsx后缀名的excel文件' });
    return false
  }
};

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
</style>
