const Spinner = ({ size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-5 h-5',
      md: 'w-8 h-8',
      lg: 'w-12 h-12'
    };
    
    return (
      <div className="flex justify-center items-center py-4">
        <div className={`border-t-4 border-primary border-solid rounded-full animate-spin ${sizeClasses[size]}`}></div>
      </div>
    );
  };
  
  export default Spinner;