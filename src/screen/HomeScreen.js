import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { COLORS } from '../../contants'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Dimensions } from 'react-native'
import { Entypo } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../component/AuthProvider';
import { getComment, like } from '../service/PostService';
import { FlatList } from 'react-native';
import { fetchPostsSuggest } from '../service/AccountService';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import ImageGrid from '../component/ImageGrid';
import validate from '../../utils/Validate';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { ENV } from '../../contants/theme';
const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, api, getUserInfo, } = useAuth();
  const stompClientRef = useRef(null);
  const stories = [
    {
      id: "1",
      name: "Duy"
    },
    {
      id: "2",
      name: "Kiên"
    },
    {
      id: "3",
      name: "Diệp"
    },
    {
      id: "4",
      name: "Giang"
    },
    {
      id: "5",
      name: "Duy"
    }
  ]
  const [posts, setPosts] = useState([])
  useEffect(() => {
    stompClientRef.current = new Client({
      webSocketFactory: () => new SockJS(ENV.URL_SOCKET),
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("Connected to WebSocket hehe!");
        stompClientRef.current.subscribe(`/topic/post`, (message) => {
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
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          if (api !== null) {
            const postData = await fetchPostsSuggest(api, 0, 10);
            setPosts(postData);
          }

        } catch (error) {
          console.error('Lỗi khi tải dữ liệu:', error);
        }
      };
      loadData();
    }, [])
  );
  const renderData = ({ item }) => {
    return (
      <View key={item.id} style={{ borderColor: 'gray', borderBottomWidth: 1, paddingVertical: 10 }}>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
          <View style={{ justifyContent: 'flex-start', flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: item.createdBy.avatar }} style={styles.avatarPost} />
            <View style={{ paddingLeft: 10 }}>
              <Text style={styles.nameFriend}>{item.createdBy.fullName}</Text>
              <Text style={{ fontSize: 14 }}>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi }) + '  '}
                <Text >
                  {item.visibility === 0 ? <Entypo name="lock" size={15} color="black" /> :
                    (item.visibility === 1) ? <FontAwesome5 name="user-friends" size={15} color="black" /> :
                      <FontAwesome6 name="earth-americas" size={15} color="black" />
                  }
                </Text>
              </Text>
            </View>
          </View>
          <Entypo name="dots-three-horizontal" size={24} color="black" />
        </View>
        <View style={{ paddingVertical: 10 }}>
          <Text style={{ fontSize: 16 }}>{item.contents}</Text>
        </View>
        <ImageGrid images={item.image} />
        <View style={styles.countReaction}>

          {item.reactions && item.reactions.length > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={require('../../assets/like.png')} style={{ width: 16, height: 16 }} />
              <Text style={{ paddingLeft: 5 }}>{item.reactions.length}</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', height: 19 }}>
              <Text style={{ paddingLeft: 5 }}></Text>
            </View>
          )}
          {item.shares !== 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text>{item.shares} <Text> chia sẻ</Text></Text>
            </View>) : (<View />)}
          <View style={{ flexDirection: 'row' }}>
            {item.comments !== 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>{item.comments} <Text> bình luận</Text></Text>
              </View>) : (<View />)}
            {item.shares !== 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>{item.shares} <Text> chia sẻ</Text></Text>
              </View>) : (<View />)}
          </View>

        </View>
        <View style={styles.reactionPost}>
          {validate.checkLike(item.reactions, user.id) ? (
            <TouchableOpacity style={styles.reaction} onPress={() => like(item.id, user.id, api)}>
              <AntDesign name="like1" size={24} color={COLORS.primary} />
              <Text style={{ color: COLORS.primary }}> Thích</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.reaction} onPress={() => like(item.id, user.id, api)}>
              <AntDesign name="like2" size={24} color="black" />
              <Text> Thích</Text>
            </TouchableOpacity>
          )
          }

          <TouchableOpacity style={styles.reaction} onPress={() => getComment(item.id, navigation)}>
            <FontAwesome name="comment-o" size={24} color="black" />
            <Text> Bình luận</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reaction}>
            <FontAwesome6 name="share-from-square" size={24} color="black" />
            <Text> Chia sẻ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const loadMore = () => {
    // if (hasMore && comments.length > 0) {
    //     const lastComment = comments[comments.length - 1];
    //     setLastCreatedAt(lastComment.createdAt);
    // }
  };
  const renderFooter = () => {
    // if (!loading) return null;
    // return <ActivityIndicator size="small" color="gray" style={{ marginVertical: 10 }} />;
  };
  return (
    <View style={styles.container}>
      <FlatList
  data={posts}
  renderItem={renderData}
  keyExtractor={(item) => item.id}
  onEndReached={loadMore} 
  onEndReachedThreshold={0.5}
  ListFooterComponent={renderFooter}
  ListHeaderComponent={
    <View style={{ marginBottom: 10 }}>
      <View style={styles.post}>
        <TouchableOpacity onPress={() => navigation.navigate('Account', { friendId: user.id })}>
          <Image style={styles.avatar} source={{ uri: user.avatar }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.inputPost}>
          <Text>Bạn đang nghĩ gì</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Image style={{ width: 40, resizeMode: 'contain' }} source={require('../../assets/image.png')} />
        </TouchableOpacity>
      </View>

      {/* Story */}
      <View>
        <ScrollView horizontal contentContainerStyle={styles.stories} showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.viewStories}>
            <Image style={styles.imageStories} source={require('../../assets/coverdefault2.png')} />
            <View style={styles.overlay}>
              <Ionicons name="add-circle-sharp" style={{ textAlign: 'center' }} size={40} color="white" />
              <Text style={styles.titleCreateStory}>Tạo tin</Text>
            </View>
          </TouchableOpacity>
          {stories.map((item, index) => (
            <TouchableOpacity key={index} style={styles.viewStories}>
              <Image style={styles.imageStories} source={require('../../assets/coverdefault.png')} />
              <View style={styles.overlay}>
                <Image style={styles.avatarStory} source={require('../../assets/coverdefault.png')} />
                <Text style={styles.nameStory}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  }
/>

    </View>

  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    backgroundColor: 'white'
  },
  post: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    alignItems: 'center'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 50,
    borderColor: '#E5E6EB',
    borderWidth: 1,
  },
  inputPost: {
    borderColor: '#E5E6EB',
    borderWidth: 1,
    borderRadius: 30,
    paddingTop: 10,
    paddingLeft: 10,
    width: '70%',
    height: 40,

  },
  stories: {
    height: 180,
    backgroundColor: "#fff",
    paddingVertical: 5,
  },
  viewStories: {
    width: 120, // Mỗi ô chiếm 23% chiều rộng container
    marginHorizontal: 5, // Tạo khoảng cách giữa các ảnh
    borderRadius: 10, // Bo góc ảnh
    overflow: "hidden", // Tránh ảnh bị tràn ra ngoài
    position: "relative",
  },
  imageStories: {
    width: "100%", // Chiếm toàn bộ kích thước của `viewStories`
    height: '100%',
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    bottom: 5,  // Đặt ở gần đáy ảnh
    left: 5,
    right: 5,
    borderRadius: 5,
    padding: 5,

  },
  avatarStory: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  nameStory: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
  },
  titleCreateStory: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 5,
    textAlign: "center",
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