import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { COLORS } from '../../contants'
import { ENV, FRIEND_STATUS } from '../../contants/theme'
import Icon from "react-native-vector-icons/Ionicons";
import { FlatList } from 'react-native-gesture-handler';
import { vi } from 'date-fns/locale';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { formatDistanceStrict } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../component/AuthProvider';
import { fetchFriend } from '../service/AccountService';
const RequestFriend = () => {
    const { user,api,getUserInfo } = useAuth();
    const [requestFriends, setRequestFriends] = useState([]);
    const [reset, setReset] = useState(false);
    const [content, setContent] = useState('');
    const [page, setPage] = useState(0);
    const [requestIds, setRequestIds] = useState({});
    const [sentRequests, setSentRequests] = useState({});
    const navigation = useNavigation();
    
    useFocusEffect(
        useCallback(() => {
          const loadData = async () => {
            try {
              if(api !==null){
                const friendInvitation = await fetchFriend(user.id,api,page,FRIEND_STATUS.INVITATION,10);
                setRequestFriends(friendInvitation);
                
              }
            } catch (error) {
              console.error('Lỗi khi tải dữ liệu:', error);
            }
          };
          loadData();
        }, [])
      );
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
    const changeRequest = async (id,status,friendId) => {
        let formData = {
            id: id,
            status: status,
            friendId: friendId
        };
        console.log(formData);
        try {
            const response = await api.patch(`/friends`, formData)
            setSentRequests((prev) => ({
                ...prev,
                [friendId]: status === FRIEND_STATUS.CANCEL ? false :true,
            }));
        } catch (err) {
            console.error("Lỗi khi gửi kết bạn: ", err);
        }
    }
    const renderData = ({ item }) => {
        console.log(item);
        return (
            <TouchableOpacity style={styles.invitation}>
                <Image source={{ uri: item.friend.avatar }} style={styles.avatarFriend} />
                <View >
                    <View style={styles.headerFriendName}>
                        <Text style={styles.friendName}>{item.friend.fullName}</Text>
                        <Text>{formatDistanceStrict(item.createdAt, new Date(), { locale: vi })}</Text>
                    </View>
                    {sentRequests[item.friend.id] ? (
                        <View >
                            <Text style={[styles.friendName, { fontSize: 15, paddingVertical: 5 }]}>Các bạn đã là bạn bè</Text>
                        </View>
                    ) : (
                        <View style={styles.btnFriend}>
                            <TouchableOpacity style={styles.btnConfirm} onPress={() => changeRequest(item.id, FRIEND_STATUS.FRIEND, item.friend.id)} >
                                <Text style={styles.confirm}>Xác nhận</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnDelete} onPress={() => changeRequest(item.id, FRIEND_STATUS.REJECT, item.friend.id)} >
                                <Text style={styles.h2}>Xóa</Text>
                            </TouchableOpacity>
                        </View>
                    )
                    }
                </View>
            </TouchableOpacity>
        )
    };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name='arrow-back-outline' size={30} color={"black"} />
                </TouchableOpacity>

                <Text style={styles.title}>Lời mời kết bạn</Text>
            </View>
            <Text style={styles.h2}>{requestFriends.length > 0 ? `Lời mời kết bạn (${requestFriends.length})` : ''}</Text>
            <View >
                <FlatList
                    data={requestFriends}
                    renderItem={renderData}
                    keyExtractor={(item, index) => item.id}
                    onEndReached={loadMore} // Khi cuộn đến cuối, gọi loadMore
                    onEndReachedThreshold={0.5} // Ngưỡng kích hoạt loadMore
                    ListFooterComponent={renderFooter} // Hiển thị loading
                />
            </View>

        </View>
    )
}

export default RequestFriend
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
        paddingTop: 40,
        paddingBottom: 20,
    },
    h2: {
        fontWeight: 'bold',
        fontSize: 18
    },
    avatarFriend: {
        width: 90,
        height: 90,
        borderRadius: 15,
        marginRight: 10
    },
    friendName: {
        fontSize: 18,
        fontWeight: '400',
    },
    confirm: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'white'
    },
    btnConfirm: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingHorizontal: 25,
        paddingVertical: 8,
        marginRight: 20
    },
    btnDelete: {
        backgroundColor: COLORS.gray,
        borderRadius: 10,
        paddingHorizontal: 50,
        paddingVertical: 8
    },
    btnFriend: {
        flexDirection: "row",
        justifyContent: 'space-between',
        paddingTop: 10,
    },
    invitation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 10
    },
    headerFriendName: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      
    },
    textInput: {
        backgroundColor: COLORS.gray,
        borderRadius: 20,
        width: '90%',
        paddingHorizontal: 20
    },
    search: {
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: 'center',
        paddingBottom: 10,
    }
})