import React from 'react';
import { View, Text, Modal, TouchableOpacity, Image, StyleSheet } from 'react-native';

const CustomAlert = ({ visible, message, onPage,img ,color }) => {
  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onPage}
    >
      <View style={styles.container}>
        <View style={styles.alert}>
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={img} />
          </View>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity style={[styles.okButton,{backgroundColor:color}]} onPress={onPage}>
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alert: {
    width: '90%',
    paddingVertical: 30,
    backgroundColor: 'white',
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  imageContainer: {
    overflow: "hidden",
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
  },
  message: {
    textAlign: 'center',
    fontSize: 20,
    paddingVertical: 10,
  },
  okButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
  },
  okButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight:'bold'
  },
});

export default CustomAlert;
