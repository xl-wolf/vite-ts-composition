import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { usePermissStore } from '../store/permiss';
import Home from '../views/home.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        meta: {
          title: '系统首页',
          permiss: '系统首页',
        },
        component: () => import(/* webpackChunkName: "dashboard" */ '../views/dashboard.vue'),
      },
      // 表格目录
      {
        path: '/table',
        name: 'basetable',
        meta: {
          title: '表格',
          permiss: '表格',
        },
        component: () => import(/* webpackChunkName: "table" */ '../views/table/table.vue'),
      },
      {
        path: '/export',
        name: 'export',
        meta: {
          title: '导出Excel',
          permiss: '导出Excel',
        },
        component: () => import(/* webpackChunkName: "export" */ '../views/table/export.vue'),
      },
      {
        path: '/import',
        name: 'import',
        meta: {
          title: '导入Excel',
          permiss: '导入Excel',
        },
        component: () => import(/* webpackChunkName: "import" */ '../views/table/import.vue'),
      },

      // 表单
      {
        path: '/form',
        name: 'baseform',
        meta: {
          title: '表单',
          permiss: '表单',
        },
        component: () => import(/* webpackChunkName: "form" */ '../views/form/form.vue'),
      },
      {
        path: '/upload',
        name: 'upload',
        meta: {
          title: '文件上传',
          permiss: '文件上传',
        },
        component: () => import(/* webpackChunkName: "upload" */ '../views/form/upload.vue'),
      },
      // 自定义图标
      {
        path: '/icon',
        name: 'icon',
        meta: {
          title: '自定义图标',
          permiss: '自定义图标',
        },
        component: () => import(/* webpackChunkName: "icon" */ '../views/icon.vue'),
      },
      // 权限管理
      {
        path: '/permission',
        name: 'permission',
        meta: {
          title: '权限管理',
          permiss: '权限管理',
        },
        component: () => import(/* webpackChunkName: "permission" */ '../views/permission.vue'),
      },

    ],
  },
  {
    path: '/login',
    name: 'Login',
    meta: {
      title: '登录',
    },
    component: () => import(/* webpackChunkName: "login" */ '../views/login/index.vue'),
  },
  {
    path: '/403',
    name: '403',
    meta: {
      title: '没有权限',
    },
    component: () => import(/* webpackChunkName: "403" */ '../views/403.vue'),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | 后台管理系统`;
  const role = localStorage.getItem('ms_username');
  const permiss = usePermissStore();
  if (!role && to.path !== '/login') {
    next('/login');
  } else if (to.meta.permiss && !permiss.key.includes(to.meta.permiss)) {
    // 如果没有权限，则进入403
    next('/403');
  } else {
    next();
  }
});

export default router;
