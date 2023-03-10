import { defineStore } from 'pinia';
import { pagePermission } from '../permissionConfig';

interface ObjectList {
  [key: string]: string[];
}
const adminList = pagePermission.map(pagecfg => pagecfg.permiss)
// 没权限的页面需要设成空字符串方便设置权限
const userPermissConfig = ['系统首页', '文件上传']
const userList = adminList.map(permiss => {
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
