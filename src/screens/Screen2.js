import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Animated,
  Platform,
} from 'react-native';

export default function Screen2({ navigation }) {
  // OTP state (6 digits)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(28);
  const [error, setError] = useState(false);

  // refs
  const inputRefs = useRef(new Array(6));
  const intervalRef = useRef(null);
  const verifyingRef = useRef(false);

  // animated value for error message
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // focus first input on mount
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus?.(), 200);
  }, []);

  // timer setup & cleanup
  useEffect(() => {
    // clear any previous
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // verify when all digits entered
  useEffect(() => {
    if (otp.every((d) => d !== '') && !verifyingRef.current) {
      verifyingRef.current = true;
      // small delay so UI updates before verifying
      setTimeout(() => {
        verifyOTP();
      }, 120);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // helper: format mm : ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  // handle changes — supports single digit or pasted multiple digits
  const handleOtpChange = (text, index) => {
    // Clear error on new typing
    if (error) {
      setError(false);
      fadeAnim.setValue(0);
    }

    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length === 0) {
      // user cleared input
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    // If user pasted multiple digits, distribute them
    const digits = cleaned.split('');
    const newOtp = [...otp];

    let idx = index;
    for (let i = 0; i < digits.length && idx < 6; i++, idx++) {
      newOtp[idx] = digits[i];
    }

    setOtp(newOtp);

    // focus next empty
    const nextEmpty = newOtp.findIndex((d, i) => d === '' && i > index);
    if (nextEmpty !== -1) {
      setTimeout(() => inputRefs.current[nextEmpty]?.focus?.(), 50);
    } else {
      // if no empty but less than last, try to focus next index
      if (index < 5) {
        setTimeout(() => inputRefs.current[Math.min(index + digits.length, 5)]?.focus?.(), 50);
      } else {
        // last box - dismiss keyboard optionally
        inputRefs.current[5]?.blur?.();
      }
    }
  };

  // handle backspace — robust across platforms
  const handleKeyPress = ({ nativeEvent }, index) => {
    // On Android key may be 'Backspace' or 'Backspace' still works; be defensive
    if (nativeEvent.key === 'Backspace') {
      // If current box is empty, move focus back and clear previous
      if (otp[index] === '' && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        setTimeout(() => inputRefs.current[index - 1]?.focus?.(), 50);
      } else {
        // clear current
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
      // clear any error
      if (error) {
        setError(false);
        fadeAnim.setValue(0);
      }
      // allow further verifies again
      verifyingRef.current = false;
    }
  };

  const verifyOTP = () => {
    const enteredOtp = otp.join('');
    // Example success code '151515' — change to your verification logic
    const CORRECT = '151515';

    if (enteredOtp === CORRECT) {
      // success -> navigate
      verifyingRef.current = false;
      navigation.replace('AddressList');
    } else {
      // wrong OTP -> show error, reset inputs, animate error
      setError(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // clear OTP and focus first; small delay so animation runs nicely
      setTimeout(() => {
        setOtp(['', '', '', '', '', '']);
        verifyingRef.current = false;
        setTimeout(() => inputRefs.current[0]?.focus?.(), 100);
      }, 200);
    }
  };

  const handleResendOTP = () => {
    // reset timer & otp & error
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimer(28);
    setOtp(['', '', '', '', '', '']);
    setError(false);
    fadeAnim.setValue(0);
    verifyingRef.current = false;

    // restart timer
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // focus first
    setTimeout(() => inputRefs.current[0]?.focus?.(), 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="rgb(42,145,52)" />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>OTP</Text>
          <Text style={styles.title}>Verification</Text>
        </View>

        <Text style={styles.subtitle}>Enter the 6-digit OTP</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <View
              key={index}
              style={[
                styles.otpCircle,
                error && styles.otpErrorBorder,
              ]}
            >
              <TextInput
                // assign ref safely
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={styles.otpInput}
                keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                // numeric on android behaves slightly differently; we sanitize input anyway
                maxLength={6} // allow paste of up to 6, handle distribution in handleOtpChange
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                returnKeyType="done"
                textContentType="oneTimeCode"
                selectTextOnFocus
                caretHidden={false}
                autoFocus={false}
              />
              <Text style={[styles.otpText, error && { color: '#000' }]}>{digit}</Text>
            </View>
          ))}
        </View>

        {/* Animated error message */}
        {error && (
          <Animated.View style={{ opacity: fadeAnim, marginTop: 18 }}>
            <Text style={styles.errorMessage}>You have entered wrong OTP — Try Again</Text>
          </Animated.View>
        )}

        <Text style={styles.timer}>{formatTime(timer)}</Text>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive OTP? </Text>
          <TouchableOpacity onPress={handleResendOTP} disabled={timer > 0}>
            <Text style={[styles.resendLink, timer > 0 && styles.resendLinkDisabled]}>Resend OTP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgb(42,145,52)' },
  content: { flex: 1, paddingHorizontal: 20 },
  backButton: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: -4 },
  titleContainer: { marginTop: 60 },
  title: { color: '#fff', fontSize: 42, fontWeight: 'bold', lineHeight: 50 },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 20 },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 60,
    paddingHorizontal: 10,
  },

  otpCircle: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#FFFFFF', // white inside boxes
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50', // green border by default
  },

  otpErrorBorder: {
    borderColor: '#FF3B30', // red border on error
  },

  otpInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0, // input is hidden; value displayed by otpText
    fontSize: 20,
    textAlign: 'center',
    color: '#000',
  },

  otpText: { color: '#4CAF50', fontSize: 24, fontWeight: 'bold' },

  errorMessage: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  timer: {
    color: '#fff',
    fontSize: 20,
    marginTop: 30,
    fontWeight: '600',
  },

  resendContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 30 },
  resendText: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
  resendLink: {
    color: '#fff',
    fontSize: 15,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  resendLinkDisabled: { opacity: 0.5 },
});
