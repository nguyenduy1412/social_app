import React, { useContext, useEffect, useState } from 'react'

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import Wating from './src/component/Wating';
import Login from './src/screen/Login';
import StartScreen from './src/component/StartScreen';
import { UserProvider } from './src/component/UserProvider';
import SignUp from './src/screen/SignUp';
import Logout from './src/screen/Logout';
import ButtonTab from './src/screen/ButtonTab';
import HomeScreen from './src/screen/HomeScreen';
import Account from './src/screen/Account';
import CreatePost from './src/screen/CreatePost';
import CommentScreen from './src/component/CommentScreen';




const Stack = createNativeStackNavigator();


const App = () => {
  return (
    <UserProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Comment' screenOptions={{headerShown:false}}>
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
        <Stack.Screen name="Logout" component={Logout} options={{ headerShown: false }} />
        <Stack.Screen name="ButtonTab" component={ButtonTab} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Account" component={Account} options={{ headerShown: false }} />
        <Stack.Screen name="CreatePost" component={CreatePost} options={{ headerShown: false }} />
        <Stack.Screen name="Comment" component={CommentScreen} options={{ headerShown: false }} />
        {/* <Stack.Screen name="Onbroad" component={Onbroading} options={{ headerShown: false }} />
        <Stack.Screen name="UpdateAccount" component={AccountUpdateScreen} options={{ headerShown: false }} />     
   
        <Stack.Screen name="PassNew" component={PassNew} />
        <Stack.Screen name="MaOtp" component={MaOtp} /> */}
        {/* <Stack.Screen name="ForgotPass" component={ForgotPass} options={{ headerShown: false }} />
        <Stack.Screen name="DetailOrder" component={DetailOrder} /> */}
        <Stack.Screen name="Wating" component={Wating} />
        {/* <Stack.Screen name="Rating" component={Rating} />
        <Stack.Screen name="ListOrder" component={ListOrder} />
        <Stack.Screen name="Checkout" component={Checkout} />
        <Stack.Screen name="Checkout2" component={Checkout2} />
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="UpdatePass" component={UpdatePass} />
        <Stack.Screen name="Account" component={Account} /> */}
        <Stack.Screen name="Start" component={StartScreen} options={{ headerShown: false }} />
       
      </Stack.Navigator>
    </NavigationContainer>
    </UserProvider>
  )
}

export default App;
