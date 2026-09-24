import Navbar from '../../Components/organisms/Navbar.jsx';
import Profile from '../../Components/organisms/Profile.jsx';

export default function ProfileScreen({ navigate }) {
  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--bg-primary)]">
      <Navbar navigate={navigate} current="profile" />
      <main className="flex-1 w-full">
        <div className="max-w-content px-6 py-8">
          <Profile />
        </div>
      </main>
    </div>
  );
}
