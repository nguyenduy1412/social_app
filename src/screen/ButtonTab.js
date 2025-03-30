import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import HomeScreen from "./HomeScreen";
import Friendship from "./Friendship";
import { COLORS } from "../../contants";
import { useAuth } from "../component/AuthProvider";
import Message from "./Message";
import Notification from "./Notification";
import Toast from "react-native-toast-message";
import { getLocation, updateLocation } from "../service/LocationService";


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Component tạo Header với icon
const CustomHeader = () => {
  const { user,api,getUserInfo,logout } = useAuth();
  
  const navigation = useNavigation();
  const handleLogout = async () => {
    if(await logout())
    navigation.reset({
      index: 0,
      routes: [{ name: 'Start' }], // Reset stack về màn hình Start
    });
  };
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 10,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        marginTop:30
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "bold", color: "#1877F2" }}>
        facebook
      </Text>
      <View style={{ flexDirection: "row", gap: 15 }}>
        <TouchableOpacity>
          <Icon name="add-circle-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>navigation.navigate('SearchFriend')}>
          <Icon name="search-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>handleLogout()}>
          <Icon name="menu-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Các màn hình

const VideoScreen = () => <View><Text>Video Screen</Text></View>;
const MarketScreen = () => <View><Text>Market Screen</Text></View>;
const HeartScreen = () => <View><Text>Heart Screen</Text></View>;

// Bottom Tab Navigator
const BottomTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        height: 60,
        paddingTop:10
      },
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{
      headerShown:false,
      tabBarIcon: ({ focused }) => (
        <Icon name={focused ? 'home' : 'home-outline'} size={30} color={focused ? COLORS.primary : "black"} />
      ),
    }} />
    <Tab.Screen name="FriendShip" component={Friendship} options={{
      headerShown:false,
      tabBarIcon: ({ focused }) => (
        <Icon name={focused ? 'people' :'people-outline' } size={30} color={focused ? COLORS.primary : "black"} />
      ),
    }} />
    <Tab.Screen name="Message" component={Message} options={{
      headerShown:false,
      tabBarIcon: ({ focused }) => (
        <Icon name={focused ? 'chatbubbles' :'chatbubbles-outline' } size={30} color={focused ? COLORS.primary : "black"} />
      ),
    }} />
    <Tab.Screen name="Notifications" component={Notification} options={{
      headerShown:false,
      tabBarIcon: ({ focused }) => (
        <Icon name={focused ? 'notifications' :'notifications-outline'} size={30} color={focused ? COLORS.primary : "black"} />
      ),
    }} />
    <Tab.Screen name="Heart" component={HeartScreen} options={{
      headerShown:false,
      tabBarIcon: ({ focused }) => (
        <Icon name="heart-outline" size={24} color={focused ? "blue" : "black"} />
      ),
    }} />
    
  </Tab.Navigator>
);

// Giao diện chính chứa cả Header và Tabs
const MainScreen = () => {
  return (
    <View style={{flex:1}} >
      <CustomHeader />
      <BottomTabs />
      <Toast /> 
    </View>
  );
};

// App với Stack Navigator
export default function App() {
  const { connectWebSocket, disconnectWebSocket,api } = useAuth();
  useEffect(() => {
    connectWebSocket();
    
    const loadData = async () => {
      if(api!==null){
          console.log("Hú")
          let location = await getLocation();
          await updateLocation(location.coords.latitude,location.coords.longitude,api);
      }
  };
  loadData();
  return () => {
    disconnectWebSocket();
  };
  }, []);
  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainScreen} />
      </Stack.Navigator>
    
  );
}
