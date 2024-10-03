import {useState, useEffect} from 'react';

export const useAuthForm = navigation => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isButtonDisabled, setButtonDisabled] = useState(true);
  const [isEmailTyping, setEmailTyping] = useState(false);
  const [isCallTyping, setCallTyping] = useState(false);
  const [isPwdTyping, setPwdTyping] = useState(false);
  const [isConfTyping, setConfPwdTyping] = useState(false);

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email address');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const validatePhone = () => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('Invalid phone number');
      return false;
    } else {
      setPhoneError('');
      return true;
    }
  };

  const validatePassword = () => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  const validateConfirmPassword = () => {
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    } else {
      setConfirmPasswordError('');
      return true;
    }
  };

  useEffect(() => {
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    const isDisabled =
      !isEmailValid ||
      !isPhoneValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid;

    setButtonDisabled(isDisabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, phone, password, confirmPassword]);

  const handleSignUp = () => {
    if (!isButtonDisabled) {
      navigation.navigate('LoaderScreen');
    }
  };

  return {
    email,
    phone,
    password,
    confirmPassword,
    emailError,
    phoneError,
    passwordError,
    confirmPasswordError,
    isButtonDisabled,
    isEmailTyping,
    isCallTyping,
    isPwdTyping,
    isConfTyping,
    validateEmail,
    validatePhone,
    validatePassword,
    validateConfirmPassword,
    setEmail,
    setPhone,
    setPassword,
    setConfirmPassword,
    setEmailTyping,
    setCallTyping,
    setPwdTyping,
    setConfPwdTyping,
    handleSignUp,
  };
};
