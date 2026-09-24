import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../Components/organisms/Navbar.jsx';
import RegisterForm from '../../Components/organisms/RegisterForm.jsx';
import useAuth from '../../Scripts/hooks/useAuth.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { authenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && authenticated) navigate('/dashboard', { replace: true });
  }, [authenticated, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--bg-primary)]">
      <Navbar navigate={(p) => navigate(p)} current="/register" />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="card p-8 w-full max-w-xl shadow-warm">
          <RegisterForm
            navigate={(p) => navigate(p)}
            onLoginClick={() => navigate('/login')}
          />
        </div>
      </main>
    </div>
  );
}
