import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../Components/organisms/Navbar.jsx';
import LoginForm from '../../Components/organisms/LoginForm.jsx';
import useAuth from '../../Scripts/hooks/useAuth.js';
import { useEffect } from 'react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && authenticated) {
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [authenticated, loading, navigate, location.state]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--bg-primary)]">
      <Navbar navigate={(p) => navigate(p)} current="/login" />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="card p-8 w-full max-w-md shadow-warm">
          <LoginForm
            navigate={(p) => navigate(p)}
            onRegisteredClick={() => navigate('/register')}
          />
        </div>
      </main>
    </div>
  );
}
