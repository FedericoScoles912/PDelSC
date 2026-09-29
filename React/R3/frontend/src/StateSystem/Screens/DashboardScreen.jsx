import Navbar from '../../Components/Organisms/Navbar.jsx';
import Dashboard from '../../Components/Organisms/Dashboard.jsx';

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
