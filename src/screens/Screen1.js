import React, { useState, useEffect } from 'react';
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
  Keyboard,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { sendOtp } from '../api';

export default function Screen1({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', body: '' });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

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
      navigation.navigate('Screen2', { phoneNumber: fullPhoneNumber });
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openPolicy = (type) => {
    const content = type === 'terms' ? {
      title: 'Terms of Use',
      body: `Welcome to Keeva. By using our application, you agree to the following terms and conditions:

1. Acceptance of Terms
By accessing or using Keeva, you agree to be bound by these Terms of Use and all applicable laws and regulations.

2. Description of Service
Keeva provides a platform for quick delivery of grocery and daily essential items at the lowest prices.

3. User Accounts
You are responsible for maintaining the confidentiality of your account and phone number. All activities under your account are your responsibility.

4. Delivery Policy
We aim to deliver within 30 minutes, however, external factors like traffic, weather, or high demand may cause delays.

5. Pricing and Payments
Prices are subject to change without notice. Payments must be made through the integrated payment gateways or cash on delivery where applicable.

6. Cancellation and Refunds
Orders can only be cancelled before they are dispatched. Refunds will be processed according to our standard refund policy.

7. Contact Information
If you have any questions, please contact us at:
Phone: +91 9569125048
Email: pandeykaran1515@gmail.com`
    } : {
      title: 'Privacy Policy',
      body: `Your privacy is important to us. This Privacy Policy explains how Keeva collects, uses, and protects your information.

1. Information Collection
We collect your phone number for authentication and order tracking. We also collect location data to provide delivery services.

2. Use of Information
- To process and deliver your orders.
- To send OTP and order updates.
- To improve our services and user experience.

3. Data Security
We implement industry-standard security measures to protect your personal information from unauthorized access.

4. Sharing of Information
We do not sell your personal information. We only share data with delivery partners and service providers necessary for operation.

5. Permissions
The app requires permissions for Location (to find your address), SMS (for OTP auto-read), and Contacts (optional for sharing).

6. Cookies and Tracking
We use cookies and similar technologies to track app usage and maintain user sessions.

7. Changes to Policy
We may update this policy from time to time. Continued use of the app signifies acceptance of the updated policy.

8. Contact Us
For any privacy-related concerns:
Phone: +91 9569125048
Email: pandeykaran1515@gmail.com`
    };
    setModalContent(content);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgb(42,145,52)" />

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

          {!isKeyboardVisible && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our{'\n'}
                <Text style={styles.linkText} onPress={() => openPolicy('terms')}>Terms of Use</Text>
                <Text style={styles.footerText}> & </Text>
                <Text style={styles.linkText} onPress={() => openPolicy('privacy')}>Privacy Policy</Text>
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalContent.title}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.policyText}>{modalContent.body}</Text>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    fontFamily: 'sans-serif-medium',
  },
  taglineContainer: {
    marginTop: 30,
  },
  tagline: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    fontFamily: 'sans-serif-medium',
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
    marginLeft: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    height: '90%',
    width: '100%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    flex: 1,
  },
  policyText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    textAlign: 'justify',
  },
});
