import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

// Advanced Password Input Component
const PasswordInput = ({ 
  value, 
  onChange, 
  placeholder = "Enter your password", 
  name = "password",
  showStrengthMeter = true 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Advanced password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length > 7) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    onChange(e);
    
    // Calculate password strength
    const strength = calculatePasswordStrength(newPassword);
    setPasswordStrength(strength);
  };

  // Password strength color and width
  const strengthColors = [
    'bg-red-500',   // Very weak
    'bg-orange-500', // Weak
    'bg-yellow-500', // Medium
    'bg-green-500',  // Strong
    'bg-green-700'   // Very Strong
  ];

  return (
    <div className="form-group relative">
      <label htmlFor={name} className="form-label flex items-center">
        <FaLock className="mr-2 text-primary" />
        Password
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={name}
          name={name}
          className="form-input group-hover:border-primary transition-all duration-300 pr-12"
          value={value}
          onChange={handlePasswordChange}
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <AnimatePresence mode="wait">
            {showPassword ? (
              <motion.div
                key="hide"
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
              >
                <FaEyeSlash />
              </motion.div>
            ) : (
              <motion.div
                key="show"
                initial={{ opacity: 0, rotate: 180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -180 }}
                transition={{ duration: 0.2 }}
              >
                <FaEye />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Password Strength Meter */}
      {showStrengthMeter && (
        <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${strengthColors[passwordStrength]}`}
            initial={{ width: 0 }}
            animate={{ width: `${(passwordStrength / 5) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Password Hints */}
      {showStrengthMeter && value && (
        <div className="text-xs mt-1 text-gray-600">
          {passwordStrength <= 1 && "Weak password"}
          {passwordStrength === 2 && "Medium strength"}
          {passwordStrength >= 3 && "Strong password"}
        </div>
      )}
    </div>
  );
};

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
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
          
          {/* Replace previous password input with PasswordInput component */}
          <PasswordInput 
            value={credentials.password}
            onChange={handleChange}
            showStrengthMeter={true}
          />
          
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