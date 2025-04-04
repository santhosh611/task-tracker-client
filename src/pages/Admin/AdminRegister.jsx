import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import { registerAdmin } from '../../services/authService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

// PasswordInput Component (same as in AdminLogin)
const PasswordInput = ({ 
  value, 
  onChange, 
  placeholder = "Enter your password", 
  name = "password",
  showStrengthMeter = true 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length > 7) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    onChange(e);
    const strength = calculatePasswordStrength(newPassword);
    setPasswordStrength(strength);
  };

  const strengthColors = [
    'bg-red-500', 
    'bg-orange-500', 
    'bg-yellow-500', 
    'bg-green-500', 
    'bg-green-700'
  ];

  return (
    <div className="form-group relative">
      <label htmlFor={name} className="form-label flex items-center">
        <FaLock className="mr-2 text-primary" />
        {name === 'password' ? 'Password' : 'Confirm Password'}
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

      {showStrengthMeter && name === 'password' && (
        <>
          <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${strengthColors[passwordStrength]}`}
              initial={{ width: 0 }}
              animate={{ width: `${(passwordStrength / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-xs mt-1 text-gray-600">
            {passwordStrength <= 1 && "Weak password"}
            {passwordStrength === 2 && "Medium strength"}
            {passwordStrength >= 3 && "Strong password"}
          </div>
        </>
      )}
    </div>
  );
};

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await registerAdmin({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      toast.success('Registration successful! Please login.');
      navigate('/admin/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center">Create Admin Account</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <PasswordInput 
            value={formData.password}
            onChange={handleChange}
            name="password"
            showStrengthMeter={true}
          />
          
          <PasswordInput 
            value={formData.confirmPassword}
            onChange={handleChange}
            name="confirmPassword"
            placeholder="Confirm your password"
            showStrengthMeter={false}
          />
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Create Account'}
          </Button>
        </form>
        
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link 
            to="/admin/login" 
            className="text-primary hover:underline"
          >
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default AdminRegister;