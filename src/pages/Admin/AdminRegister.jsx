import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerAdmin, subdomainAvailable } from '../../services/authService';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { FaLink } from "react-icons/fa6";

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    subdomain: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundShapes, setBackgroundShapes] = useState([]);
  const [domainAvailable, setDomainAvailable] = useState(true);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      await registerAdmin(formData);
      toast.success('Registration successful! Please login.');
      navigate('/admin/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubdomainChange = async (e) => {
    const { name, value } = e.target;
    const formattedValue = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, [name]: formattedValue }));

    if (value.length <= 4) {
      setDomainAvailable(false);
      return;
    }

    try {
      await subdomainAvailable(formData)
        .then(res => {
          console.log(res);
          setDomainAvailable(res.available);
        })
        .catch(e => console.error(e.message));
    } catch (error) {
      console.error(error.message);
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

      <Card className="w-full max-w-md z-10 relative shadow-2xl my-10">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>

        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 relative">
          Create Admin Account
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
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label flex items-center">
              <FaLink className="h-5 w-5 mr-2 text-primary" />
              Company name
            </label>
            <input
              type="text"
              id="subdomain"
              name="subdomain"
              className="form-input group-hover:border-primary transition-all duration-300"
              value={formData.subdomain}
              onChange={handleSubdomainChange}
              required
              placeholder="Enter your company name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input group-hover:border-primary transition-all duration-300"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
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
    value={formData.password}
    onChange={handleChange}
    required
    minLength="6"
    placeholder="Enter your password"
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

<div className="form-group relative">
  <label htmlFor="confirmPassword" className="form-label flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
    Confirm Password
  </label>
  <input
    type={showConfirmPassword ? 'text' : 'password'}
    id="confirmPassword"
    name="confirmPassword"
    className="form-input group-hover:border-primary transition-all duration-300 pr-10"
    value={formData.confirmPassword}
    onChange={handleChange}
    required
    minLength="6"
    placeholder="Confirm your password"
  />
  <button
    type="button"
    className="absolute right-0 top-0 mt-7 mr-3 focus:outline-none"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
  >
    {showConfirmPassword ? (
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
            {isLoading ? 'Registering...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link
            to="/admin/login"
            className="text-primary hover:underline font-semibold"
          >
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default AdminRegister;