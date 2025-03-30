import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import { Entypo } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { AntDesign } from '@expo/vector-icons';
import { COLORS } from '../../contants';
import { Image } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FlatList } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import ImageGrid from '../component/ImageGrid';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../component/AuthProvider';

const CreatePost = ({route}) => {
  const { user } = route.params; 
  const { api} = useAuth();
  const [visibility, setVisibility] = useState("0");
  const [content, setContent] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [uris,setUris] = useState([]);
  const navigation = useNavigation();
  const options = [
    { label: "Chỉ mình tôi", value: "0", icon: "lock" },
    { label: "Bạn bè", value: "1", icon: "user" },
    { label: "Công khai", value: "2", icon: "globe" }
  ];
  const mapUris = (list) =>{
    return list.map(image => image.uri);
  }
  const handleSelect = (value) => {
    setVisibility(value);
    setIsDropdownOpen(false);
  };
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => {
        const uri = asset.uri;
        const fileExtension = uri.split('.').pop(); // Lấy đuôi file từ URI
        const currentTime = new Date().toISOString().replace(/:/g, '-'); // Định dạng thời gian
        return {
          uri,
          name: `image_${currentTime}.${fileExtension}`, // Giữ nguyên đuôi file
          type: `image/${fileExtension}`
        };
      });

      setImages([...images, ...newImages]);
    }
  };
  const createPost = async () => {
    try {
        const formData = new FormData();

        // ✅ Chỉ thêm ảnh nếu `images` không rỗng
        if (images.length > 0) {
            images.forEach(image => {
                formData.append("files", {
                    uri: image.uri,
                    name: image.name,
                    type: image.type,
                });
            });
        }

        formData.append("contents", content);
        formData.append("visibility", visibility);

        const response = await api.post(`/post`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        console.log("✅ Đăng bài thành công:", response.data);
        navigation.reset({
            routes: [{ name: "Account" }],
        });
    } catch (error) {
        console.error("❌ Lỗi khi đăng bài:", error.response ? error.response.data : error.message);
    }
};

  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* tạo header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-sharp" size={24} color="black" />
          <Text>Tạo bài viết</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnDang} onPress={createPost}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Đăng</Text>
        </TouchableOpacity>
      </View>
      <View>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <View style={{ justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center',padding:10  }}>
            <Image source={{ uri: user.avatar }} style={styles.avatarPost} />
            <View style={{ paddingLeft: 10 }}>
              <Text style={styles.nameFriend}>{user.fullName}</Text>
              <View style={styles.wrapper}>
                {/* Nút bấm để mở dropdown */}
                <TouchableOpacity style={styles.container} onPress={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <Icon name={options.find(opt => opt.value === visibility)?.icon} size={14} color="#1877F2" />
                  <Text style={styles.text}>{options.find(opt => opt.value === visibility)?.label}</Text>
                  <Icon name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={12} color="#1877F2" />
                </TouchableOpacity>

                {/* Danh sách option đổ xuống */}
                {isDropdownOpen && (
                  <View style={styles.dropdown}>
                    <FlatList
                      data={options}
                      keyExtractor={(item) => item.value}
                      renderItem={({ item }) => (
                        <TouchableOpacity style={styles.option} onPress={() => handleSelect(item.value)}>
                          <View style={{width:20}}>
                            <Icon name={item.icon} size={14} color="#1877F2" />
                          </View>
                          
                          <Text style={styles.text}>{item.label}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}
              </View>
            </View>
          </View> 
        </View>
        <TextInput placeholder='Bạn đang nghĩ gì' 
        style={styles.textInput}
        multiline={true}
        textAlignVertical="top"
        value={content}
        onChangeText={(text) => setContent(text)}
        />
      </View>
      {images.length > 0 && (
          <ImageGrid images={mapUris(images)} />
        )}
      
      <TouchableOpacity style={styles.chooseIconImage} onPress={pickImages} >
        <Ionicons name="image" size={40} color="green" />
      </TouchableOpacity>
            
    </GestureHandlerRootView>
  )
}

export default CreatePost

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 30,
    paddingHorizontal: 10,
    borderColor: 'gray',
    borderBottomWidth: 1,
    paddingBottom: 10
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  btnDang: {
    padding: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.blue,
    borderRadius: 10,

  },
  avatarPost: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderColor: '#E5E6EB',
    borderWidth: 1,

  },
  wrapper: {
    position: 'relative',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F3FF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  nameFriend: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
    paddingLeft:5
  },
  text: {
    color: '#1877F2',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  dropdown: {
    position: 'absolute',
    top: 35,
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    paddingVertical: 5,
    width: '100%',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  textInput:{
    paddingLeft:10,
    fontSize:16
  },
  chooseIconImage:{
    position: 'absolute',  // Cố định vị trí
    bottom: 20,           // Cách đáy màn hình 20px
    right: 20,            // Cách mép phải màn hình 20px
    backgroundColor: 'white',  // Màu nền (tùy chỉnh)
    padding: 10,          // Khoảng cách giữa icon và viền
    borderRadius: 50,     // Làm tròn nút
    elevation: 5,         // Đổ bóng (chỉ Android)
    shadowColor: '#000',  // Đổ bóng (chỉ iOS)
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  }
})