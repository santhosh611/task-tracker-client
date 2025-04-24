import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import appContext from '../../context/AppContext';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const AdminLogin = () => {
  const { subdomain } = useContext(appContext);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    subdomain
  });
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundShapes, setBackgroundShapes] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Animated background shapes
  useEffect(() => {
    const generateShapes = () => {
      return Array.from({ length: 5 }, (_, index) => ({
        id: index,
        size: Math.random() * 100 + 50,
        left: Math.random() * 100,
        animationDuration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
        color: ['bg-primary/10', 'bg-secondary/10', 'bg-blue-200/10'][Math.floor(Math.random() * 3)]
      }));
    };

    setBackgroundShapes(generateShapes());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      const result = await login(credentials, 'admin');
      localStorage.setItem('tasktracker-subdomain', result.subdomain);
      toast.success('Login successful!');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden relative">
      {/* Animated Background Shapes */}
      {backgroundShapes.map((shape) => (
        <div
          key={shape.id}
          className={`
            absolute 
            rounded-full 
            ${shape.color}
            animate-float
            opacity-50
          `}
          style={{
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            left: `${shape.left}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${shape.animationDuration}s`,
            animationDelay: `${shape.delay}s`
          }}
        />
      ))}

      <Card className="w-full max-w-md z-10 relative shadow-2xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>

        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 relative">
          Admin Login
          <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-primary rounded"></span>
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label htmlFor="username" className="form-label flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input group-hover:border-primary transition-all duration-300"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="form-group relative">
  <label htmlFor="password" className="form-label flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
    Password
  </label>
  <input
    type={showPassword ? 'text' : 'password'}
    id="password"
    name="password"
    className="form-input group-hover:border-primary transition-all duration-300 pr-10"
    value={credentials.password}
    onChange={handleChange}
    placeholder="Enter your password"
    required
  />
  <button
    type="button"
    className="absolute right-0 top-0 mt-7 mr-3 focus:outline-none"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
      </svg>
    )}
  </button>
</div>
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isLoading}
            className="hover:scale-105 transition-transform duration-300"
          >
            {isLoading ? 'Logging in...' : 'Sign In'}
          </Button>
        </form>
        
        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <Link 
            to="/admin/register" 
            className="text-primary hover:underline font-semibold"
          >
            Create Account
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default AdminLogin;