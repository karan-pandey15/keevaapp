import React from "react";
import { StatusBar, useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./src/screens/SplashScreen";
import Screen1 from "./src/screens/Screen1";
import Screen2 from "./src/screens/Screen2";
import Screen3 from "./src/screens/Screen3";
import AddressListScreen from "./src/screens/AddressListScreen";
import MapPickerScreen from "./src/screens/MapPickerScreen";
import HomePage from "./src/screens/HomePage";
import LocationHeader from "./src/helperComponent/LocationHeader"
import SearchScreen from "./src/SearchBar/SearchScreen"
import AllCategoryPage from "./src/CaategoryScreen/AllCategoryPage"
import BabyProducts from "./src/CaategoryScreen/BabyProducts";
import CoshmeticPaeg from "./src/CaategoryScreen/CoshmeticPaeg";
import GroceryScreen from "./src/CaategoryScreen/GroceryScreen"
import MilkBread from "./src/CaategoryScreen/MilkBread"
import FreshVeg from "./src/CaategoryScreen/FreshVeg"
import FreshFruit from "./src/CaategoryScreen/FreshFruit"
import Profile from "./src/Profile/Profile";
import KeevaCart from "./src/cart/KeevaCart";
import CheckoutScreen from "./src/cart/CheckoutScreen";
import ProductDetailPage from "./src/screens/ProductDetailPage";

// Profile Screen Calling 
import ProfilePage from "./src/profilepages/Profilepage"
import YourOrders from "./src/profilepages/YourOrders"
import OrderDetails from "./src/profilepages/OrderDetails"
import AddressPage from "./src/profilepages/AddressPage"
import HelpSupport from "./src/profilepages/HelpSupport"
import Rewards from "./src/profilepages/Rewards"
const Stack = createNativeStackNavigator();

export default function App() {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <NavigationContainer>
        <Stack.Navigator initialRouteName="SplashScreen">

          <Stack.Screen
            name="SplashScreen"
            component={SplashScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Screen1"
            component={Screen1}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Screen2"
            component={Screen2}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Screen3"
            component={Screen3}
            options={{ headerShown: true }}
          />

          <Stack.Screen
            name="AddressList"
            component={AddressListScreen}
            options={{ headerShown: false, title: "Select Location" }}


          />
          <Stack.Screen
            name="MapPicker"
            component={MapPickerScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LocationHeader"
            component={LocationHeader}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="SearchScreen"
            component={SearchScreen}
            options={{ headerShown: false }}
          />




          <Stack.Screen name="HomePage" component={HomePage} options={{ headerShown: false }} />

 

    <Stack.Screen
            name="AllCategoryPage"
            component={AllCategoryPage}
            options={{ headerShown: false }}
          />

   <Stack.Screen
            name="BabyProducts"
            component={BabyProducts}
            options={{ headerShown: false }}
          />
 
   <Stack.Screen
            name="CoshmeticPaeg"
            component={CoshmeticPaeg}
            options={{ headerShown: false }}
          />

  

              <Stack.Screen
            name="FreshFruit"
            component={FreshFruit}
            options={{ headerShown: false }}
          />
              <Stack.Screen
            name="FreshVeg"
            component={FreshVeg}
            options={{ headerShown: false }}
          />
              <Stack.Screen
            name="MilkBread"
            component={MilkBread}
            options={{ headerShown: false }}
          />
              <Stack.Screen
            name="GroceryScreen"
            component={GroceryScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ProductDetailPage"
            component={ProductDetailPage}
            options={{ headerShown: false }}
          />

           <Stack.Screen
            name="Profile"
            component={Profile}
            options={{ headerShown: false }}
          />

             <Stack.Screen
            name="KeevaCart"
            component={KeevaCart}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="CheckoutScreen"
            component={CheckoutScreen}
            options={{ headerShown: false }}
          />

     {/* Profile Page Screen  */}


             <Stack.Screen
            name="ProfilePage"
            component={ProfilePage}
            options={{ headerShown: false }}
          />




             <Stack.Screen
            name="YourOrders"
            component={YourOrders}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OrderDetails"
            component={OrderDetails}
            options={{ headerShown: false }}
          />
    <Stack.Screen
            name="AddressPage"
            component={AddressPage}
            options={{ headerShown: false }}
          />


          {/* HelpSupport */}
 
  <Stack.Screen
            name="HelpSupport"
            component={HelpSupport}
            options={{ headerShown: false }}
          />

          {/* Rewards - Refer A Friend */}
  <Stack.Screen
            name="Rewards"
            component={Rewards}
            options={{ headerShown: false }}
          />

           

        </Stack.Navigator>
      </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
