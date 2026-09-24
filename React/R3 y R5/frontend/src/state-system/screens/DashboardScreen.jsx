import Navbar from '../../Components/organisms/Navbar.jsx';
import Dashboard from '../../Components/organisms/Dashboard.jsx';

export default function DashboardScreen({ navigate }) {
  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--bg-primary)]">
      <Navbar navigate={navigate} current="dashboard" />
      <main className="flex-1 w-full">
        <div className="max-w-content px-6 py-8">
          <Dashboard />
        </div>
      </main>
    </div>
  );
}
