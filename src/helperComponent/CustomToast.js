import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const CustomToast = ({ visible, message, duration = 500, onHide }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(-100)).current;
  const onHideRef = useRef(onHide);

  useEffect(() => {
    onHideRef.current = onHide;
  }, [onHide]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (onHideRef.current) onHideRef.current();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateAnim }],
        },
      ]}
    >
      <View style={styles.toastContent}>
        <Icon name="checkmark-circle" size={24} color="#fff" />
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 9999,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(42,145,52)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
});

export default CustomToast;
