// CategorySlider.js
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CategorySlider = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState(1);

  const categories = [
    { id: 1, name: 'All', image: require('../images/All.png'), screen: 'AllCategoryPage' },
    { id: 2, name: 'Fresh Veg..', image: require('../images/vegetable.png'), screen: 'FreshVeg' },
    { id: 3, name: 'Fresh Fruit', image: require('../images/fruit.png'), screen: 'FreshFruit' },
    { id: 4, name: 'Milk & Bread', image: require('../images/milkbread.png'), screen: 'MilkBread' },
    { id: 5, name: 'Groceries', image: require('../images/grocery.png'), screen: 'GroceryScreen' },
  ];

  const handleCategoryPress = (screen, categoryId) => {
    setActiveCategory(categoryId);
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(category.screen, category.id)}
          >
            <View style={styles.iconContainer}>
              <Image 
                source={category.image} 
                style={styles.image}
                resizeMode="cover"
              />
            </View>

            <Text style={styles.categoryText} numberOfLines={2}>
              {category.name}
            </Text>

            {activeCategory === category.id && (
              <View style={styles.underline} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#99d98c',
    paddingVertical: 5,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',  // PERFECT EVEN GAP FOR 5 ITEMS
    paddingHorizontal: 10,
  },

  categoryItem: {
    width: '18%',  // 5 items fit perfectly (5 x 18% + spaces)
    alignItems: 'center',
    position: 'relative',
  },

  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  categoryText: {
    fontSize: 10,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },

  underline: {
    position: 'absolute',
    bottom: -3,
    width: 40,
    height: 2,
    backgroundColor: '#333',
    borderRadius: 1,
  },
});

export default CategorySlider;
