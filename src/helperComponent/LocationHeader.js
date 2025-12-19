import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

import SearchBar from "./SearchBar"
import CategorySlider from "./CategorySlider"
import BannerComponent from "./BannerComponent"
import TrendingGrocery from "./TrendingGrocery";
import CartButton from "./CartButton";

const { width } = Dimensions.get('window');

const LocationHeader = () => {
  const navigation = useNavigation();

  // Array of addresses
  const addresses = [
    {
      id: 1,
      type: 'Home',
      street: 'Near Jagwanti Petrol Pump',
      block: 'Block A',
      area: 'Balipur',
    },
    {
      id: 2,
      type: 'Shop',
      street: 'Near Mamta Hardware',
      block: 'Block A',
      area: 'Balipur',
    },
    {
      id: 3,
      type: 'Work',
      street: 'Street Number 8',
      block: 'Block B',
      area: 'GhantaGhar',
    },
  ];

  // Current selected address (first one by default)
  const currentAddress = addresses[0];

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const handleAddressPress = () => {
    navigation.navigate('AddressList', { addresses });
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="#99d98c" barStyle="dark-content" />
      
      {/* Fixed Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.contentSection}>
          <View style={styles.timeSection}>
            <Icon name="bolt" size={28} color="#000" style={styles.boltIcon} />
            <Text style={styles.timeText}>16 minutes</Text>
          </View>

          <TouchableOpacity
            style={styles.addressSection}
            onPress={handleAddressPress}
            activeOpacity={0.7}>
            <View style={styles.addressContent}>
              <Text style={styles.addressDetails} numberOfLines={1}>
                <Text style={styles.addressType}>{currentAddress.type} -</Text>
                {' '}{currentAddress.street}, {currentAddress.block},{' '}
                {currentAddress.area}...
              </Text>
            </View>
            <Icon name="keyboard-arrow-down" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleProfilePress}
          activeOpacity={0.7}>
          <Icon name="person" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Fixed SearchBar */}
      <SearchBar />

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <CategorySlider />
        <BannerComponent />
        <TrendingGrocery />
      </ScrollView>

      <CartButton />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#99d98c',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 34,
    justifyContent: 'space-between',
  },
  contentSection: {
    flex: 1,
    marginRight: 12,
    marginTop: 20,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  boltIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: width < 360 ? 18 : 20,
    fontWeight: '700',
    color: '#000',
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressContent: {
    flex: 1,
  },
  addressType: {
    fontSize: width < 360 ? 14 : 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  addressDetails: {
    fontSize: width < 360 ? 12 : 13,
    color: '#000',
    opacity: 0.8,
  },
  profileButton: {
    marginLeft: 8,
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
});

export default LocationHeader;