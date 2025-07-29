import { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && ['image/jpeg', 'image/png'].includes(selectedFile.type) && selectedFile.size <= 5 * 1024 * 1024) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
    } else {
      setError('Please upload a JPG or PNG file (max 5MB)');
      setFile(null);
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && ['image/jpeg', 'image/png'].includes(droppedFile.type) && droppedFile.size <= 5 * 1024 * 1024) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setError('');
    } else {
      setError('Please upload a JPG or PNG file (max 5MB)');
      setFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      setError('File and title are required');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in.');
        return;
      }

      const apiUrl = `${import.meta.env.VITE_API_URL}/api/media/upload`;
      console.log('Request URL:', apiUrl); // Debug URL
      const response = await axios.post(apiUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload response:', response.data); // Debug response
      navigate('/gallery');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Check console for details.');
      console.error('Upload error:', err); // Debug error
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Upload Image</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div
          className="border-2 border-dashed border-gray-300 p-4 mb-4 text-center"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-w-full h-auto mb-4" />
          ) : (
            <p>Drag and drop an image here or click to select</p>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="mt-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Select File
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Upload
          </button>
        </form>
      </div>
    </div>
  );
}

export default ImageUpload;