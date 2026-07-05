import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getHospitalImages,
  uploadHospitalImage,
  deleteHospitalImage
} from '../../services/hospitalService';
import toast from 'react-hot-toast';
import {
  Images,
  Upload,
  Trash2,
  X,
  Plus,
  ImageOff,
  ZoomIn,
  User,
  Clock,
  CheckCircle2
} from 'lucide-react';

const UPLOAD_ROLES = ['SUPER_ADMIN', 'HOSPITAL_ADMIN'];
const DELETE_ROLES = ['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR'];

// ── Small helpers ───────────────────────────────────────────────────────────
const getBaseUrl = () => {
  return import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : '';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// ── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({ image, onClose }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full mx-4 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={`${getBaseUrl()}${image.url}`}
          alt={image.caption || 'Hospital Image'}
          className="w-full max-h-[80vh] object-contain bg-gray-900"
        />
        {(image.caption || image.details || image.address || image.phoneNumber) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-6 pt-12 pb-6">
            {image.caption && <p className="text-white text-xl font-bold mb-1">{image.caption}</p>}
            
            {(image.address || image.phoneNumber) && (
              <div className="flex items-center gap-4 text-white/80 text-sm mb-2">
                {image.phoneNumber && <span className="flex items-center gap-1">📞 {image.phoneNumber}</span>}
                {image.address && <span className="flex items-center gap-1">📍 {image.address}</span>}
              </div>
            )}
            
            {image.details && <p className="text-white/70 text-sm mb-3 line-clamp-2">{image.details}</p>}

            {image.uploadedBy && (
              <p className="text-white/50 text-xs flex items-center gap-1 border-t border-white/10 pt-2 w-fit">
                <User className="w-3 h-3" />
                Uploaded by {image.uploadedBy.firstName} {image.uploadedBy.lastName}
              </p>
            )}
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
const DeleteConfirmModal = ({ onConfirm, onCancel, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Image?</h3>
      <p className="text-gray-500 text-sm mb-6">
        This action is permanent and cannot be undone. The image will be removed from the gallery and server.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ── Upload Modal ──────────────────────────────────────────────────────────────
const UploadModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [details, setDetails] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!allowed.includes(selectedFile.type)) {
      toast.error('Only image files are allowed (PNG, JPG, WEBP, GIF)');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select an image'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('caption', caption);
      formData.append('address', address);
      formData.append('phoneNumber', phoneNumber);
      formData.append('details', details);
      await uploadHospitalImage(formData);
      toast.success('Image uploaded successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Upload Hospital Image</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer
                ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
                ${preview ? 'border-green-300 bg-green-50' : ''}
              `}
              style={{ minHeight: '180px' }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium">Click to change</p>
                  </div>
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-44 gap-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Images className="w-7 h-7 text-gray-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600">
                      {isDragging ? 'Drop your image here' : 'Drag & drop or click to browse'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, GIF — Max 10MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields Grid */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Name / Caption
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={200}
                  placeholder="e.g. Apollo Main Hospital, ICU Ward..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. MG Road, Bengaluru"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Additional Details
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows="3"
                  placeholder="Enter details about facilities, specialties, or timings..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-none"
                />
              </div>
            </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Image
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

// ── Image Card ────────────────────────────────────────────────────────────────
const ImageCard = ({ image, canDelete, onDelete, onView }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const imgSrc = `${getBaseUrl()}${image.url}`;

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Area */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden cursor-pointer" onClick={onView}>
        {imageError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
            <ImageOff className="w-10 h-10" />
            <span className="text-xs">Image unavailable</span>
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={image.caption || 'Hospital image'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        )}

        {/* Overlay on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
            transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <button
              onClick={onView}
              className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              View
            </button>
            {canDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(image); }}
                className="flex items-center gap-1.5 bg-red-500/80 backdrop-blur-sm hover:bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-3">
        {image.caption ? (
          <p className="text-sm font-semibold text-gray-800 truncate">{image.caption}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">No caption</p>
        )}
        
        {/* Address and Phone */}
        {(image.address || image.phoneNumber) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 truncate">
            {image.address && <span className="truncate">📍 {image.address}</span>}
            {image.address && image.phoneNumber && <span>•</span>}
            {image.phoneNumber && <span>📞 {image.phoneNumber}</span>}
          </div>
        )}

        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-50">
          {image.uploadedBy && (
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[90px]">
                {image.uploadedBy.firstName} {image.uploadedBy.lastName}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[11px] text-gray-400 ml-auto">
            <Clock className="w-3 h-3" />
            <span>{formatDate(image.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Gallery Page ─────────────────────────────────────────────────────────
const HospitalGallery = () => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canUpload = UPLOAD_ROLES.includes(user?.role);
  const canDelete = DELETE_ROLES.includes(user?.role);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getHospitalImages();
      setImages(res.data || []);
    } catch (err) {
      toast.error('Failed to load gallery images');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteHospitalImage(deleteTarget._id);
      toast.success('Image deleted successfully');
      setDeleteTarget(null);
      fetchImages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete image');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Lightbox */}
      {lightboxImage && (
        <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <DeleteConfirmModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={fetchImages}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-6 p-1">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Images className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hospital Gallery</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {images.length} {images.length === 1 ? 'image' : 'images'} uploaded
              </p>
            </div>
          </div>

          {/* Role badge + Upload Button */}
          <div className="flex items-center gap-3">
            {/* Permission hint */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              ${canUpload ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}
            >
              {canUpload ? '✓ Upload enabled' : '👁 View only'}
            </div>

            {canUpload && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="w-4 h-4" />
                Upload Image
              </button>
            )}
          </div>
        </div>

        {/* Permission Info Bar */}
        {canDelete && !canUpload && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm text-blue-700">
              As a <strong>Doctor</strong>, you can view and delete hospital images, but image uploads are restricted to admins.
            </p>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && images.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
              <ImageOff className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No images yet</h3>
            <p className="text-gray-400 text-sm max-w-xs">
              {canUpload
                ? 'Start building your hospital gallery by uploading your first image.'
                : 'No hospital images have been uploaded yet. Check back later.'}
            </p>
            {canUpload && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
              >
                <Plus className="w-5 h-5" />
                Upload First Image
              </button>
            )}
          </div>
        )}

        {/* Image Grid */}
        {!isLoading && images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {images.map((img) => (
              <ImageCard
                key={img._id}
                image={img}
                canDelete={canDelete}
                onDelete={setDeleteTarget}
                onView={() => setLightboxImage(img)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalGallery;
