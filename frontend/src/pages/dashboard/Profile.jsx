import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  User, Mail, Shield, Camera, Trash2, Eye, EyeOff, Save, KeyRound,
  RefreshCw, CheckCircle
} from 'lucide-react';
import api from '../../services/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  
  // States
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [savingDetails, setSavingDetails] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  const fileInputRef = useRef(null);

  // Trigger file selection dialog
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  // Upload Selected Image
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PNG, JPG, and JPEG images are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB.');
      return;
    }

    // Show instant local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Call upload API
    const formData = new FormData();
    formData.append('profileImage', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/auth/profile/image', formData);
      if (res.data?.success) {
        // Sync local auth context with new user details
        updateUser(res.data.data); 
        toast.success('Profile picture updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload profile picture.');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove Photo
  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    
    setUploadingImage(true);
    try {
      const res = await api.delete('/auth/profile/image');
      if (res.data?.success) {
        updateUser(res.data.data);
        setImagePreview(null);
        toast.success('Profile picture removed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove profile picture.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Info (First Name, Last Name, and optionally Password)
  const handleSaveDetails = async (e) => {
    e.preventDefault();
    
    if (!firstName.trim()) return toast.error('First name is required');
    if (!lastName.trim()) return toast.error('Last name is required');
    
    if (password) {
      if (password.length < 8) return toast.error('Password must be at least 8 characters');
      if (password !== confirmPassword) return toast.error('Passwords do not match');
    }

    setSavingDetails(true);
    try {
      const payload = { firstName, lastName };
      if (password) payload.password = password;

      const res = await api.put('/auth/profile', payload);
      if (res.data?.success) {
        updateUser(res.data.data);
        setPassword('');
        setConfirmPassword('');
        toast.success('Profile details updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setSavingDetails(false);
    }
  };

  // Profile Image URL resolver
  const getProfileImage = () => {
    if (imagePreview) return imagePreview;
    if (user?.profileImage) {
      return user.profileImage.startsWith('http') 
        ? user.profileImage 
        : `http://localhost:5000${user.profileImage}`;
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Page Title */}
      <div>
        <h1 className="font-outfit text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your personal profile information, avatar, and password.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Photo Upload Card */}
        <div className="glass rounded-3xl p-6 flex flex-col items-center justify-center space-y-6">
          <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
            <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center relative">
              {getProfileImage() ? (
                <img 
                  src={getProfileImage()} 
                  alt="Profile Avatar" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="font-outfit text-4xl font-bold text-slate-400">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              )}

              {/* Photo Change Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Camera badge indicator */}
            <div className="absolute bottom-0 right-0 p-2 bg-brand-600 rounded-full text-white shadow-md">
              <Camera className="h-4 w-4" />
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-bold text-slate-800 text-sm">Profile Photo</h3>
            <p className="text-slate-500 text-xs mt-1">PNG, JPG, JPEG up to 5 MB</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handlePhotoClick}
              disabled={uploadingImage}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-button disabled:opacity-50"
            >
              {uploadingImage ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
              Change Photo
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".png,.jpg,.jpeg"
              className="hidden"
            />
            {user?.profileImage && (
              <button
                onClick={handleRemovePhoto}
                disabled={uploadingImage}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 text-xs font-semibold rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-button disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
                Remove Photo
              </button>
            )}
          </div>
        </div>

        {/* Form Details Card */}
        <div className="md:col-span-2 glass rounded-3xl p-8">
          <form onSubmit={handleSaveDetails} className="space-y-6">
            
            {/* Header info */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                <User className="h-4 w-4" />
              </div>
              <h2 className="font-bold text-slate-800 text-base">Personal Details</h2>
            </div>

            {/* Email & Username Read Only info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-sm select-none">
                  <User className="h-4 w-4 text-slate-400" />
                  {user?.username}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-sm select-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Input fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">First Name <span className="text-red-500">*</span></label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Last Name <span className="text-red-500">*</span></label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                  className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password header info */}
            <div className="flex items-center gap-3 pt-6 pb-4 border-b border-slate-100">
              <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
                <KeyRound className="h-4 w-4" />
              </div>
              <h2 className="font-bold text-slate-800 text-base">Change Password</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label htmlFor="newPass" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">New Password</label>
                <input
                  id="newPass"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-white border border-slate-200 pl-4 pr-10 py-2.5 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-9 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div>
                <label htmlFor="confirmPass" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Confirm New Password</label>
                <input
                  id="confirmPass"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span>Your connection is SSL encrypted</span>
              </div>
              <button
                type="submit"
                disabled={savingDetails}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-button disabled:opacity-50"
              >
                {savingDetails ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Settings
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;
