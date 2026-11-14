import { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';
import { usePageTitle } from '../../hooks/usePageTitle.js';

export default function AuthScreen() {
  usePageTitle('Sign In');
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <Login onSwitchToSignup={() => setIsLogin(false)} />
  ) : (
    <SignUp onSwitchToLogin={() => setIsLogin(true)} />
  );
}
