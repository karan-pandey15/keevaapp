import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

const HelpSupport = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('faq');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const phoneNumber = '+918957056844';
  const email = 'keeva@support.com';

  // FAQ Data
  const faqs = [
    {
      id: 1,
      question: 'How do I place an order?',
      answer: 'To place an order, simply browse our Products Page, add items to your cart, and proceed to checkout. Enter your delivery address and payment details to complete the order.',
    },
    {
      id: 2,
      question: 'What are the delivery charges?',
      answer: 'Delivery charges vary based on your location and order value. Orders above ₹159  are eligible for free delivery. You can see the exact delivery charges at checkout.',
    },
    {
      id: 3,
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 20-35 minutes. During peak hours, it might take slightly longer. You can track your order in real-time from the app.',
    },
    {
      id: 4,
      question: 'What payment methods are accepted?',
      answer: 'We accept all major payment methods including Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery. Digital wallets like Paytm, PhonePe are also accepted.',
    },
    {
      id: 5,
      question: 'Can I cancel or modify my order?',
      answer: 'You can cancel or modify your order within 5 minutes of placing it. After that, please contact our support team for assistance.',
    },
    {
      id: 6,
      question: 'What is your refund policy?',
      answer: 'If you receive damaged or incorrect items, you can request a refund within 24 hours of delivery. Refunds are processed within 5-7 business days.',
    },
    {
      id: 7,
      question: 'How do I track my order?',
      answer: 'Once your order is confirmed, you can track it in real-time from the "Your Orders" section. You will also receive notifications about your order status.',
    },
    {
      id: 8,
      question: 'Are there any offers or discounts?',
      answer: 'Yes! Check the "Offers" section in the app for current deals and discounts. We regularly update our offers and send notifications about exclusive deals.',
    },
  ];

  // Handle FAQ toggle
  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  // Handle Call
  const handleCall = () => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Unable to make a call');
    });
  };

  // Handle WhatsApp
  const handleWhatsApp = () => {
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'WhatsApp is not installed on your device');
    });
  };

  // Handle Email
  const handleEmail = () => {
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert('Error', 'Unable to open email client');
    });
  };

  // Render FAQ Tab
  const renderFaqTab = () => (
    <ScrollView
      style={styles.tabContent}
      contentContainerStyle={styles.tabContentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.faqHeader}>
        <Icon name="help-outline" size={40} color="#00A86B" />
        <Text style={styles.faqHeaderTitle}>Frequently Asked Questions</Text>
        <Text style={styles.faqHeaderSubtitle}>
          Find answers to common questions
        </Text>
      </View>

      {faqs.map((faq) => (
        <View key={faq.id} style={styles.faqCard}>
          <TouchableOpacity
            style={styles.faqQuestion}
            onPress={() => toggleFaq(faq.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.faqQuestionText}>{faq.question}</Text>
            <Icon
              name={expandedFaq === faq.id ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>

          {expandedFaq === faq.id && (
            <View style={styles.faqAnswer}>
              <Text style={styles.faqAnswerText}>{faq.answer}</Text>
            </View>
          )}
        </View>
      ))}

      <View style={styles.stillNeedHelp}>
        <Text style={styles.stillNeedHelpText}>Still need help?</Text>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => setActiveTab('contact')}
        >
          <Text style={styles.contactButtonText}>Contact Us</Text>
          <Icon name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Render Contact Us Tab
  const renderContactTab = () => (
    <ScrollView
      style={styles.tabContent}
      contentContainerStyle={styles.tabContentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contactHeader}>
        <Icon name="headset-mic" size={50} color="#00A86B" />
        <Text style={styles.contactHeaderTitle}>We're Here to Help!</Text>
        <Text style={styles.contactHeaderSubtitle}>
          Get in touch with us through any of these channels
        </Text>
      </View>

      {/* Phone Call Card */}
      <TouchableOpacity
        style={styles.contactCard}
        onPress={handleCall}
        activeOpacity={0.8}
      >
        <View style={[styles.contactIconContainer, { backgroundColor: '#E8F5F1' }]}>
          <Icon name="phone" size={30} color="#00A86B" />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>Call Us</Text>
          <Text style={styles.contactSubtitle}>Talk to our support team</Text>
          <Text style={styles.contactDetail}>{phoneNumber}</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#00A86B" />
      </TouchableOpacity>

      {/* WhatsApp Card */}
      <TouchableOpacity
        style={styles.contactCard}
        onPress={handleWhatsApp}
        activeOpacity={0.8}
      >
        <View style={[styles.contactIconContainer, { backgroundColor: '#E8F8F5' }]}>
          <FontAwesome name="whatsapp" size={30} color="#25D366" />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>WhatsApp</Text>
          <Text style={styles.contactSubtitle}>Chat with us on WhatsApp</Text>
          <Text style={styles.contactDetail}>{phoneNumber}</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#25D366" />
      </TouchableOpacity>

      {/* Email Card */}
      <TouchableOpacity
        style={styles.contactCard}
        onPress={handleEmail}
        activeOpacity={0.8}
      >
        <View style={[styles.contactIconContainer, { backgroundColor: '#FFF4E6' }]}>
          <Icon name="email" size={30} color="#FF9800" />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>Email Us</Text>
          <Text style={styles.contactSubtitle}>Send us your queries</Text>
          <Text style={styles.contactDetail}>{email}</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#FF9800" />
      </TouchableOpacity>

      {/* Support Hours Card */}
      <View style={styles.supportHoursCard}>
        <View style={styles.supportHoursHeader}>
          <MaterialCommunityIcons name="clock-outline" size={24} color="#666" />
          <Text style={styles.supportHoursTitle}>Support Hours</Text>
        </View>
        <View style={styles.supportHoursContent}>
          <View style={styles.supportHoursRow}>
            <Text style={styles.supportHoursDay}>Monday - Friday</Text>
            <Text style={styles.supportHoursTime}>8:00 AM - 8:00 PM</Text>
          </View>
          <View style={styles.supportHoursRow}>
            <Text style={styles.supportHoursDay}>Saturday</Text>
            <Text style={styles.supportHoursTime}>07:00 AM - 10:00 PM</Text>
          </View>
          <View style={styles.supportHoursRow}>
            <Text style={styles.supportHoursDay}>Sunday</Text>
            <Text style={styles.supportHoursTime}>07:00 AM - 10:00 PM</Text>
          </View>
        </View>
      </View>

      {/* Quick Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Have your order ID ready for faster assistance
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Check our FAQ section for instant answers
          </Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipBullet}>•</Text>
          <Text style={styles.tipText}>
            Average response time: Under 5 minutes
          </Text>
        </View>
      </View>
    </ScrollView>
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
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'faq' && styles.activeTab]}
          onPress={() => setActiveTab('faq')}
          activeOpacity={0.8}
        >
          <Icon
            name="help-outline"
            size={22}
            color={activeTab === 'faq' ? '#00A86B' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'faq' && styles.activeTabText]}>
            FAQ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'contact' && styles.activeTab]}
          onPress={() => setActiveTab('contact')}
          activeOpacity={0.8}
        >
          <Icon
            name="contact-support"
            size={22}
            color={activeTab === 'contact' ? '#00A86B' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>
            Contact Us
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'faq' ? renderFaqTab() : renderContactTab()}
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
        marginTop:20
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: width * 0.055,
    fontWeight: '700',
    color: '#000',
    marginLeft: width * 0.03,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.015,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.015,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#00A86B',
  },
  tabText: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#666',
    marginLeft: width * 0.02,
  },
  activeTabText: {
    color: '#00A86B',
  },
  tabContent: {
    flex: 1,
  },
  tabContentContainer: {
    paddingBottom: height * 0.03,
  },
  faqHeader: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: height * 0.04,
    marginBottom: height * 0.02,
  },
  faqHeaderTitle: {
    fontSize: width * 0.055,
    fontWeight: '700',
    color: '#000',
    marginTop: height * 0.015,
    marginBottom: height * 0.008,
  },
  faqHeaderSubtitle: {
    fontSize: width * 0.038,
    color: '#666',
    textAlign: 'center',
  },
  faqCard: {
    backgroundColor: '#fff',
    marginHorizontal: width * 0.04,
    marginBottom: height * 0.012,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: width * 0.04,
  },
  faqQuestionText: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: width * 0.02,
  },
  faqAnswer: {
    paddingHorizontal: width * 0.04,
    paddingBottom: height * 0.02,
    paddingTop: height * 0.01,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  faqAnswerText: {
    fontSize: width * 0.038,
    color: '#666',
    lineHeight: width * 0.055,
  },
  stillNeedHelp: {
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: width * 0.04,
    marginTop: height * 0.03,
    paddingVertical: height * 0.03,
    borderRadius: 12,
  },
  stillNeedHelpText: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#000',
    marginBottom: height * 0.02,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A86B',
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.015,
    borderRadius: 25,
  },
  contactButtonText: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#fff',
    marginRight: width * 0.02,
  },
  contactHeader: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: height * 0.04,
    marginBottom: height * 0.02,
  },
  contactHeaderTitle: {
    fontSize: width * 0.055,
    fontWeight: '700',
    color: '#000',
    marginTop: height * 0.015,
    marginBottom: height * 0.008,
  },
  contactHeaderSubtitle: {
    fontSize: width * 0.038,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: width * 0.08,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: width * 0.04,
    marginBottom: height * 0.015,
    padding: width * 0.04,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  contactIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.04,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: width * 0.045,
    fontWeight: '700',
    color: '#000',
    marginBottom: height * 0.005,
  },
  contactSubtitle: {
    fontSize: width * 0.035,
    color: '#666',
    marginBottom: height * 0.008,
  },
  contactDetail: {
    fontSize: width * 0.038,
    fontWeight: '600',
    color: '#00A86B',
  },
  supportHoursCard: {
    backgroundColor: '#fff',
    marginHorizontal: width * 0.04,
    marginTop: height * 0.02,
    padding: width * 0.04,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  supportHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  supportHoursTitle: {
    fontSize: width * 0.045,
    fontWeight: '700',
    color: '#000',
    marginLeft: width * 0.02,
  },
  supportHoursContent: {
    paddingTop: height * 0.01,
  },
  supportHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: height * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  supportHoursDay: {
    fontSize: width * 0.038,
    color: '#666',
  },
  supportHoursTime: {
    fontSize: width * 0.038,
    fontWeight: '600',
    color: '#000',
  },
  tipsCard: {
    backgroundColor: '#FFF9E6',
    marginHorizontal: width * 0.04,
    marginTop: height * 0.02,
    padding: width * 0.04,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  tipsTitle: {
    fontSize: width * 0.045,
    fontWeight: '700',
    color: '#000',
    marginBottom: height * 0.015,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: height * 0.01,
  },
  tipBullet: {
    fontSize: width * 0.045,
    color: '#FF9800',
    marginRight: width * 0.02,
    fontWeight: '700',
  },
  tipText: {
    fontSize: width * 0.037,
    color: '#666',
    flex: 1,
    lineHeight: width * 0.052,
  },
});

export default HelpSupport;