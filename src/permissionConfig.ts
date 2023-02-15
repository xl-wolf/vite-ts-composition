import { RouteRecordRaw } from "vue-router"

interface permission {
    icon?: string
    index: string
    title: string
    permiss: string
    subs?: permission[]
}


export const pagePermission: Array<permission & RouteRecordRaw> = [
    {
        // 侧边栏配置项
        icon: 'Odometer',
        index: '/dashboard',
        title: '系统首页',
        permiss: '系统首页',
        // 路由的配置项
        path: '/dashboard',
        meta: {
            title: '系统首页',
            permiss: '系统首页',
        },
        name: 'dashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ './views/dashboard.vue')
    },
    {
        // 侧边栏配置项
        icon: 'Files',
        index: '/upload',
        title: '文件上传',
        permiss: '文件上传',
        // 路由的配置项
        path: '/upload',
        meta: {
            title: '文件上传',
            permiss: '文件上传',
        },
        name: 'upload',
        component: () => import(/* webpackChunkName: "dashboard" */ './views/upload.vue')
    },
    {
        // 侧边栏配置项
        icon: 'Upload',
        index: '/import',
        title: '导入Excel',
        permiss: '导入Excel',
        // 路由的配置项
        path: '/import',
        meta: {
            title: '导入Excel',
            permiss: '导入Excel',
        },
        name: 'import',
        component: () => import(/* webpackChunkName: "dashboard" */ './views/import.vue')
    },
    {
        // 侧边栏配置项
        icon: 'Download',
        index: '/export',
        title: '导出Excel',
        permiss: '导出Excel',
        // 路由的配置项
        path: '/export',
        meta: {
            title: '导出Excel',
            permiss: '导出Excel',
        },
        name: 'export',
        component: () => import(/* webpackChunkName: "dashboard" */ './views/export.vue')
    },
    {
        // 侧边栏配置项
        icon: 'Warning',
        index: '/permission',
        title: '权限管理',
        permiss: '权限管理',
        // 路由的配置项
        path: '/permission',
        meta: {
            title: '权限管理',
            permiss: '权限管理',
        },
        name: 'permission',
        component: () => import(/* webpackChunkName: "permission" */ './views/permission.vue'),
    },
];