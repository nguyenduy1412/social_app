import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Icon from "react-native-vector-icons/Ionicons";
import { FlatList } from 'react-native-gesture-handler';
import { ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../component/AuthProvider';
import { format } from 'date-fns';
import { FRIEND_STATUS } from '../../contants/theme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
const Message = () => {
    const [loading, setLoading] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [toaDo, setToaDo] = useState(200);
    const { api,user, getUserInfo, logout } = useAuth();
    const navigation = useNavigation();
    const [friendChat, setFriendChat] = useState([]);
    const [friend, setFriend] = useState([]);
    const [page, setPage] = useState(0);
    const fetchFriend = async () => {
        let formData = {
            page: 0,
            size: 10,
            status: FRIEND_STATUS.FRIEND
        };
        console.log("Ú")
        try {
            const response = await api.post(`/friends/getFriend/${user.id}`, formData)
            setFriend(response.data.list)
        } catch (err) {
            console.error("Lỗi khi lấy friend:", err);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchFriend();
            fetchFriendChat();
        }, [])
    );
    useEffect(() => {
        fetchFriendChat();
    }, [page]);
    const fetchFriendChat = async () => {
        try {
            const response = await api.post('/chat/get-friend',
                {
                    size: 10,
                    page: 0,
                }
            );
            setFriendChat(response.data);

        } catch (err) {
            console.error("Lỗi khi gọi API:", err);
        }
    };
    useEffect(() => {
        fetchFriendChat();
    }, [page]);
    const scrollViewRef = useRef(null);
    const handleScroll = (event) => {
        const yOffset = event.nativeEvent.contentOffset.y;
        // console.log(yOffset)
        // Hiển thị hoặc ẩn nút dựa trên điều kiện cuộn
        setShowScrollButton(yOffset > 200); // Thay đổi 200 thành giá trị phù hợp với yêu cầu của bạn
        if (yOffset > toaDo) {
            setToaDo(yOffset + 400)
            if (page < totalPage) {
                setLoad(true)

            }
        }
    };
    const handChatMessage = async (item) => {  // 🔹 Thêm 'async'
        try {
            const response = await api.get(`/room/${item.id}`);  // 🔹 Thêm 'await'
            // Kiểm tra response trả về
            console.log("Room Data: ", response.data);  
            // Chuyển trang sau khi lấy dữ liệu thành công
            navigation.navigate('ChatMessage', { roomId: response.data.id, friend: item });
        } catch (error) {
            console.log("Lỗi lấy roomId: ", error);
        }
    };
    const renderFriend = ({ item }) => {

        return (
            <TouchableOpacity style={styles.friendMessage} onPress={
                () => navigation.navigate('ChatMessage', { roomId: item.room.id, friend: item.friend })
            }>
                <View style={styles.frameFriend}>
                    <Image style={styles.avatarMess} source={{ uri: item.friend.avatar }} />
                    <View style={styles.active}></View>
                </View>
                <View >
                    <Text style={styles.nameFriend}>{item.friend.fullName}</Text>
                    {item.createdBy.id === user.id ? (
                        <Text style={styles.texMessage}>Bạn: {item.messages}  <Text style={{ fontWeight: 'bold' }}>{format(new Date(item.createdAt), "HH:mm")}</Text>  </Text>
                    ) : (
                        <Text style={styles.texMessage}>{item.messages}  <Text style={{ fontWeight: 'bold' }}>{format(new Date(item.createdAt), "HH:mm")}</Text>  </Text>
                    )}

                </View>
            </TouchableOpacity>
        )
    };
    const loadMore = () => {
        // if (hasMore && comments.length > 0) {
        //     const lastComment = comments[comments.length - 1];
        //     setLastCreatedAt(lastComment.createdAt);
        // }
    };
    const renderFooter = () => {
        if (!loading) return null;
        return <ActivityIndicator size="small" color="gray" style={{ marginVertical: 10 }} />;
    };
    return (
        <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Tin nhắn</Text>
        </View>
    
        <FlatList
            data={friendChat}
            renderItem={renderFriend}
            keyExtractor={(item) => item.room.id}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListHeaderComponent={() => (
                <ScrollView
                    horizontal
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                    showsHorizontalScrollIndicator={false}
                    style={{ height: 100 }}
                >
                    {friend.map((item, index) => (
                        <TouchableOpacity key={index} onPress={() => handChatMessage(item.friend)}>
                        <View style={styles.frameFriend} >
                            <Image
                                style={styles.avatarMess}
                                source={{ uri: item.friend.avatar }}
                            />
                            <View style={styles.active}></View>
                            <Text style={{ textAlign: 'center' }}>
                                {item.friend.fullName.split(" ").pop()}
                            </Text>
                        </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        />
    </View>


    )
}

export default Message

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
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
    frameFriend: {
        position: 'relative',
        width: 60,
        height: 60,
        marginRight:15
    },
    avatarMess: {
        width: 60,
        height: 60,
        borderRadius: 50
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
    friendMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 8
    },
    nameFriend: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    texMessage: {
        fontSize: 14,
    }
})