// MapPickerScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const MapPickerScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backIconContainer}>
            <View style={styles.backArrow} />
          </View>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.headerTitle}>Select Your Location</Text>

        {/* Skip Button */}
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => navigation.navigate('LocationHeader')}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <View style={styles.searchIconContainer}>
            <View style={styles.searchIconCircle} />
            <View style={styles.searchIconHandle} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for apartment, street name..."
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=800&h=1200&fit=crop' }}
          style={styles.mapImage}
          resizeMode="cover"
        />
        
        {/* Gray overlay for map effect */}
        <View style={styles.mapOverlayFilter} />
        
        {/* Overlay elements */}
        <View style={styles.mapOverlay}>
          {/* Instruction Tooltip */}
          <View style={styles.tooltip}>
            <Text style={styles.tooltipTitle}>Order will be delivered here</Text>
            <Text style={styles.tooltipSubtitle}>Place the pin to your exact location</Text>
            <View style={styles.tooltipArrow} />
          </View>

          {/* Center Pin */}
          <View style={styles.pinContainer}>
            <View style={styles.pin}>
              <View style={styles.pinHead} />
              <View style={styles.pinPoint} />
            </View>
          </View>

          {/* Location Marker */}
          <View style={styles.locationMarker}>
            <View style={styles.markerIcon}>
              <View style={styles.markerDot} />
            </View>
            <View style={styles.markerLabel}>
              <Text style={styles.markerTitle}>Balipur</Text>
              <Text style={styles.markerSubtitle}>Pratapgarh</Text>
              <Text style={styles.markerAddress}>Jagwanti Petrol Pump</Text> 
            </View>
          </View>

          {/* Current Location Button */}
          <TouchableOpacity style={styles.currentLocationButton}>
            <View style={styles.currentLocationIcon}>
              <View style={styles.currentLocationDot} />
              <View style={styles.currentLocationRing} />
              <View style={styles.currentLocationRing2} />
              <View style={styles.currentLocationRing3} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Message */}
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          We are not serviceable at this location. Please select a different location.
        </Text>
      </View>

      {/* Location Info Section */}
      <View style={styles.locationInfoContainer}>
        <Text style={styles.locationTitle}>Balipur</Text>
        <Text style={styles.locationSubtitle}>Pratapgarh</Text>
        <Text style={styles.distanceText}>
          Pin location is 5.2 kms away from your current location
        </Text>

        {/* Confirm Button (Disabled) */}
        <TouchableOpacity 
          style={styles.confirmButton}
          disabled
          activeOpacity={0.7}
        >
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};



/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',   // IMPORTANT
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    
    marginTop:20
  },

  backIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backArrow: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#000',
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    
    marginTop:20
  },

  /* SKIP BUTTON */
  skipButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop:20,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '700', 
    color: '#111',
  },

  /* Search Bar */
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 16,
    height: 52,
  },
  searchIconContainer: {
    width: 20,
    height: 20,
    marginRight: 12,
    position: 'relative',
  },
  searchIconCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#757575',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  searchIconHandle: {
    width: 6,
    height: 2,
    backgroundColor: '#757575',
    position: 'absolute',
    bottom: 2,
    right: 0,
    transform: [{ rotate: '45deg' }],
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    padding: 0,
  },

  /* Map */
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlayFilter: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Tooltip */
  tooltip: {
    position: 'absolute',
    top: 80,
    backgroundColor: '#2C2C2C',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    maxWidth: 280,
    elevation: 8,
  },
  tooltipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  tooltipSubtitle: {
    fontSize: 13,
    color: '#E0E0E0',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#2C2C2C',
  },

  /* Pin */
  pinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -15,
    marginTop: -45,
  },
  pin: {
    alignItems: 'center',
  },
  pinHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E91E63',
    borderWidth: 4,
    borderColor: '#fff',
  },
  pinPoint: {
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 12,
    borderTopColor: '#E91E63',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },

  /* Marker */
  locationMarker: {
    position: 'absolute',
    bottom: '35%',
    left: '28%',
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    maxWidth: 180,
  },
  markerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#666',
  },
  markerLabel: {
    flex: 1,
  },

  /* Error */
  errorContainer: {
    backgroundColor: '#FFE5E5',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
    fontWeight: '500',
  },

  /* Location info */
  locationInfoContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
  },
  locationTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
  },
  locationSubtitle: {
    fontSize: 17,
    color: '#666',
  },
  distanceText: {
    fontSize: 13,
    color: '#E91E63',
    marginBottom: 24,
    fontWeight: '500',
  },

  /* Confirm Button */
  confirmButton: {
    backgroundColor: '#E5E5E5',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#9E9E9E',
  },
});

export default MapPickerScreen;
