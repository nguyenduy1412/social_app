import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Icon from "react-native-vector-icons/Ionicons";
import { COLORS } from '../../contants';
import { ENV, FRIEND_STATUS } from '../../contants/theme';
import { formatDistanceStrict } from 'date-fns';
import axios from 'axios';
import { FlatList } from 'react-native-gesture-handler';
import { vi } from 'date-fns/locale';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../component/AuthProvider';
import { ScrollView } from 'react-native'
import { fetchFriend } from '../service/AccountService';
const Friendship = ({ navigation }) => {
    const { user, api, getUserInfo } = useAuth();
    const [requestFriends, setRequestFriends] = useState([]);
    const [suggest, setSuggest] = useState([]);
    const [sentRequests, setSentRequests] = useState({});
    const [requestIds, setRequestIds] = useState({});
    
    // const navigation = useNavigation();
    const [page, setPage] = useState(0);
   
    useFocusEffect(
        useCallback(() => {
          const loadData = async () => {
            try {
              if(api !==null){
                const friendInvitation = await fetchFriend(user.id,api,page,FRIEND_STATUS.INVITATION,10);
                setRequestFriends(friendInvitation);
                const friendNoFriend = await fetchFriend(user.id,api,page,FRIEND_STATUS.NO_FRIEND,10);
                setSuggest(friendNoFriend);
              }   
            } catch (error) {
              console.error('Lỗi khi tải dữ liệu:', error);
            }
          };
          loadData();
        }, [])
      );
    
    const renderSuggest = ({ item, index }) => {

        return (
            <View>
                {
                    index === 0 ? (<Text style={styles.h2}>Những người bạn có thể biết</Text>) : (<View></View>)
                }
                <TouchableOpacity style={styles.invitation} onPress={() => {
                    navigation.navigate('Account',{friendId:item.friend.id});
                }} >
                    <Image source={{ uri: item.friend.avatar }} style={styles.avatarFriend} />
                    <View style={{ width: '72%' }}>
                        <View style={styles.headerFriendName}>
                            <Text style={styles.friendName}>{item.friend.fullName}</Text>
                        </View>
                        {sentRequests[item.friend.id] ? (
                            <View>
                                <Text style={[styles.friendName, { fontSize: 15, paddingVertical: 5 }]}>Đã gửi lời mời</Text>
                                <TouchableOpacity style={styles.btnCancel} onPress={() => changeRequest(requestIds[item.friend.id], FRIEND_STATUS.CANCEL, item.friend.id)}>
                                    <Text style={[styles.h2, { textAlign: 'center' }]}>Hủy lời mời</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.btnFriend}>
                                <TouchableOpacity style={styles.btnConfirm} onPress={() => addFriend(item.id)}>
                                    <Text style={styles.confirm}>Thêm bạn</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnDelete} onPress={() => changeRequest(1, FRIEND_STATUS.NOT_SUGGESTED, item.friend.id)}>
                                    <Text style={styles.h2}>Gỡ</Text>
                                </TouchableOpacity>
                            </View>
                        )}


                    </View>
                </TouchableOpacity>
            </View>

        )
    };
    const renderRequest = ({ item }) => {

        return (
            <TouchableOpacity style={styles.invitation} onPress={() => {
                navigation.navigate('Account',{friendId:item.friend.id});
            }}>
                <Image source={{ uri: item.friend.avatar }} style={styles.avatarFriend} />
                <View style={sentRequests[item.friend.id] ? styles.width72 :''} >
                    <View style={styles.headerFriendName}>
                        <Text style={styles.friendName}>{item.friend.fullName}</Text>
                        <Text>{sentRequests[item.friend.id] ? '':  formatDistanceStrict(item.createdAt, new Date(), { locale: vi })}</Text>
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
    const addFriend = async (friendId) => {
        let formData = {
            friendId: friendId,
        };
        console.log(formData);
        try {
            const response = await api.post(`/friends`, formData)
            setSentRequests((prev) => ({
                ...prev,
                [friendId]: true, // Đánh dấu user đã được gửi lời mời
            }));
            setRequestIds((prev) => ({
                ...prev,
                [friendId]: response.data.id, // lưu friendId lại
            }));
        } catch (err) {
            console.error("Lỗi khi gửi kết bạn:", err);
        }
    }
    const changeRequest = async (id, status, friendId) => {
        let formData = {
            id: id,
            status: status,
            friendId: friendId
        };
        console.log(formData);
        try {
            const response = await api.patch(`/friends`, formData)
            if (status === FRIEND_STATUS.NOT_SUGGESTED ) {
                setSuggest(prev => prev.filter(item => item.friend.id !== friendId))
            }
            else if (status === FRIEND_STATUS.REJECT ) {
                setRequestFriends(prev => prev.filter(item => item.friend.id !== friendId))
            }
            else{
                // nếu hủy lời mời
                setSentRequests((prev) => ({
                    ...prev,
                    [friendId]: status === FRIEND_STATUS.CANCEL ? false :true,
                }));
            }
            // nếu chấp nhận kết bạn
        } catch (err) {
            console.error("Lỗi khi gửi kết bạn:", err);
        }
    }
    return (
        <View style={styles.container}>
            {/* Header không cuộn */}
            <View style={styles.header}>
                <Text style={styles.title}>Bạn bè</Text>
                <Icon name="search" size={30} color={"black"} />
            </View>

            {/* Nút điều hướng không cuộn */}
            <View style={{ flexDirection: "row" }}>
                <TouchableOpacity style={styles.btnRequest} onPress={() => navigation.navigate("RequestFriend")}>
                    <Text style={styles.h2}>Lời mời kết bạn</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnRequest} onPress={() => navigation.navigate("Friend")}>
                    <Text style={styles.h2}>Bạn bè</Text>
                </TouchableOpacity>
            </View>

            {/* Danh sách lời mời kết bạn - Không cuộn */}
            <FlatList
                data={suggest} // Chỉ danh sách gợi ý bạn bè có thể cuộn
                renderItem={renderSuggest}
                keyExtractor={(item) => item.id}
                onEndReached={loadMore} // Load thêm dữ liệu khi cuộn đến cuối
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter} // Hiển thị loading khi tải thêm
                ListHeaderComponent={() => (
                    requestFriends.length > 0 ? (
                        <View>
                            <Text style={styles.h2}>{`Lời mời kết bạn (${requestFriends.length})`}</Text>
                            <FlatList
                                data={requestFriends}
                                renderItem={renderRequest}
                                keyExtractor={(item) => item.id.toString()}
                            />
                        </View>
                    ) : null
                )}
            />
        </View>

    )
}

export default Friendship

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 15,
        backgroundColor: "white"
    },
    title: {
        fontWeight: 'bold',
        fontSize: 25
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 10
    },
    h2: {
        fontWeight: 'bold',
        fontSize: 18
    },
    avatarFriend: {
        width: 90,
        height: 90,
        borderRadius: 15
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
    btnCancel: {
        backgroundColor: COLORS.gray,
        borderRadius: 10,
        paddingHorizontal: 50,
        paddingVertical: 8,
        width: '100%'
    },
    btnFriend: {
        flexDirection: "row",
        justifyContent: 'space-between',
        paddingTop: 10
    },
    invitation: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        justifyContent: 'space-between'
    },
    headerFriendName: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    btnRequest: {
        backgroundColor: COLORS.gray,
        borderRadius: 20,
        padding: 10,
        marginRight: 15
    },
    width72:{
        width:'72%'
    }
})