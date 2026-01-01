import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getProfile, updateProfile } from '../api';
import CustomToast from '../helperComponent/CustomToast';

const { width, height } = Dimensions.get('window');

const ProfilePage = ({navigation}) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      if (data.ok && data.user) {
        setName(data.user.name || '');
        // Strip 91 from phone for display
        const phone = data.user.phone || '';
        setMobile(phone.startsWith('91') ? phone.slice(2) : phone);
        setEmail(data.user.email || '');
        setRole(data.user.role || 'customer');
        setCreatedAt(data.user.createdAt || '');
      }
    } catch (error) {
      console.error(error);
      showToast('Some Error Occurs Try Later', 'info');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    if (!name.trim()) return false;
    if (email && !validateEmail(email)) return false;
    return true;
  };

  const handleUpdateProfile = async () => {
    if (!isFormValid()) {
      showToast('Please fill all required fields correctly', 'info');
      return;
    }
    
    try {
      setUpdating(true);
      // Auto-add 91 to phone for backend
      const phoneToSend = mobile.length === 10 ? '91' + mobile : mobile;
      
      const userData = {
        name,
        email,
        phone: phoneToSend,
      };
      
      const data = await updateProfile(userData);
      
      if (data.ok) {
        showToast('Profile Update SuccessFully', 'success');
        if (data.user) {
          setName(data.user.name || '');
          const phone = data.user.phone || '';
          setMobile(phone.startsWith('91') ? phone.slice(2) : phone);
          setEmail(data.user.email || '');
          setRole(data.user.role || 'customer');
          setCreatedAt(data.user.createdAt || '');
        }
      } else {
        showToast(data.message || 'Some Error Occurs Try Later', 'info');
      }
    } catch (error) {
      console.error(error);
      showToast('Some Error Occurs Try Later', 'info');
    } finally {
      setUpdating(false);
    }
  };

  const handleMobileChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setMobile(cleaned);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
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
      <CustomToast 
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
      
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
        {/* Profile Picture & Role */}
        <View style={styles.profileSection}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileInitial}>{name ? name.charAt(0).toUpperCase() : 'U'}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role.toUpperCase()}</Text>
          </View>
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

        {/* Mobile Field (Read-only as per typical profile behavior, but editable if requested) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mobile</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={mobile}
              onChangeText={handleMobileChange}
              placeholder="Enter mobile number"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={10}
              editable={false} 
            />
          </View>
        </View>

        {/* Email Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Account Created Date */}
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Account Created</Text>
          <View style={styles.infoWrapper}>
            <Icon name="calendar-today" size={20} color="#666" style={{ marginRight: 10 }} />
            <Text style={styles.infoText}>{formatDate(createdAt)}</Text>
          </View>
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
    marginTop: 20
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
    paddingBottom: height * 0.05,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: height * 0.03,
    position: 'relative',
  },
  profileCircle: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: (width * 0.25) / 2,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00A86B',
  },
  profileInitial: {
    fontSize: width * 0.1,
    fontWeight: '600',
    color: '#00A86B',
  },
  roleBadge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#00A86B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  roleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginHorizontal: width * 0.05,
    marginBottom: height * 0.02,
  },
  label: {
    fontSize: width * 0.038,
    color: '#666',
    marginBottom: height * 0.01,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: width * 0.04,
    paddingVertical: Platform.OS === 'ios' ? height * 0.018 : height * 0.005,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    fontSize: width * 0.042,
    color: '#000',
    paddingVertical: 10,
  },
  countryCode: {
    fontSize: width * 0.042,
    color: '#333',
    marginRight: 10,
    fontWeight: '500',
  },
  infoContainer: {
    marginHorizontal: width * 0.05,
    marginBottom: height * 0.02,
  },
  infoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.018,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoText: {
    fontSize: width * 0.04,
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#00A86B',
    marginHorizontal: width * 0.05,
    marginTop: height * 0.04,
    paddingVertical: height * 0.02,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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