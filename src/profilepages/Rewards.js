import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Share from 'react-native-share';

const { width, height } = Dimensions.get('window');

const Rewards = ({ navigation }) => {
  const [shareLoading, setShareLoading] = useState(false);

  const handleShare = async () => {
    try {
      setShareLoading(true);
      const shareOptions = {
        message: 'Join Keeva and get 20% discount on your first order! Use my referral code and enjoy amazing fresh groceries delivered to your doorstep. Download the app now!',
        url: 'https://play.google.com/store/apps/details?id=com.keeva', // Update with your app URL
        title: 'Share Keeva with Friends',
      };

      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error sharing:', error);
      if (error.code !== 'CANCEL') {
        Alert.alert('Error', 'Unable to share. Please try again.');
      }
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer A Friend</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Refer Friend Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../images/referfriend.png')}
            style={styles.referImage}
            resizeMode="contain"
          />
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.mainTitle}>Share A Friend</Text>
          <Text style={styles.mainSubtitle}>and get 20% discount</Text>

          {/* Benefits Card */}
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>How it works?</Text>

            <View style={styles.benefitItem}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>1</Text>
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitHead}>Share the Code</Text>
                <Text style={styles.benefitDesc}>
                  Share your unique referral code with friends
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>2</Text>
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitHead}>They Download & Sign Up</Text>
                <Text style={styles.benefitDesc}>
                  Your friends download Keeva and use your referral code
                </Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>3</Text>
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitHead}>You Both Get Rewards</Text>
                <Text style={styles.benefitDesc}>
                  Both of you get 20% discount on your first order
                </Text>
              </View>
            </View>
          </View>

          {/* Terms Card */}
          <View style={styles.termsCard}>
            <Text style={styles.termsTitle}>Terms & Conditions</Text>
            <View style={styles.termItem}>
              <Text style={styles.termBullet}>•</Text>
              <Text style={styles.termText}>
                Discount applies to first order of referred friends only
              </Text>
            </View>
            <View style={styles.termItem}>
              <Text style={styles.termBullet}>•</Text>
              <Text style={styles.termText}>
                Minimum order value should be ₹200 for discount eligibility
              </Text>
            </View>
            <View style={styles.termItem}>
              <Text style={styles.termBullet}>•</Text>
              <Text style={styles.termText}>
                Discount cannot be combined with other offers
              </Text>
            </View>
            <View style={styles.termItem}>
              <Text style={styles.termBullet}>•</Text>
              <Text style={styles.termText}>
                Unlimited referrals - keep sharing and earning!
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Share Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
          disabled={shareLoading}
          activeOpacity={0.8}
        >
          <Icon name="share" size={24} color="#fff" />
          <Text style={styles.shareButtonText}>
            {shareLoading ? 'Sharing...' : 'Share Now'}
          </Text>
        </TouchableOpacity>
      </View>
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
    marginTop: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: height * 0.02,
  },
  imageContainer: {
    width: '100%',
    height: height * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: height * 0.02,
  },
  referImage: {
    width: width * 0.6,
    height: '100%',
  },
  contentSection: {
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
  },
  mainTitle: {
    fontSize: width * 0.065,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: height * 0.005,
  },
  mainSubtitle: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: 'rgb(42,145,52)',
    textAlign: 'center',
    marginBottom: height * 0.03,
  },
  benefitsCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    borderLeftWidth: 4,
    borderLeftColor: 'rgb(42,145,52)',
  },
  benefitsTitle: {
    fontSize: width * 0.05,
    fontWeight: '700',
    color: '#000',
    marginBottom: height * 0.015,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: height * 0.015,
  },
  numberCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgb(42,145,52)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.03,
    minWidth: 40,
  },
  numberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  benefitText: {
    flex: 1,
    justifyContent: 'center',
  },
  benefitHead: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#000',
    marginBottom: height * 0.005,
  },
  benefitDesc: {
    fontSize: width * 0.035,
    color: '#666',
    lineHeight: 18,
  },
  termsCard: {
    backgroundColor: '#FFF4E6',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: height * 0.02,
  },
  termsTitle: {
    fontSize: width * 0.05,
    fontWeight: '700',
    color: '#000',
    marginBottom: height * 0.01,
  },
  termItem: {
    flexDirection: 'row',
    marginBottom: height * 0.01,
  },
  termBullet: {
    fontSize: width * 0.04,
    color: 'rgb(42,145,52)',
    marginRight: width * 0.02,
    fontWeight: '600',
  },
  termText: {
    flex: 1,
    fontSize: width * 0.035,
    color: '#333',
    lineHeight: 18,
  },
  bottomSpacer: {
    height: height * 0.02,
  },
  buttonContainer: {
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  shareButton: {
    backgroundColor: 'rgb(42,145,52)',
    paddingVertical: height * 0.02,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgb(42,145,52)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  shareButtonText: {
    fontSize: width * 0.05,
    fontWeight: '700',
    color: '#fff',
    marginLeft: width * 0.02,
  },
});

export default Rewards;
