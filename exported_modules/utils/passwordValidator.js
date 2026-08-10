export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8 || password.length > 16) {
    return { isValid: false, message: 'Password must be between 8 and 16 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 uppercase letter (A-Z)' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 lowercase letter (a-z)' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 digit (0-9)' };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 special symbol (e.g. @, #, $, !)' };
  }

  return { isValid: true, message: 'Password meets security requirements' };
};

export const getPasswordChecklist = (password = '') => {
  return [
    { id: 'length', label: '8-16 characters', pass: password.length >= 8 && password.length <= 16 },
    { id: 'upper', label: '1 Uppercase (A-Z)', pass: /[A-Z]/.test(password) },
    { id: 'lower', label: '1 Lowercase (a-z)', pass: /[a-z]/.test(password) },
    { id: 'digit', label: '1 Digit (0-9)', pass: /[0-9]/.test(password) },
    { id: 'symbol', label: '1 Special Symbol (!@#$...)', pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password) },
  ];
};
