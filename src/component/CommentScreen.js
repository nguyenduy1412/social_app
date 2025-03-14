import React, { useEffect, useRef, useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { COLORS, ENV } from "../../contants/theme";
import { formatDistanceStrict } from "date-fns";
import { vi } from "date-fns/locale";
import axios from "axios";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const CommentScreen = () => {
    const postId = "25069012836627934745232636990205";
    const [user, setUser] = useState('')
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState("");
    const [lastCreatedAt, setLastCreatedAt] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true); // Kiểm tra còn dữ liệu không
    const [replier, setReplier] = useState('');
    const [replierName, setReplierName] = useState('');
    const [parentId, setParentId] = useState('');
    const [stompClient, setStompClient] = useState(null);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${ENV.API_URL}/user/get-current-user`, {
                    headers: {
                        Authorization: `Bearer ${ENV.token}`,
                    },
                })
                setUser(response.data);
            } catch (err) {
                console.error("Lỗi khi lấy user:", err);
            }
        };
        fetchUser();
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
        console.log("formData", formData);
        try {
            const response = await axios.post(`${ENV.API_URL}/comment/get-comment`, formData);
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
        inputRef.current?.focus(); // Focus vào ô nhập
    };
    useEffect(() => {
        if (user.id) { // Chỉ gọi API khi user đã được set
            fetchComment();
        }
    }, [lastCreatedAt,user]);

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
            const response = await axios.post(`${ENV.API_URL}/comment/like`, formData, {
                headers: {
                    Authorization: `Bearer ${ENV.token}`,
                },
            });
            setComments(prevComments =>
                prevComments.map(c =>
                    c.id === comment.id
                        ? { ...c, liked: !c.liked, reactionCount: c.liked ? c.reactionCount - 1 : c.reactionCount + 1 }
                        : c
                )
            );        
            console.log("Like thành công");
        } catch (error) {

        }
    }
    const renderFooter = () => {
        if (!loading) return null;
        return <ActivityIndicator size="small" color="gray" style={{ marginVertical: 10 }} />;
    };

    const renderComment = ({ item }) => (
        <View style={{ padding: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image source={{ uri: item.createdBy.avatar }} style={styles.avatarComment} />
                <View style={styles.comments}>
                    <View style={styles.contentComment}>
                        <Text style={{ fontWeight: "bold" }}>{item.createdBy.fullName}</Text>
                        <Text><Text style={{ fontWeight: 'bold' }}>{item.replier !== null ? item.replier.fullName : ''}</Text> {item.content}</Text>
                    </View>
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 60 }}>
                <View style={{ flexDirection: "row", marginTop: 5 }}>
                    <TouchableOpacity style={{ paddingRight: 15 }}>
                        <Text>{formatDistanceStrict(item.createdAt, new Date(), { locale: vi })}</Text>
                    </TouchableOpacity>
                    {item.liked ? (
                        <TouchableOpacity style={{ paddingRight: 15 }} onPress={() => sendLike(item)}>
                            <Text style={{color:COLORS.primary,fontWeight:'bold'}}>Thích</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={{ paddingRight: 15 }} onPress={() => sendLike(item)}>
                            <Text>Thích</Text>
                        </TouchableOpacity>
                    )}
                   
                    <TouchableOpacity onPress={() => handleReply(item)}>
                        <Text>Trả lời</Text>
                    </TouchableOpacity>
                </View>
                {item.reaction?.length > 0 && (
                    <View style={{ marginTop: 5, flexDirection: "row" }}>
                        <Text style={{ paddingRight: 5 }}>{item.reaction.length}</Text>
                        <Image source={require('../../assets/like.png')} style={{ width: 20, height: 20 }} />
                    </View>
                )}
            </View>
            {item.child?.length > 0 && (
                <View style={{ marginLeft: 50, marginTop: 5 }}>
                    {item.child.map((reply) => renderComment({ item: reply }))}
                </View>
            )}
        </View>
    );
    useEffect(() => {
        const socket = new SockJS(`${ENV.URL_SOCKET}`);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log("🔗 Kết nối WebSocket thành công!");
                client.subscribe(`/topic/post/${postId}`, (message) => {
                    const newComment = JSON.parse(message.body);
                    console.log("📩 Nhận comment mới:", newComment);

                    setComments((prev) => {
                        if (!newComment.parentId) {
                            // Nếu không có parentId, đây là comment cấp 1
                            return [newComment, ...prev];
                        } else {
                            // Nếu có parentId, tìm bình luận cha để thêm vào `child`
                            return prev.map((comment) => {
                                if (comment.id === newComment.parentId) {
                                    return {
                                        ...comment,
                                        child: comment.child ? [...comment.child, newComment] : [newComment]
                                    };
                                }
                                return comment;
                            });
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
            console.log("Hú", formData);
            const response = await axios.post(`${ENV.API_URL}/comment`, formData, {
                headers: {
                    Authorization: `Bearer ${ENV.token}`,
                },
            });
            setContent("");
        } catch (error) {

        }
    }
    return (
        <View style={{ flex: 1, padding: 10 }}>
            <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item, index) => index.toString()}
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
        </View>
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
    }
});
