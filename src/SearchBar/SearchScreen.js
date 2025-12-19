import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import TrendingGrocery from "../helperComponent/TrendingGrocery";

const DATA = [
  { id: 1, name: "Vegetables", image: require("../images/vegetable.png") },
  { id: 2, name: "Vegetable oil", image: require("../images/grocery.png") },
  { id: 3, name: "Vegetable bag", image: require("../images/vegetable.png") },
  { id: 4, name: "Vegetable toy", image: require("../images/vegetable.png") },
  { id: 5, name: "Vegetable soup", image: require("../images/grocery.png") },
  { id: 6, name: "Vegetable salad", image: require("../images/fruit.png") },
  { id: 7, name: "Vegetable chips", image: require("../images/grocery.png") },
  { id: 8, name: "Fruits", image: require("../images/fruit.png") },
  { id: 9, name: "Apple", image: require("../images/fruit.png") },
  { id: 10, name: "Banana", image: require("../images/fruit.png") },
];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");

  const filteredData = DATA.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  // Render trending grocery when no search query
  const renderTrendingHeader = () => {
    if (query.length === 0) {
      return <TrendingGrocery />;
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* ------------------- Search Bar ------------------- */}
        <View style={styles.searchBarContainer}>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={26} color="#333" />
          </TouchableOpacity>

          <TextInput
            autoFocus={true}
            placeholder="Search for Vegetables"
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />

          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Icon name="close" size={22} color="#333" />
            </TouchableOpacity>
          )}

        </View>

        {/* -------------------- Unified FlatList -------------------- */}
        <FlatList
          data={query.length === 0 ? [] : filteredData}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderTrendingHeader}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.itemRow}>
              <Image source={item.image} style={styles.itemImage} />
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            query.length > 0 ? (
              filteredData.length > 0 ? (
                <TouchableOpacity style={styles.showAllRow}>
                  <Icon name="search" size={20} color="#6A1B9A" />
                  <Text style={styles.showAllText}>
                    Show all results for "{query}"
                  </Text>
                  <Icon name="chevron-forward" size={22} color="#6A1B9A" />
                </TouchableOpacity>
              ) : (
                <Text style={styles.noResult}>No results found</Text>
              )
            ) : null
          }
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  // -------------------- Search Bar --------------------
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomColor: "#EEE",
    borderBottomWidth: 1,
    marginTop: 25,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#F3F3F3",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 15,
  },

  // -------------------- List Content --------------------
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexGrow: 1,
  },

  // -------------------- Item Row --------------------
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 14,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },

  // -------------------- Footer --------------------
  showAllRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    gap: 10,
  },
  showAllText: {
    flex: 1,
    fontSize: 16,
    color: "#6A1B9A",
  },
  noResult: {
    textAlign: "center",
    marginTop: 20,
    color: "#555",
  },
});