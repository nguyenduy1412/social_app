import { StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { Button } from 'react-native'
import { StackActions } from '@react-navigation/native'
import { useNavigation } from "@react-navigation/native";
import { useEffect } from 'react';

const Logout = ({ navigation }) => {
  const currentDate = new Date(); 
  const time=currentDate.getMinutes() +"-"+currentDate.getSeconds()
  const {setId} = useContext(AppContext);
  useEffect(() => {
    setId("-1");
    navigation.dispatch(StackActions.popToTop());
    navigation.navigate('Login')
  },[time])
    const handleLogout = () => {
        // const navigation = useNavigation();
        navigation.dispatch(StackActions.popToTop());
        navigation.navigate('Login')
    }
  return (
    <View style={{marginTop:50,backgroundColor:'white'}}>
      
    </View>
  )
}

export default Logout

const styles = StyleSheet.create({})