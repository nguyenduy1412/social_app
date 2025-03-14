import axios from "axios";
import Toast from "react-native-toast-message";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Lấy API_URL từ process.env 
const API_URL = process.env.API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Thêm token vào request headers
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Lỗi khi lấy token từ AsyncStorage:", error);
  }
  return config;
});

// Xử lý lỗi response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || "Có lỗi xảy ra!";

    if (status === 401) {
      Toast.show({ text1: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!", type: "error" });
      await AsyncStorage.removeItem("accessToken");
      // Điều hướng về màn hình đăng nhập (sử dụng React Navigation)
      // navigationRef.current?.navigate("Login");
    } else if (status === 403) {
      Toast.show({ text1: "Bạn không có quyền truy cập!", type: "error" });
      // navigationRef.current?.navigate("Login");
    } else {
      Toast.show({ text1: errorMessage, type: "error" });
    }

    return Promise.reject(error);
  }
);

export default api;
