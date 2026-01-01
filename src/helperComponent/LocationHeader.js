import React, { useState, useRef, useEffect } from 'react';
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
  PermissionsAndroid,
  Platform,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api';
import CustomToast from './CustomToast';
import FreshVegetable from "../HomePages/FreshVegetable"
import FreshFruit from "../HomePages/FreshFruit"
import SearchBar from "./SearchBar"
import CategorySlider from "./CategorySlider"
import BannerComponent from "./BannerComponent"
import BabyProductspage from "./BabyProductspage";
import CosmeticProductsPage from "./CosmeticProductsPage";
import CartButton from "./CartButton";

const { width } = Dimensions.get('window');

const LocationHeader = () => {
  const navigation = useNavigation();
  const [currentAddress, setCurrentAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const BabyProductspageRef = useRef(null);
  const [permissionGranted, setPermissionGranted] = useState(true);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      setPermissionGranted(granted);
    } else {
      setPermissionGranted(true);
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionGranted(true);
          fetchAddresses();
        } else {
          setPermissionGranted(false);
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

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

      if (BabyProductspageRef.current) {
        await BabyProductspageRef.current.refreshProducts();
      }
    } catch (error) {
      console.error('Error refreshing addresses:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleProfilePress = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      navigation.navigate('Profile');
    } else {
      setToastMessage('Please Login First');
      setShowToast(true);
      setTimeout(() => {
        navigation.navigate('Screen1');
      }, 1000);
    }
  };

  const handleAddressPress = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      navigation.navigate('AddressPage', { addresses });
    } else {
      setToastMessage('Please Login First');
      setShowToast(true);
      setTimeout(() => {
        navigation.navigate('Screen1');
      }, 1000);
    }
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

        <CosmeticProductsPage />
        <BabyProductspage ref={BabyProductspageRef} />
        <FreshVegetable />
        <FreshFruit />
           
      </ScrollView>

      <CartButton />

      <CustomToast 
        visible={showToast} 
        message={toastMessage} 
        duration={1000} 
        type="info"
        onHide={() => setShowToast(false)}
      />

      {!permissionGranted && (
        <View style={styles.permissionOverlay}>
          <View style={styles.permissionContent}>
        

            <View style={styles.permissionSheet}>
              <View style={styles.pinCircle}>
                <Icon name="location-on" size={36} color= 'rgb(42,145,52)' />
              </View>

              <Text style={styles.permissionTitle}>Location permission is off</Text>
              <Text style={styles.permissionSubtitle}>
                Enabling location helps us reach you quickly with accurate delivery
              </Text>

              <View style={styles.optionsContainer}>
                <View style={styles.optionItem}>
                  <View style={styles.optionLeft}>
                    <Icon name="my-location" size={24} color="#E91E63" />
                    <Text style={styles.optionText}>Use my Current Location</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.enableButton}
                    onPress={requestLocationPermission}
                  >
                    <Text style={styles.enableButtonText}>Enable</Text>
                  </TouchableOpacity>
                </View>

             
              </View>
            </View>
          </View>
        </View>
      )}
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
  permissionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  permissionContent: {
    width: '100%',
    alignItems: 'center',
  },
  basketballContainer: {
    marginBottom: -50,
    zIndex: 1001,
    backgroundColor: '#fff',
    borderRadius: 75,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  permissionSheet: {
    backgroundColor: '#fff',
    width: '100%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  pinCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE4ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  optionsContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  enableButton: {
    backgroundColor: '#ff0054',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LocationHeader;