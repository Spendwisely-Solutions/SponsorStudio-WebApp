import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import Modal from '../../Modal';
import 'tailwindcss/tailwind.css';

// Dedicated Supabase client for storage operations
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error('Invalid Supabase URL format');
}

const supabaseStorage = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

function ManageBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    preview_text: '',
    content: '',
    preview_image: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);

  useEffect(() => {
    const fetchUserAndBlogs = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setUser(null);
      } else {
        setUser(user);
      }
      fetchBlogs();
    };
    fetchUserAndBlogs();
  }, []);

  async function fetchBlogs() {
    const { data, error } = await supabase
      .from('success_stories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      setError(`Failed to fetch blogs: ${error.message}`);
      return;
    }
    setBlogs(data);
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error on input change
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (e.g., .jpg, .png).');
        return;
      }
      setFormData(prev => ({ ...prev, preview_image: file }));
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic form validation
    if (!formData.title.trim() || !formData.preview_text.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    let imageUrl = isEditing ? formData.preview_image : null;

    if (formData.preview_image instanceof File) {
      const file = formData.preview_image;
      const fileExt = file.name.split('.').pop().toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!validExtensions.includes(fileExt)) {
        setError('Unsupported image format. Please use JPG, PNG, GIF, or WebP.');
        setIsLoading(false);
        return;
      }

      const fileName = `${uuidv4()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabaseStorage.storage
        .from('blogs')
        .upload(fileName, file, {
          contentType: file.type,
          headers: { 'Content-Type': file.type },
          upsert: true
        });

      if (uploadError) {
        setError(`Failed to upload image: ${uploadError.message}`);
        setIsLoading(false);
        return;
      }

      imageUrl = supabaseStorage.storage
        .from('blogs')
        .getPublicUrl(fileName).data.publicUrl;
    } else if (!imageUrl && !isEditing) {
      imageUrl = 'https://example.com/placeholder.jpg';
    }

    try {
      if (isEditing) {
        if (!user) {
          setError('You must be logged in to update blogs.');
          setIsLoading(false);
          return;
        }
        const { error } = await supabase
          .from('success_stories')
          .update({
            title: formData.title,
            preview_text: formData.preview_text,
            content: formData.content,
            preview_image: imageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', formData.id);

        if (error) {
          setError(`Failed to update blog: ${error.message}`);
          setIsLoading(false);
          return;
        }
      } else {
        const { error } = await supabase
          .from('success_stories')
          .insert({
            title: formData.title,
            preview_text: formData.preview_text,
            content: formData.content,
            preview_image: imageUrl
          });

        if (error) {
          setError(`Failed to create blog: ${error.message}`);
          setIsLoading(false);
          return;
        }
      }

      resetForm();
      setIsFormVisible(false);
      fetchBlogs();
    } catch (err) {
      setError('An unexpected error occurred: ' + err.message);
      setIsLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (!user) {
      setError('You must be logged in to delete blogs.');
      return;
    }
    setBlogToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;

    const { error } = await supabase
      .from('success_stories')
      .delete()
      .eq('id', blogToDelete);

    if (error) {
      setError(`Failed to delete blog: ${error.message}`);
    } else {
      fetchBlogs();
    }
    setIsDeleteModalOpen(false);
    setBlogToDelete(null);
  };

  const handleEdit = (blog) => {
    setFormData({
      id: blog.id,
      title: blog.title,
      preview_text: blog.preview_text,
      content: blog.content,
      preview_image: blog.preview_image
    });
    setImagePreview(blog.preview_image);
    setIsEditing(true);
    setIsFormVisible(true);
  };

  const openCreateForm = () => {
    resetForm();
    setIsEditing(false);
    setIsFormVisible(true);
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: '',
      preview_text: '',
      content: '',
      preview_image: null
    });
    setImagePreview(null);
    setIsEditing(false);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      {!isFormVisible ? (
        <>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 animate-fade-in">
              {error}
            </div>
          )}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Blog Manager</h1>
            <button
              onClick={openCreateForm}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              aria-label="Create new blog"
            >
              Create Blog
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map(blog => (
              <div
                key={blog.id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <img
                  src={blog.preview_image}
                  alt={blog.title}
                  className="w-full h-48 object-cover rounded mb-4"
                />
                <h2 className="text-xl font-bold mb-2 text-gray-800">{blog.title}</h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{blog.preview_text}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                    disabled={!user}
                    aria-label={`Edit ${blog.title}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors duration-200"
                    disabled={!user}
                    aria-label={`Delete ${blog.title}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-xl animate-scale-in">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {isEditing ? 'Edit Blog' : 'Create Blog'}
          </h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 animate-fade-in">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="title">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error && !formData.title.trim() ? 'border-red-500' : ''
                }`}
                required
                aria-describedby={error && !formData.title.trim() ? 'title-error' : undefined}
              />
              {error && !formData.title.trim() && (
                <p id="title-error" className="text-red-500 text-sm mt-1">
                  Title is required
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="preview_text">
                Preview Text
              </label>
              <textarea
                id="preview_text"
                name="preview_text"
                value={formData.preview_text}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error && !formData.preview_text.trim() ? 'border-red-500' : ''
                }`}
                rows="3"
                required
                aria-describedby={error && !formData.preview_text.trim() ? 'preview-text-error' : undefined}
              />
              {error && !formData.preview_text.trim() && (
                <p id="preview-text-error" className="text-red-500 text-sm mt-1">
                  Preview text is required
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="content">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error && !formData.content.trim() ? 'border-red-500' : ''
                }`}
                rows="6"
                required
                aria-describedby={error && !formData.content.trim() ? 'content-error' : undefined}
              />
              {error && !formData.content.trim() && (
                <p id="content-error" className="text-red-500 text-sm mt-1">
                  Content is required
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="preview_image">
                Preview Image
              </label>
              <input
                type="file"
                id="preview_image"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error && !formData.preview_image && !isEditing ? 'border-red-500' : ''
                }`}
                required={!isEditing}
                aria-describedby={error && !formData.preview_image && !isEditing ? 'image-error' : undefined}
              />
              {error && !formData.preview_image && !isEditing && (
                <p id="image-error" className="text-red-500 text-sm mt-1">
                  Preview image is required
                </p>
              )}
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-2 max-w-xs rounded shadow"
                />
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
                aria-label={isEditing ? 'Update blog' : 'Create blog'}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                {isEditing ? 'Update Blog' : 'Create Blog'}
              </button>
              <button
                type="button"
                onClick={() => setIsFormVisible(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                disabled={isLoading}
                aria-label="Cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBlogToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this blog? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 text-white hover:bg-red-700"
        cancelButtonClass="border-gray-300 text-gray-700 hover:bg-gray-50"
      />
    </div>
  );
}

export default ManageBlogs;