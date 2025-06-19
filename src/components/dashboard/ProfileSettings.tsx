import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { updateProfile } from '../../lib/auth';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import { Save, X, Camera, SquarePen, Crop } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';
import { CustomModal } from '../../components/CustomModal';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileSettingsProps {
  profile: Profile | null;
}

interface SocialMedia {
  linkedin: string;
  twitter: string;
  instagram: string;
  facebook: string;
}

interface TargetAudience {
  age_range: { min: number; max: number };
  genders: string;
  interests: string[];
  locations: string[];
  income_level: string;
}

export default function ProfileSettings({ profile }: ProfileSettingsProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    company_name: profile?.company_name || '',
    email: profile?.email || '',
    website: profile?.website || '',
    industry: profile?.industry || '',
    industry_details: profile?.industry_details || '',
    company_size: profile?.company_size || '',
    annual_marketing_budget: profile?.annual_marketing_budget || '',
    marketing_channels: profile?.marketing_channels || [],
    previous_sponsorships: profile?.previous_sponsorships || [],
    sponsorship_goals: profile?.sponsorship_goals || [],
    location: profile?.location || '',
    contact_person_name: profile?.contact_person_name || '',
    contact_person_position: profile?.contact_person_position || '',
    contact_person_phone: profile?.contact_person_phone || '',
    profile_picture_url: profile?.profile_picture_url || '',
    social_media: profile?.social_media || {
      linkedin: '',
      twitter: '',
      instagram: '',
      facebook: '',
    },
    target_audience: profile?.target_audience || {
      age_range: { min: 18, max: 65 },
      genders: Array.isArray(profile?.target_audience?.genders)
        ? profile?.target_audience?.genders[0] || ''
        : profile?.target_audience?.genders || '',
      interests: [],
      locations: [],
      income_level: '',
    },
    phone_number_verified: profile?.phone_number_verified || false,
    email_verified: profile?.email_verified || false,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(formData.profile_picture_url || null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showEmailOtpPopup, setShowEmailOtpPopup] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState<string | null>(null);
  const [showPhoneOtpPopup, setShowPhoneOtpPopup] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendEmailOtp = async () => {
    if (!formData.email) {
      setError('Please enter an email address');
      toast.error('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format');
      toast.error('Invalid email format');
      return;
    }

    setEmailOtpLoading(true);

    try {
      const otp = generateOtp();
      setGeneratedEmailOtp(otp);

      const templateParams = {
        to_email: formData.email,
        otp,
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID_EMAIL_VERIFY,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID_EMAIL_VERIFY,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY_EMAIL_VERIFY,
      );

      setShowEmailOtpPopup(true);
      toast.success('OTP sent to your email!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!emailOtp) {
      setError('Please enter the OTP');
      toast.error('Please enter the OTP');
      return;
    }

    setEmailOtpLoading(true);

    try {
      if (emailOtp !== generatedEmailOtp) {
        throw new Error('Invalid OTP');
      }

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          email_verified: true,
          email: formData.email,
        })
        .eq('id', user.id);

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      if (formData.email !== user?.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: formData.email,
        });
        if (authError) {
          throw new Error(`Failed to update authentication email: ${authError.message}`);
        }
      }

      setFormData((prev) => ({
        ...prev,
        email_verified: true,
        email: formData.email,
      }));
      setShowEmailOtpPopup(false);
      setEmailOtp('');
      setGeneratedEmailOtp(null);
      setSuccess(true);
      toast.success('Email verified successfully!');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setEmailOtpLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === 'annual_marketing_budget') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : parseFloat(value),
      });
    } else if (name === 'min_age' || name === 'max_age') {
      setFormData({
        ...formData,
        target_audience: {
          ...formData.target_audience,
          age_range: {
            ...formData.target_audience.age_range,
            [name === 'min_age' ? 'min' : 'max']: parseInt(value) || 0,
          },
        },
      });
    } else if (name.startsWith('social_media_')) {
      const platform = name.replace('social_media_', '') as keyof SocialMedia;
      setFormData({
        ...formData,
        social_media: {
          ...formData.social_media,
          [platform]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setError('No file selected');
      toast.error('No file selected');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setError('Profile picture must be JPEG, PNG, or GIF');
      toast.error('Profile picture must be JPEG, PNG, or GIF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Profile picture must be less than 5MB');
      toast.error('Profile picture must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setImageSrc(null);
    setShowCropper(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImage = async (imageSrc: string, pixelCrop: Area): Promise<File> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          const file = new File([blob], `cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
          resolve(file);
        },
        'image/jpeg',
        0.9,
      );
    });
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels || !user?.id) return;

    setUploading(true);
    setLoading(true);
    try {
      const croppedFile = await getCroppedImage(imageSrc, croppedAreaPixels);
      const imageUrl = URL.createObjectURL(croppedFile);
      setPreviewImage(imageUrl);

      const fileExt = croppedFile.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      if (formData.profile_picture_url) {
        const oldFilePath = formData.profile_picture_url.split('/').slice(-2).join('/');
        const { error: removeError } = await supabase.storage.from('public').remove([oldFilePath]);
        if (removeError) {
          console.error('Failed to remove old file:', removeError);
        }
      }

      const fileBuffer = await croppedFile.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, fileBuffer, {
          cacheControl: '3600',
          upsert: true,
          contentType: croppedFile.type,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage.from('public').getPublicUrl(filePath);
      if (!publicUrlData?.publicUrl) {
        throw new Error('Failed to generate public URL');
      }

      setFormData((prev) => ({
        ...prev,
        profile_picture_url: publicUrlData.publicUrl,
      }));

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrlData.publicUrl })
        .eq('id', user.id);

      if (dbError) {
        throw new Error(`Failed to update profile picture in database: ${dbError.message}`);
      }

      toast.success('Profile picture updated successfully!');
      resetFileInput();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload profile picture';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('File upload or database update error:', err);
    } finally {
      setUploading(false);
      setLoading(false);
    }
  };

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const values = e.target.value.split(',').map((item) => item.trim()).filter(Boolean);
    setFormData({
      ...formData,
      [field]: values,
    });
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      target_audience: {
        ...formData.target_audience,
        genders: value,
      },
    });
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const interests = e.target.value.split(',').map((interest) => interest.trim()).filter(Boolean);
    setFormData({
      ...formData,
      target_audience: {
        ...formData.target_audience,
        interests,
      },
    });
  };

  const handleLocationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const locations = e.target.value.split(',').map((location) => location.trim()).filter(Boolean);
    setFormData({
      ...formData,
      target_audience: {
        ...formData.target_audience,
        locations,
      },
    });
  };

  const handleIncomeLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      target_audience: {
        ...formData.target_audience,
        income_level: e.target.value,
      },
    });
  };

  const handlePreviousSponsorshipsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    try {
      if (value.trim().startsWith('[')) {
        const sponsorships = JSON.parse(value);
        if (Array.isArray(sponsorships)) {
          setFormData({
            ...formData,
            previous_sponsorships: sponsorships,
          });
        }
      } else {
        const sponsorships = value.split(',').map((s) => s.trim()).filter(Boolean);
        setFormData({
          ...formData,
          previous_sponsorships: sponsorships,
        });
      }
    } catch (err) {
      setFormData({
        ...formData,
        previous_sponsorships: value,
      });
    }
  };

  const sendPhoneOtp = async () => {
    if (!formData.contact_person_phone) {
      setError('Please enter a phone number');
      toast.error('Please enter a phone number');
      return;
    }

    setPhoneOtpLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_TWILIO_API_URL + '/api/twilio/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: formData.contact_person_phone }),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      setShowPhoneOtpPopup(true);
      toast.success('OTP sent to your phone!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  const verifyPhoneOtp = async () => {
    if (!phoneOtp) {
      setError('Please enter the OTP');
      toast.error('Please enter the OTP');
      return;
    }

    setPhoneOtpLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_TWILIO_API_URL + '/api/twilio/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.contact_person_phone,
          code: phoneOtp,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid OTP');
      }

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone_number_verified: true,
          contact_person_phone: formData.contact_person_phone,
        })
        .eq('id', user.id);

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      setFormData((prev) => ({
        ...prev,
        phone_number_verified: true,
        contact_person_phone: formData.contact_person_phone,
      }));
      setShowPhoneOtpPopup(false);
      setPhoneOtp('');
      setSuccess(true);
      toast.success('Phone number verified successfully!');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const emailChanged = formData.email !== profile?.email;

      if (emailChanged && !formData.email_verified) {
        await sendEmailOtp();
      } else {
        await updateProfile(formData);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      const errorMessage = err.message?.includes('Failed to update profile') && err.cause
        ? `Failed to update profile: ${err.cause.message || 'Unknown error'}`
        : err.message || 'An error occurred while updating your profile';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isBrand = profile?.user_type === 'brand' || profile?.user_type === 'agency';

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 pb-14 sm:pb-6 relative w-full">
      <motion.h2
        className="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-[#2B4B9B] pb-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Profile Settings
      </motion.h2>

      <AnimatePresence>
        {success && (
          <motion.div
            className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center justify-between"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
          >
            <span>Profile updated successfully!</span>
            <motion.button
              onClick={() => setSuccess(false)}
              className="text-green-700"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-between"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
          >
            <span>{error}</span>
            <motion.button
              onClick={() => setError('')}
              className="text-red-700"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        <motion.div
          className="flex justify-center items-center my-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div className="text-center relative" whileHover={{ scale: 1.05 }}>
            <label
              htmlFor="profile_picture"
              className="relative group cursor-pointer block"
              aria-label="Change profile picture"
            >
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {previewImage ? (
                  <img src={previewImage} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
              {!uploading && (
                <motion.div
                  className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                  whileHover={{ rotate: 90 }}
                >
                  <SquarePen className="w-5 h-5 text-gray-600" />
                </motion.div>
              )}
              <div
                className={`absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center rounded-full transition-opacity ${
                  uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                {uploading ? (
                  <motion.svg
                    className="animate-spin h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
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
                  </motion.svg>
                ) : (
                  <motion.div
                    className="flex items-center space-x-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Camera className="w-5 h-5 text-white" />
                    <span className="text-sm text-white font-medium">Change</span>
                  </motion.div>
                )}
              </div>
            </label>
            <input
              type="file"
              id="profile_picture"
              name="profile_picture"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
              ref={fileInputRef}
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="bg-gray-50 p-6 rounded-lg shadow-sm"
            whileHover={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          >
            <motion.h3
              className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-[#2B4B9B] pl-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Company Information
            </motion.h3>
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <motion.input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              <div className="relative">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <motion.input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              <div className="relative">
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <motion.select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Media">Media & Entertainment</option>
                  <option value="Food">Food & Beverage</option>
                  <option value="Travel">Travel & Hospitality</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Other">Other</option>
                </motion.select>
              </div>
              <div className="relative">
                <label htmlFor="industry_details" className="block text-sm font-medium text-gray-700 mb-1">
                  Industry Details
                </label>
                <motion.textarea
                  id="industry_details"
                  name="industry_details"
                  value={formData.industry_details}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                  placeholder="Please provide more specific details about your industry"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              <div className="relative">
                <label htmlFor="company_size" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Size
                </label>
                <motion.select
                  id="company_size"
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="">Select Company Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1001+">1001+ employees</option>
                </motion.select>
              </div>
              <div className="relative">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Location
                </label>
                <motion.input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                  placeholder="City, Country"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-50 p-6 rounded-lg shadow-sm"
            whileHover={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          >
            <motion.h3
              className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-[#2B4B9B] pl-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Contact Information
            </motion.h3>
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address {formData.email_verified && <span className="text-green-600 text-xs">(Verified)</span>}
                </label>
                <div className="flex items-center space-x-2">
                  <motion.input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={formData.email_verified}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    whileFocus={{ scale: 1.02 }}
                  />
                  {!formData.email_verified && (
                    <motion.button
                      type="button"
                      onClick={sendEmailOtp}
                      disabled={emailOtpLoading}
                      className="px-3 py-2 bg-[#2B4B9B] text-white rounded-lg hover:bg-[#1a2f61] disabled:opacity-50"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      {emailOtpLoading ? 'Sending...' : 'Verify'}
                    </motion.button>
                  )}
                </div>
              </div>
              <div className="relative">
                <label htmlFor="contact_person_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person Name
                </label>
                <motion.input
                  type="text"
                  id="contact_person_name"
                  name="contact_person_name"
                  value={formData.contact_person_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              <div className="relative">
                <label htmlFor="contact_person_position" className="block text-sm font-medium text-gray-700 mb-1">
                  Position/Title
                </label>
                <motion.input
                  type="text"
                  id="contact_person_position"
                  name="contact_person_position"
                  value={formData.contact_person_position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                  whileFocus={{ scale: 1.02 }}
                />
              </div>
              <div className="relative">
                <label htmlFor="contact_person_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number{' '}
                  {formData.phone_number_verified && <span className="text-green-600 text-xs">(Verified)</span>}
                </label>
                <div className="flex items-center space-x-2">
                  <motion.input
                    type="tel"
                    id="contact_person_phone"
                    name="contact_person_phone"
                    value={formData.contact_person_phone}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="+1234567890"
                    disabled={formData.phone_number_verified}
                    whileFocus={{ scale: 1.02 }}
                  />
                  {!formData.phone_number_verified && (
                    <motion.button
                      type="button"
                      onClick={sendPhoneOtp}
                      disabled={phoneOtpLoading || !formData.contact_person_phone}
                      className="px-3 py-2 bg-[#2B4B9B] text-white rounded-lg hover:bg-[#1a2f61] disabled:opacity-50"
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      {phoneOtpLoading ? 'Sending...' : 'Verify'}
                    </motion.button>
                  )}
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Social Media</label>
                <div className="space-y-2">
                  <motion.input
                    type="url"
                    name="social_media_linkedin"
                    value={formData.social_media.linkedin}
                    onChange={handleInputChange}
                    placeholder="LinkedIn URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <motion.input
                    type="url"
                    name="social_media_twitter"
                    value={formData.social_media.twitter}
                    onChange={handleInputChange}
                    placeholder="Twitter URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <motion.input
                    type="url"
                    name="social_media_instagram"
                    value={formData.social_media.instagram}
                    onChange={handleInputChange}
                    placeholder="Instagram URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                    whileFocus={{ scale: 1.02 }}
                  />
                  <motion.input
                    type="url"
                    name="social_media_facebook"
                    value={formData.social_media.facebook}
                    onChange={handleInputChange}
                    placeholder="Facebook URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {isBrand && (
          <>
            <hr className="my-8 border-gray-200" />
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="bg-gray-50 p-6 rounded-lg shadow-sm"
                whileHover={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              >
                <motion.h3
                  className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-[#2B4B9B] pl-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Marketing Information
                </motion.h3>
                <div className="space-y-4">
                  <div className="relative">
                    <label
                      htmlFor="annual_marketing_budget"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Annual Marketing Budget
                    </label>
                    <motion.input
                      type="number"
                      id="annual_marketing_budget"
                      name="annual_marketing_budget"
                      value={formData.annual_marketing_budget}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                  <div className="relative group">
                    <label
                      htmlFor="marketing_channels"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Marketing Channels (comma separated)
                    </label>
                    <motion.input
                      type="text"
                      id="marketing_channels"
                      value={formData.marketing_channels.join(', ')}
                      onChange={(e) => handleArrayInputChange(e, 'marketing_channels')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                      placeholder="Social Media, Email, Events, etc."
                      whileFocus={{ scale: 1.02 }}
                    />
                    <div className="absolute hidden group-hover:block text-xs text-gray-500 mt-1">
                      Enter channels separated by commas (e.g., Social Media, Email)
                    </div>
                  </div>
                  <div className="relative group">
                    <label
                      htmlFor="previous_sponsorships"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Previous Sponsorships (comma separated)
                    </label>
                    <motion.textarea
                      id="previous_sponsorships"
                      value={
                        Array.isArray(formData.previous_sponsorships)
                          ? formData.previous_sponsorships.join(', ')
                          : formData.previous_sponsorships
                      }
                      onChange={handlePreviousSponsorshipsChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                      placeholder="List previous events or organizations you've sponsored"
                      whileFocus={{ scale: 1.02 }}
                    />
                    <div className="absolute hidden group-hover:block text-xs text-gray-500 mt-1">
                      Enter sponsorships separated by commas
                    </div>
                  </div>
                  <div className="relative group">
                    <label
                      htmlFor="sponsorship_goals"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Marketing Goals (comma separated)
                    </label>
                    <motion.input
                      type="text"
                      id="sponsorship_goals"
                      value={formData.sponsorship_goals.join(', ')}
                      onChange={(e) => handleArrayInputChange(e, 'sponsorship_goals')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                      placeholder="Brand Awareness, Lead Generation, etc."
                      whileFocus={{ scale: 1.02 }}
                    />
                    <div className="absolute hidden group-hover:block text-xs text-gray-500 mt-1">
                      Enter goals separated by commas
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="bg-gray-50 p-6 rounded-lg shadow-sm"
                whileHover={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              >
                <motion.h3
                  className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-[#2B4B9B] pl-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Target Audience
                </motion.h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label htmlFor="min_age" className="block text-sm font-medium text-gray-700 mb-1">
                        Min Age
                      </label>
                      <motion.input
                        type="number"
                        id="min_age"
                        name="min_age"
                        value={formData.target_audience.age_range.min}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                        whileFocus={{ scale: 1.02 }}
                      />
                    </div>
                    <div className="relative">
                      <label htmlFor="max_age" className="block text-sm font-medium text-gray-700 mb-1">
                        Max Age
                      </label>
                      <motion.input
                        type="number"
                        id="max_age"
                        name="max_age"
                        value={formData.target_audience.age_range.max}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                        whileFocus={{ scale: 1.02 }}
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <motion.input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.target_audience.genders === 'male'}
                          onChange={handleGenderChange}
                          className="mr-2"
                          whileHover={{ scale: 1.1 }}
                        />
                        Male
                      </label>
                      <label className="inline-flex items-center">
                        <motion.input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.target_audience.genders === 'female'}
                          onChange={handleGenderChange}
                          className="mr-2"
                          whileHover={{ scale: 1.1 }}
                        />
                        Female
                      </label>
                      <label className="inline-flex items-center">
                        <motion.input
                          type="radio"
                          name="gender"
                          value="other"
                          checked={formData.target_audience.genders === 'other'}
                          onChange={handleGenderChange}
                          className="mr-2"
                          whileHover={{ scale: 1.1 }}
                        />
                        Other
                      </label>
                    </div>
                  </div>
                  <div className="relative group">
                    <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                      Interests (comma separated)
                    </label>
                    <motion.input
                      type="text"
                      id="interests"
                      value={formData.target_audience.interests.join(', ')}
                      onChange={handleInterestsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                      placeholder="Technology, Fashion, Sports, etc."
                      whileFocus={{ scale: 1.02 }}
                    />
                    <div className="absolute hidden group-hover:block text-xs text-gray-500 mt-1">
                      Enter interests separated by commas
                    </div>
                  </div>
                  <div className="relative group">
                    <label htmlFor="locations" className="block text-sm font-medium text-gray-700 mb-1">
                      Target Locations (comma separated)
                    </label>
                    <motion.input
                      type="text"
                      id="locations"
                      value={formData.target_audience.locations.join(', ')}
                      onChange={handleLocationsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                      placeholder="New York, London, Tokyo, etc."
                      whileFocus={{ scale: 1.02 }}
                    />
                    <div className="absolute hidden group-hover:block text-xs text-gray-500 mt-1">
                      Enter locations separated by commas
                    </div>
                  </div>
                  <div className="relative">
                    <label htmlFor="income_level" className="block text-sm font-medium text-gray-700 mb-1">
                      Income Level
                    </label>
                    <motion.select
                      id="income_level"
                      value={formData.target_audience.income_level}
                      onChange={handleIncomeLevelChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <option value="">Select Income Level</option>
                      <option value="low">Low Income</option>
                      <option value="middle">Middle Income</option>
                      <option value="high">High Income</option>
                      <option value="luxury">Luxury</option>
                    </motion.select>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}

        <div className="flex justify-end mt-8">
          <motion.button
            type="submit"
            disabled={loading || uploading}
            className="inline-flex items-center px-4 py-2 bg-[#2B4B9B] text-white rounded-lg hover:bg-[#1a2f61] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2B4B9B] disabled:opacity-50"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {loading ? (
              <>
                <motion.svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </motion.svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </motion.button>
        </div>
      </form>

      <AnimatePresence>
        {showEmailOtpPopup && (
          <CustomModal
            isOpen={showEmailOtpPopup}
            onClose={() => {
              setShowEmailOtpPopup(false);
              setEmailOtp('');
              setGeneratedEmailOtp(null);
            }}
            title="Verify Email Address"
            customStyles={{ maxWidth: '28rem', height: '15.5rem', width: '90%' }}
          >
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
              <p className="text-sm text-gray-600 mb-4">An OTP has been sent to {formData.email}. Please enter it below.</p>
              <motion.input
                type="text"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                whileFocus={{ scale: 1.02 }}
              />
              <div className="flex justify-end space-x-2 mt-4">
                <motion.button
                  onClick={() => {
                    setShowEmailOtpPopup(false);
                    setEmailOtp('');
                    setGeneratedEmailOtp(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={verifyEmailOtp}
                  disabled={emailOtpLoading}
                  className="px-4 py-2 bg-[#2B4B9B] text-white rounded-lg hover:bg-[#1a2f61] disabled:opacity-50"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {emailOtpLoading ? 'Verifying...' : 'Verify OTP'}
                </motion.button>
              </div>
            </motion.div>
          </CustomModal>
        )}

        {showPhoneOtpPopup && (
          <CustomModal
            isOpen={showPhoneOtpPopup}
            onClose={() => {
              setShowPhoneOtpPopup(false);
              setPhoneOtp('');
            }}
            title="Verify Phone Number"
            customStyles={{ maxWidth: '28rem', height: '15.5rem', width: '90%' }}
          >
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
              <p className="text-sm text-gray-600 mb-4">
                An OTP has been sent to {formData.contact_person_phone}. Please enter it below.
              </p>
              <motion.input
                type="text"
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#2B4B9B] focus:border-[#2B4B9B] transition-all"
                whileFocus={{ scale: 1.02 }}
              />
              <div className="flex justify-end space-x-2 mt-4">
                <motion.button
                  onClick={() => {
                    setShowPhoneOtpPopup(false);
                    setPhoneOtp('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={verifyPhoneOtp}
                  disabled={phoneOtpLoading}
                  className="px-4 py-2 bg-[#2B4B9B] text-white rounded-lg hover:bg-[#1a2f61] disabled:opacity-50"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {phoneOtpLoading ? 'Verifying...' : 'Verify OTP'}
                </motion.button>
              </div>
            </motion.div>
          </CustomModal>
        )}

        {imageSrc && (
          <CustomModal
            isOpen={showCropper}
            onClose={resetFileInput}
            title="Crop Profile Picture"
            customStyles={{ maxWidth: '32rem', height: 'auto', width: '90%' }}
          >
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
              <div className="relative w-full h-80">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Zoom</label>
                <motion.input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                  whileHover={{ scale: 1.02 }}
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <motion.button
                  onClick={resetFileInput}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleCropConfirm}
                  disabled={uploading}
                  className="px-4 py-2 bg-[#2B4B9B] text-white rounded-lg hover:bg-[#1a2f61] disabled:opacity-50 flex items-center"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {uploading ? (
                    <>
                      <motion.svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </motion.svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Crop className="w-4 h-4 mr-2" />
                      Crop & Upload
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </CustomModal>
        )}
      </AnimatePresence>
    </div>
  );
}