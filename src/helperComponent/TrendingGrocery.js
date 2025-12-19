import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addItem, incrementQuantity, decrementQuantity } from "../redux/cartSlice";

const { width } = Dimensions.get("window");

// Perfectly calculated width for 3 products everywhere
const ITEM_WIDTH = (width - 48) / 3;

const TrendingGrocery = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const [products] = useState([
    {
      id: "1",
      name: "Amul Gold Full Cream Fresh Milk (Pouch)",
      price: 35,
      originalPrice: null,
      discount: null,
      weight: "1 pack (500 ml)",
      tag: "Full Cream",
      image: require("../images/grocery.png"),
    },
    {
      id: "2",
      name: "Coriander leaves",
      price: 17,
      originalPrice: 23,
      discount: "₹6 OFF",
      weight: "100 g",
      tag: null,
      image: require("../images/grocery.png"),
    },
    {
      id: "3",
      name: "ZOFF Big Cardamom Whole",
      price: 80,
      originalPrice: 128,
      discount: "₹48 OFF",
      weight: "1 pack (25 g)",
      tag: null,
      image: require("../images/grocery.png"),
      isAd: true,
    },
    {
      id: "4",
      name: "Onion",
      price: 32,
      originalPrice: 42,
      discount: "₹10 OFF",
      weight: "1 Pack (900 - 1000 g)",
      tag: null,
      image: require("../images/grocery.png"),
    },
    {
      id: "5",
      name: "Mother Dairy Fresh Paneer",
      price: 85,
      originalPrice: 92,
      discount: "₹7 OFF",
      weight: "1 pack (200 g)",
      tag: null,
      image: require("../images/grocery.png"),
    },
    {
      id: "6",
      name: "Centrum Recharge Kids Powder",
      price: 9,
      originalPrice: 60,
      discount: "₹51 OFF",
      weight: "1 pack (6 Sachets)",
      tag: "Electrolyte",
      image: require("../images/grocery.png"),
      isAd: true,
    },
    {
      id: "7",
      name: "Tender Coconut",
      price: 70,
      originalPrice: 89,
      discount: "₹19 OFF",
      weight: "1 piece",
      tag: null,
      image: require("../images/grocery.png"),
    },
    {
      id: "8",
      name: "Aashirvaad Superior MP Atta",
      price: 455,
      originalPrice: 499,
      discount: "₹44 OFF",
      weight: "5 kg",
      tag: null,
      image: require("../images/grocery.png"),
    },
  ]);

  const getItemQuantity = (id) => {
    const item = cartItems.find((item) => item.id === id);
    return item ? item.quantity : 0;
  };

  const handleAddClick = (product) => {
    dispatch(addItem(product));
  };

  const handleIncrement = (id) => {
    dispatch(incrementQuantity(id));
  };

  const handleDecrement = (id) => {
    dispatch(decrementQuantity(id));
  };

  const renderProduct = ({ item }) => {
    const quantity = getItemQuantity(item.id);
    return (
    <View style={styles.productCard}>
      {/* IMAGE */}
      <View style={styles.imageContainer}>
        <Image
          source={item.image}
          style={styles.productImage}
          resizeMode="contain"
        />
        {item.isAd && (
          <View style={styles.adBadge}>
            <Text style={styles.adText}>Ad</Text>
          </View>
        )}
      </View>

      {/* ADD BUTTON OR QTY */}
      <View style={styles.addButtonContainer}>
        {quantity === 0 ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddClick(item)}
          >
            <Text style={styles.addButtonText}>ADD</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              onPress={() => handleDecrement(item.id)}
              style={styles.quantityButton}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.quantityText}>{quantity}</Text>

            <TouchableOpacity
              onPress={() => handleIncrement(item.id)}
              style={styles.quantityButton}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* PRODUCT DETAILS */}
      <View style={styles.detailsContainer}>
        <View style={styles.priceRow}>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>₹{item.price}</Text>
          </View>

          {item.originalPrice && (
            <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
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
    </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.headerText}>
        Trending in <Text style={styles.headerHighlight}>Belha, Pratapgarh </Text>
      </Text>

      {/* Scrollable List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
      />
      
      {/* See All Button */}
      <TouchableOpacity style={styles.seeAllButton} activeOpacity={0.9}>
        <Text style={styles.seeAllText}>See All</Text>
        <Text style={styles.arrowText}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

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
