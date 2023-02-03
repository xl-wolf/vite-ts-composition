<template>
  <div class="container">
    <div class="content-title">支持拖拽</div>
    <el-upload class="upload-com" drag :auto-upload="false" multiple :on-change="handle">
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { uploadApi } from '../../api/upload';

const handle = (rawFile: any) => {
  console.log(rawFile);
  uploadApi(rawFile)
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
</style>
