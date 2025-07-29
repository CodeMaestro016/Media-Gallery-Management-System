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
        if (!token) {
          setError('No authentication token found. Please log in.');
          return;
        }

        const apiUrl = `${import.meta.env.VITE_API_URL}/api/media`;
        console.log('Fetching from:', apiUrl); // Debug URL
        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetch response:', response.data); // Debug response
        setMedia(response.data);
      } catch (err) {
        setError(`Failed to fetch media: ${err.response?.status} ${err.response?.statusText}. ${err.message}`);
        console.error('Fetch error:', err); // Debug error
      }
    };

    fetchMedia();
  }, []);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center">Media Gallery</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {media.length === 0 && !error && <p className="text-center">No media available. Upload some images!</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {media.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded-lg shadow-md">
            <img
              src={`http://localhost:5000/uploads/${item.filePath.split('/').pop()}`}
              alt={item.title}
              className="w-full h-48 object-cover mb-2 rounded"
            />
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-gray-600">{item.description || 'No description'}</p>
            <p className="text-sm text-gray-500">Tags: {item.tags.join(', ') || 'None'}</p>
            <p className="text-xs text-gray-400">Uploaded: {new Date(item.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MediaGallery;