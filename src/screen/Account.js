import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client';
import { Image } from 'react-native'
import { Dimensions } from 'react-native'
import { Entypo } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { AntDesign } from '@expo/vector-icons';
const { width, height } = Dimensions.get('screen')
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { LogBox } from 'react-native';
import { useState } from 'react';
import moment from 'moment';
LogBox.ignoreLogs(['Key "cancelled" in the image picker result']);

import { useUser } from '../component/UserProvider';
import { COLORS } from '../../contants';
import { ENV } from '../../contants/theme';
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import api from '../../router/AxiosInstance';

import ImageGrid from '../component/ImageGrid';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';


const Account = () => {
  const [user, setUser] = useState('')
  const [image, setImage] = useState(null);
  const [image2, setImage2] = useState(null);
  const [userData, setUserData] = useState('');
  const [posts, setPosts] = useState([]);
  const [lastCreatedAt, setLastCreatedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const currentDate = new Date();
  const navigation = useNavigation();
  const [activeLike, setActiveLike] = useState()
  const time = currentDate.getMinutes() + "-" + currentDate.getSeconds()
  const formatDate = (reviewDate) => {
    const formattedDate = moment(reviewDate).format('DD/MM/YYYY');
    return formattedDate;
  };
  const friend = [
    { id: 1, name: "Nguyễn Hoàng Nam", avatar: "https://res.cloudinary.com/dbywzbny7/image/upload/v1741757616/xitypt4aycminxzmtdeg.png", status: "Đang hoạt động" },
    { id: 2, name: "Nguyễn Đình Tuấn", avatar: "https://res.cloudinary.com/dbywzbny7/image/upload/v1741757616/xitypt4aycminxzmtdeg.png", status: "Hoạt động 39 phút trước" },
    { id: 3, name: "Hin Anh", avatar: "https://res.cloudinary.com/dbywzbny7/image/upload/v1741757616/xitypt4aycminxzmtdeg.png", status: "" },
    { id: 4, name: "Tuan Anh", avatar: "https://res.cloudinary.com/dbywzbny7/image/upload/v1741757616/xitypt4aycminxzmtdeg.png", status: "Hoạt động 3 giờ trước" },
    { id: 5, name: "Xuân Hiếu", avatar: "https://res.cloudinary.com/dbywzbny7/image/upload/v1741757616/xitypt4aycminxzmtdeg.png", status: "Hoạt động 14 phút trước" },
    { id: 6, name: "Nguyễn Quang Hào", avatar: "https://res.cloudinary.com/dbywzbny7/image/upload/v1741757616/xitypt4aycminxzmtdeg.png", status: "Đang hoạt động" },
  ];
  const stompClientRef = useRef(null);
  
  useEffect(() => {
    stompClientRef.current = new Client({
        webSocketFactory: () => new SockJS(ENV.URL_SOCKET),
        debug: (str) => console.log(str),
        onConnect: () => {
            console.log("Connected to WebSocket!");
            stompClientRef.current.subscribe("/topic/post", (message) => {
                try {
                    const updatedPost = JSON.parse(message.body);
                    console.log("Received updated post:", updatedPost);
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
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${ENV.API_URL}/user/get-current-user`, {
          headers: {
            Authorization: `Bearer ${ENV.token}`,
          },
        })
        setUser(response.data);
        fetchPosts(response.data.id);
      } catch (err) {
        console.error("Lỗi khi lấy user:", err);
      }
    };
    fetchUser();
  }, []);
  
  const fetchPosts = async (userId) => {
    try {
      const response = await axios.post(
        `${ENV.API_URL}/post/search`,
        {
          size: 20,
          userId: userId,
          content: "",
          visibility: 0,
          lastCreatedAt: "",
          viewId: userId
        },
        {
          headers: {
            Authorization: `Bearer ${ENV.token}`,
          },
        }
      );
      const newPosts = response.data;
      setPosts(response.data);
      if (newPosts.length > 0) {
        setLastCreatedAt(newPosts[newPosts.length - 1].createdAt);
      }
    } catch (err) {
      console.error("Lỗi khi gọi API:", err);
    }
  };

  const pickImage1 = async () => {
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
      const apiUrl = `${API_URL}`;
      uploadImage(result.assets[0].uri, imgName, apiUrl);
    }
  };
  
  const pickImage2 = async () => {
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

      setImage2(result.assets[0].uri);
      const apiUrl = `${API_URL}`;
      uploadImage(result.assets[0].uri, imgName, apiUrl);
    }
  };
  
  const uploadImage = async (uri, imgName, apiUrl) => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: imgName,
      type: 'image/*',
    });
    
    try {
      const response = await axios.put(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image: ', error);
    }
  };

  const like = async (postId, createdBy) => {
    try {
      // Tạo object chứa thông tin like
      let formData = {
        postId: postId,
        createdBy: createdBy
      };
      
      // Cập nhật UI trước khi nhận phản hồi từ server để tạo trải nghiệm tốt hơn
      setPosts((prevPosts) => 
        prevPosts.map((post) => {
          if (post.id === postId) {
            // Thay đổi trạng thái liked và số lượng reaction
            const newLikedState = !post.liked;
            const reactionCount = newLikedState 
              ? post.reactions + 1 
              : post.reactions - 1;
            
            return {
              ...post,
              liked: newLikedState,
              reactions: reactionCount
            };
          }
          return post;
        })
      );
      
      // Gửi yêu cầu đến server
      const response = await axios.post(`${ENV.API_URL}/reaction`, formData, {
        headers: {
          Authorization: `Bearer ${ENV.token}`,
        },
      });
      
      console.log("Like thành công:", response.data);
      
      // WebSocket sẽ cập nhật lại trạng thái chính xác sau khi server xử lý
    } catch (error) {
      console.error("Lỗi khi like:", error);
      
      // Nếu có lỗi, khôi phục lại trạng thái cũ
      setPosts((prevPosts) => 
        prevPosts.map((post) => {
          if (post.id === postId) {
            // Thay đổi trạng thái liked và số lượng reaction
            const newLikedState = !post.liked;
            const reactionCount = newLikedState 
              ? post.reactions + 1 
              : post.reactions - 1;
            
            return {
              ...post,
              liked: newLikedState,
              reactions: reactionCount
            };
          }
          return post;
        })
      );
    }
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar translucent={true} backgroundColor={'transparent'}></StatusBar>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.borderCover} >
            <Image style={styles.imgCover} source={user.coverImg === null ? require('../../assets/coverdefault.png') : { uri: user.coverImg }} ></Image>
          </View>

          <TouchableOpacity style={styles.btnUploadCover} onPress={pickImage2}>
            <Entypo name="camera" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <View>
            <View style={styles.borderAvata}>
              <Image style={styles.avatar} source={user.coverImg === null ? require('../../assets/coverdefault.png') : { uri: user.avatar }} />
            </View>
            <TouchableOpacity style={styles.btnUploadAvatar} onPress={pickImage1}>
              <Entypo name="camera" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text style={styles.nameUser}>{user.fullName}</Text>
          <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>{user.friendCount}</Text> người bạn</Text>
          <Text style={styles.text}>{user.about}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 }}>
            <TouchableOpacity style={styles.btnBack} onPress={() => { navigation.goBack() }}>
              <AntDesign name="doubleleft" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnUpdate} onPress={() => { navigation.navigate('UpdateAccount') }}>
              <FontAwesome5 name="pen" size={16} color="black" />
              <Text style={{ fontWeight: 'bold', fontSize: 16, paddingLeft: 10 }}>Chỉnh sửa trang cá nhân</Text>
            </TouchableOpacity>
          </View>

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
            {user.email === null ? null :
              (
                <View style={styles.inform}>
                  <Image style={styles.icon} source={require('../../assets/email.gif')} />
                  <Text style={styles.text}>{user.email}</Text>
                </View>
              )
            }
            {user.address === null ? null :
              (
                <View style={styles.inform}>
                  <Image style={styles.icon} source={require('../../assets/address.gif')} />
                  <Text style={styles.text}>{user.email}</Text>
                </View>
              )
            }
            {user.phone === null ? null :
              (
                <View style={styles.inform}>
                  <Image style={styles.icon} source={require('../../assets/telephone.gif')} />
                  <Text style={styles.text}>{user.phone}</Text>
                </View>
              )
            }
            {user.gender === null ? null :
              (
                <View style={styles.inform}>
                  <Image style={styles.icon} source={require('../../assets/gender.gif')} />
                  <Text style={styles.text}>{user.gender == 1 ? 'Nam' : 'Nữ'}</Text>
                </View>
              )
            }
            {user.birthday === null ? null :
              (
                <View style={styles.inform}>
                  <Image style={styles.icon} source={require('../../assets/cake.gif')} />
                  <Text style={styles.text}>{formatDate(user.birthday)}</Text>
                </View>
              )
            }
            {user.followCount === null ? null :
              (
                <View style={styles.inform}>
                  <Image style={styles.icon} source={require('../../assets/follow.png')} />
                  <Text style={styles.text}>{user.followCount} người theo dõi</Text>
                </View>
              )
            }
          </View>
          <View >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 10 }}>
              <View>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Bạn bè</Text>
                <Text>{user.friendCount} người bạn</Text>
              </View>
              <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>Tìm bạn bè</Text>
            </View>
            <View style={styles.listFriend}>
              {friend.map((user) => (
                <View key={user.id} style={styles.userCard}>
                  <Image
                    source={{ uri: user.avatar }}
                    style={styles.avatarFriend}
                  />
                  <Text style={styles.nameFriend}>{user.name}</Text>
                  {user.status && <Text style={styles.status}>{user.status}</Text>}
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
          <View style={styles.post}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Image style={styles.avatarPost} source={{ uri: user.avatar }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.inputPost} onPress={() => navigation.navigate('CreatePost')}>
              <Text style={{ fontSize: 16 }} >Bạn đang nghĩ gì</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Image style={{ width: 40, resizeMode: 'contain' }} source={require('../../assets/image.png')} />
            </TouchableOpacity>
          </View>
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
                          <Text style={{ fontSize: 14 }}>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                            <Text>
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
                      <Text>{post.contents}</Text>
                    </View>
                    <ImageGrid images={post.image} />
                    <View style={styles.countReaction}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AntDesign name="like1" size={20} color="blue" />
                        <Text>{post.reactions}</Text>
                      </View>
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
                      {post.liked ? (
                        <TouchableOpacity style={styles.reaction} onPress={()=>like(post.id,user.id)}>
                        <AntDesign name="like1" size={24} color={COLORS.primary} />
                        <Text style={{color:COLORS.primary}}> Thích</Text>
                      </TouchableOpacity>
                      ) : (
                        <TouchableOpacity style={styles.reaction} onPress={()=>like(post.id,user.id)}>
                          <AntDesign name="like2" size={24} color="black" />
                          <Text> Thích</Text>
                        </TouchableOpacity>
                      )
                      }

                      <TouchableOpacity style={styles.reaction}>
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
      </ScrollView>

    </View>
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
  borderAvata: {
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