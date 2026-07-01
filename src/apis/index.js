import axios from 'axios';

const api = axios.create({
  baseURL: 'https://service.mntech.website/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const customerAuth = {
  register: payload => api.post('/customer/auth/register-customer', payload),
  verifyOtp: payload => api.post('/customer/auth/verify-otp-customer', payload),
  updateUser: (payload, token) =>
    api.put('/customer/auth/update-user', payload, {
      headers: {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      },
    }),
  verifyUpdateOtp: (payload, token) =>
    api.post('/customer/auth/verify-update-otp', payload, {
      headers: {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      },
    }),
};

export default api;
