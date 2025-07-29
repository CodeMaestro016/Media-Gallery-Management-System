import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MediaGallery() {
  const [media, setMedia] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedia();
  }, [activeTab, searchTerm]);

  const fetchMedia = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }
      console.log('Fetching from URL:', `${import.meta.env.VITE_API_URL}/api/media/${activeTab}`);
      let url = `${import.meta.env.VITE_API_URL}/api/media/${activeTab}`;
      if (activeTab === 'search' && searchTerm) {
        const tags = searchTerm.includes(',') ? searchTerm.split(',').map(tag => tag.trim()).join(',') : '';
        const title = searchTerm.includes(',') ? '' : searchTerm;
        url = `${import.meta.env.VITE_API_URL}/api/media/search?${tags ? `tags=${encodeURIComponent(tags)}` : ''}${title ? `${tags ? '&' : ''}title=${encodeURIComponent(title)}` : ''}`;
        console.log('Search URL:', url);
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Response data:', res.data);
      setMedia(res.data.media || []);
      setError('');
    } catch (err) {
      console.error('Fetch error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch media');
    }
  };

  const openSlider = (item) => {
    setSelectedImage(item);
  };

  const closeSlider = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const currentIndex = media.findIndex((item) => item._id === selectedImage._id);
    const nextIndex = (currentIndex + 1) % media.length;
    setSelectedImage(media[nextIndex]);
  };

  const prevImage = () => {
    const currentIndex = media.findIndex((item) => item._id === selectedImage._id);
    const prevIndex = (currentIndex - 1 + media.length) % media.length;
    setSelectedImage(media[prevIndex]);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 text-center">My Media Gallery</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4 flex space-x-4">
          <button
            onClick={() => { setActiveTab('personal'); setSearchTerm(''); }}
            className={`px-4 py-2 rounded ${activeTab === 'personal' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Personal
          </button>
          <button
            onClick={() => { setActiveTab('shared'); setSearchTerm(''); }}
            className={`px-4 py-2 rounded ${activeTab === 'shared' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Shared
          </button>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setActiveTab('search'); setSearchTerm(e.target.value); }}
            placeholder="Search by title or tags"
            className="flex-1 p-2 border rounded"
          />
        </div>
        {media.length === 0 ? (
          <p className="text-center">No media found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.map((item) => (
              <div key={item._id} className="border p-4 rounded cursor-pointer" onClick={() => openSlider(item)}>
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

        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeSlider}>
            <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-black p-2 rounded-full"
              >
                &lt;
              </button>
              <img
                src={`${import.meta.env.VITE_API_URL}/uploads/${selectedImage.filePath.split('\\').pop()}`}
                alt={selectedImage.title}
                className="max-h-[80vh] max-w-full object-contain"
              />
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-black p-2 rounded-full"
              >
                &gt;
              </button>
              <button
                onClick={closeSlider}
                className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full"
              >
                X
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaGallery;