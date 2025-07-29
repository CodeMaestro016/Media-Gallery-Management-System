import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MediaGallery() {
  const [media, setMedia] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [editMedia, setEditMedia] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
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
      let url = `${import.meta.env.VITE_API_URL}/api/media/${activeTab}`;
      if (activeTab === 'search' && searchTerm) {
        const tags = searchTerm.includes(',') ? searchTerm.split(',').map(tag => tag.trim()).join(',') : '';
        const title = searchTerm.includes(',') ? '' : searchTerm;
        url = `${import.meta.env.VITE_API_URL}/api/media/search?${tags ? `tags=${encodeURIComponent(tags)}` : ''}${title ? `${tags ? '&' : ''}title=${encodeURIComponent(title)}` : ''}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedia(res.data.media || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch media');
    }
  };

  const openSlider = (item, index) => {
    setSelectedImage({ ...item, currentIndex: index });
  };

  const closeSlider = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage && selectedImage.filePaths && selectedImage.filePaths.length > 0) {
      const nextIndex = (selectedImage.currentIndex + 1) % selectedImage.filePaths.length;
      setSelectedImage({ ...selectedImage, currentIndex: nextIndex });
    }
  };

  const prevImage = () => {
    if (selectedImage && selectedImage.filePaths && selectedImage.filePaths.length > 0) {
      const prevIndex = (selectedImage.currentIndex - 1 + selectedImage.filePaths.length) % selectedImage.filePaths.length;
      setSelectedImage({ ...selectedImage, currentIndex: prevIndex });
    }
  };

  const openEditModal = (item) => {
    setEditMedia({ ...item, tags: item.tags.join(',') });
  };

  const closeEditModal = () => {
    setEditMedia(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editMedia) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/media/${editMedia._id}`, editMedia, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMedia();
      closeEditModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update media');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/media/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchMedia();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete media');
      }
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDownloadZip = async () => {
    if (selectedItems.length === 0) {
      setError('Please select at least one item to download');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/media/download-zip`,
        { ids: selectedItems },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'media_images.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSelectedItems([]); // Clear selection after download
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download ZIP');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 text-center">My Media Gallery</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4 flex space-x-4">
          <button
            onClick={() => { setActiveTab('personal'); setSearchTerm(''); setSelectedItems([]); }}
            className={`px-4 py-2 rounded ${activeTab === 'personal' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Personal
          </button>
          <button
            onClick={() => { setActiveTab('shared'); setSearchTerm(''); setSelectedItems([]); }}
            className={`px-4 py-2 rounded ${activeTab === 'shared' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Shared
          </button>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setActiveTab('search'); setSearchTerm(e.target.value); setSelectedItems([]); }}
            placeholder="Search by title or tags"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleDownloadZip}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
            disabled={selectedItems.length === 0}
          >
            Download ZIP
          </button>
        </div>
        {media.length === 0 ? (
          <p className="text-center">No media found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.map((item) => (
              <div key={item._id} className="border p-4 rounded relative">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item._id)}
                    onChange={() => handleSelectItem(item._id)}
                    className="mr-2"
                  />
                  <span>Select</span>
                </div>
                <img
                  src={`${import.meta.env.VITE_API_URL}/uploads/${item.filePath.split('\\').pop()}`}
                  alt={item.title}
                  className="w-full h-48 object-cover mb-2 rounded"
                  onClick={() => openSlider(item, 0)} // Pass index 0 for single image
                />
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
                <p className="text-sm text-gray-500">Tags: {item.tags.join(', ')}</p>
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
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
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={(e) => e.target === e.currentTarget && closeSlider()}>
            <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-black p-2 rounded-full"
              >
                &lt;
              </button>
              <img
                src={`${import.meta.env.VITE_API_URL}/uploads/${selectedImage.filePath.split('\\').pop()}`}
                alt={`${selectedImage.title} ${selectedImage.currentIndex + 1}`}
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

        {editMedia && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeEditModal}>
            <div className="bg-white p-6 rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Edit Media</h3>
              <form onSubmit={handleUpdate}>
                <div className="mb-4">
                  <label className="block text-gray-700">Title</label>
                  <input
                    type="text"
                    value={editMedia.title}
                    onChange={(e) => setEditMedia({ ...editMedia, title: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Description</label>
                  <textarea
                    value={editMedia.description}
                    onChange={(e) => setEditMedia({ ...editMedia, description: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={editMedia.tags}
                    onChange={(e) => setEditMedia({ ...editMedia, tags: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">
                    <input
                      type="checkbox"
                      checked={editMedia.shared}
                      onChange={(e) => setEditMedia({ ...editMedia, shared: e.target.checked })}
                      className="mr-2"
                    />
                    Share this image
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaGallery;