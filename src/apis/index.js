import axios from 'axios';

const api = axios.create({
  baseURL: 'https://service.mntech.website/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const customerAuth = {
  register: payload => api.post('/customer/auth/register-customer', payload),
  registerVendor: payload => api.post('/customer/auth/register-vendor', payload),
  verifyOtp: payload => api.post('/customer/auth/verify-otp-customer', payload),
  verifyOtpVendor: payload => api.post('/customer/auth/verify-otp-vendor', payload),
  updateUser: (payload, token) =>
    api.put('/customer/auth/update-user', payload, {
      headers: {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      },
    }),
  updateUserLocation: (userId, payload, token) =>
    api.put(`/customer/user/${userId}`, payload, {
      headers: {
        Authorization: token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '',
      },
    }),
  verifyUpdateOtp: (payload, token) =>
    api.post('/customer/auth/verify-update-otp', payload, {
      headers: {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      },
    }),
  updateVendorProfile: (payload, token) =>
    api.put('/vendor/vendorUser/update-profile', payload, {
      headers: {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      },
    }),
  saveBusinessAddress: (payload, token) =>
    api.post('/vendor/businessAddress', payload, {
      headers: {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      },
    }),
  getVendorCategories: token =>
    api.get('/vendor/categories', {
      headers: {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      },
    }),
  getCategories: token =>
    api.get('/customer/categories', {
      headers: {
        Authorization: token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '',
      },
    }),
  getCategoryById: (categoryId, token) =>
    api.get(`/vendor/categories/${categoryId}`, {
      headers: {
        Authorization: token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '',
      },
    }),
  getVendorServicesByCategory: (categoryId, longitude, latitude, token) =>
    api.get(`/customer/vendorUser/category/${categoryId}`, {
      params: {
        latitude: latitude,
        longitude: longitude,
      },
      headers: {
        Authorization: token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '',
      },
    }),
  getVendorUserDetails: (vendorUserId, token) =>
    api.get(`/customer/vendorUser/${vendorUserId}`, {
      headers: {
        Authorization: token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '',
      },
    }),
  getServicesByCategory: (categoryId, token) =>
    api.get(`/vendor/services/category/${categoryId}`, {
      headers: {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      },
    }),
  saveVendorServices: (payload, token) =>
    api.post('/vendor/vendorService', payload, {
      headers: {
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      },
    }),
  resendOtpVendor: payload =>
    api.post('/customer/auth/resend-otp-vendor', payload),
  loginVendor: (payload, token) =>
    api.post(
      '/customer/auth/login',
      payload,
      token
        ? {
          headers: {
            Authorization: token.startsWith('Bearer ')
              ? token
              : `Bearer ${token}`,
          },
        }
        : {},
    ),
};

export const s3Api = {
  getProfilePicUploadUrl: async (payload, token) => {
    let cleanToken = token;
    if (typeof cleanToken === 'object' && cleanToken !== null) {
      cleanToken =
        cleanToken.token || cleanToken.accessToken || cleanToken.jwt;
    }
    const authHeader = cleanToken
      ? cleanToken.startsWith('Bearer ')
        ? cleanToken
        : `Bearer ${cleanToken}`
      : '';
    console.log(
      'Sending Authorization Header to S3 profilepic API:',
      authHeader ? `${authHeader.substring(0, 25)}...` : 'EMPTY_TOKEN!',
    );

    const headers = {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    };

    try {
      console.log('Attempting S3 upload request on service.mntech.website...');
      return await api.post('/s3/profilepic', payload, { headers });
    } catch (err) {
      console.log(
        'service.mntech.website S3 request error status:',
        err?.response?.status,
        'msg:',
        err?.response?.data || err.message,
      );
      console.log('Trying mntrendigo.mntech.website S3 endpoint fallback...');
      return await axios.post(
        'https://mntrendigo.mntech.website/api/v1/s3/profilepic',
        payload,
        { headers },
      );
    }
  },
};

export default api;

