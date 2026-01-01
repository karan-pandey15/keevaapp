// SearchCatgegory.js
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const SearchCategory = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState(1);

  const categories = [
    { id: 1, name: 'All Category', image: require('../images/chips.png'), screen: 'AllCategoryPage', color: '#FFF0F0' },
    { id: 2, name: 'Fresh Veg..', image: require('../images/vegetables.png'), screen: 'FreshVeg', color: '#F0FFF4' },
    { id: 3, name: 'Fresh Fruit', image: require('../images/fruits.png'), screen: 'FreshFruit', color: '#FFF8F0' },
    { id: 4, name: 'Milk & Bread', image: require('../images/milkbreads.png'), screen: 'MilkBread', color: '#F0F7FF' },
    { id: 5, name: 'Groceries', image: require('../images/grocerys.png'), screen: 'GroceryScreen', color: '#F5F0FF' },
  ];

  const handleCategoryPress = (screen, categoryId) => {
    setActiveCategory(categoryId);
    if (screen) {
      navigation.navigate(screen);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Categories</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AllCategoryPage')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map(category => {
          const isActive = activeCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryItem}
              onPress={() => handleCategoryPress(category.screen, category.id)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.iconContainer,
                { backgroundColor: isActive ? '#6A1B9A' : category.color },
                isActive && styles.iconContainerActive
              ]}>
                <View style={styles.imageWrapper}>
                  <Image 
                    source={category.image} 
                    style={[
                      styles.image,
                      isActive && { tintColor: '#FFF' }
                    ]}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <Text style={[
                styles.categoryText,
                isActive && styles.categoryTextActive
              ]} numberOfLines={2}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6A1B9A',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 72,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  iconContainerActive: {
    shadowColor: '#6A1B9A',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    transform: [{ scale: 1.05 }],
  },
  imageWrapper: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryText: {
    fontSize: 11,
    textAlign: 'center',
    color: '#616161',
    fontWeight: '500',
    lineHeight: 14,
  },
  categoryTextActive: {
    color: '#6A1B9A',
    fontWeight: '700',
  },
});

export default SearchCategory;