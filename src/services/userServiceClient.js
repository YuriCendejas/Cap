// Client-side user service that simulates MongoDB operations using localStorage
// This is for demo purposes - in production, these would be API calls to your backend

// Simulate JWT token creation (for demo only - never do this in production!)
const createMockToken = (userData) => {
  const payload = {
    userId: userData.id || Date.now().toString(),
    email: userData.email,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };
  return btoa(JSON.stringify(payload));
};

// Simulate JWT token verification
const verifyMockToken = (token) => {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return { success: false, error: 'Token expired' };
    }
    return {
      success: true,
      userId: payload.userId,
      email: payload.email
    };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
};

// Get all users from localStorage
const getAllUsers = () => {
  const users = localStorage.getItem('allUsers');
  return users ? JSON.parse(users) : [];
};

// Save all users to localStorage
const saveAllUsers = (users) => {
  localStorage.setItem('allUsers', JSON.stringify(users));
};

// Generate username from email
const generateUsername = (email) => {
  const emailPrefix = email.split('@')[0];
  return emailPrefix.replace(/[^a-zA-Z0-9_]/g, '_');
};

// User registration
export const registerUser = async (userData) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const allUsers = getAllUsers();
    
    // Check if user already exists
    const existingUser = allUsers.find(user => 
      user.email === userData.email || 
      (userData.username && user.username === userData.username)
    );
    
    if (existingUser) {
      return {
        success: false,
        error: 'User with this email or username already exists'
      };
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username || generateUsername(userData.email),
      email: userData.email,
      profilePicture: userData.profilePicture || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVerified: false
    };
    
    // Add to users array
    allUsers.push(newUser);
    saveAllUsers(allUsers);
    
    // Generate token
    const token = createMockToken(newUser);
    
    return {
      success: true,
      user: newUser,
      token
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// User login
export const loginUser = async (email, password) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const allUsers = getAllUsers();
    
    // Find user by email
    const user = allUsers.find(u => u.email === email);
    if (!user) {
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }
    
    // In a real app, you'd verify the password hash here
    // For demo purposes, we'll just check if password is provided
    if (!password || password.length < 6) {
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }
    
    // Generate token
    const token = createMockToken(user);
    
    return {
      success: true,
      user,
      token
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const allUsers = getAllUsers();
    const user = allUsers.find(u => u.id === userId);
    
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    return {
      success: true,
      user
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Update user profile
export const updateUserProfile = async (userId, updateData) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    // Check if username is being updated and if it's already taken
    if (updateData.username) {
      const existingUser = allUsers.find(u => 
        u.username === updateData.username && u.id !== userId
      );
      
      if (existingUser) {
        return {
          success: false,
          error: 'Username is already taken'
        };
      }
    }
    
    // Check if email is being updated and if it's already taken
    if (updateData.email) {
      const existingUser = allUsers.find(u => 
        u.email === updateData.email && u.id !== userId
      );
      
      if (existingUser) {
        return {
          success: false,
          error: 'Email is already taken'
        };
      }
    }
    
    // Update user
    const updatedUser = {
      ...allUsers[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    allUsers[userIndex] = updatedUser;
    saveAllUsers(allUsers);
    
    return {
      success: true,
      user: updatedUser
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify JWT token
export const verifyToken = (token) => {
  return verifyMockToken(token);
};

// Change password (mock implementation)
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const allUsers = getAllUsers();
    const user = allUsers.find(u => u.id === userId);
    
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    // In a real app, you'd verify the current password here
    if (!currentPassword) {
      return {
        success: false,
        error: 'Current password is required'
      };
    }
    
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: 'New password must be at least 6 characters'
      };
    }
    
    return {
      success: true,
      message: 'Password updated successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete user account
export const deleteUserAccount = async (userId) => {
  try {
    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    allUsers.splice(userIndex, 1);
    saveAllUsers(allUsers);
    
    return {
      success: true,
      message: 'Account deleted successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Search users
export const searchUsers = async (query, limit = 10) => {
  try {
    const allUsers = getAllUsers();
    const filteredUsers = allUsers
      .filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.firstName.toLowerCase().includes(query.toLowerCase()) ||
        user.lastName.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit)
      .map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        profilePicture: user.profilePicture
      }));
    
    return {
      success: true,
      users: filteredUsers
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user statistics
export const getUserStats = async (userId) => {
  try {
    const allUsers = getAllUsers();
    const user = allUsers.find(u => u.id === userId);
    
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }
    
    const stats = {
      memberSince: user.createdAt,
      lastUpdated: user.updatedAt,
      isVerified: user.isVerified,
      profileComplete: !!(user.firstName && user.lastName && user.username && user.profilePicture)
    };
    
    return {
      success: true,
      stats
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
