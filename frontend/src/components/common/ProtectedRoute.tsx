import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { AuthService } from '@/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, setUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async (): Promise<void> => {
      try {
        const user = await AuthService.getCurrentUser();
        if (mounted) {
          setUser(user);
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (mounted) {
          setUser(null);
          setIsChecking(false);
        }
      }
    };

    if (!isAuthenticated) {
      checkAuth();
    } else {
      setIsChecking(false);
    }

    return () => {
      mounted = false;
    };
  }, []); // Run only once on mount

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
