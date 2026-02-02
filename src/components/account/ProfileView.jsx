import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Calendar, Shield, Edit2, Save, X, 
  Building, MapPin, Phone, Camera, Trash2,
  AlertCircle, CheckCircle, Loader, Globe, Briefcase
} from 'lucide-react';

export default function ProfileView({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [showDeletePhotoModal, setShowDeletePhotoModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    company: '',
    jobTitle: '',
    location: '',
    phone: '',
    website: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
        setFormData({
          name: data.user.name || '',
          bio: data.user.bio || '',
          company: data.user.company || '',
          jobTitle: data.user.jobTitle || '',
          location: data.user.location || '',
          phone: data.user.phone || '',
          website: data.user.website || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setSaveStatus(null);
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setIsEditing(false);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      bio: user.bio || '',
      company: user.company || '',
      jobTitle: user.jobTitle || '',
      location: user.location || '',
      phone: user.phone || '',
      website: user.website || ''
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setUser(prev => ({ ...prev, profilePicture: data.profilePictureUrl }));
      } else {
        alert(data.message || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const response = await fetch('/api/user/profile-picture', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setUser(prev => ({ ...prev, profilePicture: null }));
        setShowDeletePhotoModal(false);
      }
    } catch (error) {
      console.error('Error removing photo:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name, email) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || 'U';
  };

  const getSubscriptionBadge = (tier) => {
    const badges = {
      free: { icon: '✨', label: 'Free', color: 'bg-gray-100 text-gray-700' },
      pro: { icon: '⚡', label: 'Pro', color: 'bg-blue-100 text-blue-700' },
      premium: { icon: '👑', label: 'Premium', color: 'bg-purple-100 text-purple-700' },
      enterprise: { icon: '🏢', label: 'Enterprise', color: 'bg-indigo-100 text-indigo-700' }
    };
    return badges[tier] || badges.free;
  };

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const badge = getSubscriptionBadge(user?.subscriptionTier);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Delete Photo Confirmation Modal */}
      {showDeletePhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Remove Profile Picture?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to remove your profile picture? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeletePhotoModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemovePhoto}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <User className="w-8 h-8 text-indigo-600" />
          Profile
        </h1>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Save Status */}
      {saveStatus && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 ${
          saveStatus === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {saveStatus === 'success' ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Profile updated successfully!</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5" />
              <span>Failed to update profile. Please try again.</span>
            </>
          )}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        <div className="px-8 pb-8">
          {/* Profile Picture */}
          <div className="flex items-start gap-6 -mt-16 mb-6">
            <div className="relative">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name || 'User'}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-4 border-white flex items-center justify-center text-white text-4xl font-bold">
                  {getInitials(user?.name, user?.email)}
                </div>
              )}
              
              {isEditing && (
                <div className="absolute bottom-0 right-0 flex gap-1">
                  <label className="p-2 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                    {uploadingPhoto ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </label>
                  {user?.profilePicture && (
                    <button
                      onClick={() => setShowDeletePhotoModal(true)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex-1 mt-16">
              {!isEditing ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-800">{user?.name || 'No name set'}</h2>
                  {formData.jobTitle && (
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <Briefcase className="w-4 h-4" />
                      {formData.jobTitle}
                      {formData.company && ` at ${formData.company}`}
                    </p>
                  )}
                  {formData.bio && (
                    <p className="text-gray-600 mt-2">{formData.bio}</p>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-semibold"
                  />
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium text-gray-800">{formatDate(user?.createdAt)}</p>
              </div>
            </div>

            {/* Subscription - SIMPLIFIED, NO UPGRADE BUTTON */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Shield className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Current Plan</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </span>
              </div>
            </div>

            {/* Company */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Building className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Company</p>
                {!isEditing ? (
                  <p className="font-medium text-gray-800">{formData.company || 'Not set'}</p>
                ) : (
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Your company"
                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>

            {/* Job Title */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Briefcase className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Job Title</p>
                {!isEditing ? (
                  <p className="font-medium text-gray-800">{formData.jobTitle || 'Not set'}</p>
                ) : (
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="Your job title"
                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Location</p>
                {!isEditing ? (
                  <p className="font-medium text-gray-800">{formData.location || 'Not set'}</p>
                ) : (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Phone</p>
                {!isEditing ? (
                  <p className="font-medium text-gray-800">{formData.phone || 'Not set'}</p>
                ) : (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+63 XXX XXX XXXX"
                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>

            {/* Website */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Globe className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Website</p>
                {!isEditing ? (
                  <p className="font-medium text-gray-800 truncate">
                    {formData.website ? (
                      <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                        {formData.website}
                      </a>
                    ) : (
                      'Not set'
                    )}
                  </p>
                ) : (
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <p className="text-3xl font-bold text-indigo-600">{user?.totalCleanupsUsed || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Total Cleanups</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{user?.emailQuotaUsed || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Emails Processed</p>
          </div>
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <p className="text-3xl font-bold text-pink-600">
              {user?.subscriptionTier === 'free' ? user?.freeCleanupCount || 0 : '∞'}
            </p>
            <p className="text-sm text-gray-600 mt-1">Cleanups Left</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">
              {Math.ceil((new Date() - new Date(user?.createdAt)) / (1000 * 60 * 60 * 24)) || 0}
            </p>
            <p className="text-sm text-gray-600 mt-1">Days Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}