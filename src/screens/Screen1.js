import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { sendOtp } from '../api';

export default function Screen1({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneNumberChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) {
      setPhoneNumber(cleaned);
    }
  };

  const isButtonEnabled = phoneNumber.length === 10;

  const handleContinue = async () => {
    if (!isButtonEnabled) return;
    
    setIsLoading(true);
    try {
      const fullPhoneNumber = `91${phoneNumber}`;
      const response = await sendOtp(fullPhoneNumber);
      // You might want to check response.ok or similar here depending on API
      navigation.navigate('Screen2', { phoneNumber: fullPhoneNumber });
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgb(42,145,52)" />

      {/* Ensures layout stays stable when keyboard opens */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('LocationHeader')}
          >
            <Text style={styles.skipText}>Skip  ›</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Keeva</Text>
          </View>

          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>Lowest Prices Everyday</Text>
            <Text style={styles.tagline}>in 30 minutes*</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.countryCode}>+91</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Phone Number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              (!isButtonEnabled || isLoading) && styles.continueButtonDisabled,
            ]}
            disabled={!isButtonEnabled || isLoading}
            activeOpacity={0.8}
            onPress={handleContinue}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          {/* FIXED FOOTER – STAYS AT BOTTOM ALWAYS */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{'\n'}
              <Text style={styles.linkText}>Terms of Use</Text>
              <Text style={styles.footerText}> & </Text>
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(42,145,52)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoContainer: {
    marginTop: 60,
  },
  logoText: {
    color: '#fff',
    fontSize: 70,
    fontWeight: 'bold',
    letterSpacing: 2,
    fontFamily: 'sans-serif-medium', // modern font
  },
  taglineContainer: {
    marginTop: 30,
  },
  tagline: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    fontFamily: 'sans-serif-medium', // modern font
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 20,
    marginTop: 80,
    height: 56,
  },
  countryCode: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  continueButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#FF6B9D',
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  footerText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    color: '#FFD700',
    fontWeight: '600',
  },
});
