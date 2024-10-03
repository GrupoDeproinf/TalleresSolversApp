export const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? '' : 'Invalid email address';
};

export const validatePassword = password => {
  return password.length >= 6 ? '' : 'Password must be at least 6 characters';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  return password === confirmPassword ? '' : 'Passwords do not match';
};
