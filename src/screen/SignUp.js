import { AntDesign, Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Button, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { COLORS } from '../../contants';
import CustomAlert from '../component/CustomAlert';
import { RadioButton } from 'react-native-paper';
import validate from '../../utils/Validate';
import Toast from 'react-native-toast-message'
import axios from 'axios';
import { ENV } from '../../contants/theme';
const { width, height } = Dimensions.get('screen')
const SignUp = () => {
  const API_URL= ENV.API_URL
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(true)
  const [errorEmail, setErrorEmail] = useState("")
  const [errorPass, setErrorPass] = useState("")
  const [errorFirstName, setErrorFirstName] = useState("")
  const [errorLastName, setErrorLastName] = useState("")
  const [alertVisible, setAlertVisible] = useState(false);
  const [img, setImg] = useState();
  const [color, setColor] = useState("");
  const [date, setDate] = useState(new Date());
  const [errorDate,setErrorDate] = useState('')
  const [show, setShow] = useState(false); // ✅ Phải khai báo useState
  const [gender, setGender] = useState("1");
  const [pass,setPass]=useState(false);
  // ngày sinh

  const [message, setMessage] = useState("");
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const showToast=(mess,type)=>{
    Toast.show({
      type:type, 
      text1:"Thông báo",
      text2:mess,
      autoHide:true,
      visibilityTime:2000
    });
  };
  const onSuccess = () => {
    navigation.navigate("Login");
    setAlertVisible(false);
  }
  const onFail = () => {
    setAlertVisible(false);
  }
 
  const onChange = (event, selectedDate) => {
    setShow(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  const handleSignUp = () => {
    let check1 = true, check2 = true, check3 = true, check4 = true, check5 = true;
    
  
    const formattedDate = `${date.getDate() <10 ? '0'+date.getDate():date.getDate()}/${(date.getMonth()+1) <10 ? '0'+(date.getMonth()+1):(date.getMonth()+1)}/${date.getFullYear()}`;
    if (!validate.date(formattedDate)) {
      setErrorDate("Ngày sinh không hợp lệ")
      check1 = false;
    }else{
      setErrorDate("")
      check1 = true
    }
    if (!validate.email(email)) {
      setErrorEmail("Email không hợp lệ")
      check2 = false
    }else{
      setErrorEmail("")
      check2 = true
    }
    if (!validate.password(password)) {
      setErrorPass("Mật khẩu có ít nhất 6 ký tự")
      check3 = false
    }else{
      setErrorPass("")
      check3 = true
    }
    if (!firstName) {
      setErrorFirstName("Không được để trống")
      check4 = false
    }else{
      setErrorFirstName("")
      check4 = true
    }
    if (!lastName) {
      setErrorLastName("Không được để trống")
      check5 = false
    }else{
      setErrorLastName("")
      check5 = true
    }
    let formData = {
      firstName: firstName,
      lastName: lastName,
      birthday: formattedDate,
      gender: Number(gender),
      password: password,
      email: email
    }
    console.log("FormData: " , formData);
    if (!check1 || !check2 || !check3 || !check4 || !check5)
      return
    console.log("api",API_URL);
    axios.post(`${API_URL}/auth/register`, formData)
      .then((response) => {
        if (response.status === 200) {
          // ✅ Lấy token từ response trước khi lưu
          setColor("#1877f2")
          setImg(require('../../assets/loginPass.webp'))
          setMessage("Đăng ký thành công")
          setAlertVisible(true);
          setPass(true)
        } 
        
      })
      .catch((err) => {
        console.log("Lỗi khi gọi API:", err);
        // ✅ Kiểm tra nếu có response từ server thì lấy message, ngược lại hiển thị lỗi mặc định
        const errorMessage = err.response?.data?.message || "Có lỗi xảy ra!";
        
        showToast(errorMessage, "error");
        setPass(false);
      });
  };
  return (
    <View style={styles.container}>
      <View>
        <Image style={styles.img} source={require('../../assets/register.png')} />
        <View style={styles.back} >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnBack} >
            <AntDesign name="arrowleft" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.form} >
          <View style={styles.inputFullName} >
            <View style={[styles.borderInput, { width: '48%' }]}>
              <TextInput
                style={[styles.input, { width: '100%' }]}
                placeholder="Họ"
                value={firstName}
                onChangeText={setFirstName}
              />
              {
                errorFirstName === "" ? null : (
                  <Text style={styles.error}>{errorFirstName}</Text>
                )
              }
            </View>
            <View style={[styles.borderInput, { width: '48%' }]}>
              <TextInput
                style={styles.input}
                placeholder="Tên"
                value={lastName}
                onChangeText={setLastName}
              />
              {
                errorLastName === "" ? null : (
                  <Text style={styles.error}>{errorLastName}</Text>
                )
              }
            </View>
          </View>

          <TouchableOpacity style={{ backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-between',marginTop:10 }} onPress={() => setShow(true)}>
            <Text style={styles.inputDate}>
              {date.getDate()}
            </Text>
            <Text style={styles.inputDate}>
              {date.getMonth() + 1}
            </Text>
            <Text style={styles.inputDate}>
              {date.getFullYear()}
            </Text>
          </TouchableOpacity>
          {
            errorDate === "" ? null : (
              <Text style={styles.error}>{errorDate}</Text>
            )
            }
          {show && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChange}
            />
          )}

          <RadioButton.Group
            onValueChange={(value) => setGender(value)}
            value={gender}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <View style={styles.genderInput}>
                <Text>Nam</Text>
                <RadioButton value="1" />

              </View>

              <View style={styles.genderInput}>
                <Text>Nữ</Text>
                <RadioButton value="0" />
              </View>
            </View>
          </RadioButton.Group>

          {/* <Text style={styles.lable}>Email</Text> */}
          <View style={styles.borderInput}>
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
          {/* <Text style={styles.lable}>Mật khẩu</Text> */}
          <View style={styles.borderInput}>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới"
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
            {
              errorPass === "" ? null : (
                <Text style={styles.error}>{errorPass}</Text>
              )
            }

          </View>
          <TouchableOpacity style={styles.btnLogin} onPress={handleSignUp} >
            <Text style={styles.txtLogin}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
        <View style={{ justifyContent: 'center', flexDirection: 'row', marginTop: 20, marginBottom: 50 }}>
          <Text>Bạn đã có tài khoản?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ fontWeight: 'bold', color: '#FFD700' }}> Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <CustomAlert
        visible={alertVisible}
        message={message}
        onPage={pass ? onSuccess : onFail}
        img={img}
        color={color}
      />
      <Toast /> 
    </View>

  )
}

export default SignUp

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  img: {
    width: width,
    height: 350
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
  content: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 40,
    padding: 45,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: -45
  },
  error: {
    color: 'red',
    paddingLeft: 10,
  },
  form: {

  },
  lable: {
    marginLeft: 12,
    marginBottom: 12,
    fontSize: 15
  },
  borderInput: {

    marginTop: 12
  },
  input: {
    padding: 14,
    backgroundColor: '#EEEEEE',
    borderRadius: 16,

  },
  btnLogin: {
    borderRadius: 20,
    backgroundColor: COLORS.sky,
    padding: 18,
    marginTop: 20
  },
  txtLogin: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white'
  },

  show: {
    position: 'absolute',
    top: 12,
    right: 25
  },
  inputFullName: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',

  },
  inputDate: {
    padding: 12,
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    width: '30%',
    textAlign: 'center'
  },
  genderInput: {
    padding: 5,
    backgroundColor: '#EEEEEE',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '45%'
  }
})