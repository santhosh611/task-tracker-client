const Spinner = ({ size = 'md', variant = 'default' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const variantClasses = {
    default: 'border-t-4 border-primary border-solid',
    gradient: 'border-t-4 border-transparent border-b-4 border-b-gradient-to-r from-primary to-secondary',
    pulse: 'border-4 border-primary/30 border-t-4 border-t-primary'
  };
  
  return (
    <div className="flex justify-center items-center py-4">
      <div 
        className={`
          ${sizeClasses[size]} 
          ${variantClasses[variant]} 
          rounded-full 
          animate-spin
        `}
      >
        {variant === 'pulse' && (
          <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></div>
        )}
      </div>
    </div>
  );
};

export default Spinner;