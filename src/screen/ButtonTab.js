import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import HomeScreen from "./HomeScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Component tạo Header với icon
const CustomHeader = () => {
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
        <TouchableOpacity>
          <Icon name="search-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity>
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
const NotificationScreen = () => <View><Text>Notification Screen</Text></View>;

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
        <Icon name="home-outline" size={24} color={focused ? "blue" : "black"} />
      ),
    }} />
    <Tab.Screen name="Videos" component={VideoScreen} options={{
      headerShown:false,
      tabBarIcon: ({ focused }) => (
        <Icon name="tv-outline" size={24} color={focused ? "blue" : "black"} />
      ),
    }} />
    <Tab.Screen name="Market" component={MarketScreen} options={{
      headerShown:false,
      tabBarIcon: ({ focused }) => (
        <Icon name="storefront-outline" size={24} color={focused ? "blue" : "black"} />
      ),
    }} />
    <Tab.Screen name="Heart" component={HeartScreen} options={{
      headerShown:false,
      tabBarIcon: ({ focused }) => (
        <Icon name="heart-outline" size={24} color={focused ? "blue" : "black"} />
      ),
    }} />
    <Tab.Screen name="Notifications" component={NotificationScreen} options={{
      headerShown:false,
      tabBarIcon: ({ focused }) => (
        <Icon name="notifications-outline" size={24} color={focused ? "blue" : "black"} />
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
    </View>
  );
};

// App với Stack Navigator
export default function App() {
  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainScreen} />
      </Stack.Navigator>
    
  );
}
