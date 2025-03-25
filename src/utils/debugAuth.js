export const debugAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('Current token:', token);
    console.log('Current user:', user ? JSON.parse(user) : null);
    
    // Test a basic fetch with the current token
    const headers = new Headers();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    
    console.log('Headers for fetch:', headers);
    
    return { token, user: user ? JSON.parse(user) : null };
  };