import { useState, useEffect } from 'react';
import { getUserProfile, verifyToken } from './services/userServiceClient';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Get auth token to verify user
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setError('Please log in to view your profile.');
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

      // Get user profile data
      const result = await getUserProfile(tokenResult.userId);
      if (!result.success) {
        setError(result.error);
        return;
      }

      setUser(result.user);
      
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const getThemeClass = (theme) => {
    switch (theme) {
      case 'dark': return 'profile-dark';
      case 'colorful': return 'profile-colorful';
      case 'minimal': return 'profile-minimal';
      case 'professional': return 'profile-professional';
      default: return 'profile-default';
    }
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'private': return '🔒';
      case 'friends': return '👥';
      default: return '🌍';
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading your profile ⏳...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-message">Profile not found</div>
      </div>
    );
  }

  return (
    <div className={`profile-container ${getThemeClass(user.profileTheme)}`}>
      <div className="profile-card">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-picture-container">
            {user.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={`${user.firstName} ${user.lastName}`}
                className="profile-picture"
              />
            ) : (
              <div className="profile-picture-placeholder">
                <span>👤</span>
              </div>
            )}
            <div className="profile-status">
              <span className="visibility-indicator">
                {getVisibilityIcon(user.profileVisibility)}
              </span>
            </div>
          </div>
          
          <div className="profile-info">
            <h1 className="profile-name">
              {user.firstName} {user.lastName}
            </h1>
            <p className="profile-username">@{user.username}</p>
            {user.location && (
              <p className="profile-location">📍 {user.location}</p>
            )}
          </div>
        </div>

        {/* Profile Bio */}
        {user.bio && (
          <div className="profile-bio">
            <h3>About</h3>
            <p>{user.bio}</p>
          </div>
        )}

        {/* Profile Details */}
        <div className="profile-details">
          <div className="detail-grid">
            {user.email && (
              <div className="detail-item">
                <span className="detail-icon">📧</span>
                <div className="detail-content">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{user.email}</span>
                </div>
              </div>
            )}

            {user.phone && (
              <div className="detail-item">
                <span className="detail-icon">📱</span>
                <div className="detail-content">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{user.phone}</span>
                </div>
              </div>
            )}

            {user.website && (
              <div className="detail-item">
                <span className="detail-icon">🌐</span>
                <div className="detail-content">
                  <span className="detail-label">Website</span>
                  <a 
                    href={user.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="detail-link"
                  >
                    {user.website}
                  </a>
                </div>
              </div>
            )}

            {user.birthDate && (
              <div className="detail-item">
                <span className="detail-icon">🎂</span>
                <div className="detail-content">
                  <span className="detail-label">Birthday</span>
                  <span className="detail-value">
                    {new Date(user.birthDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            )}

            {user.createdAt && (
              <div className="detail-item">
                <span className="detail-icon">📅</span>
                <div className="detail-content">
                  <span className="detail-label">Member Since</span>
                  <span className="detail-value">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Stats */}
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-number">
              {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
            </span>
            <span className="stat-label">Days Active</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-number">
              {user.profileTheme ? user.profileTheme.charAt(0).toUpperCase() + user.profileTheme.slice(1) : 'Default'}
            </span>
            <span className="stat-label">Theme</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-number">
              {user.profileVisibility ? user.profileVisibility.charAt(0).toUpperCase() + user.profileVisibility.slice(1) : 'Public'}
            </span>
            <span className="stat-label">Visibility</span>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="profile-actions">
          <button 
            className="edit-profile-btn"
            onClick={() => {
              // Simple navigation - reload page with account hash
              window.location.hash = 'account';
              window.location.reload();
            }}
          >
            ✏️ Edit Profile
          </button>
          
          <button 
            className="share-profile-btn"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${user.firstName} ${user.lastName}'s Profile`,
                  text: user.bio || `Check out ${user.firstName}'s profile!`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Profile link copied to clipboard!');
              }
            }}
          >
            🔗 Share Profile
          </button>
        </div>

        {/* Theme Preview */}
        <div className="theme-preview">
          <h4>Current Theme: {user.profileTheme || 'Default'}</h4>
          <div className="theme-colors">
            <div className={`color-swatch theme-${user.profileTheme || 'default'}-primary`}></div>
            <div className={`color-swatch theme-${user.profileTheme || 'default'}-secondary`}></div>
            <div className={`color-swatch theme-${user.profileTheme || 'default'}-accent`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
