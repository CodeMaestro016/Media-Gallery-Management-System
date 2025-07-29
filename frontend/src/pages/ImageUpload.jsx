import { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ImageUpload() {
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [shared, setShared] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 10) {
      setError('Maximum 10 files can be uploaded at once');
      setFiles([]);
      setPreview([]);
      return;
    }

    const validFiles = selectedFiles.filter(file =>
      ['image/jpeg', 'image/png'].includes(file.type) && file.size <= 5 * 1024 * 1024
    );
    if (validFiles.length !== selectedFiles.length) {
      setError('Please upload only JPG or PNG files (max 5MB each)');
    }

    setFiles(validFiles);
    setPreview(validFiles.map(file => URL.createObjectURL(file)));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 10) {
      setError('Maximum 10 files can be uploaded at once');
      setFiles([]);
      setPreview([]);
      return;
    }

    const validFiles = droppedFiles.filter(file =>
      ['image/jpeg', 'image/png'].includes(file.type) && file.size <= 5 * 1024 * 1024
    );
    if (validFiles.length !== droppedFiles.length) {
      setError('Please upload only JPG or PNG files (max 5MB each)');
    }

    setFiles(validFiles);
    setPreview(validFiles.map(file => URL.createObjectURL(file)));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length || !title) {
      setError('Files and title are required');
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);
    formData.append('shared', shared);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/media/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload response:', res.data); // Debug log
      navigate('/gallery');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Upload Images</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div
          className="border-2 border-dashed border-gray-300 p-4 mb-4 text-center"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {preview.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {preview.map((src, index) => (
                <img key={index} src={src} alt={`Preview ${index + 1}`} className="max-w-full h-24 object-cover rounded" />
              ))}
            </div>
          ) : (
            <p>Drag and drop images here or click to select (max 10)</p>
          )}
          <input
            type="file"
            multiple
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
            Select Files
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
          <div className="mb-4">
            <label className="block text-gray-700">
              <input
                type="checkbox"
                checked={shared}
                onChange={(e) => setShared(e.target.checked)}
                className="mr-2"
              />
              Share these images
            </label>
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