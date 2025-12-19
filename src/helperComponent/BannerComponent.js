import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const BannerComponent = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../images/priceBanner.png')}
        style={styles.bannerImage}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '14%',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
});

export default BannerComponent;