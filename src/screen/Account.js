import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client';
import { Image } from 'react-native'
import Icon from "react-native-vector-icons/Ionicons";
import { Dimensions } from 'react-native'
import { Entypo } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { AntDesign } from '@expo/vector-icons';
const { width, height } = Dimensions.get('screen')
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { LogBox } from 'react-native';
import { useState } from 'react';
import moment from 'moment';
LogBox.ignoreLogs(['Key "cancelled" in the image picker result']);

import { COLORS } from '../../contants';
import { ENV, FRIEND_STATUS } from '../../contants/theme';
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import ImageGrid from '../component/ImageGrid';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../component/AuthProvider';
import validate from './../../utils/Validate';
import { checkFriend, fetchFriend, fetchPeople, fetchPosts } from '../service/AccountService';
import { handleChatMessage } from '../link/NavigateToScreen';
import { getComment, like } from '../service/PostService';

const Account = ({ route }) => {
  // const [user, setUser] = useState('')
  const { user, api, getUserInfo, logout } = useAuth();
  const { friendId } = route.params;
  const [people, setPeople] = useState('')
  const [image, setImage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [lastCreatedAt, setLastCreatedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [check, setCheck] = useState(friendId === user.id)
  const currentDate = new Date();
  const navigation = useNavigation();
  const [reset, setReset] = useState(false);
  const [friend, setFriend] = useState([])
  const [statusFriend, setStatusFriend] = useState(0)
  const time = currentDate.getMinutes() + "-" + currentDate.getSeconds()
  

  const stompClientRef = useRef(null);

  useEffect(() => {
    stompClientRef.current = new Client({
      webSocketFactory: () => new SockJS(ENV.URL_SOCKET),
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("Connected to WebSocket!");
        stompClientRef.current.subscribe(`/topic/user/${friendId}`, (message) => {
          try {
            const updatedPost = JSON.parse(message.body);
            console.log("data post:", updatedPost);
            console.log(updatedPost.reactions.length)
            // Cập nhật bài viết trong danh sách
            setPosts((prevPosts) =>
              prevPosts.map((post) =>
                post.id === updatedPost.id ? updatedPost : post
              )
            );
          } catch (error) {
            console.error("Error processing WebSocket message:", error);
          }
        });
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
      },
    });

    stompClientRef.current.activate();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  const addFriend = async (friendId) => {
    let formData = {
        friendId: friendId,
    };
    console.log('Hú');
    try {
        const response = await api.post(`/friends`, formData)
        setStatusFriend(FRIEND_STATUS.APPROVED)
    } catch (err) {
        console.error("Lỗi khi gửi kết bạn:", err);
    }
}
const changeRequest = async (id,status,friendId) => {
  let formData = {
      id: id,
      status: status,
      friendId: friendId
  };
  console.log(formData);
  try {
      const response = await api.patch(`/friends`, formData)
      if(status===FRIEND_STATUS.FRIEND)
        setStatusFriend(FRIEND_STATUS.FRIEND)
      if(status===FRIEND_STATUS.REJECT)
       setStatusFriend(FRIEND_STATUS.NO_FRIEND)
    

  } catch (err) {
      console.error("Lỗi khi gửi kết bạn: ", err);
  }
}
  const pickImage = async (type) => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const fileExtension = result.assets[0].uri.split('.').pop();
      const currentDate = new Date();
      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const hours = currentDate.getHours();
      const minutes = currentDate.getMinutes();
      const seconds = currentDate.getSeconds();
      const imgName = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}.${fileExtension}`;
      setImage(result.assets[0].uri);
      const apiUrl = '/user/updateAvatar';
      uploadImage(result.assets[0].uri, imgName, apiUrl, type);
    }
  };
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          if(api !==null){
            const peopleData = await fetchPeople(friendId,api);
            setPeople(peopleData);
            const checkData = await checkFriend(friendId,api);
            setStatusFriend(checkData);
            const friendData = await fetchFriend(friendId,api,0,FRIEND_STATUS.FRIEND,6);
            setFriend(friendData);
            const postData = await fetchPosts(friendId,api,check,user.id);
            setPosts(postData);
            if (postData.length > 0) {
              setLastCreatedAt(postData[postData.length - 1].createdAt);
            }
          }
          
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu:', error);
        }
      };
      loadData();
    }, [])
  );

  const uploadImage = async (uri, imgName, apiUrl, type) => {
    const formData = new FormData();
    formData.append('type', type)
    formData.append('file', {
      uri,
      name: imgName,
      type: 'image/*',
    });

    try {
      const response = await api.patch(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setReset(!reset)
      await getUserInfo();
      console.log('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image: ', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar translucent={true} backgroundColor={'transparent'}></StatusBar>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.borderCover} >
            <Image style={styles.imgCover} source={people.coverImg === null ? require('../../assets/coverdefault.png') : { uri: people.coverImg }} ></Image>
          </View>
          {check && (
            <TouchableOpacity style={styles.btnUploadCover} onPress={() => pickImage(1)}>
              <Entypo name="camera" size={24} color="black" />
            </TouchableOpacity>
          )}

        </View>
        <View style={styles.container}>
          <View>
            <View style={styles.borderAvatar}>
              <Image style={styles.avatar} source={people.coverImg === null ? require('../../assets/coverdefault.png') : { uri: people.avatar }} />
            </View>
            {check && (
              <TouchableOpacity style={styles.btnUploadAvatar} onPress={() => pickImage(0)}>
                <Entypo name="camera" size={24} color="black" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.nameUser}>{people.fullName}</Text>
          <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>{user.friendCount}</Text> người bạn</Text>
          <Text style={styles.text}>{people.about}</Text>
          {check ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 }}>
              <TouchableOpacity style={styles.btnBack} onPress={() => { navigation.navigate('ButtonTab') }}>
                <AntDesign name="doubleleft" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnUpdate} onPress={() => { navigation.navigate('UpdateAccount') }}>
                <FontAwesome5 name="pen" size={16} color="black" />
                <Text style={{ fontWeight: 'bold', fontSize: 16, paddingLeft: 10 }}>Chỉnh sửa trang cá nhân</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 }}>
              {(() => {
                if (statusFriend === FRIEND_STATUS.FRIEND) {
                  return (
                    <TouchableOpacity style={styles.btnFriend} >
                      <Icon name="people" size={24} color="black" />
                      <Text style={{ fontWeight: 'bold', fontSize: 16, paddingLeft: 10 }}>Bạn bè</Text>
                    </TouchableOpacity>
                  );
                } else if(statusFriend === FRIEND_STATUS.APPROVED) {
                  return (
                    <TouchableOpacity style={styles.btnSendMessage} onPress={() => changeRequest(1, FRIEND_STATUS.REJECT, friendId)}>
                      <Icon name="person-add" size={24} color="white" />
                      <Text style={{ fontWeight: 'bold', fontSize: 16, paddingLeft: 10,color:'white' }}>Đã gửi lời mời</Text>
                    </TouchableOpacity>
                  );
                }else if(statusFriend === FRIEND_STATUS.INVITATION) {
                  return (
                    <TouchableOpacity style={styles.btnSendMessage} onPress={() => changeRequest(1, FRIEND_STATUS.FRIEND, friendId)}>
                      <Icon name="person-add" size={24} color="white" />
                      <Text style={{ fontWeight: 'bold', fontSize: 16, paddingLeft: 10,color:'white' }}>Xác nhận</Text>
                    </TouchableOpacity>
                  );
                }else {
                  return (
                    <TouchableOpacity style={styles.btnSendMessage} onPress={ ()=>addFriend(friendId) }>
                      <Icon name="person-add" size={24} color="white" />
                      <Text style={{ fontWeight: 'bold', fontSize: 16, paddingLeft: 10,color:'white' }}>Thêm bạn</Text>
                    </TouchableOpacity>
                  );
                }
              })()}

              <TouchableOpacity style={styles.btnSendMessage} onPress={() => handleChatMessage(people,navigation,api)}>
                <Icon name="chatbubble" size={24} color="white" />
                <Text style={{ fontWeight: 'bold', fontSize: 16, paddingLeft: 10, color: 'white' }}>Nhắn tin</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnOption} onPress={() => { navigation.navigate('UpdateAccount') }}>
                <Icon name="ellipsis-horizontal" size={24} color="black" />
              </TouchableOpacity>
            </View>
          )}
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.navigation}>
              <Text style={{ fontWeight: 'bold' }}>Bài viết</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navigation}>
              <Text style={{ fontWeight: 'bold' }}>Ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navigation}>
              <Text style={{ fontWeight: 'bold' }}>Video</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.detail} >Chi tiết</Text>
          <View>
            {people.email === null ? null :
              (
                <View style={styles.inform}>
                  <Image style={styles.icon} source={require('../../assets/email.gif')} />
                  <Text style={styles.text}>{people.email}</Text>
                </View>
              )
            }
            {people.address === null ? null :
              (
                <View style={styles.inform}>
                  <Image style={styles.icon} source={require('../../assets/address.gif')} />
                  <Text style={styles.text}>{people.email}</Text>
                </View>
              )
            }
            {people.phone === null ? null :
              (
                <View style={styles.inform}>
                  <Image style={styles.icon} source={require('../../assets/telephone.gif')} />
                  <Text style={styles.text}>{people.phone}</Text>
                </View>
              )
            }
            {people.gender === null ? null :
              (
                <View style={styles.inform}>
                  <Image style={styles.icon} source={require('../../assets/gender.gif')} />
                  <Text style={styles.text}>{people.gender == 1 ? 'Nam' : 'Nữ'}</Text>
                </View>
              )
            }
            {people.birthday === null ? null :
              (
                <View style={styles.inform}>
                  <Image style={styles.icon} source={require('../../assets/cake.gif')} />
                  <Text style={styles.text}>{validate.formatDate(people.birthday)}</Text>
                </View>
              )
            }
            {people.followCount === null ? null :
              (
                <View style={styles.inform}>
                  <Image style={styles.icon} source={require('../../assets/follow.png')} />
                  <Text style={styles.text}>{people.followCount} người theo dõi</Text>
                </View>
              )
            }
          </View>
          <View >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 10 }}>
              <View>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Bạn bè</Text>
                <Text>{friend.length === 0 ? 'Không có người bạn nào' : friend.length + ' người bạn'} </Text>
              </View>
              <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>Tìm bạn bè</Text>
            </View>
            <View style={styles.listFriend}>
              {friend.map((user) => (
                <View key={user.friend.id} style={styles.userCard}>
                  <Image
                    source={{ uri: user.friend.avatar }}
                    style={styles.avatarFriend}
                  />
                  <Text style={styles.nameFriend}>{user.friend.fullName}</Text>
                  {/* {user.status && <Text style={styles.status}>{user.status}</Text>} */}
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.btnViewFriend}>
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Xem tất cả bạn bè</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 10, alignItems: 'center' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Bài viết</Text>
            <Text style={{ fontWeight: 'bold', color: COLORS.primary, fontSize: 16 }}>Bộ lọc</Text>
          </View>
          {people.id === user.id && (
            <View style={styles.post}>
              <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                <Image style={styles.avatarPost} source={{ uri: people.avatar }} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.inputPost} onPress={() => navigation.navigate('CreatePost', { user: people })}>
                <Text style={{ fontSize: 16 }} >Bạn đang nghĩ gì</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Image style={{ width: 40, resizeMode: 'contain' }} source={require('../../assets/image.png')} />
              </TouchableOpacity>
            </View>
          )}
          <View>
            <View>
              {/* header bài viết */}
              <View style={styles.listPost}>
                {posts.map((post) => (
                  <View key={post.id} style={{ borderColor: 'gray', borderBottomWidth: 1, paddingVertical: 10 }}>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                      <View style={{ justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center' }}>
                        <Image source={{ uri: post.createdBy.avatar }} style={styles.avatarPost} />
                        <View style={{ paddingLeft: 10 }}>
                          <Text style={styles.nameFriend}>{post.createdBy.fullName}</Text>
                          <Text style={{ fontSize: 14 }}>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi }) + '  '}
                            <Text >
                              {post.visibility === 0 ? <Entypo name="lock" size={15} color="black" /> :
                                (post.visibility === 1) ? <FontAwesome5 name="user-friends" size={15} color="black" /> :
                                  <FontAwesome6 name="earth-americas" size={15} color="black" />
                              }
                            </Text>
                          </Text>
                        </View>
                      </View>
                      <Entypo name="dots-three-horizontal" size={24} color="black" />
                    </View>
                    <View style={{ paddingVertical: 10 }}>
                      <Text style={{ fontSize: 16 }}>{post.contents}</Text>
                    </View>
                    <ImageGrid images={post.image} />
                    <View style={styles.countReaction}>

                      {post.reactions && post.reactions.length > 0 ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Image source={require('../../assets/like.png')} style={{ width: 16, height: 16 }} />
                          <Text style={{ paddingLeft: 5 }}>{post.reactions.length}</Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', height: 19 }}>
                          <Text style={{ paddingLeft: 5 }}></Text>
                        </View>
                      )}
                      {post.shares !== 0 ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text>{post.shares} <Text> chia sẻ</Text></Text>
                        </View>) : (<View />)}
                      <View style={{ flexDirection: 'row' }}>
                        {post.comments !== 0 ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text>{post.comments} <Text> bình luận</Text></Text>
                          </View>) : (<View />)}
                        {post.shares !== 0 ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text>{post.shares} <Text> chia sẻ</Text></Text>
                          </View>) : (<View />)}
                      </View>

                    </View>
                    <View style={styles.reactionPost}>
                      {validate.checkLike(post.reactions,user.id) ? (
                        <TouchableOpacity style={styles.reaction} onPress={() => like(post.id, user.id,api)}>
                          <AntDesign name="like1" size={24} color={COLORS.primary} />
                          <Text style={{ color: COLORS.primary }}> Thích</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity style={styles.reaction} onPress={() => like(post.id, user.id,api)}>
                          <AntDesign name="like2" size={24} color="black" />
                          <Text> Thích</Text>
                        </TouchableOpacity>
                      )
                      }

                      <TouchableOpacity style={styles.reaction} onPress={()=>getComment(post.id,navigation)}>
                        <FontAwesome name="comment-o" size={24} color="black" />
                        <Text> Bình luận</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.reaction}>
                        <FontAwesome6 name="share-from-square" size={24} color="black" />
                        <Text> Chia sẻ</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView >

    </View >
  )
}

export default Account

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15
  },
  borderCover: {
    width: width,
    height: 300,
    overflow: 'hidden'
  },
  imgCover: {
    width: '100%',
    height: '100%'
  },
  borderAvatar: {
    width: 180,
    height: 180,
    borderRadius: 150,
    borderColor: 'white',
    borderWidth: 4,
    marginTop: -130,
    overflow: 'hidden'
  },
  avatar: {
    width: '100%',
    height: '100%'

  },
  nameUser: {
    fontSize: 25,
    fontWeight: 'bold',
    paddingVertical: 5
  },
  btnUploadCover: {
    width: 45,
    height: 45,
    backgroundColor: '#E5E6EB',
    position: 'absolute',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 10,
    right: 10,
    borderWidth: 4,
    borderColor: 'white'
  },
  btnUploadAvatar: {
    width: 45,
    height: 45,
    backgroundColor: '#E5E6EB',
    position: 'absolute',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    left: 130,
    borderWidth: 4,
    borderColor: 'white'
  },
  btnBack: {
    backgroundColor: '#E5E6EB',
    padding: 10,
    borderRadius: 8
  },
  btnFriend: {
    backgroundColor: '#E5E6EB',
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    width: '40%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnSendMessage: {
    backgroundColor: COLORS.sky,
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',
    width: '40%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnOption: {
    backgroundColor: '#E5E6EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  btnUpdate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E6EB',
    padding: 10,
    borderRadius: 8,
    width: '86%'
  },
  detail: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingVertical: 10,

  },
  inform: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10
  },
  text: {
    fontSize: 14,
    paddingLeft: 5
  },
  icon: {
    width: 30,
    height: 30
  },
  navigation: {
    padding: 15,
    borderRadius: 20
  },
  userCard: {
    width: "32%",
    height: 200
  },
  listFriend: {
    flexDirection: "row",
    flexWrap: "wrap", // Tự động xuống hàng khi đủ 3 phần tử
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  avatarFriend: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    backgroundColor: "#ccc", // Màu nền khi không có ảnh
  },
  nameFriend: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  status: {
    fontSize: 12,
    color: "gray",
  },
  btnViewFriend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E6EB',
    padding: 10,
    borderRadius: 8,
  },
  post: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,

  },
  avatarPost: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderColor: '#E5E6EB',
    borderWidth: 1,

  },
  inputPost: {
    fontSize: 16,
    paddingTop: 10,
    paddingLeft: 10,
    width: '70%',
    height: 40,

  },
  listPost: {
    paddingTop: 20
  },
  reactionPost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countReaction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10
  }
})