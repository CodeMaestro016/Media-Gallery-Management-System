import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import ImageUpload from './pages/ImageUpload';
import MediaGallery from './pages/MediaGallery';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/upload" element={<ImageUpload />} />
            <Route path="/gallery" element={<MediaGallery />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;