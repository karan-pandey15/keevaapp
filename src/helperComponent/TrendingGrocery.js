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
const API_URL = "https://api.keeva.in/products";
const FALLBACK_IMAGE = require("../images/grocery.png");

const TrendingGrocery = forwardRef((props, ref) => {
  /* ✅ HOOKS — MUST BE FIRST */
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const cartItems = useSelector((state) => state.cart.items);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH PRODUCTS FUNCTION ---------------- */
  const fetchProducts = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      
      const res = await fetch(API_URL);
      const data = await res.json();

      if (res.ok && data.ok) {
        const mapped = data.products.map((p) => ({
          id: p._id,
          name: p.name,
          price: p.price?.selling_price ?? 0,
          originalPrice: p.price?.mrp ?? null,
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

  /* ---------------- EXPOSE REFRESH FUNCTION TO PARENT ---------------- */
  useImperativeHandle(ref, () => ({
    refreshProducts: () => fetchProducts(false),
  }));

  /* ---------------- INITIAL FETCH & FOCUS EFFECT ---------------- */
  useEffect(() => {
    fetchProducts(true);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts(false);
    }, [])
  );

  /* ---------------- CART HELPERS ---------------- */
  const getItemQuantity = (id) => {
    const item = cartItems.find((i) => i.id === id);
    return item ? item.quantity : 0;
  };

  /* ---------------- RENDER PRODUCT ---------------- */
  const renderProduct = ({ item }) => {
    const quantity = getItemQuantity(item.id);

    const handleProductPress = () => {
      if (item.originalProduct) {
        navigation.navigate('ProductDetailPage', { product: item.originalProduct });
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

  /* ---------------- UI (NO EARLY RETURNS) ---------------- */
  return (
    <View style={styles.wrapper}>
      <Text style={styles.headerText}>
        Trending in{" "}
        <Text style={styles.headerHighlight}>Belha, Pratapgarh</Text>
      </Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContainer}
        />
      )} 
    </View>
  );
});

TrendingGrocery.displayName = 'TrendingGrocery';

/* ---------------- STYLES (UNCHANGED) ---------------- */
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 10, 
  },

  headerText: {
    fontSize: 20,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 10,
    color: "#1a1a1a",
  },
  headerHighlight: {
    color: "#8b3dff",
  },

  gridContainer: {
    paddingHorizontal: 12,
    paddingBottom: 80,
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

  adBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adText: { fontSize: 10, fontWeight: "500", color: "#666" },

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
  quantityButton: { width: 22, alignItems: "center" },
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

  detailsContainer: { padding: 8 },

  priceRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  priceBadge: {
    backgroundColor: "#2d8659",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
  },
  priceText: { color: "#fff", fontWeight: "700", fontSize: 13 },

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
    position: 'absolute',
    bottom: 10,
    right: 20,
    backgroundColor: '#d91c5c',
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#d91c5c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  seeAllText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  arrowText: {
    color: '#ffffff',
    fontSize: 20,
  },
});

export default TrendingGrocery;
