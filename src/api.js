import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://api.keeva.in';

export const sendOtp = async (phone) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

export const verifyOtp = async (phone, otp) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, otp }),
    });
    const data = await response.json();
    
    if (data.ok && data.token) {
      await AsyncStorage.setItem('userToken', data.token);
      if (data.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateProfile = async (userData) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  const text = await response.text();
  throw new Error(`Server returned invalid response: ${text.substring(0, 100)}`);
};

export const getAddresses = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${BASE_URL}/user/addresses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching addresses:', error);
    throw error;
  }
};

export const createPayment = async (orderData) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${BASE_URL}/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await parseResponse(response);
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await parseResponse(response);
    return data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await parseResponse(response);
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await parseResponse(response);
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};
