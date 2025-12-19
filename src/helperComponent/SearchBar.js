import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
export default function SearchBar({ onPress, onAdPress }) {
  const navigation = useNavigation(); 
  const placeholderItems = [
    "Safai Abhiyaan",
    "Potato",
    "Tomato",
    "Onion",
    "Cabbage",
    "Brinjal",
    "Mango",
    "Apple",
    "Banana",
    "Grapes",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % placeholderItems.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.mainRow}>
        {/* Search Bar */}
    <TouchableOpacity
  style={styles.searchBox}
  activeOpacity={0.7}
  onPress={() => navigation.navigate('SearchScreen')}
>
          <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.input}
            editable={false}
            placeholder={`Search for "${placeholderItems[index]}"`}
            placeholderTextColor="#888"
            pointerEvents="none"
          />
        </TouchableOpacity>

        {/* Winter Skincare Ad - Touches right side */}
        <TouchableOpacity
          style={styles.adContainer}
          activeOpacity={0.8}
          onPress={onAdPress}
        >
          <View style={styles.adContent}>
            <Text style={styles.adText}>Shop</Text>
            <Text style={styles.adText}>Fresh Now</Text>
          </View>
          <View style={styles.iconContainer}>
          
            <View style={styles.blueIcon}>
              <Icon name="shopping-cart" size={16} color="#FFF" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#99d98c",
    paddingLeft: 16, 
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 30,
    marginRight: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginBottom:8
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: "400",
  },
  adContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingLeft: 12,
    paddingVertical: 10,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  adContent: {
    marginRight: 8,
  },
  adText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E88E5",
    lineHeight: 16,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 12,
  },
  yellowIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#FDD835",
    justifyContent: "center",
    alignItems: "center",
  },
  blueIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#1E88E5",
    justifyContent: "center",
    alignItems: "center",
  },
});