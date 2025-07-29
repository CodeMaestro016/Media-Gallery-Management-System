import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Home() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Media Gallery System</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name} ({user.email})!</p>
          <button
            onClick={logout}
            className="mt-4 bg-red-500 text-white p-2 rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>Please <a href="/login" className="text-blue-500">login</a> or <a href="/register" className="text-blue-500">register</a> to continue.</p>
      )}
    </div>
  );
}

export default Home;