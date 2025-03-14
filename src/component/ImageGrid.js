import React, { useEffect, useState } from "react";
import { View, Image, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";

export default function ImageGrid({ images }) {
    const { width } = Dimensions.get('window');
    if (!images || images.length === 0) return null;
    const [aspectRatio, setAspectRatio] = useState(1);
    const maxVisibleImages = 4; // Hiển thị tối đa 4 ảnh
    const extraImages = images.length - maxVisibleImages; // Ảnh ẩn
    const visibleImages = images.slice(0, maxVisibleImages); // Lấy 4 ảnh đầu
    const [imageDimensions, setImageDimensions] = useState({});
    const onImageLoad = (uri, event) => {
        const { width, height } = event.nativeEvent.source;
        const aspectRatio = width / height; // Tính tỷ lệ
        setImageDimensions((prev) => ({
          ...prev,
          [uri]: { width, height, aspectRatio },
        }));
      };
    const getImageHeight = (uri, width) => {
        const aspectRatio = imageDimensions[uri]?.aspectRatio || 1;
        return width / aspectRatio; // Tính chiều cao dựa trên width và tỷ lệ ảnh
      };
    
      const getImageWidth = (width) => {
        return width-35;
      };
    useEffect(() => {
        if (images) {
            Image.getSize(images[0], (width, height) => {
                setAspectRatio(width / height);
            });
        }
    }, [images]);
    return (
        <View style={styles.container}>
            {images.length === 1 ? (
                // Nếu có 1 ảnh, chiếm 100% chiều rộng
                <Image
                      resizeMode="contain"
                      style={[styles.singleImage, { width: getImageWidth(width), height: getImageHeight(images[0], getImageWidth(width)) }]}
                      source={{ uri: images[0] }}
                      onLoad={(e) => onImageLoad(images[0], e)}
                    />
               
            ) : images.length === 3 ? (
                // Nếu có 3 ảnh, 1 ảnh lớn + 2 ảnh nhỏ bên dưới
                <View style={styles.threeImagesGrid}>
                    <Image source={{ uri: images[0] }} style={styles.fullWidthImage} />
                    <View style={styles.row}>
                        {visibleImages.slice(1).map((img, index) => (
                            <Image key={index} source={{ uri: img }} style={styles.halfWidthImage} />
                        ))}
                    </View>
                </View>
            ) : (
                // Nếu có 2, 4 hoặc nhiều hơn → Chia dạng lưới 2 cột
                <View style={styles.grid}>
                    {visibleImages.map((img, index) => (
                        <TouchableOpacity key={index} style={styles.imageWrapper}>
                            <Image source={{ uri: img }} style={styles.image} />
                            {index === maxVisibleImages - 1 && extraImages > 0 && (
                                <View style={styles.overlay}>
                                    <Text style={styles.overlayText}>+{extraImages}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        gap: 5,
    },
    singleImage: {
        
        borderRadius: 10,
    },
    threeImagesGrid: {
        flexDirection: "column",
        gap: 5,
    },
    fullWidthImage: {
        width: "100%",
        height: 150,
        borderRadius: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    halfWidthImage: {
        width: "49.5%",
        height: 100,
        borderRadius: 10,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 5,
    },
    imageWrapper: {
        position: "relative",
        width: "49%", // Chia 2 cột
        aspectRatio: 1, // Vuông
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
    },
    overlay: {
        position: "absolute",
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        borderRadius: 10,
    },
    overlayText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
    },
});
