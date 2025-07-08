import React, { useState } from 'react';
import { Video, Users, Tag, DollarSign, Upload, X, CheckCircle, AlertCircle, Sparkles, Eye } from 'lucide-react';

interface PostFormProps {
  onSubmit: (postData: any) => void;
  loading?: boolean;
  onClose?: () => void;
  categories?: Array<{ id: string; name: string }>;
  onSuccess?: () => void; // Add callback for successful submission
}

export default function PostForm({ onSubmit, loading, onClose, categories = [], onSuccess }: PostFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hashtags: '',
    category_id: '',
    reach: undefined as number | undefined,
    price_range: '', // Store as string to match database
    video_url: '',
    status: 'active' as const,
    verification_status: 'pending' as const,
    video_file: undefined as File | undefined,
  });
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isDragging, setIsDragging] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }
    
    if (!formData.reach || formData.reach <= 0) {
      newErrors.reach = 'Reach must be a positive number';
    }
    
    if (!formData.price_range.trim()) {
      newErrors.price_range = 'Price range is required';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Simulate upload progress for better UX
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate progress steps
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 200);
      
      // Submit the form after a short delay for UX
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        onSubmit(formData);
        
        // Don't reset form here - let the parent component handle closing
        // after successful upload in the handleCreatePost function
      }, 1000);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      hashtags: '',
      category_id: '',
      reach: undefined,
      price_range: '',
      video_url: '',
      status: 'active' as const,
      verification_status: 'pending' as const,
      video_file: undefined,
    });
    setVideoPreview(null);
    setErrors({});
    setFocusedField(null);
    setHashtagInput('');
    setHashtags([]);
    setUploadProgress(0);
    setIsUploading(false);
    // Don't auto-close the form here
  };

  // Function to handle successful post creation
  const handleSuccessfulSubmission = () => {
    setIsUploading(false);
    setUploadProgress(0);
    resetForm();
    if (onSuccess) onSuccess(); // Call the success callback instead of direct close
    else if (onClose) onClose(); // Fallback to direct close if no success callback
  };

  // Effect to handle successful submission when loading changes from true to false
  const prevLoading = React.useRef(loading);
  React.useEffect(() => {
    if (prevLoading.current === true && loading === false && (isUploading || uploadProgress > 0)) {
      // Post was successfully submitted, reset the form and close
      setTimeout(() => {
        handleSuccessfulSubmission();
      }, 500); // Small delay to show completion
    }
    prevLoading.current = loading;
  }, [loading, isUploading, uploadProgress, onSuccess, onClose]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'reach') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : parseInt(value),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({
        ...prev,
        video_file: file,
      }));
      setVideoPreview(URL.createObjectURL(file));
      setErrors(prev => ({
        ...prev,
        video_file: ''
      }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('video/')) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        video_file: file,
      }));
      setVideoPreview(URL.createObjectURL(file));
      setErrors(prev => ({
        ...prev,
        video_file: ''
      }));
    }
  };

  const removeVideo = () => {
    setFormData(prev => ({
      ...prev,
      video_file: undefined,
    }));
    setVideoPreview(null);
  };

  const handleHashtagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHashtagInput(value);
    
    // Update form data with current hashtags plus input
    const allHashtags = [...hashtags, value].filter(tag => tag.trim() !== '');
    setFormData(prev => ({
      ...prev,
      hashtags: allHashtags.join(' ')
    }));
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      addHashtag();
    } else if (e.key === 'Backspace' && hashtagInput === '' && hashtags.length > 0) {
      // Remove last hashtag if input is empty and backspace is pressed
      removeHashtag(hashtags.length - 1);
    }
  };

  const addHashtag = () => {
    const trimmedInput = hashtagInput.trim();
    if (trimmedInput && !hashtags.includes(trimmedInput) && hashtags.length < 10) {
      // Add # if not present
      const formattedTag = trimmedInput.startsWith('#') ? trimmedInput : `#${trimmedInput}`;
      const newHashtags = [...hashtags, formattedTag];
      setHashtags(newHashtags);
      setHashtagInput('');
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        hashtags: newHashtags.join(' ')
      }));
    } else {
      setHashtagInput('');
    }
  };

  const removeHashtag = (index: number) => {
    const newHashtags = hashtags.filter((_, i) => i !== index);
    setHashtags(newHashtags);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      hashtags: newHashtags.join(' ')
    }));
  };

  const getHashtagColor = (index: number) => {
    const colors = [
      'bg-gradient-to-r from-pink-500 to-rose-500',
      'bg-gradient-to-r from-purple-500 to-indigo-500',
      'bg-gradient-to-r from-blue-500 to-cyan-500',
      'bg-gradient-to-r from-green-500 to-emerald-500',
      'bg-gradient-to-r from-yellow-500 to-orange-500',
      'bg-gradient-to-r from-red-500 to-pink-500',
      'bg-gradient-to-r from-indigo-500 to-purple-500',
      'bg-gradient-to-r from-teal-500 to-green-500',
    ];
    return colors[index % colors.length];
  };

  const getFieldError = (field: string) => errors[field];
  const hasError = (field: string) => Boolean(errors[field]);

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar enhanced-shadow modal-animation premium-glass">
      {/* Add CSS animations and custom scrollbar */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(-30px);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0px);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 
              0 25px 50px -12px rgba(0, 0, 0, 0.25),
              0 0 0 1px rgba(255, 255, 255, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
          }
          50% {
            box-shadow: 
              0 35px 70px -12px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.3),
              0 0 40px rgba(99, 102, 241, 0.1);
          }
        }
        
        .glass-effect {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.9);
        }
        
        .premium-glass {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%,
            rgba(248, 250, 252, 0.95) 25%,
            rgba(241, 245, 249, 0.95) 50%,
            rgba(248, 250, 252, 0.95) 75%,
            rgba(255, 255, 255, 0.95) 100%);
          backdrop-filter: blur(20px) saturate(180%);
        }
        
        .form-animation {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .modal-animation {
          animation: modalSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .input-focus-glow {
          box-shadow: 
            0 0 0 3px rgba(59, 130, 246, 0.12),
            0 4px 16px rgba(59, 130, 246, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          border-color: #3b82f6;
          transform: translateY(-1px);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .drag-active {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%);
          border-color: #3b82f6;
          box-shadow: 
            0 8px 25px rgba(59, 130, 246, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transform: scale(1.02);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        /* Premium Custom Scrollbar Styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(135deg, rgba(241, 245, 249, 0.3) 0%, rgba(248, 250, 252, 0.3) 100%);
          border-radius: 12px;
          margin: 12px 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 4px 12px rgba(99, 102, 241, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%);
          transform: scale(1.05);
          box-shadow: 
            0 6px 20px rgba(99, 102, 241, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            inset 0 -1px 0 rgba(0, 0, 0, 0.15);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:active {
          background: linear-gradient(135deg, #4338ca 0%, #6d28d9 50%, #7e22ce 100%);
          transform: scale(0.98);
          box-shadow: 
            0 2px 8px rgba(99, 102, 241, 0.6),
            inset 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #6366f1 rgba(241, 245, 249, 0.3);
        }
        
        /* Smooth scrolling behavior */
        .custom-scrollbar {
          scroll-behavior: smooth;
          overflow-y: auto;
          overflow-x: hidden;
        }
        
        /* Premium Modal backdrop blur effect */
        .modal-backdrop {
          backdrop-filter: blur(12px) saturate(180%);
          background: linear-gradient(135deg, 
            rgba(0, 0, 0, 0.4) 0%, 
            rgba(30, 41, 59, 0.5) 25%,
            rgba(15, 23, 42, 0.6) 75%,
            rgba(0, 0, 0, 0.7) 100%);
          animation: backdropFadeIn 0.4s ease-out;
        }
        
        @keyframes backdropFadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(12px) saturate(180%);
          }
        }
        
        /* Enhanced premium shadow effects */
        .enhanced-shadow {
          box-shadow: 
            0 32px 64px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.25),
            inset 0 0 20px rgba(255, 255, 255, 0.05),
            0 0 60px rgba(99, 102, 241, 0.08);
          transition: box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .enhanced-shadow:hover {
          box-shadow: 
            0 40px 80px -12px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 0 30px rgba(255, 255, 255, 0.08),
            0 0 80px rgba(99, 102, 241, 0.12);
        }
        
        /* Premium button hover effects */
        .btn-premium {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        
        .btn-premium::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        
        .btn-premium:hover::before {
          left: 100%;
        }
        
        .btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 20px 40px rgba(99, 102, 241, 0.4),
            0 0 20px rgba(99, 102, 241, 0.2);
        }
        
        /* Hashtag Tags Styling */
        .hashtag-container {
          min-height: 46px;
          padding: 8px 12px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(4px);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .hashtag-container:focus-within {
          border-color: #3b82f6;
          box-shadow: 
            0 0 0 3px rgba(59, 130, 246, 0.12),
            0 4px 16px rgba(59, 130, 246, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        
        .hashtag-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          animation: hashtagFadeIn 0.3s ease-out;
          transition: all 0.2s ease;
        }
        
        .hashtag-tag:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        .hashtag-remove {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .hashtag-remove:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
        
        .hashtag-input {
          flex: 1;
          min-width: 120px;
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          padding: 4px 0;
        }
        
        .hashtag-input::placeholder {
          color: #9ca3af;
        }
        
        @keyframes hashtagFadeIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        /* Progress Bar Animations */
        @keyframes progressFill {
          from {
            width: 0%;
          }
          to {
            width: var(--progress-width);
          }
        }
        
        @keyframes progressGlow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
          }
        }
        
        .progress-bar {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          animation: progressGlow 2s ease-in-out infinite;
          transition: width 0.3s ease-out;
        }
        
        .upload-progress {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        
        .hashtag-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          z-index: 10;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .hashtag-suggestion {
          padding: 8px 12px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .hashtag-suggestion:hover {
          background: #f3f4f6;
        }
      `}</style>

      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Create New Post</h2>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Eye className="w-4 h-4 text-indigo-500" />
                Share your content and attract brand partnerships
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8 form-animation">
        {/* Title and Category Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Tag className="w-4 h-4 text-blue-500" />
              Post Title
            </label>
            <div className="relative">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('title')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                  hasError('title') 
                    ? 'border-red-300 focus:border-red-500 bg-red-50/50' 
                    : focusedField === 'title' 
                    ? 'input-focus-glow' 
                    : 'border-gray-200 focus:border-blue-400'
                } bg-white/70 backdrop-blur-sm`}
                placeholder="Enter an engaging title for your post..."
                required
              />
              {formData.title && (
                <div className="absolute right-3 top-3 text-green-500">
                  <CheckCircle className="w-5 h-5" />
                </div>
              )}
            </div>
            {hasError('title') && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {getFieldError('title')}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {formData.title.length}/100 characters
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Tag className="w-4 h-4 text-purple-500" />
              Category
            </label>
            <div className="relative">
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('category_id')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                  hasError('category_id') 
                    ? 'border-red-300 focus:border-red-500 bg-red-50/50' 
                    : focusedField === 'category_id' 
                    ? 'input-focus-glow' 
                    : 'border-gray-200 focus:border-blue-400'
                } bg-white/70 backdrop-blur-sm appearance-none`}
                required
              >
                <option value="">Select your content category...</option>
                {categories.length > 0 ? (
                  categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1">🎨 Fashion & Style</option>
                    <option value="2">💄 Beauty & Skincare</option>
                    <option value="3">📱 Lifestyle & Daily Vlogs</option>
                    <option value="4">🍳 Food & Cooking</option>
                    <option value="5">💪 Fitness & Wellness</option>
                    <option value="6">✈️ Travel & Adventure</option>
                    <option value="7">🎵 Dance & Music</option>
                    <option value="8">😂 Comedy & Entertainment</option>
                    <option value="9">📱 Tech Reviews & Tutorials</option>
                    <option value="10">🎨 DIY & Crafts</option>
                    <option value="11">🎮 Gaming & Streaming</option>
                    <option value="12">💼 Business & Entrepreneurship</option>
                    <option value="13">📚 Education & Learning</option>
                    <option value="14">🐾 Pets & Animals</option>
                    <option value="15">🏠 Home & Decor</option>
                  </>
                )}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {hasError('category_id') && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {getFieldError('category_id')}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Video className="w-4 h-4 text-green-500" />
            Content Description
          </label>
          <div className="relative">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 resize-none ${
                hasError('description') 
                  ? 'border-red-300 focus:border-red-500 bg-red-50/50' 
                  : focusedField === 'description' 
                  ? 'input-focus-glow' 
                  : 'border-gray-200 focus:border-blue-400'
              } bg-white/70 backdrop-blur-sm`}
              rows={4}
              placeholder="Describe your content, style, and what makes it unique..."
              required
            />
            {formData.description && (
              <div className="absolute right-3 top-3 text-green-500">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
          </div>
          {hasError('description') && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {getFieldError('description')}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* Enhanced Hashtags Section */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Tag className="w-4 h-4 text-pink-500" />
            Hashtags
          </label>
          <div className="relative">
            <div
              className={`hashtag-container ${
                focusedField === 'hashtags' ? 'border-blue-400' : 'border-gray-200'
              }`}
              onClick={() => document.getElementById('hashtag-input')?.focus()}
            >
              {hashtags.map((tag, index) => (
                <div
                  key={index}
                  className={`hashtag-tag ${getHashtagColor(index)}`}
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    className="hashtag-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHashtag(index);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <input
                id="hashtag-input"
                type="text"
                value={hashtagInput}
                onChange={handleHashtagInputChange}
                onKeyDown={handleHashtagKeyDown}
                onFocus={() => setFocusedField('hashtags')}
                onBlur={() => setFocusedField(null)}
                className="hashtag-input"
                placeholder={hashtags.length === 0 ? "Type hashtag and press space..." : "Add more..."}
              />
            </div>
            <div className="absolute right-3 top-3 text-pink-500 pointer-events-none">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <p className="text-xs text-gray-500 flex-1">
              Press space or enter to add hashtags • Use # symbol or we'll add it for you
            </p>
            <p className="text-xs text-gray-400">
              {hashtags.length}/10 hashtags
            </p>
          </div>
          
          {/* Popular Hashtag Suggestions */}
          <div className="mt-3">
            <p className="text-xs font-medium text-gray-600 mb-2">Popular suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {[
                '#sponsored', '#partnership', '#collab', '#creator', '#influencer', 
                '#brand', '#content', '#viral', '#trending', '#lifestyle'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    if (!hashtags.includes(suggestion) && hashtags.length < 10) {
                      const newHashtags = [...hashtags, suggestion];
                      setHashtags(newHashtags);
                      setFormData(prev => ({
                        ...prev,
                        hashtags: newHashtags.join(' ')
                      }));
                    }
                  }}
                  disabled={hashtags.includes(suggestion) || hashtags.length >= 10}
                  className={`px-3 py-1 text-xs rounded-full transition-all duration-200 transform hover:scale-105 ${
                    hashtags.includes(suggestion) || hashtags.length >= 10
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-pink-100 hover:to-pink-200 hover:text-pink-700'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4 text-blue-500" />
              Followers Reach
            </label>
            <div className="relative">
              <input
                type="number"
                name="reach"
                value={formData.reach || ''}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('reach')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                  hasError('reach') 
                    ? 'border-red-300 focus:border-red-500 bg-red-50/50' 
                    : focusedField === 'reach' 
                    ? 'input-focus-glow' 
                    : 'border-gray-200 focus:border-blue-400'
                } bg-white/70 backdrop-blur-sm`}
                placeholder="50,000"
                min="0"
                required
              />
              <div className="absolute right-3 top-3 text-blue-500">
                <Users className="w-5 h-5" />
              </div>
            </div>
            {hasError('reach') && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {getFieldError('reach')}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Your total follower count
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              Price Range
            </label>
            <div className="relative">
              <input
                type="text"
                name="price_range"
                value={formData.price_range}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('price_range')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                  hasError('price_range') 
                    ? 'border-red-300 focus:border-red-500 bg-red-50/50' 
                    : focusedField === 'price_range' 
                    ? 'input-focus-glow' 
                    : 'border-gray-200 focus:border-blue-400'
                } bg-white/70 backdrop-blur-sm`}
                placeholder="$500-$2000 or $1000"
                required
              />
              <div className="absolute left-3 top-3 text-green-500 pointer-events-none">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            {hasError('price_range') && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {getFieldError('price_range')}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Enter your pricing (e.g., "$500-$2000" or "$1000")
            </p>
          </div>
        </div>

        {/* Enhanced Video Upload */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Video className="w-4 h-4 text-indigo-500" />
            Content Preview Video
          </label>
          
          {!formData.video_file ? (
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                isDragging 
                  ? 'drag-active border-blue-400' 
                  : 'border-gray-300 hover:border-gray-400'
              } bg-gradient-to-br from-gray-50 to-white`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Drop your video here or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload a high-quality video to showcase your content style
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 cursor-pointer transform hover:scale-105"
                  >
                    <Upload className="w-5 h-5" />
                    Choose Video File
                  </label>
                </div>
                <p className="text-xs text-gray-400">
                  Supported formats: MP4, MOV, AVI (Max 100MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">Video Uploaded Successfully</p>
                      <p className="text-sm text-gray-500">{formData.video_file.name}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {videoPreview && (
                  <div className="relative">
                    <video
                      src={videoPreview}
                      className="w-full max-w-md h-64 object-cover rounded-xl border-2 border-gray-200 shadow-lg"
                      controls
                      preload="metadata"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      Preview
                    </div>
                    {(isUploading || loading) && (
                      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 flex items-center gap-3">
                          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                          <span className="text-sm font-medium text-gray-700">
                            {isUploading ? 'Uploading...' : 'Processing...'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-700">Ready to showcase!</p>
                  <p className="text-sm text-blue-600">Your video will help brands understand your content style</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="space-y-4 pt-6">
          {/* Progress Bar - Show when uploading */}
          {(isUploading || loading) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">
                  {isUploading ? 'Uploading content...' : 'Creating post...'}
                </span>
                <span className="text-blue-600 font-semibold">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden upload-progress">
                <div 
                  className="progress-bar h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                {isUploading ? 'Processing video and optimizing for best quality...' : 'Finalizing your post...'}
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={loading || isUploading}
                className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 hover:scale-105 shadow-md border border-gray-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading || isUploading}
              className="flex-1 btn-premium text-white py-4 px-6 rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-blue-300/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              {loading || isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isUploading ? 'Uploading...' : 'Creating Post...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Create Post
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
