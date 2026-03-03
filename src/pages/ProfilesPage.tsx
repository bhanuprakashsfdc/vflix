import React, { useState, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';
import { Icon } from '../components/common/Icon';
import { Button } from '../components/common/Button';
import type { Profile } from '../types';

// Predefined avatars
const AVATARS = [
  '👤', '👨', '👩', '👴', '👵', '🧑', '👦', '👧', '👶', 
  '🐱', '🐶', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🦄'
];

// Predefined colors
const COLORS = [
  '#E50914', '#221F1F', '#564d4d', '#4a90e2', '#46d369',
  '#f5c518', '#e50914', '#8321c3', '#d32626', '#3d5a80'
];

export const ProfilesPage: React.FC = () => {
  const { 
    profiles, 
    currentProfile, 
    setCurrentProfile, 
    addProfile, 
    removeProfile,
    loadProfiles 
  } = useAppStore();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState(AVATARS[0]);
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleSelectProfile = useCallback((profile: Profile) => {
    setCurrentProfile(profile);
    // Navigate to home after selecting profile
    useAppStore.getState().setCurrentView('home');
  }, [setCurrentProfile]);

  const handleCreateProfile = useCallback(async () => {
    if (!newName.trim()) return;
    
    const profile: Profile = {
      id: `profile-${Date.now()}`,
      name: newName.trim(),
      avatar: newAvatar,
      color: newColor,
      isAdult: true,
      createdAt: Date.now(),
    };
    
    await addProfile(profile);
    setIsCreating(false);
    setNewName('');
    setNewAvatar(AVATARS[0]);
    setNewColor(COLORS[0]);
  }, [newName, newAvatar, newColor, addProfile]);

  const handleDeleteProfile = useCallback(async (id: string) => {
    await removeProfile(id);
    setShowDeleteConfirm(null);
  }, [removeProfile]);

  const handleUpdateProfile = useCallback(async () => {
    if (!editingProfile || !newName.trim()) return;
    
    // Update profile via store (need to implement updateProfile in store)
    const updatedProfile = {
      ...editingProfile,
      name: newName.trim(),
      avatar: newAvatar,
      color: newColor,
    };
    
    // For now, we remove and re-add
    await removeProfile(editingProfile.id);
    await addProfile(updatedProfile);
    
    setEditingProfile(null);
    setNewName('');
    setNewAvatar(AVATARS[0]);
    setNewColor(COLORS[0]);
  }, [editingProfile, newName, newAvatar, newColor, addProfile, removeProfile]);

  const startEditing = (profile: Profile) => {
    setEditingProfile(profile);
    setNewName(profile.name);
    setNewAvatar(profile.avatar);
    setNewColor(profile.color);
  };

  const cancelEdit = () => {
    setEditingProfile(null);
    setIsCreating(false);
    setNewName('');
    setNewAvatar(AVATARS[0]);
    setNewColor(COLORS[0]);
  };

  return (
    <div className="min-h-screen bg-netflix-background pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="font-heading text-3xl text-white mb-2">
          {editingProfile ? 'Edit Profile' : isCreating ? 'Create Profile' : 'Who\'s Watching?'}
        </h1>
        
        {!isCreating && !editingProfile && (
          <p className="text-netflix-gray mb-8">
            Select a profile to continue or create a new one
          </p>
        )}

        {/* Profile Grid */}
        {(isCreating || editingProfile) ? (
          <div className="bg-netflix-dark rounded-lg p-6 max-w-md">
            {/* Avatar Selection */}
            <div className="mb-6">
              <label className="text-white block mb-2">Choose Avatar</label>
              <div className="flex flex-wrap gap-3">
                {AVATARS.map(avatar => (
                  <button
                    key={avatar}
                    onClick={() => setNewAvatar(avatar)}
                    className={`text-4xl p-2 rounded-lg transition-all ${
                      newAvatar === avatar 
                        ? 'bg-white/20 scale-110' 
                        : 'hover:bg-white/10'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="text-white block mb-2">Profile Color</label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={`w-10 h-10 rounded-full transition-all ${
                      newColor === color 
                        ? 'ring-2 ring-white scale-110' 
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div className="mb-6">
              <label className="text-white block mb-2">Profile Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter profile name"
                className="w-full px-4 py-2 bg-black/50 border border-netflix-gray/30 rounded-md text-white placeholder-netflix-gray focus:outline-none focus:border-netflix-red"
                maxLength={20}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={editingProfile ? handleUpdateProfile : handleCreateProfile}
                disabled={!newName.trim()}
              >
                {editingProfile ? 'Save Changes' : 'Create Profile'}
              </Button>
              <Button variant="secondary" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {/* Existing Profiles */}
            {profiles.map(profile => (
              <div key={profile.id} className="relative group">
                <button
                  onClick={() => handleSelectProfile(profile)}
                  className={`w-full aspect-square rounded-lg transition-all transform group-hover:scale-105 ${
                    currentProfile?.id === profile.id 
                      ? 'ring-4 ring-netflix-red' 
                      : 'hover:ring-4 hover:ring-white/50'
                  }`}
                  style={{ backgroundColor: profile.color }}
                >
                  <span className="text-6xl">{profile.avatar}</span>
                </button>
                
                <p className="text-white text-center mt-2 font-medium truncate">
                  {profile.name}
                </p>
                
                {/* Edit/Delete buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(profile);
                    }}
                    className="p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <Icon name="settings" size={14} />
                  </button>
                  {profiles.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(profile.id);
                      }}
                      className="p-1 bg-black/50 rounded-full text-white hover:bg-netflix-red"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  )}
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm === profile.id && (
                  <div className="absolute inset-0 bg-black/80 rounded-lg flex flex-col items-center justify-center p-4">
                    <p className="text-white text-sm mb-3">Delete this profile?</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="!px-2 !py-1 text-xs"
                      >
                        Delete
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => setShowDeleteConfirm(null)}
                        className="!px-2 !py-1 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add New Profile Button */}
            {profiles.length < 5 && (
              <button
                onClick={() => setIsCreating(true)}
                className="aspect-square rounded-lg border-2 border-dashed border-netflix-gray/50 hover:border-netflix-red transition-colors flex flex-col items-center justify-center gap-2 text-netflix-gray hover:text-netflix-red"
              >
                <Icon name="add" size={32} />
                <span className="text-sm">Add Profile</span>
              </button>
            )}
          </div>
        )}

        {/* Current Profile Indicator */}
        {currentProfile && !isCreating && !editingProfile && (
          <div className="mt-8 pt-8 border-t border-netflix-gray/20">
            <p className="text-netflix-gray text-sm">
              Currently viewing as: <span className="text-white">{currentProfile.name}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilesPage;
