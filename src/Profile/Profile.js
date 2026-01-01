import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../api';

const { height } = Dimensions.get('window');

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const data = await getProfile();
      if (data.ok && data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  };

  const showLogoutModal = () => {
    setLogoutModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideLogoutModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setLogoutModalVisible(false);
    });
  };

  const handleLogout = async () => {
    hideLogoutModal();
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      navigation.replace('Screen1');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user && user.name ? (
              <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
            ) : (
              <Icon name="person" size={40} color="#fff" />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Guest User'}</Text>
            <Text style={styles.profilePhone}>{user?.phone || ''}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('YourOrders')}
          >
            <Icon name="shopping-bag" size={28} color="#000" />
            <Text style={styles.actionText}>Your{'\n'}Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <MaterialCommunityIcons name="message-text-outline" size={28} color="#000" />
            <Text style={styles.actionText}>Help &{'\n'}Support</Text>
          </TouchableOpacity>

         
        </View>

        {/* Your Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Information</Text>

          <View style={styles.menuContainer}>
       

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('KeevaCart')}
            >
              <View style={styles.menuLeft}>
                <MaterialCommunityIcons name="cart-outline" size={24} color="#000" />
                <Text style={styles.menuText}>Your Cart</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <View style={styles.menuLeft}>
                <MaterialCommunityIcons name="message-text-outline" size={24} color="#000" />
                <Text style={styles.menuText}>Help & Support</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('AddressPage')}
            >
              <View style={styles.menuLeft}>
                <Icon name="location-on" size={24} color="#000" />
                <View>
                  <Text style={styles.menuText}>Saved Addresses</Text> 
                </View>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('ProfilePage')}
            >
              <View style={styles.menuLeft}>
                <Icon name="person-outline" size={24} color="#000" />
                <Text style={styles.menuText}>Profile</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Rewards')}
            >
              <View style={styles.menuLeft}>
                <MaterialCommunityIcons name="gift-outline" size={24} color="#000" />
                <Text style={styles.menuText}>Refer A Friend</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('')}
            >
              <View style={styles.menuLeft}>
                <MaterialCommunityIcons name="card-outline" size={24} color="#000" />
                <Text style={styles.menuText}>Keeva MemberShip</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Information</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={showLogoutModal}
            >
              <View style={styles.menuLeft}>
                <Icon name="logout" size={24} color="#E53935" />
                <Text style={styles.logoutText}>Logout</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={hideLogoutModal}
        animationType="none"
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={hideLogoutModal}
          />
          <Animated.View 
            style={[
              styles.logoutModalContent,
              {
                opacity: fadeAnim,
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                }],
              }
            ]}
          >
            <View style={styles.logoutModalHeader}>
              <Icon name="logout" size={40} color="#E53935" />
            </View>
            
            <Text style={styles.logoutModalTitle}>Logout?</Text>
            <Text style={styles.logoutModalMessage}>Are you sure you want to logout? You'll need to login again to access your account.</Text>

            <View style={styles.logoutModalActions}>
              <TouchableOpacity 
                style={[styles.logoutModalButton, styles.cancelButton]}
                onPress={hideLogoutModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.logoutModalButton, styles.confirmButton]}
                onPress={handleLogout}
              >
                <Text style={styles.confirmButtonText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', marginTop: 20 },
  backButton: { padding: 4, },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginLeft: 16, },
  scrollView: { flex: 1, },
  profileSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 24, },
  avatarContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#99d98c', justifyContent: 'center', alignItems: 'center', },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  profileInfo: { marginLeft: 16, },
  profileName: { fontSize: 22, fontWeight: '700', color: '#000', marginBottom: 4, },
  profilePhone: { fontSize: 15, color: '#555', },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 20, gap: 12, },
  actionCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, minHeight: 100, },
  actionText: { fontSize: 13, fontWeight: '600', color: '#000', textAlign: 'center', marginTop: 8, lineHeight: 18, },
  section: { marginTop: 8, },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000', paddingHorizontal: 20, paddingVertical: 16, },
  menuContainer: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', },
  menuLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, },
  menuText: { fontSize: 16, color: '#000', marginLeft: 16, },
  menuSubtext: { fontSize: 12, color: '#666', marginTop: 2, },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, },
  logoutText: { fontSize: 16, color: '#E53935', marginLeft: 16, fontWeight: '600', },
  bottomSpacer: { height: 40, },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  logoutModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  logoutModalHeader: {
    marginBottom: 16,
    backgroundColor: '#FFE8E8',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  logoutModalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
  },
  logoutModalActions: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  logoutModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#E53935',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default Profile;
