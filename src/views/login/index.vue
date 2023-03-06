<template>
  <div class="login-wrap" id="form-bg">
    <div class="ms-login">
      <div class="ms-title">后台管理系统</div>
      <el-form :model="loginInfo" label-width="0px" class="ms-content">
        <el-form-item prop="username">
          <el-input v-model="loginInfo.userName" placeholder="输入用户名">
            <template #prepend>
              <el-button :icon="User"></el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" placeholder="输入密码" v-model="loginInfo.password" @keyup.enter="submitForm">
            <template #prepend>
              <el-button :icon="Lock"></el-button>
            </template>
          </el-input>
        </el-form-item>
        <div class="login-btn">
          <el-button type="primary" @click="submitForm">登录</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useTagsStore } from '../../store/tags';
import { usePermissStore } from '../../store/permiss';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Lock, User } from '@element-plus/icons-vue';
import { LoginInfo, loginApi } from '../../api/user';
import asyncAMapLoader from '../../utils/asyncAMapLoader';


const loginInfo = reactive<LoginInfo>({
  userName: '',
  password: ''
});

const router = useRouter();
const permiss = usePermissStore();
// @ts-ignore
// 浏览器获取当前定位
const getCurrentPosition = (AMap: any) => {
  return new Promise((resolve: (params: any, signal: string) => void, reject: (params: any, signal: string) => void) => {
    const geolocation = new AMap.Geolocation({
      enableHighAccuracy: false, //是否使用高精度定位，默认:true
      timeout: 20000, //超过20秒后停止定位，默认：5s
    })
    geolocation.getCurrentPosition(function (status: any, result: any) {
      if (status === "complete") {
        console.log(result, "success")
        resolve(result, "success")
      } else {
        console.log(result, "fail")
        reject(result, "fail")
      }
    })
  })
}

const getIpAndAddressSohu = () => {
  asyncAMapLoader().then(
    (mapRes: any) => {
      console.log(mapRes)
      // this.initMap()
      getCurrentPosition(mapRes.AMap).then(() => {
        console.log("获取定位成功")
      }).catch(() => {
        console.log("获取定位失败")
      })
    },
    (err) => {
      console.log("AMap加载失败", err)
      ElMessage.error("AMap加载失败")
    }
  )
}
onMounted(getIpAndAddressSohu)

const submitForm = () => {
  if (!loginInfo.userName || !loginInfo.password) return ElMessage.error('用户名和密码不能为空');
  loginApi(loginInfo).then((res) => {
    const response = res.data
    if (response.success) {
      ElMessage.success('登录成功');
      localStorage.setItem('ms_username', loginInfo.userName);
      const keys = permiss.defaultList[loginInfo.userName === 'root' ? 'admin' : 'user'];
      permiss.handleSet(keys);
      localStorage.setItem('ms_keys', JSON.stringify(keys));
      // localStorage.setItem('lastLoginInfo', JSON.stringify({time:Date.now(),location:}));
      if (response.data.name === 'hq') {
        router.push('/upload');
      } else {
        router.push('/');
      }
    } else {
      ElMessage.error(response.msg);
    }

  }).catch(err => {
    ElMessage.error('登录失败');
    console.log(err)
  })
};

const tags = useTagsStore();
tags.clearTags();

const clearRef = ref()
const setCanvasBg = () => {
  // @ts-ignore
  import("./plugins/svg01.js").then(({ drawCanvas, clearFunc }) => {
    clearRef.value = clearFunc
    drawCanvas("form-bg")
  })
}
onMounted(setCanvasBg)

onUnmounted(() => clearRef.value())

</script>

<style scoped>
.login-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.ms-title {
  width: 100%;
  line-height: 50px;
  text-align: center;
  font-size: 20px;
  color: #fff;
  border-bottom: 1px solid #ddd;
}

.ms-login {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: 50%;
  width: 350px;
  margin: -190px 0 0 -175px;
  border-radius: 5px;
  background: rgba(99, 99, 99, 0.9);
  overflow: hidden;
}

.ms-login:hover {
  box-shadow: 2px 2px 24px rgba(99, 99, 99, 0.24);
}

.ms-content {
  padding: 30px 30px;
}

.login-btn {
  text-align: center;
}

.login-btn button {
  width: 100%;
  height: 36px;
  margin-bottom: 10px;
}
</style>
