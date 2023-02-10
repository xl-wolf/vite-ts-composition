import request from '../utils/request';

export const uploadApi = (formData: any) => {
  return request({
    url: '/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'content-type': 'multipart/form-data'
    }
  });
};
