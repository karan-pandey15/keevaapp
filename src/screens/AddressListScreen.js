// LocationSelectorScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const LocationSelectorScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const savedAddresses = [
    {
      id: 1,
      label: 'Other',
      distance: '543.5 km',
      address: '22, Sector 49, Baraula, Natthu Colony, Noida',
      icon: 'map-pin',
    }, 
    {
      id: 2,
      label: 'Work',
      distance: '550.2 km',
      address: 'Floor 1, Block G-19, Itdose, Itdose, Sector 6, F Block, G Block, Noida',
      icon: 'briefcase',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Address"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Quick Actions */}
     <View style={styles.quickActionsContainer}>

  {/* Current Location */}
  <TouchableOpacity
    style={styles.currentLocationButton}
    onPress={() => navigation.navigate("MapPicker")}
  >
    <Icon name="map-pin" size={20} color="#E91E63" />
    <Text style={styles.currentLocationText}>Use my Current Location</Text>
  </TouchableOpacity>

  {/* Add New Address */}
  <TouchableOpacity
    style={styles.actionButton}
    onPress={() => navigation.navigate("MapPicker")}
  >
    <View style={styles.actionButtonLeft}>
      <Icon name="plus" size={20} color="#E91E63" />
      <Text style={styles.actionButtonText}>Add New Address</Text>
    </View>
    <Icon name="chevron-right" size={20} color="#999" />
  </TouchableOpacity>

  {/* Request From Friend */}
  <TouchableOpacity
    style={styles.actionButton}
    onPress={() => navigation.navigate("MapPicker")}
  >
    <View style={styles.actionButtonLeft}>
      <Icon name="users" size={20} color="#E91E63" />
      <Text style={styles.actionButtonText}>Request Address from Friend</Text>
    </View>
    <Icon name="chevron-right" size={20} color="#999" />
  </TouchableOpacity>

</View>


        {/* Saved Addresses */}
        <View style={styles.savedAddressesContainer}>
          <Text style={styles.savedAddressesTitle}>Saved Addresses</Text>

          {savedAddresses.map((item) => (
            <View key={item.id} style={styles.addressCard}>
              <View style={styles.addressIconContainer}>
                <Icon name={item.icon} size={20} color="#333" />
              </View>

              <View style={styles.addressInfo}>
                <View style={styles.addressHeader}>
                  <Text style={styles.addressLabel}>{item.label}</Text>
                  <Text style={styles.addressDot}>•</Text>
                  <Text style={styles.addressDistance}>{item.distance}</Text>
                </View>
                <Text style={styles.addressText}>{item.address}</Text>
              </View>

              <View style={styles.addressActions}>
                <TouchableOpacity style={styles.iconButton}>
                  <Icon name="share-2" size={18} color="#999" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Icon name="more-vertical" size={18} color="#999" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    
    marginTop:20
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    
    marginTop:20
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    padding: 0,
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E91E63',
    marginLeft: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 12,
  },
  savedAddressesContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  savedAddressesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  addressIconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  addressInfo: {
    flex: 1,
    marginRight: 8,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  addressDot: {
    fontSize: 16,
    color: '#ccc',
    marginHorizontal: 6,
  },
  addressDistance: {
    fontSize: 14,
    color: '#999',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 2,
  },
  iconButton: {
    padding: 4,
    marginLeft: 4,
  },
});

export default LocationSelectorScreen;