import { useEffect } from 'react';
import Navbar from '../../Components/organisms/Navbar.jsx';
import LoginForm from '../../Components/organisms/LoginForm.jsx';
import useAuth from '../../Scripts/hooks/useAuth.js';

export default function LoginScreen({ navigate }) {
  const { authenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && authenticated) navigate?.('/dashboard');
  }, [authenticated, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--bg-primary)]">
      <Navbar navigate={navigate} current="login" />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="card p-8 w-full max-w-md shadow-warm">
          <LoginForm
            navigate={navigate}
            onRegisteredClick={() => navigate?.('/register')}
          />
        </div>
      </main>
    </div>
  );
}
