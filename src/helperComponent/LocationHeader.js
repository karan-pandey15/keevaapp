import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api';

import SearchBar from "./SearchBar"
import CategorySlider from "./CategorySlider"
import BannerComponent from "./BannerComponent"
import TrendingGrocery from "./TrendingGrocery";
import CartButton from "./CartButton";

const { width } = Dimensions.get('window');

const LocationHeader = () => {
  const navigation = useNavigation();
  const [currentAddress, setCurrentAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const trendingGroceryRef = useRef(null);

  const fetchAddresses = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/user/addresses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        const addressList = data.addresses || (Array.isArray(data) ? data : []);
        setAddresses(addressList);

        if (addressList.length > 0) {
          const defaultAddress = addressList.find(addr => addr.isDefault);
          setCurrentAddress(defaultAddress || addressList[0]);
        }
      } else {
        console.error('Failed to fetch addresses:', data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found');
        setRefreshing(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/user/addresses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        const addressList = data.addresses || (Array.isArray(data) ? data : []);
        setAddresses(addressList);

        if (addressList.length > 0) {
          const defaultAddress = addressList.find(addr => addr.isDefault);
          setCurrentAddress(defaultAddress || addressList[0]);
        }
      } else {
        console.error('Failed to fetch addresses:', data);
      }

      if (trendingGroceryRef.current) {
        await trendingGroceryRef.current.refreshProducts();
      }
    } catch (error) {
      console.error('Error refreshing addresses:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const handleAddressPress = () => {
    navigation.navigate('AddressPage', { addresses });
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
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.addressDetails} numberOfLines={1}>
                  {currentAddress ? (
                    <>
                      <Text style={styles.addressType}>{currentAddress.label || 'Home'} -</Text>
                      {' '}{currentAddress.street}, {currentAddress.city}, {currentAddress.state}...
                    </>
                  ) : (
                    <Text style={styles.addressType}>Select Address</Text>
                  )}
                </Text>
              )}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#99d98c']}
            tintColor="#99d98c"
            progressBackgroundColor="#fff"
          />
        }
      >
        <CategorySlider />
        <BannerComponent />
        <TrendingGrocery ref={trendingGroceryRef} />
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