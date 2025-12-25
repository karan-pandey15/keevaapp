import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  // Animation values
  const kLogoScale = useRef(new Animated.Value(0)).current;
  const kLogoOpacity = useRef(new Animated.Value(0)).current;
  const kLogoRotate = useRef(new Animated.Value(0)).current;
  
  const letterK = useRef(new Animated.Value(0)).current;
  const letterE1 = useRef(new Animated.Value(0)).current;
  const letterE2 = useRef(new Animated.Value(0)).current;
  const letterV = useRef(new Animated.Value(0)).current;
  const letterA = useRef(new Animated.Value(0)).current;
  
  const letterKOpacity = useRef(new Animated.Value(0)).current;
  const letterE1Opacity = useRef(new Animated.Value(0)).current;
  const letterE2Opacity = useRef(new Animated.Value(0)).current;
  const letterVOpacity = useRef(new Animated.Value(0)).current;
  const letterAOpacity = useRef(new Animated.Value(0)).current;
  
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(1)).current;

  const checkToken = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (token) {
        navigation.replace('LocationHeader');
      } else {
        navigation.replace('Screen1');
      }
    } catch (error) {
      console.error('Error checking token:', error);
      navigation.replace('Screen1');
    }
  }, [navigation]);

  useEffect(() => {
    // Animation sequence
    Animated.sequence([
      // Step 1: K logo appears with scale and rotation
      Animated.parallel([
        Animated.timing(kLogoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(kLogoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(kLogoRotate, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
      ]),
      
      // Small pause
      Animated.delay(300),
      
      // Step 2: Letters appear one by one with stagger effect
      Animated.stagger(100, [
        Animated.parallel([
          Animated.timing(letterKOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(letterK, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(letterE1Opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(letterE1, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(letterE2Opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(letterE2, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(letterVOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(letterV, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(letterAOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(letterA, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]),
      
      // Step 3: Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      
      // Small pause before navigation
      Animated.delay(400),
    ]).start(() => {
      checkToken();
    });

    // Pulse animation for the circle
    Animated.loop(
      Animated.sequence([
        Animated.timing(circleScale, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(circleScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  const spin = kLogoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getLetterStyle = (animValue, opacityValue) => ({
    opacity: opacityValue,
    transform: [
      {
        translateY: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        }),
      },
    ],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="rgb(42,145,52)" barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {/* K Logo Circle */}
          <Animated.View
            style={[
              styles.kLogoContainer,
              {
                opacity: kLogoOpacity,
                transform: [
                  { scale: Animated.multiply(kLogoScale, circleScale) },
                  { rotate: spin },
                ],
              },
            ]}
          >
            <Text style={styles.kLogo}>K</Text>
          </Animated.View>

          {/* Keeva Text */}
          <View style={styles.textContainer}>
            <Animated.Text style={[styles.letter, getLetterStyle(letterK, letterKOpacity)]}>
              K
            </Animated.Text>
            <Animated.Text style={[styles.letter, getLetterStyle(letterE1, letterE1Opacity)]}>
              e
            </Animated.Text>
            <Animated.Text style={[styles.letter, getLetterStyle(letterE2, letterE2Opacity)]}>
              e
            </Animated.Text>
            <Animated.Text style={[styles.letter, getLetterStyle(letterV, letterVOpacity)]}>
              v
            </Animated.Text>
            <Animated.Text style={[styles.letter, getLetterStyle(letterA, letterAOpacity)]}>
              a
            </Animated.Text>
          </View>

          {/* Tagline */}
          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: taglineOpacity,
              },
            ]}
          >
            Your Fresh Market
          </Animated.Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(42,145,52)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kLogoContainer: {
    width: width < 360 ? 100 : 120,
    height: width < 360 ? 100 : 120,
    borderRadius: width < 360 ? 50 : 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  kLogo: {
    color: 'rgb(42,145,52)',
    fontSize: width < 360 ? 60 : 70,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  letter: {
    color: '#fff',
    fontSize: width < 360 ? 48 : 56,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    color: '#fff',
    fontSize: width < 360 ? 16 : 18,
    fontWeight: '500',
    letterSpacing: 1,
    opacity: 0.9,
  },
});

export default SplashScreen;