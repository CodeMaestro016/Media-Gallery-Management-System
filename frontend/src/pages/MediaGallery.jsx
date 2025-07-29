import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MediaGallery() {
  const [media, setMedia] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/media`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMedia(res.data.media);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch media');
      }
    };
    fetchMedia();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 text-center">My Media Gallery</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {media.length === 0 ? (
          <p className="text-center">No media uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.map((item) => (
              <div key={item._id} className="border p-4 rounded">
                <img
                  src={`${import.meta.env.VITE_API_URL}/uploads/${item.filePath.split('\\').pop()}`}
                  alt={item.title}
                  className="w-full h-48 object-cover mb-2 rounded"
                />
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
                <p className="text-sm text-gray-500">Tags: {item.tags.join(', ')}</p>
                <p className="text-sm text-gray-500">Uploaded: {new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => navigate('/upload')}
          className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Upload New Image
        </button>
      </div>
    </div>
  );
}

export default MediaGallery;