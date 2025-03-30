import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { COLORS } from '../../contants'
import { ENV, FRIEND_STATUS } from '../../contants/theme'
import Icon from "react-native-vector-icons/Ionicons";
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import { vi } from 'date-fns/locale';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../component/AuthProvider';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import validate from './../../utils/Validate';
const Friend = () => {
    const [friend, setFriend] = useState([]);
    const [page, setPage] = useState(0);
    const [reset, setReset] = useState(false);
    const [content, setContent] = useState('');
    const { user, api, getUserInfo } = useAuth();
    const bottomSheetRef = useRef(null);
    const [friendFocus, setFriendFocus] = useState(null);
    // SnapPoints: Điểm dừng của BottomSheet (có thể thay đổi)
    const snapPoints = useMemo(() => ["35%", "50%"], []);
    const navigation = useNavigation();
    const fetchFriend = async (status) => {
        let formData = {
            page: page,
            size: 10,
            status: status
        };
        try {
            const response = await api.post(`/friends/getFriend/${user.id}`, formData)
            if (status === null) {
                setSuggest(response.data.list);
            } else if (status === FRIEND_STATUS.APPROVED) {
                // LỜI MỜI KẾT BẠN
                setRequestFriends(response.data.list);
            } else if (status === FRIEND_STATUS.FRIEND) {
                // BẠN BÈ
                setFriend(response.data.list);
                console.log(response.data.list);
            }

        } catch (err) {
            console.error("Lỗi khi lấy user:", err);
        }
    };
    const handleOpenSheet = useCallback((item) => {
        setFriendFocus(item);
        bottomSheetRef.current?.snapToIndex(0); // Hiển thị BottomSheet
    }, []);
    useEffect(() => {
        fetchFriend(FRIEND_STATUS.FRIEND)
        console.log("Alo")
    }, [reset]);
    const renderFriend = ({ item }) => {

        return (
            <TouchableOpacity style={styles.invitation} onPress={() => {
                navigation.navigate('Account', { friendId: item.friend.id });
            }}>
                <Image source={{ uri: item.friend.avatar }} style={styles.avatarFriend} />
                <View >
                    <View style={styles.headerFriendName}>
                        <Text style={styles.friendName}>{item.friend.fullName}</Text>
                        <TouchableOpacity onPress={() => handleOpenSheet(item)}>
                            <Icon name='ellipsis-horizontal' size={30} color={"black"} />
                        </TouchableOpacity>
                    </View>
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
    const changeRequest = async (id, status, friendId) => {
        let formData = {
            id: id,
            status: status,
            friendId: friendId
        };
        console.log(formData);
        try {
            const response = await api.patch(`/friends`, formData)
            setFriend(prev => prev.filter(item => item.id !== id))
            console.log("Hủy thafh công");
        } catch (err) {
            console.error("Lỗi khi gửi kết bạn:", err);
        }
        bottomSheetRef.current?.close();
    }
    return (
        <GestureHandlerRootView >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name='arrow-back-outline' size={30} color={"black"} />
                    </TouchableOpacity>

                    <Text style={styles.title}>Bạn bè</Text>
                </View>
                <View style={styles.search}>
                    <TextInput placeholder='Tìm kiếm bạn bè'
                        style={styles.textInput}
                        textAlignVertical="top"
                        value={content}
                        onChangeText={(text) => setContent(text)}
                    />
                    <Icon name='search' size={30} color={"black"} />
                </View>

                <View >

                    <Text style={styles.h2}>{friend.length > 0 ? `${friend.length} người bạn` : ''}</Text>
                    <View >
                        <FlatList
                            data={friend}
                            renderItem={renderFriend}
                            keyExtractor={(item, index) => item.id}
                            onEndReached={loadMore} // Khi cuộn đến cuối, gọi loadMore
                            onEndReachedThreshold={0.5} // Ngưỡng kích hoạt loadMore
                            ListFooterComponent={renderFooter} // Hiển thị loading
                        />
                    </View>
                </View>
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1} // Ẩn khi bắt đầu
                    snapPoints={snapPoints}
                    enablePanDownToClose={true} // Vuốt xuống để đóng
                    backdropComponent={(props) => (
                        <BottomSheetBackdrop
                            {...props}
                            disappearsOnIndex={-1} // Khi đóng thì backdrop biến mất
                            appearsOnIndex={0} // Khi mở thì backdrop xuất hiện
                            pressBehavior="close" // Click nền đóng BottomSheet
                        />
                    )}
                >
                    <BottomSheetView >
                        <View style={styles.containerIcon}>
                            {friendFocus !== null && (
                                <View style={styles.friendMessage} >
                                    <View style={styles.frameFriend}>
                                        <Image style={styles.avatarMess} source={{ uri: friendFocus.friend.avatar }} />
                                        <View style={styles.active}></View>
                                    </View>
                                    <View style={{ paddingLeft: 15 }}>
                                        <Text style={styles.nameFriend}>{friendFocus.friend.fullName}</Text>
                                        <Text>{validate.getTimeFriend(friendFocus.createdAt)}</Text>
                                    </View>
                                </View>
                            )}
                            <TouchableOpacity style={styles.icon}  >
                                <FontAwesome name="comment" size={24} color="black" />
                                <Text style={styles.textIcon}>Nhắn tin</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.icon} onPress={() => changeRequest(friendFocus.id, FRIEND_STATUS.REJECT, friendFocus.friend.id)} >
                                <Image source={require('../../assets/delete-friend.png')} style={styles.iconImg} />
                                <Text style={styles.textIcon}>Hủy kết bạn</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.icon} onPress={() => changeRequest(friendFocus.id, FRIEND_STATUS.BLOCK, friendFocus.friend.id)} >
                                <Image source={require('../../assets/block-user.png')} style={styles.iconImg} />
                                <Text style={styles.textIcon}>Chặn</Text>
                            </TouchableOpacity>
                        </View>
                    </BottomSheetView>
                </BottomSheet>
            </View>
        </GestureHandlerRootView>
    )
}

export default Friend

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
        paddingTop: 10
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
        width: '85%'
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
    },
    containerIcon: {
        paddingHorizontal: 20,
        paddingVertical: 20
    },
    icon: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10
    },
    textIcon: {
        paddingLeft: 10
    },
    iconImg: {
        width: 30,
        height: 30
    },
    friendMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 8,
        borderBottomWidth: 1,  // Độ dày của đường viền
        borderBottomColor: '#ccc',
    },
    nameFriend: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    texMessage: {
        fontSize: 14,
    },
    frameFriend: {
        position: 'relative',
        width: 50,
        height: 50
    },
    avatarMess: {
        width: 50,
        height: 50,
        borderRadius: 50
    },
})