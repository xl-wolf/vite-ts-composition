import { defineStore } from 'pinia';

interface ObjectList {
  [key: string]: string[];
}
export const adminList = ['系统首页', '文件上传', '导入Excel', '导出Excel', '自定义图标', '权限管理',]
// 没权限的页面需要设成空字符串方便设置权限
const userPermissConfig = ['文件上传']
export const userList = adminList.map(permiss => {
  if (userPermissConfig.indexOf(permiss) === -1) { return '' }
  return permiss
})

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
