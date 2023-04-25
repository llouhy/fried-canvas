import { setIdentify } from '../utils/setIdentify';

export const getError = (msg: string) => {
  const error = Object.create(null);
  error.msg = msg;
  setIdentify(error, 'error');
  return error;
};
