import { Client } from "@stomp/stompjs";
import axios from "axios";
import { formatDistanceStrict } from "date-fns";
import { vi } from "date-fns/locale";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import SockJS from "sockjs-client";
import { COLORS, ENV } from "../../contants/theme";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Button } from "react-native-paper";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as Clipboard from "expo-clipboard";
import { useAuth } from "./AuthProvider";
const CommentScreen = ({route } ) => {
    const { postId } = route.params; 
    const { user,api,getUserInfo,logout } = useAuth();
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState("");
    const [lastCreatedAt, setLastCreatedAt] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true); // Kiểm tra còn dữ liệu không
    const [replier, setReplier] = useState('');
    const [replierName, setReplierName] = useState('');
    const [parentId, setParentId] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [visibleReplies, setVisibleReplies] = useState({});
    const bottomSheetRef = useRef(null);
    const [commentFocus, setCommentsFocus] = useState('');
    const [showToast, setShowToast] = useState(false);
    const copyToClipboard = async (commentFocus) => {
        await Clipboard.setStringAsync(commentFocus.content);
        setShowToast(true);

        // Ẩn thông báo sau 1 giây
        setTimeout(() => {
            setShowToast(false);
        }, 500);
        bottomSheetRef.current?.close();
    };
    const checkLike = (list) => {
        const reactionSet=new Set(list);
        console.log("UsserId ",user.id," SET: " , reactionSet," List", list)
        console.log("Result",reactionSet.has(user.id));
        return reactionSet.has(user.id);
    }
    // SnapPoints: Điểm dừng của BottomSheet (có thể thay đổi)
    const snapPoints = useMemo(() => ["35%", "50%"], []);

    // Hàm mở BottomSheet khi click vào nút
    const handleOpenSheet = useCallback((item) => {
        setCommentsFocus(item)
        bottomSheetRef.current?.snapToIndex(0); // Hiển thị BottomSheet
    }, []);
    const handleCloseSheet = useCallback(() => {
        bottomSheetRef.current?.close(); // Đóng BottomSheet
    }, []);
    const inputRef = useRef(null); // Tạo ref cho TextInput
    const fetchComment = async () => {
        if (loading || !hasMore) return; // Ngăn gọi API liên tục
        setLoading(true);
        let formData = {
            postId: postId,
            sort: 0,
            lastCreatedAt: lastCreatedAt,
            size: 10,
            viewId: user.id
        };

        try {
            const response = await api.post(`/comment/get-comment`, formData);
            if (response.data.length === 0)
                setHasMore(false)
            else {
                setComments(prev => lastCreatedAt === '' ? response.data : [...prev, ...response.data]);
            }
        } catch (err) {
            console.error("Lỗi khi lấy comment:", err);
        } finally {
            setLoading(false);
        }
    };
    const handleReply = (comment) => {
        // setParentId(comment.parentId === null ? comment.id : comment.parentId); 
        setParentId(comment.parentId || comment.id)
        setReplier(comment.createdBy.id); // Gán replier
        setReplierName(comment.createdBy.fullName); // Gán replier
        setContent(comment.createdBy.fullName + " ")
        bottomSheetRef.current?.close();
        inputRef.current?.focus(); // Focus vào ô nhập
        
    };
    useEffect(() => {
        if (user.id) { // Chỉ gọi API khi user đã được set
            fetchComment();
        }
    }, [lastCreatedAt, user]);

    const loadMore = () => {
        if (hasMore && comments.length > 0) {
            const lastComment = comments[comments.length - 1];
            setLastCreatedAt(lastComment.createdAt);
        }
    };
    const sendLike = async (comment) => {
        try {
            let formData = {
                commentId: comment.id,
                createdBy: user.id,

            };
            const response = await api.post(`/comment/like`, formData);

            console.log("Like thành công");
        } catch (error) {

        }
        bottomSheetRef.current?.close();
    }
    const renderFooter = () => {
        if (!loading) return null;
        return <ActivityIndicator size="small" color="gray" style={{ marginVertical: 10 }} />;
    };
    const toggleReplyVisibility = (commentId) => {
        setVisibleReplies(prev => ({
            ...prev,
            [commentId]: !prev[commentId], // Chỉ thay đổi trạng thái của comment đó
        }));
    };
    const renderComment = ({ item }) => {
        const isChildVisible = visibleReplies[item.id] || false;
        return (
            <View style={{ padding: 10 }}>
                {/* Bình luận chính */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image source={{ uri: item.createdBy.avatar }} style={styles.avatarComment} />
                    <TouchableOpacity style={styles.comments} onLongPress={() => handleOpenSheet(item)}>
                        <View style={styles.contentComment}>
                            <Text style={{ fontWeight: "bold" }}>{item.createdBy.fullName}</Text>
                            <Text>
                                {item.replier && <Text style={{ fontWeight: 'bold' }}>{item.replier.fullName} </Text>}
                                {item.content}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Nút bấm & thông tin thêm */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 50, marginTop: 5 }}>
                    <TouchableOpacity style={{ paddingRight: 15 }}>
                        <Text>{formatDistanceStrict(item.createdAt, new Date(), { locale: vi })}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ paddingRight: 15 }} onPress={() => sendLike(item)}>
                        <Text style={checkLike(item.reaction) ? { color: "blue", fontWeight: 'bold' } : {}}>Thích</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleReply(item)}>
                        <Text>Phản hồi</Text>
                    </TouchableOpacity>

                    {item.reaction?.length > 0 && (
                        <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 10 }}>
                            <Text style={{ paddingRight: 5 }}>{item.reaction.length}</Text>
                            <Image source={require('../../assets/like.png')} style={{ width: 16, height: 16 }} />
                        </View>
                    )}
                </View>

                {/* Nút bấm "Xem X phản hồi" */}
                {item.child?.length > 0 && !isChildVisible && (
                    <TouchableOpacity onPress={() => toggleReplyVisibility(item.id)} style={{ marginLeft: 50, marginTop: 5 }}>
                        <Text >Xem {item.child.length} phản hồi</Text>
                    </TouchableOpacity>
                )}

                {/* Hiển thị danh sách comment con nếu isChildVisible */}
                {isChildVisible && item.child?.length > 0 && (
                    <View style={{ marginLeft: 50, marginTop: 5 }}>
                        <FlatList
                            data={item.child}
                            keyExtractor={(reply) => reply.id}
                            renderItem={renderComment}
                        />
                        {/* Nút "Ẩn phản hồi" */}
                        <TouchableOpacity onPress={() => toggleReplyVisibility(item.id)} style={{ marginTop: 5 }}>
                            <Text >Ẩn phản hồi</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };
    useEffect(() => {
        const socket = new SockJS(`${ENV.URL_SOCKET}`);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe(`/topic/post/${postId}`, (message) => {
                    const newComment = JSON.parse(message.body);
                    console.log("📩 Nhận comment mới:", newComment);
                    setComments((prev) => {
                        if (typeof newComment === "string") {
                            // Nếu nhận được một string, xóa comment có id tương ứng
                            return prev
                                .map((comment) => {
                                    if (comment.id === newComment) {
                                        return null; // Đánh dấu comment cần xóa
                                    }
                                    if (comment.child) {
                                        // Xóa comment con nếu nó bị xóa
                                        const updatedChildren = comment.child.filter(c => c.id !== newComment);
                                        return { ...comment, child: updatedChildren };
                                    }
                                    return comment;
                                })
                                .filter(Boolean); // Loại bỏ những comment bị null
                        } else {
                            if (!newComment.parentId) {
                                // Kiểm tra xem comment đã tồn tại chưa
                                const existingIndex = prev.findIndex(c => c.id === newComment.id);
                                if (existingIndex !== -1) {
                                    // Thay thế comment cũ bằng comment mới
                                    return prev.map((comment, index) =>
                                        index === existingIndex ? newComment : comment
                                    );
                                }
                                return [newComment, ...prev];
                            } else {
                                // Nếu có parentId, tìm comment cha
                                return prev.map((comment) => {
                                    if (comment.id === newComment.parentId) {
                                        const updatedChildren = comment.child ? [...comment.child] : [];
                
                                        // Kiểm tra xem comment con đã tồn tại chưa
                                        const existingChildIndex = updatedChildren.findIndex(c => c.id === newComment.id);
                                        if (existingChildIndex !== -1) {
                                            updatedChildren[existingChildIndex] = newComment;
                                        } else {
                                            updatedChildren.push(newComment);
                                        }
                
                                        return { ...comment, child: updatedChildren };
                                    }
                                    return comment;
                                });
                            }
                        }
                    });
                    
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

    const deleteComment = async(comment) => {
        try {
           
            const response = await axios.delete(`${ENV.API_URL}/comment/${comment.id}`, {
                headers: {
                    Authorization: `Bearer ${ENV.token}`,
                },
            });

            console.log("Xóa thành công");
        } catch (error) {
            console.log("Xóa lỗi");
        }
        bottomSheetRef.current?.close();
    }

    const sendComment = async () => {
        try {
            let formData = {
                content: content.startsWith(replierName) ? content.slice(replierName.length).trim() : content,
                parentId: parentId,
                postId: postId,
                type: 0,
                status: 1,
                replier: replier
            };

            const response = await api.post(`/comment`, formData);
            setContent("");
            setParentId("");
            setReplier("")
        } catch (error) {

        }
    }
    return (
        <GestureHandlerRootView >
            <View style={styles.container}>
                <FlatList
                    data={comments}
                    renderItem={renderComment}
                    keyExtractor={(item, index) => item.id}
                    onEndReached={loadMore} // Khi cuộn đến cuối, gọi loadMore
                    onEndReachedThreshold={0.5} // Ngưỡng kích hoạt loadMore
                    ListFooterComponent={renderFooter} // Hiển thị loading
                />
                <View style={{ flexDirection: "row", alignItems: "center", padding: 10, borderTopWidth: 1, borderColor: "#ddd" }}>
                    <TextInput
                        ref={inputRef}
                        value={content}
                        onChangeText={setContent}
                        placeholder="Viết bình luận..."
                        style={{ flex: 1, padding: 10, borderWidth: 1, borderColor: "#ddd", borderRadius: 20 }}
                    />
                    <TouchableOpacity onPress={sendComment} style={{ marginLeft: 10 }}>
                        <AntDesign name="arrowright" size={24} color="blue" />
                    </TouchableOpacity>
                </View>
                {/* BottomSheet */}
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
                            <TouchableOpacity style={styles.icon} onPress={() => handleReply(commentFocus)} >
                                <FontAwesome name="comment-o" size={24} color="black" />
                                <Text style={styles.textIcon}>Trả lời</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.icon} onPress={() => copyToClipboard(commentFocus)}>
                                <AntDesign name="copy1" size={24} color="black" />
                                <Text style={styles.textIcon}>Sao chép</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.icon} onPress={()=>deleteComment(commentFocus)}>
                                <AntDesign name="delete" size={24} color="black" />
                                <Text style={styles.textIcon}>Xóa</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.icon}>
                                <FontAwesome name="pencil" size={24} color="black" />
                                <Text style={styles.textIcon}>Chỉnh sửa</Text>
                            </TouchableOpacity>
                        </View>
                    </BottomSheetView>
                </BottomSheet>
                {showToast && (
                    <View style={styles.toast}>
                        <Text style={styles.toastText}>Đã sao chép!</Text>
                    </View>
                )}
            </View>
        </GestureHandlerRootView>
    );
};

export default CommentScreen;

const styles = StyleSheet.create({
    avatarComment: {
        width: 50,
        height: 50,
        borderRadius: 30
    },
    comments: {
        marginLeft: 10,
    },
    contentComment: {
        padding: 10,
        backgroundColor: COLORS.gray,
        borderRadius: 15
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
    toast: {
        position: "absolute",
        bottom: 50,
        alignSelf: "center",
        backgroundColor: "black",
        padding: 10,
        borderRadius: 5,
        opacity: 0.8,
      },
      toastText: {
        color: "white",
      },
    container: { 
        flex: 1,
        paddingTop:30,
        paddingBottom:10
    },

});
