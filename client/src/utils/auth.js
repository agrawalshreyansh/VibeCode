export const logout = () => {
  // Clear localStorage
  localStorage.removeItem('userAuth');
  localStorage.removeItem('healthAssessment');
  
  // Clear auth cookie
  document.cookie = 'isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};
