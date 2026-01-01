import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Modal,
  Animated,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Switch,
  PermissionsAndroid
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { BASE_URL } from '../api';
import { useFocusEffect } from '@react-navigation/native';
import CustomToast from '../helperComponent/CustomToast';

const { width, height } = Dimensions.get('window');

const AddressPage = ({ navigation }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false); // Options modal
  const [formModalVisible, setFormModalVisible] = useState(false); // Add/Edit form modal
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // Delete confirmation modal
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [formSlideAnim] = useState(new Animated.Value(height));
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  // Form state
  const [formData, setFormData] = useState({
    label: '',
    houseNo: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    latitude: null,
    longitude: null,
    isDefault: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState();
  const [submitting, setSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const fetchAddresses = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        showToast('User not authenticated', 'info');
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
        if (data.addresses) {
            setAddresses(data.addresses);
        } else if (Array.isArray(data)) {
            setAddresses(data);
        } else {
            console.log('Fetched addresses structure:', data);
            setAddresses([]); 
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
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const handleSaveAddress = async () => {
    if (!formData.houseNo || !formData.street || !formData.city || !formData.state || !formData.pincode) {
      showToast('Please fill in all required fields', 'info');
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const url = isEditing 
        ? `${BASE_URL}/user/addresses/${editingId}`
        : `${BASE_URL}/user/addresses`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`Address ${isEditing ? 'updated' : 'added'} successfully`, 'success');
        hideFormModal();
        fetchAddresses();
      } else {
        showToast(data.message || 'Something went wrong', 'info');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      showToast('Failed to save address', 'info');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = () => {
    if (!selectedAddress) return;
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${BASE_URL}/user/addresses/${selectedAddress._id || selectedAddress.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setDeleteModalVisible(false);
        hideModal();
        fetchAddresses();
        showToast('Address deleted successfully', 'success');
      } else {
        showToast('Failed to delete address', 'info');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      showToast('Failed to delete address', 'info');
    }
  };

  const showModal = (address) => {
    setSelectedAddress(address);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedAddress(null);
    });
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Keeva App needs access to your location to provide accurate delivery.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      showToast('Location permission is required', 'info');
      return;
    }

    setLocationLoading(true);
    
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Coordinates obtained:', latitude, longitude);
        
        try {
          const token = await AsyncStorage.getItem('userToken');
          const response = await fetch(`https://api.keeva.in/user/addresses/geocode?latitude=${latitude}&longitude=${longitude}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          
          if (data.ok && data.address) {
            const { address } = data;
            setFormData({
              label: '',
              houseNo: address.houseNo || '',
              street: address.street || '',
              landmark: address.landmark || '',
              city: address.city || '',
              state: address.state || '',
              pincode: address.pincode || '',
              latitude: latitude,
              longitude: longitude,
              isDefault: false
            });
            
            setIsEditing(false);
            setEditingId(null);
            setFormModalVisible(true);
            Animated.timing(formSlideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          } else {
            setFormData(prev => ({ ...prev, latitude, longitude }));
            setIsEditing(false);
            setEditingId(null);
            setFormModalVisible(true);
            Animated.timing(formSlideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
            showToast('Captured location, but could not fetch address details.', 'info');
          }
        } catch (error) {
          console.error('Geocode API Error:', error);
          setFormData(prev => ({ ...prev, latitude, longitude }));
          setIsEditing(false);
          setEditingId(null);
          setFormModalVisible(true);
          Animated.timing(formSlideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
          showToast('Geocode API Error', 'info');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        console.error('Location Error:', error);
        let errorMsg = 'Failed to get location. Please ensure location services are enabled.';
        if (error.code === 1) errorMsg = 'Location permission denied.';
        else if (error.code === 2) errorMsg = 'Location provider unavailable.';
        else if (error.code === 3) errorMsg = 'Location request timed out.';
        showToast(errorMsg, 'info');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const showFormModal = (address = null) => {
    if (address) {
      setIsEditing(true);
      setEditingId(address._id || address.id);
      setFormData({
        label: address.label || '',
        houseNo: address.houseNo || '',
        street: address.street || '',
        landmark: address.landmark || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        latitude: address.latitude || null,
        longitude: address.longitude || null,
        isDefault: address.isDefault || false,
      });
      // If we are editing from the options modal, hide it first
      if (modalVisible) hideModal();
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        label: '',
        houseNo: '',
        street: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        latitude: null,
        longitude: null,
        isDefault: false
      });
    }
    
    setFormModalVisible(true);
    Animated.timing(formSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideFormModal = () => {
    Animated.timing(formSlideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setFormModalVisible(false);
      setIsEditing(false);
      setEditingId(null);
    });
  };

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const renderAddressCard = (address) => (
    <View key={address._id || address.id} style={styles.addressCard}>
      <View style={styles.cardHeader}>
        <View style={styles.leftSection}>
          <Icon name={address.label === 'Work' ? 'work' : 'home'} size={28} color="#666" />
        </View>

        <View style={styles.middleSection}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.addressType}>{address.label || 'Home'}</Text>
            {address.isDefault && (
                <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                </View>
            )}
          </View>
          <Text style={styles.addressText}>
            {`${address.houseNo}, ${address.street}, ${address.landmark ? address.landmark + ', ' : ''}${address.city}, ${address.state} - ${address.pincode}`}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => showModal(address)}
        >
          <Icon name="more-horiz" size={24} color="#00A86B" />
        </TouchableOpacity>
 
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Addresses</Text>
          </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Add Address Button */}
        <TouchableOpacity style={styles.addAddressButton} onPress={() => showFormModal()}>
          <Icon name="add" size={24} color="#00A86B" />
          <Text style={styles.addAddressText}>Add Address</Text>
          <Icon name="chevron-right" size={24} color="#00A86B" style={styles.chevronRight} />
        </TouchableOpacity>

        {/* Use My Current Location Button */}
        <TouchableOpacity 
          style={styles.currentLocationBtn} 
          onPress={getCurrentLocation}
          disabled={locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color="#00A86B" />
          ) : (
            <Icon name="my-location" size={24} color="#00A86B" />
          )}
          <Text style={styles.currentLocationBtnText}>
            {locationLoading ? 'Fetching Location...' : 'Use my current location'}
          </Text>
        </TouchableOpacity>

        {/* Saved Addresses Section */}
        <Text style={styles.sectionTitle}>SAVED ADDRESSES</Text>

        {/* Address Cards */}
        {loading ? (
            <ActivityIndicator size="large" color="#00A86B" style={{marginTop: 20}} />
        ) : (
            addresses.map((address) => renderAddressCard(address))
        )}
        {!loading && addresses.length === 0 && (
            <Text style={{textAlign: 'center', marginTop: 20, color: '#666'}}>No addresses found.</Text>
        )}
      </ScrollView>

      {/* Options Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideModal}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={hideModal}
        >
          <Animated.View 
            style={[
              styles.modalOverlayBackground,
              {
                opacity: fadeAnim,
              }
            ]}
          />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, 0],
                }),
              }],
            }
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={hideModal}
          >
            <Icon name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.modalInner}>
            <Text style={styles.modalTitle}>Address options</Text>

            {/* Edit Address */}
            <TouchableOpacity 
              style={styles.modalOption}
              activeOpacity={0.7}
              onPress={() => showFormModal(selectedAddress)}
            >
              <Icon name="edit" size={24} color="#000" />
              <Text style={styles.modalOptionText}>Edit Address</Text>
              <Icon name="chevron-right" size={24} color="#666" style={styles.modalChevron} />
            </TouchableOpacity>

            {/* Delete Address */}
            <TouchableOpacity 
              style={styles.modalOption}
              activeOpacity={0.7}
              onPress={handleDeleteAddress}
            >
              <Icon name="delete-outline" size={24} color="#000" />
              <Text style={styles.modalOptionText}>Delete Address</Text>
              <Icon name="chevron-right" size={24} color="#666" style={styles.modalChevron} />
            </TouchableOpacity>
 
          </View>
        </Animated.View>
      </Modal>

      {/* Add/Edit Address Form Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={formModalVisible}
        onRequestClose={hideFormModal}
      >
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{flex: 1}}
        >
            <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1}
            onPress={hideFormModal}
            >
            <View style={styles.modalOverlayBackground} />
            </TouchableOpacity>

            <Animated.View
            style={[
                styles.formModalContent,
                {
                transform: [{ translateY: formSlideAnim }],
                }
            ]}
            >
            <View style={styles.formHeader}>
                <Text style={styles.formTitle}>{isEditing ? 'Edit Address' : 'Add New Address'}</Text>
                <TouchableOpacity onPress={hideFormModal}>
                    <Icon name="close" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Label (e.g., Home, Work)</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.label}
                        onChangeText={(text) => setFormData({...formData, label: text})}
                        placeholder="Home"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>House No / Flat No *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.houseNo}
                        onChangeText={(text) => setFormData({...formData, houseNo: text})}
                        placeholder="123"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Street / Area *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.street}
                        onChangeText={(text) => setFormData({...formData, street: text})}
                        placeholder="Main Street"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Landmark</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.landmark}
                        onChangeText={(text) => setFormData({...formData, landmark: text})}
                        placeholder="Near Park"
                    />
                </View>

                <View style={styles.row}>
                    <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
                        <Text style={styles.label}>City *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.city}
                            onChangeText={(text) => setFormData({...formData, city: text})}
                            placeholder="City"
                        />
                    </View>
                    <View style={[styles.inputGroup, {flex: 1}]}>
                        <Text style={styles.label}>State *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.state}
                            onChangeText={(text) => setFormData({...formData, state: text})}
                            placeholder="State"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Pincode *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.pincode}
                        onChangeText={(text) => setFormData({...formData, pincode: text})}
                        placeholder="123456"
                        keyboardType="numeric"
                        maxLength={6}
                    />
                </View>

                <View style={styles.switchContainer}>
                    <Text style={styles.label}>Set as Default Address</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: "#00A86B" }}
                        thumbColor={formData.isDefault ? "#fff" : "#f4f3f4"}
                        onValueChange={(value) => setFormData({...formData, isDefault: value})}
                        value={formData.isDefault}
                    />
                </View>

                <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSaveAddress}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Address</Text>
                    )}
                </TouchableOpacity>
                <View style={{height: 40}} /> 
            </ScrollView>
            </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <View style={styles.confirmIconContainer}>
              <Icon name="delete-sweep" size={40} color="#FF4D4D" />
            </View>
            <Text style={styles.confirmTitle}>Delete Address?</Text>
            <Text style={styles.confirmMessage}>Are you sure you want to delete this address? This action cannot be undone.</Text>
            
            <View style={styles.confirmButtonContainer}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelBtn]} 
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmButton, styles.deleteBtn]} 
                onPress={confirmDelete}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Toast Notification */}
      <CustomToast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingTop: Platform.OS === 'ios' ? height * 0.06 : height * 0.02,
    paddingBottom: height * 0.02,
    backgroundColor: '#fff',
    marginTop:20
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: width * 0.06,
    fontWeight: '700',
    color: '#000',
    marginLeft: width * 0.02,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: height * 0.03,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: width * 0.04,
    marginTop: height * 0.02,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addAddressText: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#00A86B',
    marginLeft: width * 0.03,
    flex: 1,
  },
  chevronRight: {
    marginLeft: 'auto',
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: width * 0.04,
    marginTop: height * 0.015,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  currentLocationBtnText: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#00A86B',
    marginLeft: width * 0.03,
  },
  blinkitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: width * 0.04,
    marginTop: height * 0.015,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.04,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  blinkitLogo: {
    backgroundColor: '#F8D448',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.012,
    borderRadius: 8,
  },
  blinkitLogoText: {
    fontSize: width * 0.038,
    fontWeight: '700',
    color: '#000',
  },
  blinkitText: {
    fontSize: width * 0.045,
    fontWeight: '500',
    color: '#00A86B',
    marginLeft: width * 0.03,
    flex: 1,
  },
  sectionTitle: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: '#999',
    marginHorizontal: width * 0.04,
    marginTop: height * 0.03,
    marginBottom: height * 0.015,
    letterSpacing: 0.5,
  },
  addressCard: {
    backgroundColor: '#fff',
    marginHorizontal: width * 0.04,
    marginBottom: height * 0.015,
    borderRadius: 12,
    padding: width * 0.04,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: height * 0.015,
  },
  leftSection: {
    alignItems: 'center',
    marginRight: width * 0.04,
  },
  distance: {
    fontSize: width * 0.03,
    color: '#666',
    marginTop: height * 0.005,
  },
  middleSection: {
    flex: 1,
  },
  addressType: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#000',
    marginBottom: height * 0.008,
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    marginBottom: 4
  },
  defaultText: {
    color: '#00A86B',
    fontSize: 10,
    fontWeight: 'bold'
  },
  addressText: {
    fontSize: width * 0.038,
    color: '#666',
    lineHeight: width * 0.052,
    marginBottom: height * 0.008,
  },
  phoneText: {
    fontSize: width * 0.035,
    color: '#666',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: height * 0.015,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF8',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.01,
    borderRadius: 20,
    marginRight: width * 0.03,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? height * 0.04 : height * 0.02,
  },
  closeButton: {
    position: 'absolute',
    top: -height * 0.08,
    alignSelf: 'center',
    backgroundColor: '#333',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInner: {
    padding: width * 0.05,
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: '700',
    color: '#000',
    marginBottom: height * 0.03,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  modalOptionText: {
    fontSize: width * 0.045,
    color: '#000',
    marginLeft: width * 0.04,
    flex: 1,
  },
  modalChevron: {
    marginLeft: 'auto',
  },
  // Form Modal Styles
  formModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.85,
    marginTop: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  formScrollView: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#f9f9f9',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: '#00A86B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContent: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  confirmIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  confirmButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F5F5F5',
    marginRight: 12,
  },
  deleteBtn: {
    backgroundColor: '#FF4D4D',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deleteBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AddressPage;
