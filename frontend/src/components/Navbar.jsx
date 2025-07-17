import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <h1 className="text-2xl font-extrabold tracking-tight text-emerald-500">FitTrack</h1>
      <div className="space-x-6 text-sm font-medium">
        <Link to="/" className="hover:text-emerald-400 transition duration-200">Home</Link>
        <Link to="/auth" className="hover:text-emerald-400 transition duration-200">Register</Link>
      </div>
    </nav>

  );
}
