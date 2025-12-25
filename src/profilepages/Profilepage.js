import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getProfile, updateProfile } from '../api';

const { width, height } = Dimensions.get('window');

const ProfilePage = ({navigation}) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [gender, setGender] = useState('Male');
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editingMobile, setEditingMobile] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      if (data.ok && data.user) {
        setName(data.user.name || '');
        setMobile(data.user.phone || '');
        setEmail(data.user.email || '');
        // Note: dateOfBirth, anniversary, gender are not in the provided schema
        // so they are not populated from backend
      } else {
        // If user not found or other error, maybe redirect to login or show error
        // For now just alert if it's a critical error, or fail silently
        // Alert.alert('Error', data.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while fetching profile');
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile) => {
    return (mobile.length === 10 || mobile.length === 12) && /^\d+$/.test(mobile);
  };

  const isFormValid = () => {
    if (!name.trim()) return false;
    // Mobile is usually read-only or validated if editable
    // if (!validateMobile(mobile)) return false; 
    if (email && !validateEmail(email)) return false;
    // dateOfBirth is optional in schema
    return true;
  };

  const handleUpdateProfile = async () => {
    if (!isFormValid()) {
      Alert.alert('Error', 'Please fill all required fields correctly');
      return;
    }
    
    if (email && !validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setUpdating(true);
      const userData = {
        name,
        email,
      };
      
      const data = await updateProfile(userData);
      
      if (data.ok) {
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while updating profile');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (text) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format as DD/MM/YYYY
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
    
    return formatted;
  };

  const handleMobileChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 12) {
      setMobile(cleaned);
    }
  };

  const handleMobileUpdate = async () => {
    if (!validateMobile(mobile)) {
      Alert.alert('Error', 'Please enter a valid 10 or 12 digit mobile number');
      return;
    }

    try {
      setUpdating(true);
      const userData = {
        name,
        email,
        phone: mobile,
      };
      
      const data = await updateProfile(userData);
      
      if (data.ok) {
        Alert.alert('Success', 'Mobile number updated successfully!');
        setEditingMobile(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to update mobile number');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while updating mobile number');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00A86B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Profile</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture */}
        <View style={styles.profileSection}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileInitial}>{name ? name.charAt(0).toUpperCase() : 'U'}</Text>
          </View>
          <TouchableOpacity style={styles.editIcon}>
            <Icon name="edit" size={18} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Name Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#999"
            />
            {name !== '' && (
              <TouchableOpacity onPress={() => setName('')}>
                <Icon name="cancel" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Mobile Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mobile</Text>
          <View style={styles.inputWrapperWithButton}>
            <TextInput
              style={styles.inputWithButton}
              value={mobile}
              onChangeText={handleMobileChange}
              placeholder="Enter mobile number"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={12}
              editable={editingMobile}
            />
            {editingMobile ? (
              <TouchableOpacity 
                onPress={handleMobileUpdate}
                disabled={!validateMobile(mobile) || updating}
                style={[styles.changeButton, (!validateMobile(mobile) || updating) && styles.changeButtonDisabled]}
              >
                <Text style={[styles.changeButtonText, (!validateMobile(mobile) || updating) && styles.changeButtonTextDisabled]}>
                  {updating ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={() => setEditingMobile(true)}
                style={styles.changeButton}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Email Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapperWithButton}>
            <TextInput
              style={styles.inputWithButton}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
             {/* Removed CHANGE button */}
          </View>
        </View>

        {/* Date of Birth Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date of birth</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={dateOfBirth}
              onChangeText={(text) => setDateOfBirth(formatDate(text))}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={10}
            />
            {dateOfBirth !== '' && (
              <TouchableOpacity onPress={() => setDateOfBirth('')}>
                <Icon name="cancel" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Anniversary Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Anniversary</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={anniversary}
              onChangeText={(text) => setAnniversary(formatDate(text))}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>
        </View>

        {/* Gender Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender</Text>
          <TouchableOpacity 
            style={styles.genderSelector}
            onPress={() => setShowGenderDropdown(!showGenderDropdown)}
          >
            <Text style={styles.genderText}>{gender}</Text>
            <Icon name="arrow-drop-down" size={24} color="#666" />
          </TouchableOpacity>
          
          {showGenderDropdown && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setGender('Male');
                  setShowGenderDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setGender('Female');
                  setShowGenderDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>Female</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setGender('Other');
                  setShowGenderDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>Other</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Update Button */}
        <TouchableOpacity 
          style={[
            styles.updateButton,
            (!isFormValid() || updating) && styles.updateButtonDisabled
          ]}
          onPress={handleUpdateProfile}
          disabled={!isFormValid() || updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[
              styles.updateButtonText,
              !isFormValid() && styles.updateButtonTextDisabled
            ]}>
              Update profile
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: width * 0.055,
    fontWeight: '600',
    color: '#000',
    marginLeft: width * 0.03,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: height * 0.03,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: height * 0.03,
    marginBottom: height * 0.04,
  },
  profileCircle: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: width * 0.175,
    backgroundColor: '#FFF8E7',
    borderWidth: 3,
    borderColor: '#D4A574',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: width * 0.15,
    fontWeight: '400',
    color: '#D4A574',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: width * 0.3,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inputContainer: {
    marginHorizontal: width * 0.05,
    marginBottom: height * 0.02,
  },
  label: {
    fontSize: width * 0.035,
    color: '#999',
    marginBottom: height * 0.01,
    marginLeft: width * 0.02,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.018,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    fontSize: width * 0.042,
    color: '#000',
    padding: 0,
  },
  inputWrapperWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingLeft: width * 0.04,
    paddingVertical: height * 0.018,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputWithButton: {
    flex: 1,
    fontSize: width * 0.042,
    color: '#000',
    padding: 0,
  },
  changeButton: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.012,
  },
  changeButtonText: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: '#00A86B',
  },
  changeButtonDisabled: {
    opacity: 0.5,
  },
  changeButtonTextDisabled: {
    color: '#999',
  },
  genderSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.018,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  genderText: {
    fontSize: width * 0.042,
    color: '#000',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: height * 0.01,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 5,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#00A86B',
    marginHorizontal: width * 0.05,
    marginTop: height * 0.02,
    paddingVertical: height * 0.02,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  updateButtonTextDisabled: {
    color: '#fff',
  },
});

export default ProfilePage;