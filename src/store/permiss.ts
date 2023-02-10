import { defineStore } from 'pinia';

interface ObjectList {
  [key: string]: string[];
}
export const adminList = ['系统首页', '表单', '基本表单', '文件上传', '表格', '基础表格', '导入Excel', '导出Excel', '自定义图标', '权限管理',]
export const userList = ['表单', '文件上传']

export const usePermissStore = defineStore('permiss', {
  state: () => {
    const keys = localStorage.getItem('ms_keys');
    return {
      key: keys ? JSON.parse(keys) : <string[]>[],
      defaultList: <ObjectList>{
        admin: adminList,
        user: userList
      }
    };
  },
  actions: {
    handleSet(val: string[]) {
      this.key = val;
    }
  }
});
