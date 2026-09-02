import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = isSignUp ? await signUp(email, password) : await signIn(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isSignUp ? 'Create your account' : 'Log in'}</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
      </button>
      <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Already have an account? Log in' : "No account? Sign up"}
      </button>
    </form>
  );
}