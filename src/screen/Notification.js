import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { COLORS } from '../../contants';
import SockJS from 'sockjs-client';
import { ENV, FRIEND_STATUS, NOTIFICATION_TYPE } from '../../contants/theme';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../component/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';
import { formatDistanceStrict } from 'date-fns';
import { vi } from 'date-fns/locale';

const Notification = () => {
  const [loading, setLoading] = useState(false);
  const [stompClient, setStompClient] = useState(null);
  const { user, api, getUserInfo, logout } = useAuth();
  const [notification,setNotification]=useState([])
  const [lastCreatedAt,setLastCreatedAt]=useState(null)

  const fetchNotification = async ()=>{
    try {
      let formData={
        size:10,
        lastCreatedAt:lastCreatedAt
      }
      console.log("Form data: " , formData)
      const response = await api.post('/notification',formData);
      setNotification(response.data)
    } catch (error) {
      console.log("Lỗi lấy notification")
    }
  }
  useFocusEffect(
    useCallback(() => {
      console.log("Quay lại màn hình Account -> Cập nhật danh sách bài viết");
      fetchNotification()
      // Gọi API để lấy danh sách bài viết mới nhất
    }, [])
  );
  const loadMore = () => {
    // if (hasMore && comments.length > 0) {
    //   const lastComment = comments[comments.length - 1];
    //   setLastCreatedAt(lastComment.createdAt);
    // }
  };
  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator size="small" color="gray" style={{ marginVertical: 10 }} />;
  };
  const renderData = ({ item }) => {
    return (
      <View>
        <TouchableOpacity style={styles.friendMessage} >
          <View style={styles.frameFriend}>
            <Image style={styles.avatarMess} source={{ uri: item.sender.avatar }} />
            <View style={styles.active}></View>
          </View>
          <View style={{ paddingLeft: 15,  width: '82%',justifyContent:'flex-start' }}>
            <View style={{flexDirection:'row'}}>
              <Text style={{flexWrap: 'wrap'}} >
                <Text style={styles.nameFriend}>{item.sender.fullName+ ' '}</Text>
                <Text style={[styles.texMessage,{ flexWrap: 'wrap' }]}>{item.contents}</Text>
              </Text>
            </View>
            <View>
              <Text style={{ fontWeight: 'bold' }}>{formatDistanceStrict(item.createdAt, new Date(), { locale: vi })}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  useEffect(() => {
    const socket = new SockJS(`${ENV.URL_SOCKET}`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/topic/notification/${user.id}`, (message) => {
          const newMessage = JSON.parse(message.body);
          console.log("Notification:",newMessage);
          setNotification((prevMessages) => [...prevMessages, newMessage]);
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
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thông báo</Text>
      </View>
      <FlatList
        data={notification}
        renderItem={renderData}
        keyExtractor={(item, index) => item.id}
        onEndReached={loadMore} // Khi cuộn đến cuối, gọi loadMore
        onEndReachedThreshold={0.5} // Ngưỡng kích hoạt loadMore
        ListFooterComponent={renderFooter} // Hiển thị loading
      />
    </View>
  )
}

export default Notification

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: "white"
  },
  title: {
    fontWeight: 'bold',
    fontSize: 23,
    paddingLeft: 5
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingTop: 10,
    paddingBottom: 20,
  },
  friendMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 8
  },
  nameFriend: {
    fontWeight: 'bold',

  },
  texMessage: {
    fontSize: 14,
  },
  frameFriend: {
    position: 'relative',
    width: 60,
    height: 60
  },
  avatarMess: {
    width: 60,
    height: 60,
    borderRadius: 10
  },
  active: {
    width: 18,
    height: 18,
    backgroundColor: 'green',
    borderRadius: 10,
    borderColor: 'white',
    borderWidth: 3,
    position: 'absolute',
    bottom: 0,
    right: 2,
  },
  btnConfirm:{
    padding:15,
    backgroundColor:COLORS.primary,
    borderRadius: 10,
    marginRight:15
  },
  btnReject:{
    padding:15,
    backgroundColor:COLORS.danger,
    borderRadius: 10,
  },
})