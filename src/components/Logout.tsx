import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = () => {
      try {
        localStorage.clear();
        toast.success('Logged out successfully');
        navigate('/');
      } catch (error) {
        toast.error('Error during logout');
        navigate('/');
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <div>
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;