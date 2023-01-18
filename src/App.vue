<template>
  <div>
    <el-upload ref="uploadFile" drag :http-request="httpRequest" multiple :auto-upload="false"
      v-model:file-list="fileList" :on-preview="handlePreview" :on-remove="handleRemove" :before-remove="beforeRemove"
      :on-success="handleSuccess" :on-exceed="handleExceed">
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        Drop file here or <em>click to upload</em>
      </div>
    </el-upload>
    <el-button @click="uploadAction">点击上传</el-button>
  </div>
</template>

<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue'
import { ElUpload, ElIcon, ElButton, ElMessage, ElMessageBox, UploadProps, UploadUserFile, UploadRequestHandler } from 'element-plus';
import { ref } from 'vue';
import { request } from './request';
const uploadFile = ref();
const fileList = ref<UploadUserFile[]>([])

const handleSuccess: UploadProps['onSuccess'] = (file, uploadFiles) => {
  console.log('onSuccess', file, uploadFiles)
  fileList.value.push(file)
}
const handleRemove: UploadProps['onRemove'] = (file, uploadFiles) => {
  console.log(file, uploadFiles)
}

const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  console.log(uploadFile)
}

const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
  ElMessage.warning(
    `The limit is 3, you selected ${files.length} files this time, add up to ${files.length + uploadFiles.length
    } totally`
  )
}

const beforeRemove: UploadProps['beforeRemove'] = (uploadFile, uploadFiles) => {
  return ElMessageBox.confirm(
    `Cancel the transfert of ${uploadFile.name} ?`
  ).then(
    () => true,
    () => false
  )
}

const httpRequest = (option: any) => {
  const data = new FormData();
  data.append('file', option.file);
  console.log(data, option.files, 'option')
  request({
    url: 'excel/upload',
    method: 'post',
    data
  }).then((res: any) => {
    console.log(res)
    if (res && res.status === 200) {
      console.log('图片上传成功！');
    } else {

      console.log('图片上传失败！');

    }
  })
}

const uploadAction = () => {
  uploadFile.value.submit()
}
</script>