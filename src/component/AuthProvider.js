import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import axios from 'axios';
import { ENV } from '../../contants/theme';
import Toast from 'react-native-toast-message';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Tạo context cho xác thực
const AuthContext = createContext();

// Hàm lấy device ID duy nhất
const getDeviceId = async () => {
  try {
    let deviceId = await AsyncStorage.getItem('DEVICE_ID');
    if (!deviceId) {
      const deviceInfo = Device.modelName + Device.deviceYearClass + Date.now();
      deviceId = deviceInfo.replace(/\s+/g, '') + Math.random().toString(36).substring(2, 15);
      await AsyncStorage.setItem('DEVICE_ID', deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Lỗi khi lấy ID thiết bị:', error);
    return Date.now().toString() + Math.random().toString(36).substring(2, 15);
  }
};

// Tạo AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const stompClientRef = useRef(null);
  // Hàm lưu token
  const saveToken = async (accessToken) => {
    try {
      const deviceId = await getDeviceId();
      const tokenKey = `ACCESS_TOKEN_${deviceId}`;
      await AsyncStorage.setItem(tokenKey, accessToken);
      setToken(accessToken);
      return true;
    } catch (error) {
      console.error('Lỗi khi lưu token:', error);
      return false;
    }
  };

  // Hàm lấy token
  const getToken = async () => {
    try {
      const deviceId = await getDeviceId();
      const tokenKey = `ACCESS_TOKEN_${deviceId}`;
      const accessToken = await AsyncStorage.getItem(tokenKey);
      return accessToken;
    } catch (error) {
      console.error('Lỗi khi lấy token:', error);
      return null;
    }
  };

  // Hàm xóa token (dùng khi logout)
  const removeToken = async () => {
    try {
      const deviceId = await getDeviceId();
      const tokenKey = `ACCESS_TOKEN_${deviceId}`;
      await AsyncStorage.removeItem(tokenKey);
      setToken(null);
      setUser(null);
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa token:', error);
      return false;
    }
  };

  // Hàm đăng xuất
  const logout = async () => {
    await removeToken();
    return true;
  };

  // Hàm lấy thông tin người dùng
  const getUserInfo = async () => {
    try {
      const accessToken = await getToken();
      if (!accessToken) {
        setUser(null);
        return null;
      }

      const response = await axios.get(`${ENV.API_URL}/user/get-current-user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (response.status === 200) {
        setUser(response.data);
        return response.data;
      } else {
        return null;
      }
    } catch (err) {
      console.log("Lỗi khi lấy thông tin người dùng:", err);
      return null;
    }
  };

  // Tạo instance axios với token tự động
  const api = axios.create({
    baseURL: ENV.API_URL,
  });
  
  // Thêm interceptor để tự động thêm token vào header
  api.interceptors.request.use(
    async (config) => {
      const accessToken = await getToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra!";
  
      if (status === 401) {
        Toast.show({ text1: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!", type: "error" });
      } else if (status === 403) {
        Toast.show({ text1: "Bạn không có quyền truy cập!", type: "error" });
      } else {
        Toast.show({ text1: errorMessage, type: "error" });
      }
  
      return Promise.reject(error);
    }
  );
  // Kiểm tra xác thực khi khởi động ứng dụng
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const accessToken = await getToken();
      if (accessToken) {
        setToken(accessToken);
        await getUserInfo();
      }
      setLoading(false);
    };

    checkAuth();
  }, []);
  const connectWebSocket = () => {
    if (!user || stompClientRef.current) return; // Chỉ kết nối nếu có user và chưa kết nối trước đó

    stompClientRef.current = new Client({
      webSocketFactory: () => new SockJS(ENV.URL_SOCKET),
      debug: (str) => console.log(str),
      reconnectDelay: 5000, // Tự động kết nối lại sau 5 giây nếu mất kết nối
      onConnect: () => {
        console.log("🔌 WebSocket Connected 1111!");

        // Đăng ký nhận tin nhắn theo userId
        stompClientRef.current.subscribe(`/topic/user-notification/${user.id}`, (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log("📩 Tin nhắn mới:", data);

            // Hiển thị thông báo Toast khi có tin nhắn mới
            Toast.show({
              text1: "🔔 Thông báo",
              text2: `${data}`,
              type: "info",
            });
          } catch (error) {
            console.error("❌ Lỗi khi xử lý tin nhắn WebSocket:", error);
          }
        });
      },
      onStompError: (frame) => {
        console.error("🚨 WebSocket Error:", frame.headers["message"]);
      },
    });

    stompClientRef.current.activate();
  };

  // Ngắt kết nối WebSocket
  const disconnectWebSocket = () => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
      console.log("🔌 WebSocket Disconnected!");
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      logout,
      loading,
      api,
      isAuthenticated: !!user,
      getToken,
      saveToken,
      getUserInfo,
      connectWebSocket,
      disconnectWebSocket
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};