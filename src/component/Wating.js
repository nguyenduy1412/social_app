import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const Wating = () => {
 

  return (
    <View style={{ flex:1,justifyContent:'center',alignItems:'center',backgroundColor:"white" }}>
      <Image
        style={{
          width: 150,
          height: 150,
          marginTop:60
        }}
        source={require('../../assets/sonic.webp')}
      />
    </View>
  );
};

export default Wating;

const styles = StyleSheet.create({});
