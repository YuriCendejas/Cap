import { useState } from 'react';
import { registerUser, loginUser } from './services/userServiceClient';
import './signUp.css';

function SignUp({ onAccountCreated }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePicture: null
  });
  
  const [previewImage, setPreviewImage] = useState(null);
  const [isSignUp, setIsSignUp] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'Please select a valid image file'
        }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profilePicture: 'Image size should be less than 5MB'
        }));
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
      
      // Clear any previous errors
      setErrors(prev => ({
        ...prev,
        profilePicture: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isSignUp) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters long';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else {
      // Login validation
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSignUp) {
        // Register new user
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          profilePicture: previewImage
        };
        
        const result = await registerUser(userData);
        
        if (result.success) {
          // Store user data and token in localStorage
          localStorage.setItem('reserveUser', JSON.stringify(result.user));
          localStorage.setItem('authToken', result.token);
          
          alert(`Welcome to Reserve, ${formData.firstName}! Your account has been created successfully.`);
          
          // Reset form
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            profilePicture: null
          });
          setPreviewImage(null);
          
          // Automatically redirect to profile/account page
          if (onAccountCreated) {
            onAccountCreated();
          }
        } else {
          setErrors({ general: result.error });
        }
      } else {
        // Login existing user
        const result = await loginUser(formData.email, formData.password);
        
        if (result.success) {
          // Store user data and token in localStorage
          localStorage.setItem('reserveUser', JSON.stringify(result.user));
          localStorage.setItem('authToken', result.token);
          
          alert(`Welcome back to Reserve, ${result.user.firstName}!`);
          
          // Reset form
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            profilePicture: null
          });
          setPreviewImage(null);
          
          // Automatically redirect to profile/account page
          if (onAccountCreated) {
            onAccountCreated();
          }
        } else {
          setErrors({ general: result.error });
        }
      }
      
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      profilePicture: null
    });
    setPreviewImage(null);
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Reserve</h1>
          <p className="profile-subtitle">
            {isSignUp ? 'Create your account to start booking appointments' : 'Welcome back to Reserve'}
          </p>
        </div>

        <div className="auth-toggle">
          <button 
            className={isSignUp ? 'active' : ''} 
            onClick={() => !isSignUp && toggleMode()}
          >
            Sign Up
          </button>
          <button 
            className={!isSignUp ? 'active' : ''} 
            onClick={() => isSignUp && toggleMode()}
          >
            Login
          </button>
        </div>

        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          {isSignUp && (
            <>
              <div className="profile-picture-section">
                <div className="image-upload-container">
                  {previewImage ? (
                    <div className="image-preview">
                      <img src={previewImage} alt="Profile preview" />
                      <button 
                        type="button" 
                        className="remove-image"
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData(prev => ({ ...prev, profilePicture: null }));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="image-placeholder">
                      <span>📷</span>
                      <p>Upload Profile Picture</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file-input"
                  />
                  <label htmlFor="profilePicture" className="file-label">
                    {previewImage ? 'Change Picture' : 'Choose Picture'}
                  </label>
                </div>
                {errors.profilePicture && (
                  <span className="error-message">{errors.profilePicture}</span>
                )}
              </div>

              <div className="name-fields">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={errors.firstName ? 'error' : ''}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <span className="error-message">{errors.firstName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={errors.lastName ? 'error' : ''}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <span className="error-message">{errors.lastName}</span>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
              placeholder={isSignUp ? 'Create a password (min 6 characters)' : 'Enter your password'}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading">
                {isSignUp ? 'Creating Account...' : 'Logging In...'}
              </span>
            ) : (
              isSignUp ? 'Create Account' : 'Login'
            )}
          </button>
        </form>

        <div className="profile-footer">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" className="link-button" onClick={toggleMode}>
              {isSignUp ? 'Login here' : 'Sign up here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
