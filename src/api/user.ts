import request from '../utils/request';

export interface LoginInfo {
  userName: string;
  password: string;
}
export const loginApi = (loginInfo: LoginInfo) => {
  return request({
    url: '/user/login',
    method: 'post',
    data: { ...loginInfo }
  });
};
