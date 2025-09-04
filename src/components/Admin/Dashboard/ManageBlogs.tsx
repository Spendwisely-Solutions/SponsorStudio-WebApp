import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { CustomModal } from '../../CustomModal';
import {
  Plus,
  Edit3,
  Trash2,
  ArrowLeft,
  Image as ImageIcon,
  FileText,
  Calendar,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
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

// Types
interface Blog {
  id: string;
  title: string;
  preview_text: string;
  content: string;
  preview_image: string;
  created_at: string;
  updated_at?: string;
}

interface FormData {
  id: string | null;
  title: string;
  preview_text: string;
  content: string;
  preview_image: File | string | null;
}

function ManageBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [formData, setFormData] = useState<FormData>({
    id: null,
    title: '',
    preview_text: '',
    content: '',
    preview_image: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error on input change
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic form validation
    if (!formData.title.trim() || !formData.preview_text.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    let imageUrl: string | null = isEditing ? (formData.preview_image as string) : null;

    if (formData.preview_image instanceof File) {
      const file = formData.preview_image;
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!fileExt || !validExtensions.includes(fileExt)) {
        setError('Unsupported image format. Please use JPG, PNG, GIF, or WebP.');
        setIsLoading(false);
        return;
      }

      const fileName = `${uuidv4()}.${fileExt}`;
      const { error: uploadError } = await supabaseStorage.storage
        .from('blogs')
        .upload(fileName, file, {
          contentType: file.type,
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
      setError('An unexpected error occurred: ' + (err as Error).message);
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!user) {
      setError('You must be logged in to delete blogs.');
      return;
    }
    setBlogToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleView = (id: string) => {
    window.open(`/story/${id}`, '_blank');
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

  const handleEdit = (blog: Blog) => {
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
    <div className="space-y-6">
      {!isFormVisible ? (
        <>
          {/* Header Section */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
                  Blog Manager
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Create and manage success stories and blog posts
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {blogs.length} blogs
                </div>
                <button
                  onClick={fetchBlogs}
                  className="p-2.5 sm:p-3 text-gray-600 hover:text-blue-600 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-all duration-200 hover:shadow-md flex items-center justify-center"
                  title="Refresh blogs"
                  aria-label="Refresh blogs"
                >
                  <RefreshCw size={18} />
                </button>
                <button
                  onClick={openCreateForm}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
                  aria-label="Create new blog"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Blog</span>
                </button>
                <div className="hidden sm:block">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Blogs Grid */}
          {blogs.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/50 p-8 sm:p-12 text-center">
              <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No blogs found</h3>
              <p className="text-gray-500 text-sm sm:text-base mb-4">
                Get started by creating your first blog post.
              </p>
              <button
                onClick={openCreateForm}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Blog</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {blogs.map(blog => (
                <div
                  key={blog.id}
                  className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Blog Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={blog.preview_image}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5">
                        <ImageIcon className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                  </div>

                  {/* Blog Content */}
                  <div className="p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                      {blog.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {blog.preview_text}
                    </p>
                    
                    {/* Blog Meta */}
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Created: {new Date(blog.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(blog)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-medium"
                        disabled={!user}
                        aria-label={`Edit ${blog.title}`}
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm font-medium"
                        disabled={!user}
                        aria-label={`Delete ${blog.title}`}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                      <button
                        onClick={() => handleView(blog.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all duration-200 text-sm font-medium ml-auto"
                        aria-label={`View ${blog.title}`}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Create/Edit Form */
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-4 sm:p-6">
          {/* Form Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsFormVisible(false)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                disabled={isLoading}
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-blue-600">
                  {isEditing ? 'Edit Blog' : 'Create Blog'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {isEditing ? 'Update your blog post' : 'Create a new blog post'}
                </p>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3 mb-6">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="title">
                Blog Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter a compelling blog title..."
                required
              />
            </div>

            {/* Preview Text Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="preview_text">
                Preview Text *
              </label>
              <textarea
                id="preview_text"
                name="preview_text"
                value={formData.preview_text}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                rows={3}
                placeholder="Write a brief preview of your blog post..."
                required
              />
            </div>

            {/* Content Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="content">
                Blog Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                rows={8}
                placeholder="Write your blog content here..."
                required
              />
            </div>

            {/* Image Upload Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="preview_image">
                Preview Image {!isEditing && '*'}
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-colors duration-200">
                <input
                  type="file"
                  id="preview_image"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  required={!isEditing}
                />
                <label
                  htmlFor="preview_image"
                  className="cursor-pointer flex flex-col items-center text-center"
                >
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
                  <span className="text-sm font-medium text-gray-700">
                    Click to upload image
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF or WebP (Max 10MB)
                  </span>
                </label>
              </div>
              
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-xs rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                aria-label={isEditing ? 'Update blog' : 'Create blog'}
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                )}
                <span>{isLoading ? 'Saving...' : (isEditing ? 'Update Blog' : 'Create Blog')}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsFormVisible(false)}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                disabled={isLoading}
                aria-label="Cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBlogToDelete(null);
        }}
        title="Delete Blog Post"
        customStyles={{ maxWidth: '24rem' }}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Confirm Deletion
              </h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this blog post? This action cannot be undone.
              </p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> This will permanently remove the blog post and its associated image.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setBlogToDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Blog</span>
            </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}

export default ManageBlogs;