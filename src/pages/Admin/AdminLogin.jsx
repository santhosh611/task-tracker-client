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
          
          <div className="form-group">
            <label htmlFor="password" className="form-label flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input group-hover:border-primary transition-all duration-300"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
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