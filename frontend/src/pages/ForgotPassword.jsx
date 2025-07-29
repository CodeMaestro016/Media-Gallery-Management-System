import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function ForgotPassword() {
  const { forgotPassword, resetPassword } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('forgot');
  const [error, setError] = useState('');

  const handleForgot = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email, otp, newPassword);
      window.location.href = '/login';
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">{step === 'forgot' ? 'Forgot Password' : 'Reset Password'}</h1>
      {error && <p className="text-red-500">{error}</p>}
      {step === 'forgot' ? (
        <form onSubmit={handleForgot} className="space-y-4">
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
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Send OTP</button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
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
          <div>
            <label className="block">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Reset Password</button>
        </form>
      )}
      <p className="mt-4">
        <a href="/login" className="text-blue-500">Back to Login</a>
      </p>
    </div>
  );
}

export default ForgotPassword;