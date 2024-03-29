// AuthComponent.tsx
import React, { useEffect, useState } from 'react';
import { LoginClient } from '@authress/login';

const AuthComponent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleAuthentication = async () => {
      try {
        const loginClient = new LoginClient({
          authressLoginHostUrl: 'https://acc-f0ocirgid3b5h.login.authress.io',
          applicationId: 'app_kufw7MnevVDpYT7wTFu1Rf'
        });

        const isAuthenticated = await loginClient.authenticate();
        setIsLoggedIn(isAuthenticated);

        if (isAuthenticated) {
          console.log('User is already logged in');
                  
          const isEmailVerified = await checkEmailVerificationStatus();
          if (!isEmailVerified) {
            console.error('Email not verified. Please verify your email.');
          }
        }
        
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };

    handleAuthentication();
  }, []);

  const checkEmailVerificationStatus = async (): Promise<boolean> => {
    try {
      return true;
    } catch (error) {
      console.error('Error checking email verification status:', error);
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      const loginClient = new LoginClient({
        authressLoginHostUrl: 'https://acc-f0ocirgid3b5h.login.authress.io',
        applicationId: 'app_kufw7MnevVDpYT7wTFu1Rf'
      });

      await loginClient.logout();

      setIsLoggedIn(false);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="auth-background">
      {isLoggedIn ? (
        <div className="auth">
          <span>User is logged in</span>
          <button onClick={handleLogout}>Logout</button>
          </div>
      ) : (
        <span>User is not logged in</span>
      )}
    </div>
  );
};

export default AuthComponent;