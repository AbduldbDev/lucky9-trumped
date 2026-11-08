import { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <Login onSwitchToSignup={() => setIsLogin(false)} />
  ) : (
    <SignUp onSwitchToLogin={() => setIsLogin(true)} />
  );
}
