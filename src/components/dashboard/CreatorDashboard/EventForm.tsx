import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  RefreshCw,
  FileText,
  Upload,
  Image as ImageIcon,
  Video,
  File,
  Trash2,
  AlertCircle,
  Sparkles,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Database } from '../../../lib/database.types';
import MouSignComponent from './MouSignComponent';
import { toast } from 'react-hot-toast';

type Opportunity = Database['public']['Tables']['opportunities']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface EventFormProps {
  formData: Partial<Opportunity> & { media_files?: File[]; media_urls?: string[]; sponsorship_brochure_file?: File };
  setFormData: React.Dispatch<
    React.SetStateAction<
      Partial<Opportunity> & { media_files?: File[]; media_urls?: string[]; sponsorship_brochure_file?: File }
    >
  >;
  mediaPreviews: string[];
  setMediaPreviews: React.Dispatch<React.SetStateAction<string[]>>;
  isEditing: boolean;
  isSubmitting: boolean;
  categories: Category[];
  onSubmit: (formData: Partial<Opportunity> & { media_files?: File[]; media_urls?: string[]; sponsorship_brochure_file?: File }) => void;
  onClose: () => void;
}

const advertisingCategories = [
  'Apartment Advertising',
  'Airport Advertising',
  'Office Building Advertising',
  'Retail Store Advertising',
  'Restaurant Advertising',
  'Mall Advertising',
  'Metro Station Advertising',
  'Educational Institution Advertising',
  'Gym Advertising',
  'Digital Display Networks',
  'Cinema Advertising',
  'Digital Billboards',
  'Transit Advertising',
  'Static Billboards',
  'Hospital Advertising',
  'Hoardings',
  'Bus Stop Advertising'
];

const MAX_DESCRIPTION_LENGTH = 300;
const MAX_REQUIREMENTS_LENGTH = 200;
const MAX_BENEFITS_LENGTH = 200;

export default function EventForm({
  formData,
  setFormData,
  mediaPreviews,
  setMediaPreviews,
  isEditing,
  isSubmitting,
  categories,
  onSubmit,
  onClose,
}: EventFormProps) {
  const [isMOUAgreed, setIsMOUAgreed] = useState(isEditing ? true : !!(formData as any).mou_id);
  const [isMOUSignModalOpen, setIsMOUSignModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const brochureInputRef = useRef<HTMLInputElement>(null);

  // Debugging logs to track state changes
  useEffect(() => {
    console.log('EventForm State:', { formData, isMOUAgreed, isMOUSignModalOpen, mediaPreviews });
  }, [formData, isMOUAgreed, isMOUSignModalOpen, mediaPreviews]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'description' && value.length > MAX_DESCRIPTION_LENGTH) {
      return;
    }
    if (name === 'requirements' && value.length > MAX_REQUIREMENTS_LENGTH) {
      return;
    }
    if (name === 'benefits' && value.length > MAX_BENEFITS_LENGTH) {
      return;
    }
    
    if (name === 'price_min') {
      setFormData({
        ...formData,
        price_range: {
          ...formData.price_range,
          min: value === '' ? undefined : parseInt(value),
        },
      });
    } else if (name === 'price_max') {
      setFormData({
        ...formData,
        price_range: {
          ...formData.price_range,
          max: value === '' ? undefined : parseInt(value),
        },
      });
    } else if (name === 'reach') {
      setFormData({
        ...formData,
        [name]: value === '' ? undefined : parseInt(value),
      });
    } else if (name === 'start_date' || name === 'end_date') {
      setFormData({
        ...formData,
        [name]: value === '' ? null : value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'media_files' | 'sponsorship_brochure_file'
  ) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (field === 'media_files') {
        setFormData((prev) => ({
          ...prev,
          media_files: [...(prev.media_files || []), ...files],
        }));
        const previews = files.map((file) => URL.createObjectURL(file));
        setMediaPreviews([...mediaPreviews, ...previews]);
      } else {
        setFormData((prev) => ({
          ...prev,
          sponsorship_brochure_file: files[0],
        }));
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, field: 'media_files' | 'sponsorship_brochure_file') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (field === 'media_files') {
        const mediaFiles = files.filter(file => 
          file.type.startsWith('image/') || file.type.startsWith('video/')
        );
        if (mediaFiles.length > 0) {
          setFormData((prev) => ({
            ...prev,
            media_files: [...(prev.media_files || []), ...mediaFiles],
          }));
          const previews = mediaFiles.map((file) => URL.createObjectURL(file));
          setMediaPreviews([...mediaPreviews, ...previews]);
        }
      } else {
        const pdfFiles = files.filter(file => file.type === 'application/pdf');
        if (pdfFiles.length > 0) {
          setFormData((prev) => ({
            ...prev,
            sponsorship_brochure_file: pdfFiles[0],
          }));
        }
      }
    }
  };

  const removeMediaFile = (index: number) => {
    if (formData.media_files) {
      const newFiles = formData.media_files.filter((_, i) => i !== index);
      const newPreviews = mediaPreviews.filter((_, i) => i !== index);
      
      setFormData((prev) => ({
        ...prev,
        media_files: newFiles.length > 0 ? newFiles : undefined,
      }));
      setMediaPreviews(newPreviews);
      
      URL.revokeObjectURL(mediaPreviews[index]);
    }
  };

  const removeMediaUrl = (index: number) => {
    if (formData.media_urls) {
      const newUrls = formData.media_urls.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        media_urls: newUrls.length > 0 ? newUrls : undefined,
      }));
    }
  };

  const removeBrochureFile = () => {
    setFormData((prev) => ({
      ...prev,
      sponsorship_brochure_file: undefined,
    }));
  };

  const handleMouSigned = (mouId: string) => {
    console.log('MOU Signed:', mouId); // Debug log
    try {
      setFormData((prev) => ({
        ...prev,
        mou_id: mouId,
      }));
      setIsMOUAgreed(true);
      setIsMOUSignModalOpen(false);
    } catch (error) {
      console.error('Error in handleMouSigned:', error);
      toast.error('An error occurred while processing the MOU. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting Form:', formData); // Debug log
    if (!isEditing && (!isMOUAgreed || !(formData as any).mou_id)) {
      toast.error('You must sign the Memorandum of Understanding to proceed.');
      return;
    }
    const normalizedFormData = {
      ...formData,
      start_date: formData.start_date === '' ? null : formData.start_date,
      end_date: formData.end_date === '' ? null : formData.end_date,
    };
    try {
      onSubmit(normalizedFormData);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('An error occurred while submitting the form. Please try again.');
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category_id);
  const isAdvertisingCategory = selectedCategory && advertisingCategories.includes(selectedCategory.name);

  // Fallback UI in case of rendering error
  if (!formData) {
    console.error('FormData is undefined');
    return (
      <div className="p-6 text-red-600">
        Error: Form data is not available. Please try refreshing the page.
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 sm:static sm:bg-transparent sm:backdrop-blur-none sm:flex-none sm:items-start sm:justify-start">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col mx-auto overflow-hidden sm:rounded-lg sm:shadow-sm sm:max-w-none sm:h-auto sm:max-h-none border border-gray-100"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50"
          >
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                {isEditing ? 'Edit Opportunity' : 'Create New Opportunity'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isEditing ? 'Update your opportunity details' : 'Fill in the details to create a new opportunity'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>

          <motion.div 
            className="flex-1 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title ?? ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter opportunity title"
                      required
                    />
                  </div>
                
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id ?? ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location ?? ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter location"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        name="description"
                        value={formData.description ?? ''}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder="Describe your opportunity in detail"
                        maxLength={MAX_DESCRIPTION_LENGTH}
                        required
                      />
                      <div className="flex items-center justify-end text-xs mt-1">
                        <AlertCircle className={`w-3 h-3 mr-1 ${(formData.description?.length || 0) > MAX_DESCRIPTION_LENGTH * 0.9 ? 'text-amber-500' : 'text-gray-500'}`} />
                        <span className={`${(formData.description?.length || 0) > MAX_DESCRIPTION_LENGTH * 0.9 ? 'text-amber-500 font-medium' : 'text-gray-500'}`}>
                          {`${(formData.description ?? '').length}/${MAX_DESCRIPTION_LENGTH}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Reach (Audience Size)
                    </label>
                    <input
                      type="number"
                      name="reach"
                      value={formData.reach ?? ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Expected audience size"
                    />
                  </div>

                  {!isEditing && (
                    <motion.div 
                      className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="h-5 w-5 text-amber-500" />
                          <h4 className="font-semibold text-blue-800">Pricing Plan</h4>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-3 font-medium">
                            {(formData as any).is_vip ? 'VIP' : 'Basic'}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox"
                              name="is_vip"
                              checked={!!(formData as any).is_vip}
                              onChange={(e) => setFormData((prev) => ({ ...prev, is_vip: e.target.checked } as any))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r from-amber-500 to-yellow-500"></div>
                          </label>
                        </div>
                      </div>
                    
                      <div className="text-sm space-y-2">
                        <p className="text-gray-600 font-medium">Choose your plan:</p>

                        {!(formData as any).is_vip && (
                          <motion.div 
                            className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="font-medium text-gray-900 mb-1">Basic Plan:</p>
                            <ul className="space-y-1 pl-5 list-disc text-gray-700">
                              <li>Free event listing</li>
                              <li>₹5,000 fee to unlock brand matches</li>
                              <li>10% commission on total sponsorship amount</li>
                            </ul>
                          </motion.div>
                        )}
                      
                        {(formData as any).is_vip && (
                          <motion.div 
                            className="mt-2 p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-md"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="font-medium text-gray-900 mb-2">VIP Benefits:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-gray-700">24/7 dedicated support</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-gray-700">Premium sponsor access</span>
                              </div>
                            </div>
                          
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                              <p className="text-blue-800 text-sm font-medium">VIP Plan Pricing:</p>
                              <ul className="mt-1 space-y-1 pl-5 list-disc text-gray-700">
                                <li>₹10,000 upfront fee</li>
                                <li>25% commission on sponsorships over ₹2 lakhs</li>
                              </ul>
                              <p className="text-xs text-gray-500 mt-2">By enabling VIP privileges, you agree to the pricing terms above.</p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                  <div className="hidden xl:block"></div>
                </div>
              </motion.div>

              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Pricing Information</h3>
                </div>

                {isAdvertisingCategory ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                      <input
                        type="number"
                        name="price_min"
                        value={formData.price_range?.min ?? ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter price"
                      />
                    </div>
                    <div className="hidden lg:block xl:hidden"></div>
                    <div className="hidden xl:block"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Min Price (₹)</label>
                      <input
                        type="number"
                        name="price_min"
                        value={formData.price_range?.min ?? ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Minimum price"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Max Price (₹)</label>
                      <input
                        type="number"
                        name="price_max"
                        value={formData.price_range?.max ?? ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Maximum price"
                      />
                    </div>
                    <div className="hidden xl:block"></div>
                  </div>
                )}
              </motion.div>

              {!isAdvertisingCategory && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      3
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date ?? ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date ?? ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="hidden xl:block"></div>
                    <div className="hidden xl:block"></div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Requirements</label>
                      <div className="relative">
                        <textarea
                          name="requirements"
                          value={formData.requirements ?? ''}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          placeholder="Specify your guidelines or requirements for brands"
                          maxLength={MAX_REQUIREMENTS_LENGTH}
                        />
                        <div className="flex items-center justify-end text-xs mt-1">
                          <AlertCircle className={`w-3 h-3 mr-1 ${(formData.requirements?.length || 0) > MAX_REQUIREMENTS_LENGTH * 0.9 ? 'text-amber-500' : 'text-gray-500'}`} />
                          <span className={`${(formData.requirements?.length || 0) > MAX_REQUIREMENTS_LENGTH * 0.9 ? 'text-amber-500 font-medium' : 'text-gray-500'}`}>
                            {`${(formData.requirements ?? '').length}/${MAX_REQUIREMENTS_LENGTH}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Benefits</label>
                      <div className="relative">
                        <textarea
                          name="benefits"
                          value={formData.benefits ?? ''}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          placeholder="List the benefits offered"
                          maxLength={MAX_BENEFITS_LENGTH}
                        />
                        <div className="flex items-center justify-end text-xs mt-1">
                          <AlertCircle className={`w-3 h-3 mr-1 ${(formData.benefits?.length || 0) > MAX_BENEFITS_LENGTH * 0.9 ? 'text-amber-500' : 'text-gray-500'}`} />
                          <span className={`${(formData.benefits?.length || 0) > MAX_BENEFITS_LENGTH * 0.9 ? 'text-amber-500 font-medium' : 'text-gray-500'}`}>
                            {`${(formData.benefits ?? '').length}/${MAX_BENEFITS_LENGTH}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isEditing && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {!isAdvertisingCategory ? '4' : '3'}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Organization Information</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                      <input
                        type="text"
                        name="organization_name"
                        value={(formData as any).organization_name ?? ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter organization name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Organization Address</label>
                      <input
                        type="text"
                        name="organization_address"
                        value={(formData as any).organization_address ?? ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter complete address"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Point of Contact Name</label>
                      <input
                        type="text"
                        name="poc_name"
                        value={(formData as any).poc_name ?? ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter contact person name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Point of Contact Position</label>
                      <input
                        type="text"
                        name="poc_position"
                        value={(formData as any).poc_position ?? ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Enter position/designation"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {!isAdvertisingCategory ? '5' : '4'}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Media & Documents</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Upload Media Files (Images/Videos)
                    </label>
                  
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                        dragActive 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                      }`}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'media_files')}
                    >
                      <input
                        ref={mediaInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={(e) => handleFileChange(e, 'media_files')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900 mb-2">
                            Drop your media files here
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            or click to browse your computer
                          </p>
                          <button
                            type="button"
                            onClick={() => mediaInputRef.current?.click()}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Files
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">
                          Supports: JPG, PNG, GIF, MP4, WebM (max 5 files, 10MB each)
                        </p>
                      </div>
                    </div>

                    {(formData.media_files?.length || formData.media_urls?.length) && (
                      <div className="space-y-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-gray-900">
                              Selected Files ({(formData.media_files?.length || 0) + (formData.media_urls?.length || 0)})
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, media_files: [], media_urls: [] }));
                                setMediaPreviews([]);
                              }}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Clear All
                            </button>
                          </div>
                          <div className="space-y-2">
                            {formData.media_urls?.map((url, index) => (
                              <div key={`url-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  {url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                    <ImageIcon className="w-5 h-5 text-blue-500" />
                                  ) : url.match(/\.(mp4|webm)$/i) ? (
                                    <Video className="w-5 h-5 text-purple-500" />
                                  ) : (
                                    <File className="w-5 h-5 text-gray-500" />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                                      {url.split('/').pop()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Existing Media
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeMediaUrl(index)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            {formData.media_files?.map((file, index) => (
                              <div key={`file-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  {file.type.startsWith('image/') ? (
                                    <ImageIcon className="w-5 h-5 text-blue-500" />
                                  ) : file.type.startsWith('video/') ? (
                                    <Video className="w-5 h-5 text-purple-500" />
                                  ) : (
                                    <File className="w-5 h-5 text-gray-500" />
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeMediaFile(index)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                          {formData.media_urls?.map((url, index) => (
                            <div key={`url-preview-${index}`} className="relative group">
                              <div className="relative overflow-hidden rounded-lg border border-gray-200">
                                {url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                  <img
                                    src={url}
                                    alt={`Existing Media ${index + 1}`}
                                    className="w-full h-32 object-cover"
                                  />
                                ) : url.match(/\.(mp4|webm)$/i) ? (
                                  <video
                                    src={url}
                                    className="w-full h-32 object-cover"
                                    muted
                                  />
                                ) : (
                                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                                    <File className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeMediaUrl(index)}
                                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {mediaPreviews.map((preview, index) => (
                            <div key={`file-preview-${index}`} className="relative group">
                              <div className="relative overflow-hidden rounded-lg border border-gray-200">
                                {formData.media_files![index].type.startsWith('image/') ? (
                                  <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover"
                                  />
                                ) : formData.media_files![index].type.startsWith('video/') ? (
                                  <video
                                    src={preview}
                                    className="w-full h-32 object-cover"
                                    muted
                                  />
                                ) : (
                                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                                    <File className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeMediaFile(index)}
                                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {isSubmitting && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900">Uploading media files...</p>
                                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '45%'}}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {isAdvertisingCategory ? 'Upload Brochure (PDF)' : 'Upload Sponsorship Brochure (PDF)'}
                    </label>
                  
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                        dragActive 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                      }`}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'sponsorship_brochure_file')}
                    >
                      <input
                        ref={brochureInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleFileChange(e, 'sponsorship_brochure_file')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <FileText className="w-8 h-8 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900 mb-2">
                            Drop your PDF here
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            or click to browse your computer
                          </p>
                          <button
                            type="button"
                            onClick={() => brochureInputRef.current?.click()}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Choose PDF
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">
                          PDF only (max 10MB)
                        </p>
                      </div>
                    </div>

                    {formData.sponsorship_brochure_file && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {isAdvertisingCategory ? 'Selected Brochure:' : 'Selected Sponsorship Brochure:'}
                              </p>
                              <p className="text-sm text-gray-600 truncate max-w-64">
                                {formData.sponsorship_brochure_file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(formData.sponsorship_brochure_file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeBrochureFile}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      
                        {isSubmitting && (
                          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <RefreshCw className="w-4 h-4 text-green-600 animate-spin flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-900">Uploading brochure...</p>
                                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                                  <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '65%'}}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!isEditing && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${isMOUAgreed ? 'bg-green-600' : 'bg-red-600'}`}>
                      {!isAdvertisingCategory ? '6' : '5'}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Legal Agreement</h3>
                  </div>
                  <div className={`rounded-xl p-6 border transition-colors duration-200 ${isMOUAgreed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>  
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {isMOUAgreed ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <label htmlFor="mou-agreement" className="text-base font-semibold text-gray-900">
                            Memorandum of Understanding Agreement
                          </label>
                          {isMOUAgreed && (
                            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">Signed</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          You must sign the Memorandum of Understanding (MOU) before submitting your opportunity. This agreement outlines the terms and responsibilities for both parties.
                        </p>
                        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                          {!isMOUAgreed && (
                            <button
                              type="button"
                              onClick={() => setIsMOUSignModalOpen(true)}
                              className="inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-red-600 text-white hover:bg-red-700"
                            >
                              Review & Sign MOU
                              <FileText className="w-4 h-4 ml-2" />
                            </button>
                          )}
                          {!isMOUAgreed && (
                            <span className="text-xs text-red-600 font-medium mt-2 sm:mt-0">
                              ⚠️ MOU not signed. Please sign to enable submission.
                            </span>
                          )}
                        </div>
                        {isMOUAgreed && (
                          <p className="text-xs text-green-700 mt-2 font-medium">
                            Thank you for signing the MOU. You may now submit your opportunity.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <motion.div 
                className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium hover:shadow-sm"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    isSubmitting || (!isEditing && !isMOUAgreed) 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg hover:scale-[1.02]'
                  }`}
                  disabled={isSubmitting || (!isEditing && !isMOUAgreed)}
                  whileHover={{ scale: isSubmitting || (!isEditing && !isMOUAgreed) ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting || (!isEditing && !isMOUAgreed) ? 1 : 0.98 }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : isEditing ? (
                    'Update Opportunity'
                  ) : (
                    'Create Opportunity'
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </div>
      
      {isMOUSignModalOpen && (
        <MouSignComponent
          formData={formData}
          onMouSigned={handleMouSigned}
          onCancel={() => {
            console.log('MOU Sign Modal Cancelled'); // Debug log
            setIsMOUSignModalOpen(false);
          }}
        />
      )}
    </>
  );
}