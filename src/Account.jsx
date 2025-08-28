import { useState, useEffect } from 'react';
import { updateUserProfile, verifyToken, deleteUserAccount, getUserProfile } from './services/userServiceClient';
import { LogoutButton } from './logout.jsx';
import './Account.css';

function Account() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    profilePicture: null,
    bio: '',
    phone: '',
    location: '',
    website: '',
    birthDate: '',
    profileTheme: 'default',
    profileVisibility: 'public',
    emailNotifications: true,
    smsNotifications: false
  });
  
  const [previewImage, setPreviewImage] = useState(null);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get auth token to verify user
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setError('Authentication required. Please log in again.');
        return;
      }

      // Verify token and get user ID
      const tokenResult = verifyToken(authToken);
      if (!tokenResult.success) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('reserveUser');
        return;
      }

      // GET method: Fetch fresh user data from service
      const result = await getUserProfile(tokenResult.userId);
      if (!result.success) {
        setError(result.error);
        return;
      }

      const userData = result.user;
      setUser(userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        username: userData.username || userData.email?.split('@')[0] || '',
        email: userData.email || '',
        profilePicture: userData.profilePicture || null,
        bio: userData.bio || '',
        phone: userData.phone || '',
        location: userData.location || '',
        website: userData.website || '',
        birthDate: userData.birthDate || '',
        profileTheme: userData.profileTheme || 'default',
        profileVisibility: userData.profileVisibility || 'public',
        emailNotifications: userData.emailNotifications !== undefined ? userData.emailNotifications : true,
        smsNotifications: userData.smsNotifications !== undefined ? userData.smsNotifications : false
      });
      
      if (userData.profilePicture) {
        setPreviewImage(userData.profilePicture);
      }
      
      // Update localStorage with fresh data
      localStorage.setItem('reserveUser', JSON.stringify(userData));
      
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        profilePicture: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Get auth token to verify user
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setError('Authentication required. Please log in again.');
        return;
      }

      // Verify token and get user ID
      const tokenResult = verifyToken(authToken);
      if (!tokenResult.success) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('reserveUser');
        return;
      }

      // Update user profile
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        profilePicture: previewImage,
        bio: formData.bio,
        phone: formData.phone,
        location: formData.location,
        website: formData.website,
        birthDate: formData.birthDate,
        profileTheme: formData.profileTheme,
        profileVisibility: formData.profileVisibility,
        emailNotifications: formData.emailNotifications,
        smsNotifications: formData.smsNotifications
      };

      const result = await updateUserProfile(tokenResult.userId, updateData);
      
      if (result.success) {
        // Update localStorage with new user data
        localStorage.setItem('reserveUser', JSON.stringify(result.user));
        
        setUser(result.user);
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
      } else {
        setError(result.error);
      }
      
    } catch (error) {
      console.error('Error saving user data:', error);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      username: user.username || user.email?.split('@')[0] || '',
      email: user.email || '',
      profilePicture: user.profilePicture || null,
      bio: user.bio || '',
      phone: user.phone || '',
      location: user.location || '',
      website: user.website || '',
      birthDate: user.birthDate || '',
      profileTheme: user.profileTheme || 'default',
      profileVisibility: user.profileVisibility || 'public',
      emailNotifications: user.emailNotifications !== undefined ? user.emailNotifications : true,
      smsNotifications: user.smsNotifications !== undefined ? user.smsNotifications : false
    });
    
    // Reset preview image
    setPreviewImage(user.profilePicture || null);
    
    // Clear messages and exit editing mode
    setError('');
    setSuccess('');
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setDeleting(true);
    setError('');

    try {
      // Get auth token to verify user
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setError('Authentication required. Please log in again.');
        return;
      }

      // Verify token and get user ID
      const tokenResult = verifyToken(authToken);
      if (!tokenResult.success) {
        setError('Session expired. Please log in again.');
        return;
      }

      // DELETE method: Delete user account
      const result = await deleteUserAccount(tokenResult.userId);
      
      if (result.success) {
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('reserveUser');
        
        alert('Your account has been deleted successfully.');
        
        // Redirect to home page (you might want to pass a callback for this)
        window.location.reload();
      } else {
        setError(result.error);
      }
      
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <div className="account-container">
        <div className="loading">Loading your account ⏳ ...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="account-container">
        <div className="error">Please log in to view your account. 👩🏻‍💻 </div>
      </div>
    );
  }

  return (
    <div className="account-container">
      <div className="account-card">
        <div className="account-header">
          <h1>My Account</h1>
          <div className="header-actions">
            {!isEditing ? (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button 
                  className="save-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            )}
            <LogoutButton className="logout-btn" />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {showDeleteConfirm && (
          <div className="delete-confirmation">
            <div className="delete-warning">
              <h3>⚠️ Delete Account</h3>
              <p>Are you sure you want to delete your account? This action cannot be undone.</p>
              <div className="delete-actions">
                <button 
                  className="confirm-delete-btn"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
                <button 
                  className="cancel-delete-btn"
                  onClick={cancelDelete}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="account-content">
          <div className="profile-picture-section">
            <div className="image-container">
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="profile-image" />
              ) : (
                <div className="profile-placeholder">
                  <span>👤</span>
                </div>
              )}
            </div>
            
            {isEditing && (
              <div className="image-upload">
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
                <label htmlFor="profilePicture" className="file-label">
                  Change Picture
                </label>
              </div>
            )}
          </div>

          <div className="account-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                  />
                ) : (
                  <div className="form-value">{user.firstName}</div>
                )}
              </div>

              <div className="form-group">
                <label>Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                  />
                ) : (
                  <div className="form-value">{user.lastName}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Username</label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                />
              ) : (
                <div className="form-value">@{user.username || user.email?.split('@')[0]}</div>
              )}
            </div>

            <div className="form-group">
              <label>Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                />
              ) : (
                <div className="form-value">{user.email}</div>
              )}
            </div>

            <div className="form-group">
              <label>Member Since</label>
              <div className="form-value">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            {/* Bio Section */}
            <div className="form-group">
              <label>Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  className="bio-textarea"
                />
              ) : (
                <div className="form-value">{user.bio || 'No bio added yet'}</div>
              )}
            </div>

            {/* Contact Information */}
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="form-value">{user.phone || 'Not provided'}</div>
                )}
              </div>

              <div className="form-group">
                <label>Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                  />
                ) : (
                  <div className="form-value">{user.location || 'Not provided'}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Website</label>
                {isEditing ? (
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                  />
                ) : (
                  <div className="form-value">
                    {user.website ? (
                      <a href={user.website} target="_blank" rel="noopener noreferrer">
                        {user.website}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Birth Date</label>
                {isEditing ? (
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="form-value">
                    {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'Not provided'}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Customization */}
            <div className="customization-section">
              <h3>Profile Customization</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Profile Theme</label>
                  {isEditing ? (
                    <select
                      name="profileTheme"
                      value={formData.profileTheme}
                      onChange={handleInputChange}
                      className="theme-select"
                    >
                      <option value="default">Default</option>
                      <option value="dark">Dark Mode</option>
                      <option value="colorful">Colorful</option>
                      <option value="minimal">Minimal</option>
                      <option value="professional">Professional</option>
                    </select>
                  ) : (
                    <div className="form-value theme-display">
                      <span className={`theme-indicator ${user.profileTheme || 'default'}`}></span>
                      {(user.profileTheme || 'default').charAt(0).toUpperCase() + (user.profileTheme || 'default').slice(1)}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Profile Visibility</label>
                  {isEditing ? (
                    <select
                      name="profileVisibility"
                      value={formData.profileVisibility}
                      onChange={handleInputChange}
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="friends">Friends Only</option>
                    </select>
                  ) : (
                    <div className="form-value">
                      <span className={`visibility-indicator ${user.profileVisibility || 'public'}`}>
                        {user.profileVisibility === 'public' ? '🌍' : 
                         user.profileVisibility === 'private' ? '🔒' : '👥'}
                      </span>
                      {(user.profileVisibility || 'public').charAt(0).toUpperCase() + (user.profileVisibility || 'public').slice(1)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="notification-section">
              <h3>Notification Preferences</h3>
              
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        emailNotifications: e.target.checked
                      }))}
                      disabled={!isEditing}
                    />
                    <span className="checkmark"></span>
                    Email Notifications
                  </label>
                  <small>Receive updates and notifications via email</small>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="smsNotifications"
                      checked={formData.smsNotifications}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        smsNotifications: e.target.checked
                      }))}
                      disabled={!isEditing}
                    />
                    <span className="checkmark"></span>
                    SMS Notifications
                  </label>
                  <small>Receive important alerts via text message</small>
                </div>
              </div>
            </div>
          </div>

          <div className="danger-zone">
            <h3>Danger Zone</h3>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button 
              className="delete-account-btn"
              onClick={handleDeleteAccount}
              disabled={deleting || showDeleteConfirm}
            >
              {showDeleteConfirm ? 'Confirm Above' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;
