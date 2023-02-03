import request from '../utils/request';

export const uploadApi = (formdata: any) => {
  return request({
    url: '/upload',
    method: 'post',
    data: { ...formdata }
  });
};
