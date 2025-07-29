import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Register() {
  const { register, verifyOtp } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('register');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
  e.preventDefault();
  try {
    await register(name, email, password);
    setStep('verify');
  } catch (err) {
    console.error('Registration error:', err.response?.data); // Add this line
    setError(err.response?.data?.message || 'Registration failed');
  }
};
  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await verifyOtp(email, otp);
      window.location.href = '/login';
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">{step === 'register' ? 'Register' : 'Verify OTP'}</h1>
      {error && <p className="text-red-500">{error}</p>}
      {step === 'register' ? (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Register</button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Verify OTP</button>
        </form>
      )}
      <p className="mt-4">
        Already have an account? <a href="/login" className="text-blue-500">Login</a>
      </p>
    </div>
  );
}

export default Register;