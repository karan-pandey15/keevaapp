import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const BannerComponent = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../images/priceBanner.png')}
        style={styles.bannerImage}
        resizeMode="stretch"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: Dimensions.get('window').height * 0.15,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
});

export default BannerComponent;
