
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, StyleSheet, Image } from "react-native";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useAuth } from "../component/AuthProvider";
import { getLocation } from "../service/LocationService";
import { fetchNearbyFriends, searchFriend } from "../service/FriendService";
import Icon from "react-native-vector-icons/Ionicons";
import { TextInput } from "react-native";
import { COLORS } from "../../contants";
import { FRIEND_STATUS } from "../../contants/theme";
import { it } from "date-fns/locale";


const SearchFriend = () => {
    const { user, api, getUserInfo, logout } = useAuth();
    const navigation = useNavigation();
    const [location, setLocation] = useState(null);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyWord] = useState('');
    const [sentRequests, setSentRequests] = useState({});
    const [requestIds, setRequestIds] = useState({});
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    // Lấy vị trí hiện tại
    // useEffect(() => {
    //     const loadData = async () => {
    //         if (api !== null) {
    //             console.log("Hú")
    //             let location = await getLocation();
    //             const dataLocation = await fetchNearbyFriends(location.coords.latitude, location.coords.longitude, api)
    //             setFriends(dataLocation)
    //             console.log("data", dataLocation);
    //         }
    //     };
    //     loadData();
    // }, []);
    const getFriendLocation = async () => {
        if (api !== null) {
            console.log("Hú")
            setLoading(true)
            let location = await getLocation();
            const dataLocation = await fetchNearbyFriends(location.coords.latitude, location.coords.longitude, api)
            setFriends(dataLocation)
            setLoading(false)
            console.log("data", dataLocation);
        }
    }
    const addFriend = async (friend) => {
        let formData = {
            friendId: friend.id,
        };
        console.log(formData);
        try {
            const response = await api.post(`/friends`, formData)
            setFriends(prev => {
                const updatedFriends = prev.map(f =>
                    f.id === friend.id ? { ...f, status: FRIEND_STATUS.APPROVED } : f
                );
                return updatedFriends;
            });
        } catch (err) {
            console.error("Lỗi khi gửi kết bạn:", err);
        }
    }
    const handleSearch = async () => {
        if (api !== null) {
            const friendData = await searchFriend(page, size, keyword, api);
            console.log(friendData);
            setFriends(friendData)
        }
    }
    const changeRequest = async (id, status, friend) => {
        let formData = {
            id: id,
            status: status,
            friendId: friend.id
        };
        console.log(formData);
        try {
            const response = await api.patch(`/friends`, formData)

            // nếu hủy lời mời thì ở trạng thái thêm bạn
            if (status === FRIEND_STATUS.CANCEL)
                setFriends(prev => {
                    const updatedFriends = prev.map(f =>
                        f.id === friend.id ? { ...f, status: 5 } : f
                    );
                    return updatedFriends;
                });
            // nếu ở trạng thái chấp nhận lời mời    
            else if (status === FRIEND_STATUS.FRIEND)
                setFriends(prev => {
                    const updatedFriends = prev.map(f =>
                        f.id === friend.id ? { ...f, status: FRIEND_STATUS.FRIEND } : f
                    );
                    return updatedFriends;
                });

        } catch (err) {
            console.error("Lỗi khi gửi kết bạn:", err);
        }
    }
    const renderData = ({ item }) => {

        return (
            <TouchableOpacity style={styles.invitation} onPress={() => {
                navigation.navigate('Account', { friendId: item.id });
            }} >
                <TouchableOpacity onPress={() => {
                    navigation.navigate('Account', { friendId: item.id });
                }}>
                    <Image source={{ uri: item.avatar }} style={styles.avatarFriend} />
                </TouchableOpacity>

                <View style={{ width: '72%' }}>
                    <View style={styles.headerFriendName}>
                        <Text style={styles.friendName}>{item.fullName}</Text>
                    </View>
                    {(() => {
                        if (item.status === FRIEND_STATUS.FRIEND) {
                            return (
                                <TouchableOpacity style={styles.btnFriend}>
                                    <TouchableOpacity style={styles.btnConfirm} >
                                        <Text style={styles.confirm}>Bạn bè</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            )

                        } else if (item.status === FRIEND_STATUS.APPROVED) {
                            return (
                                <View style={styles.btnFriend}>
                                    <TouchableOpacity style={styles.btnCancel} onPress={() => changeRequest(1, FRIEND_STATUS.CANCEL, item)}>
                                        <Text style={styles.confirm}>Hủy lời mời</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        } else if (item.status === FRIEND_STATUS.INVITATION) {
                            return (
                                <View style={styles.btnFriend}>
                                    <TouchableOpacity style={styles.btnConfirm} onPress={() => changeRequest(1, FRIEND_STATUS.FRIEND, item)}>
                                        <Text style={styles.confirm}>Chấp nhận</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        } else {
                            return (
                                <View style={styles.btnFriend}>
                                    <TouchableOpacity style={styles.btnConfirm} onPress={() => addFriend(item)}>
                                        <Text style={styles.confirm}>Thêm bạn</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    })()}

                </View>
            </TouchableOpacity>
        );
    };

    //   if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

    return (
        <View style={{ flex: 1, padding: 15 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={()=>navigation.goBack()}>
                    <Icon name="chevron-back-outline" size={30} color="black" />
                </TouchableOpacity>
                
                <TextInput
                    placeholder="Tìm kiếm"
                    style={styles.input}
                    value={keyword}
                    onChangeText={(text) => setKeyWord(text)}
                />
                <TouchableOpacity onPress={() => handleSearch()}>
                    <Icon name="search-outline" size={30} color="black" />
                </TouchableOpacity>
            </View>
            { loading ? (
                <ActivityIndicator size="small" color="gray" style={{ marginVertical: 10 }} />
            ):(
                <FlatList
                data={friends}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderData}
                ListHeaderComponent={
                    <TouchableOpacity style={styles.btnLocation} onPress={()=>getFriendLocation()}>
                        <Text style={{ textAlign: 'center', fontWeight: 'bold', color: 'white' }}>Tìm kiếm những người bạn quanh đây (1km)</Text>
                    </TouchableOpacity>
                }
                />
            )}
            
        </View>
    );
};

export default SearchFriend;
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20
    },
    input: {
        padding: 10,
        paddingLeft: 20,
        backgroundColor: COLORS.gray,
        borderRadius: 20,
        width: '70%'
    },
    avatarFriend: {
        width: 80,
        height: 80,
        borderRadius: 15
    },
    friendName: {
        fontSize: 18,
        fontWeight: '400',
    },
    confirm: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'white',
        textAlign: 'center'
    },
    btnConfirm: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingHorizontal: 25,
        paddingVertical: 8,

        width: '60%',
    },
    btnCancel: {
        backgroundColor: COLORS.danger,
        borderRadius: 10,
        paddingHorizontal: 25,
        paddingVertical: 8,
        width: '60%',
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
    width72: {
        width: '72%'
    },
    h2: {
        fontWeight: 'bold',
        fontSize: 18
    },
    btnLocation: {
        marginTop: 5,
        paddingVertical: 15,
        backgroundColor: '#45BD62',
        borderRadius: 10
    }
})