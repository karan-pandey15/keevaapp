import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  addItem,
  incrementQuantity,
  decrementQuantity,
} from "../redux/cartSlice";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 3;
const API_URL = 'https://api.keeva.in/products/category/BabyProducts';
const FALLBACK_IMAGE = require("../images/grocery.png");

const BabyProductspage = forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const cartItems = useSelector((state) => state.cart.items);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);

      const res = await fetch(API_URL);
      const data = await res.json();

      if (res.ok && data.ok) {
        const mapped = data.products.slice(0, 6).map((p) => ({
          id: p._id,
          name: p.name,
          price: p.price?.selling_price ?? 0,
          originalPrice: p.price?.mrp ?? null,
          category: p.category,
          sub_category: p.sub_category,
          discount:
            p.price?.discount_percent > 0
              ? `${p.price.discount_percent}% OFF`
              : null,
          weight: `${p.quantity_info?.size ?? ""} ${
            p.quantity_info?.unit ?? ""
          }`,
          tag: p.brand || null,
          image:
            p.images?.length > 0
              ? { uri: p.images[0].url }
              : FALLBACK_IMAGE,
          originalProduct: p,
        }));

        setProducts(mapped);
      }
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refreshProducts: () => fetchProducts(false),
  }));

  useEffect(() => {
    fetchProducts(true);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts(false);
    }, [])
  );

  const getItemQuantity = (id) => {
    const item = cartItems.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  const handleSeeAll = () => {
    navigation.navigate("BabyProducts");
  };

  const renderProduct = ({ item }) => {
    const quantity = getItemQuantity(item.id);

    const handleProductPress = () => {
      if (item.originalProduct) {
        navigation.navigate("ProductDetailPage", { product: item.originalProduct });
      }
    };

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={handleProductPress}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.addButtonContainer}>
          {quantity === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => dispatch(addItem(item))}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                onPress={() => dispatch(decrementQuantity(item.id))}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>

              <Text style={styles.quantityText}>{quantity}</Text>

              <TouchableOpacity
                onPress={() => dispatch(incrementQuantity(item.id))}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.priceRow}>
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>₹{item.price}</Text>
            </View>

            {item.originalPrice && (
              <Text style={styles.originalPrice}>
                ₹{item.originalPrice}
              </Text>
            )}
          </View>

          {item.discount && (
            <Text style={styles.discountText}>{item.discount}</Text>
          )}

          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>

          <Text style={styles.weightText}>{item.weight}</Text>

          {item.tag && (
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          Baby{" "}
          <Text style={styles.headerHighlight}>Products</Text>
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#d91c5c" style={styles.loader} />
      ) : (
        <>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContainer}
          />
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={handleSeeAll}
            activeOpacity={0.85}
          >
            <Text style={styles.seeAllText}>See all</Text> 
          </TouchableOpacity>
        </>
      )}
    </View>
  );
});

BabyProductspage.displayName = "BabyProductspage";

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 0,
    marginBottom: 20,
  },

  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  headerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },

  headerHighlight: {
    color: "#d91c5c",
  },

  gridContainer: {
    paddingHorizontal: 12,
    paddingBottom: 80,
  },

  loader: {
    marginVertical: 40,
  },

  productCard: {
    width: ITEM_WIDTH,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    margin: 4,
    overflow: "hidden",
  },

  imageContainer: {
    height: 120,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
    justifyContent: "center",
  },

  productImage: {
    width: "90%",
    height: "90%",
  },

  addButtonContainer: {
    position: "absolute",
    top: 95,
    right: 8,
  },

  addButton: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#d91c5c",
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },

  addButtonText: {
    color: "#d91c5c",
    fontWeight: "700",
    fontSize: 13,
  },

  quantitySelector: {
    backgroundColor: "#d91c5c",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  quantityButton: {
    width: 22,
    alignItems: "center",
  },

  quantityButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  quantityText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginHorizontal: 10,
  },

  detailsContainer: {
    padding: 8,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  priceBadge: {
    backgroundColor: "#2d8659",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
  },

  priceText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  originalPrice: {
    textDecorationLine: "line-through",
    color: "#999",
    fontSize: 12,
  },

  discountText: {
    color: "#2d8659",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },

  productName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1a1a1a",
    minHeight: 36,
  },

  weightText: {
    fontSize: 11,
    color: "#666",
    marginVertical: 4,
  },

  tagContainer: {
    backgroundColor: "#e6f7f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },

  tagText: {
    color: "#2d8659",
    fontSize: 10,
    fontWeight: "600",
  },

  seeAllButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: "#FFEDF3",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5, 
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  seeAllText: {
    color: "#d91c5c",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },

  arrowText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "400",
  },
});

export default BabyProductspage;
