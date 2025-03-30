import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { AntDesign } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { TextInput } from 'react-native';
import axios from "axios";
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native'
import { COLORS } from '../../contants';

import CustomAlert from '../component/CustomAlert';
const { width, height } = Dimensions.get('screen')
import validate from '../../utils/Validate';
import { ENV } from '../../contants/theme';
import { useAuth } from '../component/AuthProvider';

const Login = () => {
  const { saveToken ,getUserInfo} = useAuth();
  const API_URL = ENV.API_URL;
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const [showPassword, setShowPassword] = useState(true)
  const [img, setImg] = useState();
  const [color, setColor] = useState("");
  const [pass, setPass] = useState(false)
  const [message, setMessage] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);

  const handleLogin = async () => {
    let check1 = validate.email(email);
    let check2 = validate.password(password);
    if (!check1) setErrorEmail("Email không đúng định dạng");
    else setErrorEmail("");

    if (!check2) setErrorPassword("Mật khẩu phải lớn hơn 6 ký tự");
    else setErrorPassword("");

    if (!check1 || !check2) return;

    let formData = { email, password };

    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);

      if (response.status === 200) {
        const result=await saveToken(response.data.data.accessToken);
        if (result) {
            await getUserInfo(); // Gọi API để lấy user ngay sau khi lưu token
        } else {
          console.log('Lưu token thất bại');
        }
        setColor("#1877f2");
        setImg(require('../../assets/oggy.gif'));
        setMessage("Đăng nhập thành công");
        setAlertVisible(true);
        setPass(true);
      } else {
        setMessage("Sai tài khoản hoặc mật khẩu");
        setImg(require('../../assets/loginFail.webp'));
        setColor("red");
        setAlertVisible(true);
        setPass(false);
      }
    } catch (err) {
      setPass(false);
      console.log("Lỗi khi gọi API:", err);
    }
  };


  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const onSuccess = () => {
    navigation.navigate("ButtonTab");
    setAlertVisible(false);
  }
  const onError = () => {
    setAlertVisible(false);
  }


  return (
    <View style={styles.container}>
      <View>
        <Image style={styles.img} source={require('../../assets/loginForm.png')} />
        <View style={styles.back} >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnBack} >
            <AntDesign name="arrowleft" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.form} >
          <View>
            <Text style={styles.lable}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email"
              value={email}
              onChangeText={setEmail}
            />
            {
              errorEmail === "" ? null : (
                <Text style={styles.error}>{errorEmail}</Text>
              )
            }
          </View>
          <Text style={styles.lable}>Mật khẩu</Text>
          <View>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              secureTextEntry={showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={toggleShowPassword} style={styles.show}>
              {showPassword === true ?
                (<Entypo name="eye" size={25} color="black" />) :
                (<Entypo name="eye-with-line" size={25} color="black" />)
              }
            </TouchableOpacity>
          </View>
          {
            errorPassword === "" ? null : (
              <Text style={styles.error}>{errorPassword}</Text>
            )
          }
          <TouchableOpacity style={{ justifyContent: 'flex-end', flexDirection: 'row', marginBottom: 10 }} onPress={() => {
            navigation.navigate("ForgotPass")
          }}>
            <Text>Quên mật khẩu?</Text>
          </TouchableOpacity >
          <TouchableOpacity style={styles.btnLogin} onPress={handleLogin} >
            <Text style={styles.txtLogin}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>

        <View style={{ justifyContent: 'center', flexDirection: 'row', marginTop: 20 }}>
          <Text>Bạn chưa có tài khoản?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={{ fontWeight: 'bold', color: '#FFD700' }}> Đăng ký</Text>
          </TouchableOpacity>
        </View>
        <CustomAlert
          visible={alertVisible}
          message={message}
          onPage={pass ? onSuccess : onError}
          img={img}
          color={color}
        />
      </View>
    </View>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  back: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: 20,
    paddingTop: 10,
    position: 'absolute',
    top: 30
  },
  btnBack: {
    backgroundColor: COLORS.sky,
    padding: 5,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16
  },

  img: {
    width: width,
    height: 350
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 40,
    padding: 45,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: -45
  },
  form: {

  },
  lable: {
    marginLeft: 12,
    marginBottom: 5,
    fontSize: 15,
    marginTop: 10
  },
  input: {
    padding: 16,
    backgroundColor: '#EEEEEE',

    borderRadius: 16,
    marginBottom: 5,
  },
  btnLogin: {
    borderRadius: 20,
    backgroundColor: COLORS.sky,
    padding: 18
  },
  txtLogin: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white'
  },
  lienket: {
    width: 40,
    height: 40
  },
  show: {
    position: 'absolute',
    top: 17,
    right: 25
  },
  error: {
    color: 'red',
    marginLeft: 12
  }
})