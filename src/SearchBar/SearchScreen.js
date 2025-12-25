import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import TrendingGrocery from "../helperComponent/TrendingGrocery";

const API_BASE_URL = "https://api.keeva.in/api/search";

const transformSearchResultToProduct = (searchResult) => {
  if (!searchResult) return null;

  try {
    const priceData = searchResult.price || {};
    
    return {
      _id: searchResult._id || "",
      name: searchResult.name || "Unknown Product",
      category: searchResult.category || "Uncategorized",
      description: searchResult.description || "",
      brand: searchResult.brand || "",
      sub_category: searchResult.sub_category || "",
      images: [
        {
          url: searchResult.image || "https://via.placeholder.com/300?text=No+Image",
        },
      ],
      price: {
        selling_price: priceData.selling_price || searchResult.price || 0,
        mrp: priceData.mrp || searchResult.price || 0,
        discount_percent: priceData.discount_percent || 0,
      },
      quantity_info: {
        size: searchResult.size || "1",
        unit: searchResult.unit || "piece",
      },
      inventory: {
        stock_available: searchResult.stock_available !== false,
      },
      averageRating: searchResult.averageRating || 0,
      slug: searchResult.slug || "",
    };
  } catch (err) {
    console.error("Error transforming product:", err);
    return null;
  }
};

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length === 0) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    debounceTimer.current = setTimeout(async () => {
      try {
        const searchUrl = `${API_BASE_URL}?query=${encodeURIComponent(
          trimmedQuery
        )}&limit=20`;
        console.log("🔍 Searching:", searchUrl);

        const response = await fetch(searchUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ API Response:", JSON.stringify(data, null, 2));

        if (data.success && data.results && Array.isArray(data.results)) {
          const transformedResults = data.results
            .map((result) => {
              console.log("Raw result:", JSON.stringify(result, null, 2));
              return transformSearchResultToProduct(result);
            })
            .filter((product) => product !== null && product._id);

          console.log(
            "Transformed results:",
            JSON.stringify(transformedResults, null, 2)
          );

          setSearchResults(transformedResults);
          setError(null);

          if (transformedResults.length === 0) {
            setError("No products found for your search");
          }
        } else if (!data.success) {
          setSearchResults([]);
          setError(data.message || "Search failed. Please try again.");
        } else {
          setSearchResults([]);
          setError("Unexpected response format. Please try again.");
        }
      } catch (err) {
        console.error("❌ Search error:", err);
        setSearchResults([]);
        setError("Connection failed. Please check your internet and try again.");
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleProductPress = (product) => {
    console.log("Product clicked:", JSON.stringify(product, null, 2));

    if (!product) {
      Alert.alert("Error", "Product data is missing");
      return;
    }

    if (!product._id || product._id.trim() === "") {
      Alert.alert("Error", "Invalid product ID");
      return;
    }

    try {
      navigation.navigate("ProductDetailPage", { product });
    } catch (err) {
      console.error("Navigation error:", err);
      Alert.alert("Error", "Failed to open product details: " + err.message);
    }
  };

  const handleClearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setError(null);
  };

  const renderTrendingHeader = () => {
    if (query.length === 0) {
      return <TrendingGrocery />;
    }
    return null;
  };

  const renderProductItem = ({ item }) => {
    const imageUrl = item.images?.[0]?.url;
    const price = item.price?.selling_price || 0;
    const mrp = item.price?.mrp || 0;

    return (
      <TouchableOpacity
        style={styles.itemRow}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.imageWrapper}>
          {imageUrl && imageUrl !== "https://via.placeholder.com/300?text=No+Image" ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.itemImage}
              onError={(e) => console.log("Image error:", e.nativeEvent.error)}
            />
          ) : (
            <View style={[styles.itemImage, styles.placeholderImage]}>
              <Icon name="image" size={30} color="#CCC" />
            </View>
          )}
        </View>

        <View style={styles.itemContent}>
          <Text style={styles.itemText} numberOfLines={2}>
            {item.name || "Unknown"}
          </Text>
          {item.category && (
            <Text style={styles.itemCategory} numberOfLines={1}>
              {item.category}
            </Text>
          )}
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.itemPrice}>₹{Math.floor(price)}</Text>
          {mrp > price && (
            <Text style={styles.itemMrp}>₹{Math.floor(mrp)}</Text>
          )}
          <Icon
            name="chevron-forward"
            size={18}
            color="#DDD"
            style={styles.arrowIcon}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchBarContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="chevron-back" size={26} color="#333" />
          </TouchableOpacity>

          <TextInput
            autoFocus={true}
            placeholder="Search products..."
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            returnKeyType="search"
          />

          {query.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
            >
              <Icon name="close" size={22} color="#333" />
            </TouchableOpacity>
          )}
        </View>

        {query.length > 0 && loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6A1B9A" />
            <Text style={styles.loadingText}>Searching products...</Text>
          </View>
        )}

        {query.length > 0 && !loading && error && (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={50} color="#E57373" />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorSubtext}>Try searching with different words</Text>
          </View>
        )}

        {query.length > 0 &&
          !loading &&
          !error &&
          searchResults.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon name="search" size={50} color="#DDD" />
              <Text style={styles.noResult}>No products found</Text>
            </View>
          )}

        <FlatList
          data={query.length === 0 ? [] : searchResults}
          keyExtractor={(item, index) => item._id || index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={query.length > 0}
          ListHeaderComponent={renderTrendingHeader}
          renderItem={renderProductItem}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
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
  backButton: {
    padding: 4,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#F3F3F3",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    fontSize: 15,
    color: "#333",
  },
  clearButton: {
    padding: 4,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 15,
    color: "#E57373",
    textAlign: "center",
    fontWeight: "500",
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 13,
    color: "#999",
    textAlign: "center",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noResult: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 15,
    color: "#999",
    fontWeight: "500",
  },

  listContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 20,
    flexGrow: 1,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  imageWrapper: {
    marginRight: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    lineHeight: 18,
  },
  itemCategory: {
    fontSize: 12,
    color: "#999",
    fontWeight: "400",
  },
  priceSection: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2d8659",
    marginBottom: 2,
  },
  itemMrp: {
    fontSize: 11,
    color: "#BBB",
    textDecorationLine: "line-through",
    marginBottom: 4,
  },
  arrowIcon: {
    marginTop: 4,
  },
});
