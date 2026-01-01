/**
 * BACKEND IMPLEMENTATION FOR USER PROFILE
 * This file contains the Schema, Controller, and Routes for User Management.
 * 
 * Instructions:
 * 1. Add the Schema to your models/User.js
 * 2. Add the Controller functions to your controllers/userController.js
 * 3. Add the Routes to your routes/userRoutes.js
 */

// ==========================================
// 1. USER SCHEMA (models/User.js)
// ==========================================
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  name: { 
    type: String, 
    default: null 
  },
  email: { 
    type: String, 
    default: null 
  },
  role: { 
    type: String, 
    enum: ['customer', 'admin', 'rider'], 
    default: 'customer' 
  },
  profileCompleted: { 
    type: Boolean, 
    default: false 
  },
  addresses: { 
    type: [addressSchema], 
    default: [] 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;


// ==========================================
// 2. USER CONTROLLER (controllers/userController.js)
// ==========================================

// 👤 GET profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, message: 'User not found' });
    }
    const { addresses, __v, ...payload } = user.toObject();
    return res.json({ ok: true, user: payload });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ ok: false, message: 'Internal Server Error' });
  }
};

// 👤 UPDATE profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, message: 'User not found' });
    }

    let changed = false;

    if (typeof name !== 'undefined') {
      user.name = name;
      changed = true;
    }
    
    if (typeof email !== 'undefined') {
      user.email = email;
      changed = true;
    }

    // Handle automatic 91 if phone is provided and doesn't have it
    if (typeof phone !== 'undefined') {
      let formattedPhone = phone.trim();
      if (formattedPhone.length === 10) {
        formattedPhone = '91' + formattedPhone;
      }
      if (user.phone !== formattedPhone) {
        user.phone = formattedPhone;
        changed = true;
      }
    }

    if (changed) {
      // Profile is completed if both name and email are present
      user.profileCompleted = Boolean(user.name && user.email);
      await user.save();
    }

    const { addresses, __v, ...payload } = user.toObject();
    return res.json({ ok: true, user: payload, message: 'Profile Updated Successfully' });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ ok: false, message: 'Some Error Occurs Try Later' });
  }
};

// 🔑 CREATE/VERIFY USER (Example for first-time creation)
const verifyOtpAndLogin = async (req, res) => {
  const { phone, otp } = req.body;
  // ... OTP verification logic here ...
  
  let user = await User.findOne({ phone });
  
  if (!user) {
    // First time user creation
    user = new User({
      phone,
      role: 'customer',
      createdAt: new Date()
    });
    await user.save();
  }
  
  // ... Generate JWT token and return ...
};

module.exports = {
  getProfile,
  updateProfile,
  verifyOtpAndLogin
};


// ==========================================
// 3. USER ROUTES (routes/userRoutes.js)
// ==========================================
/*
const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
*/
