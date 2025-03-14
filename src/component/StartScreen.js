import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Dimensions } from 'react-native'
import { COLORS } from '../../contants';
const {width,height} =Dimensions.get('screen')
const StartScreen = () => {
    const navigation = useNavigation();

    return (
      <View style={styles.container}>
        <Image style={styles.imageBackground} source={require('../../assets/start.png')}/>
        <View style={styles.content}>
            <TouchableOpacity
                onPress={()=> navigation.navigate("Login")}
                style={styles.btnSignup}>
                    <Text style={styles.textSignup}>
                        Bắt đầu
                    </Text>
            </TouchableOpacity>
            <View style={{flexDirection:'row',justifyContent:'center',marginTop:10}}>
                <Text style={{color:'white',fontWeight: '600'}}>Bạn đã có tài khoản?</Text>
                <TouchableOpacity onPress={()=> navigation.navigate('Login')}>
                    <Text style={styles.textLogin}> Đăng nhập</Text>
                </TouchableOpacity>
            </View>
        </View>
      </View>
    )
}

export default StartScreen

const styles = StyleSheet.create({
    container:{
        flex: 1, 
    },
    imageBackground:{
        width:width,
        height:height,
    },
    textWelcome:{
        color: 'white', 
        fontWeight: 'bold', 
        fontSize: 32, 
        textAlign: 'center'
    },
    content:{ 
        position:'absolute',
        bottom:50,
        left:0,
        right:0
    },
    anh:{
        flexDirection:'row',
        justifyContent:'center'
    },
    btnSignup:{
        paddingVertical: 12, 
        backgroundColor: COLORS.sky, 
        marginHorizontal: 28, 
        borderRadius: 16 
    },
    textSignup:{
        fontSize: 20, 
        fontWeight: 'bold',  
        textAlign: 'center', 
        color: 'white'
    },
    textLogin:{
        fontWeight:'600', 
        color: '#FFD700'
    }
})