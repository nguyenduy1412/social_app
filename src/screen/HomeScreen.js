import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { COLORS } from '../../contants'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
const HomeScreen = () => {
  const navigation = useNavigation();
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
  return (
    <View style={styles.container}>
      <View style={styles.post}>
        <TouchableOpacity onPress={navigation.navigate('')}>
          <Image style={styles.avatar} source={require('../../assets/market.png')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.inputPost}>
          <Text >Bạn đang nghĩ gì</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Image style={{width:40,resizeMode:'contain'}} source={require('../../assets/image.png')} />
        </TouchableOpacity>
      </View>

      {/* story */}
      <View >

        <ScrollView horizontal contentContainerStyle={styles.stories}
          showsHorizontalScrollIndicator={false}  >
          <TouchableOpacity style={styles.viewStories}>
            <Image
              style={styles.imageStories}
              source={require('../../assets/coverdefault2.png')}
            />
            <View style={styles.overlay}>
              <Ionicons name="add-circle-sharp" style={{ textAlign: 'center' }} size={40} color="white" />
              <Text style={styles.titleCreateStory}>Tạo tin</Text>
            </View>
          </TouchableOpacity>
          {stories.map((item, index) => {
            return (
              <TouchableOpacity key={index} style={styles.viewStories}>
                <Image
                  style={styles.imageStories}
                  source={require('../../assets/coverdefault.png')}
                />
                <View style={styles.overlay}>
                  <Image style={styles.avatarStory}
                    source={require('../../assets/coverdefault.png')} />
                  <Text style={styles.nameStory}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )
          })
          }
        </ScrollView>
      </View>

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
    alignItems:'center'
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
    paddingTop:10,
    paddingLeft:10,
    width: '70%',
    height:40,
   
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
})