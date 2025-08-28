// Logout functionality for React app
export const logout = async () => {
    try {
        // Clear any stored authentication data
        localStorage.removeItem('reserveUser');
        localStorage.removeItem('authToken');
        sessionStorage.clear();
  
        // Redirect to login page or home page
        window.location.href = '/';
        
        return {
            message: "Logout Successful ✌🏼",
            success: true
        };
    } catch (error) {
        console.error('Logout error:', error);
        return {
            message: "Logout failed",
            success: false,
            error: error.message
        };
    }
};

// React component for logout button
export const LogoutButton = ({ className = "logout-btn" }) => {
    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            alert(result.message);
        } else {
            alert('Logout failed. Please try again.');
        }
    };

    return (
        <button onClick={handleLogout} className={className}>
            Logout
        </button>
    );
};
