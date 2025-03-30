
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Client } from '@stomp/stompjs';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, Image, LogBox, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, PinchGestureHandler, State } from 'react-native-gesture-handler';
import SockJS from 'sockjs-client';
import { COLORS } from '../../contants';
import { useAuth } from '../component/AuthProvider';
import { ENV, MESSAGE_TYPE } from '../../contants/theme';
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from '@react-navigation/native';
LogBox.ignoreLogs(['Key "cancelled" in the image picker result']);
const ChatMessage = ({ route }) => {
  const { width } = Dimensions.get('window');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [lastCreatedAt, setLastCreatedAt] = useState(null);
  const [receiver, setReceiver] = useState('');
  const { user, api, getUserInfo, logout } = useAuth();
  const { roomId,friend } = route.params; 
  const navigation = useNavigation();
  const [stompClient, setStompClient] = useState(null);
  const [uri, setUri] = useState(null);
  const [imgFullScreen, setImgFullScreen] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [toaDo, setToaDo] = useState(200);
  const [lastMessageId, setLastMessageId] = useState(null);
  const [load, setLoad] = useState(false)
  const [params, setParams] = useState('page=0&&lastMessageId=null')
  const fetchMessage = async () => {
    try {
      const response = await api.post('/chat/room',
        {
          roomId: roomId,
          lastCreatedAt: lastMessageId,
          size: 20,
        }
      );
      const newList = response.data;
      setMessages(newList);
      if (newList.length > 0) {
        setLastCreatedAt(newList[newList.length - 1].createdAt);
      }

    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };
  useEffect(() => {
    fetchMessage();
  }, []);
  useEffect(() => {
    const socket = new SockJS(`${ENV.URL_SOCKET}`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, newMessage]);

        });
      },
      onStompError: (error) => {
        console.error("Lỗi WebSocket:", error);
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.deactivate();
      console.log("❌ Đã ngắt kết nối WebSocket.");
    };
  }, []);

  const sendMessage = async () => {
    setMessage('')
    // th1 không nhập gì vào ô input
    if (message.trim() === '') {
      // nếu nhập ảnh thì gửi ảnh
      if (uri !== null) {
        let rs = await sendImage(uri);
        submitMessage(MESSAGE_TYPE.IMAGE, rs);
      }
      return;
    }
    //th2 nhập vào ô input
    else {
      // nếu nhập ảnh thì gửi ảnh và gửi cả message
      if (uri !== null) {
        let rs = await sendImage(uri);
        submitMessage(MESSAGE_TYPE.IMAGE, rs);
        submitMessage(MESSAGE_TYPE.TEXT, message);
      } else {
        // nếu mà không có ảnh thì gửi tin nhắn bình thường
        submitMessage(MESSAGE_TYPE.TEXT, message);
      }
    }
    setUri(null)
  };
  const submitMessage = (type, message) => {
    let formData = {
      messages: message.trim(),
      type: type,
      roomId: roomId
    }
    try {
      const response = api.post('/chat', formData)
      console.log("Gui tin nhăn thành công")
    } catch (error) {
      console.log(error)
    }

  }
  const pickImage = async () => {

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      // aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setUri(result.assets[0].uri)
    }
    else {
      setUri(null)
    }
  };
  const sendImage = async (uri) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: "new." + uri.split('.').pop(),
        type: 'image/*',
      });
      setUri(null);
      const response = await api.post(`/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.log("Lỗi tải ảnh");
    }
  };
  const [imageDimensions, setImageDimensions] = useState({});

  const onImageLoad = (uri, event) => {
    const { width, height } = event.nativeEvent.source;
    const aspectRatio = width / height; // Tính tỷ lệ
    setImageDimensions((prev) => ({
      ...prev,
      [uri]: { width, height, aspectRatio },
    }));
  };

  const getImageHeight = (uri, width) => {
    const aspectRatio = imageDimensions[uri]?.aspectRatio || 1;
    return width / aspectRatio; // Tính chiều cao dựa trên width và tỷ lệ ảnh
  };

  const getImageWidth = (uri) => {
    const aspectRatio = imageDimensions[uri]?.aspectRatio || 1;
    return aspectRatio > 1 ? 250 : 200; // Nếu ảnh ngang thì width = 250, nếu ảnh dọc thì width = 200
  };
  const [modalVisible, setModalVisible] = useState(false);  // Trạng thái hiển thị Modal

  const onImagePress = (uri) => {
    setModalVisible(true);
    setImgFullScreen(uri)  // Mở Modal khi bấm vào ảnh
  };

  const onCloseModal = () => {
    setModalVisible(false);

  };
  const [scale] = useState(new Animated.Value(1)); // Khai báo animated value

  // Hàm xử lý sự kiện zoom
  const onZoomEventFunction = Animated.event(
    [{ nativeEvent: { scale } }],
    { useNativeDriver: true }
  );

  // Hàm thay đổi trạng thái khi zoom kết thúc
  const onZoomStateChangeFunction = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      Animated.spring(scale, {
        toValue: 1,  // Reset lại scale về 1
        useNativeDriver: true,
      }).start();
    }
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y; // Vị trí cuộn theo trục Y
    if (offsetY <= 0) {
      if (page + 1 < totalPage) {
        setLoad(true)
        setPage(page + 1)
        let param = `page=${page + 1}&&lastMessageId=${lastMessageId}`
        setParams(param)
      }
    }
  };

  return (
    <View style={styles.container}>
      {load ?
        <View style={{ alignItems: 'center' }}>
          <ActivityIndicator size={'large'} />
        </View> : null
      }
      <View>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name='arrow-back-outline' size={25} color={"black"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
                navigation.navigate('Account', { friendId: friend.id });
            }}>
            <Image source={{ uri: friend.avatar }} style={styles.avatarPost} />
          </TouchableOpacity>
          
          <View style={{ paddingLeft: 10 }}>
            <Text style={styles.nameFriend}>{friend.fullName}</Text>
            <Text >Hoạt động 2 ngày trước</Text>
          </View>
        </View>
      </View>
      <FlatList
        data={[...messages].reverse()}
        keyExtractor={(item, index) => index.toString()}
        inverted
        renderItem={({ item }) => (
          <View style={styles.messview}>
            {item.createdBy.id === user.id ? (
              // Tin nhắn gửi
              <View style={styles.viewSendMessage}>
                {item.type === 0 ? (
                  <View style={[styles.message, styles.sentMessage]}>
                    <Text style={styles.white}>{item.messages}</Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => onImagePress(item.messages)}>
                    <Image
                      resizeMode="contain"
                      style={[styles.imgMessage, { width: getImageWidth(item.messages), height: getImageHeight(item.messages, getImageWidth(item.messages)) }]}
                      source={{ uri: item.messages }}
                      onLoad={(e) => onImageLoad(item.messages, e)}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              // Tin nhắn nhận
              <View style={styles.viewReceiverMessage}>
                <Image style={styles.imageAvata} source={{ uri: item.createdBy.avatar }} />
                {item.type === 0 ? (
                  <View style={[styles.message, styles.receivedMessage]}>
                    <Text style={styles.black}>{item.messages}</Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => onImagePress(item.message)}>
                    <Image
                      resizeMode="contain"
                      style={[styles.imgMessage, { width: getImageWidth(item.message), height: getImageHeight(item.message, getImageWidth(item.message)) }]}
                      source={{ uri: item.messages }}
                      onLoad={(e) => onImageLoad(item.message, e)}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: messages.length < 20 ? 'flex-end' : 'flex-start',
        }}
      />

      {uri == null ? null : (
        <View>
          <Image resizeMode='cover' style={styles.imgUpload} source={{ uri: uri }}></Image>
        </View>
      )}
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={onCloseModal}
        animationType="fade"
      >

        <GestureHandlerRootView style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onCloseModal}>
            <AntDesign name="closecircle" size={30} color="white" />
          </TouchableOpacity>
          <PinchGestureHandler
            onGestureEvent={onZoomEventFunction}
            onHandlerStateChange={onZoomStateChangeFunction}
          >
            <Animated.Image resizeMode="contain" style={{ width: width, height: '100%', transform: [{ scale: scale }] }} source={{ uri: imgFullScreen }}></Animated.Image>
          </PinchGestureHandler>
        </GestureHandlerRootView>
      </Modal>
      <View style={styles.sendMessage}>
        <TouchableOpacity style={styles.iconImage} onPress={pickImage}>
          <FontAwesome name="picture-o" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Enter your message"
          value={message}
          onChangeText={(text) => setMessage(text)}
        />
        <TouchableOpacity onPress={sendMessage} >
          <Ionicons name="send" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
    paddingTop: 30
  },
  header:{
    justifyContent: 'flex-start', 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingBottom:5,
    borderBottomWidth: 1,  // Độ dày của đường viền
    borderBottomColor: '#ccc',
  },
  message: {
    padding: 15,
    borderRadius: 15,
    maxWidth: '75%',
  },
  imgUpload: {
    width: 80,
    height: 80,
    borderRadius: 10
  },
  imgMessage: {
    borderRadius: 20
  },
  iconImage: {
    paddingRight: 10
  },
  messview: {
    marginBottom: 10
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary, // Màu xanh dương của Messenger
    borderBottomRightRadius: 0, // Góc bo đặc trưng Messenger
  },
  imageAvata: {
    width: 40,
    height: 40,
    borderRadius: 50,
    marginRight: 10
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
    borderBottomLeftRadius: 0,

  },
  nickname: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  viewSendMessage: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  viewReceiverMessage: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',

  },
  white: {
    color: 'white',
  },
  black: {
    color: 'black',
  },
  sendMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    justifyContent: 'between'
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  buttonSend: {
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black', // Background tối cho Modal
  },
  closeButton: {
    position: 'absolute',
    top: 20, // Cách từ trên xuống (bạn có thể điều chỉnh)
    right: 20, // Cách từ phải vào
    zIndex: 1,
    width: 30
  },
  closeText: {
    fontSize: 20,
    color: 'white',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  avatarPost: {
    width: 40,
    height: 40,
    borderRadius: 50,
    borderColor: '#E5E6EB',
    borderWidth: 1,
    marginLeft:5
  },
  nameFriend: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
});

export default ChatMessage;
