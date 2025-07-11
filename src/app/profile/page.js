"use client";
import { useState, useEffect } from 'react';
import { Mail, Edit3, FileText } from 'lucide-react';
import Layout from "@/app/Layout/Layout";


const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/auth/view-profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          bio: data.bio || ''
        });
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        // Fetch updated profile data from server
        const profileRes = await fetch('http://localhost:4000/api/auth/view-profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });

        if (profileRes.ok) {
          const updatedProfile = await profileRes.json();
          setProfile(updatedProfile);
          setFormData({
            name: updatedProfile.name || '',
            email: updatedProfile.email || '',
            bio: updatedProfile.bio || ''
          });
        }

        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      bio: profile.bio || ''
    });
    setEditing(false);
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 text-lg">Loading profile...</p>
          </div>
        </div>
    );
  }

  if (!profile) {
    return (
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-600 text-lg">Failed to load profile</p>
            </div>
          </div>
        </Layout>
    );
  }

  return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-800">
                Profile Settings</h2>
              <p className="text-slate-600">Manage your account information</p>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              {/* Header Section */}
              <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 h-24">
                <div className="absolute top-6 right-6">
                  {!editing ? (
                      <button
                          onClick={() => setEditing(true)}
                          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </button>
                  ) : (
                      <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl backdrop-blur-sm transition-all duration-200"
                        >
                          Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-white text-blue-600 px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 hover:bg-slate-50"
                        >
                          {saving ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                Saving...
                              </div>
                          ) : (
                              'Save Changes'
                          )}
                        </button>
                      </div>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="pt-8 pb-8 px-8">
                <div className="space-y-6">
                  {!editing ? (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold text-slate-800 mb-1">
                            {profile.name}
                          </h2>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="w-4 h-4" />
                            {profile.email}
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-6">
                          <div className="flex items-start gap-3">
                            <FileText className="w-5 h-5 text-slate-500 mt-0.5" />
                            <div>
                              <h3 className="font-semibold text-slate-800 mb-2">Bio</h3>
                              <p className="text-slate-600 leading-relaxed">
                                {profile.bio || 'No bio provided yet. Click edit to add a bio.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                  ) : (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Full Name
                          </label>
                          <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none"
                              placeholder="Enter your full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Email Address
                          </label>
                          <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none"
                              placeholder="Enter your email address"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Bio
                          </label>
                          <textarea
                              name="bio"
                              value={formData.bio}
                              onChange={handleInputChange}
                              rows={4}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 outline-none resize-none"
                              placeholder="Tell us about yourself..."
                          />
                        </div>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
  );
};

export default ProfilePage;