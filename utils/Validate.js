import React from 'react'

// utils/validation.js

const validate = {
  // Kiểm tra email hợp lệ
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Kiểm tra mật khẩu (tối thiểu 6 ký tự)
  password: (password) => {
    return password.length >= 6;
  },

  // Kiểm tra số điện thoại (Việt Nam)
  phoneNumber: (phone) => {
    const phoneRegex = /^(0[1-9][0-9]{8})$/;
    return phoneRegex.test(phone);
  },

  // Kiểm tra độ dài của một chuỗi
  length: (text, minLength) => {
    return text.length >= minLength;
  },

  date: (dateString) => {
    const monthDays = {
      "01": 31, "02": 28, "03": 31, "04": 30, "05": 31, "06": 30,
      "07": 31, "08": 31, "09": 30, "10": 31, "11": 30, "12": 31
    };
    const [dayStr, monthStr, yearStr] = dateString.split("/");
    const day = parseInt(dayStr, 10);
    const month = monthStr;
    const year = parseInt(yearStr, 10);
    if(new Date().getFullYear() - year < 16){
      console.log("Year2",new Date().getFullYear() - year);
      return false;
    } 
    // Kiểm tra năm nhuận (chia hết cho 4 và không chia hết cho 100 trừ khi chia hết cho 400)
    if (month === "2") {
      if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
        monthDays["2"] = 29;
      }
    }
    return day > 0 && day <= monthDays[month];
  },
  auth: ()=>{
    if(localStorage.getItem("accessToken") === null) {
      return false;
    }
    return true;
  }
};

// Xuất object validate để có thể gọi validate.email(), validate.password(), ...
export default validate;

