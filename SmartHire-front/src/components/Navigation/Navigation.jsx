import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './Navigation.css';

const Navigation = () => {
  const isLoggedIn = localStorage.getItem('token');

  return (
    <nav className="nav-container">
      {/* Your other navigation items */}
      
      {isLoggedIn ? (
        <Link to="/profile" className="profile-icon">
          <FaUserCircle size={24} />
        </Link>
      ) : (
        <Link to="/login" className="login-link">
          Login
        </Link>
      )}
    </nav>
  );
};

export default Navigation; 