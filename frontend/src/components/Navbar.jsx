import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-black text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">FitTrack</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:text-yellow-400">Home</Link>
        <Link to="/register" className="hover:text-yellow-400">Register</Link>
        <Link to="/login" className="hover:text-yellow-400">Login</Link>
      </div>
    </nav>
  );
}
