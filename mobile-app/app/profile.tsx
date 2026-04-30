import * as DocumentPicker from 'expo-document-picker';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { brand } from '@/constants/brand';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/services/authApi';
import { bffApi, type Resume } from '@/services/bffApi';

const BIO_PLACEHOLDER = `## About Me
2-3 sentences about your background.

## Key Skills
• Skill 1

## Career Goals
• Goal 1`;

export default function ProfileScreen() {
  const { user, logout, refreshUser, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'view' | 'edit' | 'settings'>('view');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [resumeSuccess, setResumeSuccess] = useState('');

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    if (user.role === 'recruiter' || user.role === 'admin') return;
    (async () => {
      setResumeLoading(true);
      setResumeError('');
      try {
        const list = await bffApi.getResumes(user.id);
        setResumes(list);
      } catch (e) {
        setResumeError(e instanceof Error ? e.message : 'Failed to load resumes');
      } finally {
        setResumeLoading(false);
      }
    })();
  }, [user?.id, user?.role]);

  useEffect(() => {
    if (!user?.id || (user.role !== 'user' && user.role !== 'admin')) return;
    bffApi
      .getCandidateProfile()
      .then((p) => {
        if (p) setBio(p.bio ?? '');
        else bffApi.upsertCandidateProfile({}).catch(() => {});
      })
      .catch(() => {});
  }, [user?.id, user?.role]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#2b2b2b]">
        <ActivityIndicator color={brand.accent} />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/login" />;
  }

  if (user.role === 'recruiter' || user.role === 'admin') {
    return <Redirect href="/(tabs)/recruiter" />;
  }

  const saveProfile = async () => {
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);
    try {
      await authApi.updateProfile({ name });
      await bffApi.upsertCandidateProfile({ bio: bio.trim() });
      await refreshUser();
      setProfileSuccess('Profile updated');
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async () => {
    setPwdError('');
    setPwdSuccess('');
    if (pwd.next.length < 8) {
      setPwdError('New password must be at least 8 characters');
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setPwdError('Passwords do not match');
      return;
    }
    setPwdLoading(true);
    try {
      await authApi.changePassword({
        current_password: pwd.current,
        new_password: pwd.next,
      });
      setPwdSuccess('Password changed');
      setPwd({ current: '', next: '', confirm: '' });
    } catch (e) {
      setPwdError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setPwdLoading(false);
    }
  };

  const pickResume = async () => {
    if (!user.id) return;
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'text/plain'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (asset.size != null && asset.size > 5 * 1024 * 1024) {
      setResumeError('Max file size 5MB');
      return;
    }
    setResumeError('');
    setResumeSuccess('');
    setResumeUploading(true);
    try {
      await bffApi.uploadResume(user.id, {
        uri: asset.uri,
        name: asset.name || 'resume.pdf',
        mimeType: asset.mimeType || undefined,
      });
      setResumeSuccess('Resume uploaded');
      const list = await bffApi.getResumes(user.id);
      setResumes(list);
    } catch (e) {
      setResumeError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setResumeUploading(false);
    }
  };

  const tabBtn = (t: typeof activeTab, label: string) => (
    <Pressable
      key={t}
      onPress={() => setActiveTab(t)}
      className="mr-2 rounded-lg px-4 py-3"
      style={{
        backgroundColor: activeTab === t ? brand.surface : brand.accent,
        borderWidth: activeTab === t ? 1 : 0,
        borderColor: brand.accent,
      }}>
      <Text className="font-bold" style={{ color: activeTab === t ? brand.accent : brand.bg }}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <ScrollView className="flex-1 bg-[#2b2b2b] px-4 py-6">
      <Pressable onPress={() => router.back()}>
        <Text style={{ color: brand.accent }}>← Back</Text>
      </Pressable>

      <View className="mt-4 flex-row flex-wrap">{tabBtn('view', 'View')}{tabBtn('edit', 'Edit')}{tabBtn('settings', 'Settings')}</View>

      {activeTab === 'view' && (
        <View className="mt-6 gap-4">
          <View className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
            <Text className="text-sm text-white/50">Name</Text>
            <Text className="text-lg text-white">{user.name}</Text>
          </View>
          <View className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
            <Text className="text-sm text-white/50">Email</Text>
            <Text className="text-lg text-white">{user.email}</Text>
          </View>
          <View className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
            <Text className="text-sm text-white/50">Bio</Text>
            <Text className="text-base text-white/80">{bio || 'No bio yet.'}</Text>
          </View>
          <View className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
            <Text className="text-sm text-white/50">Resume</Text>
            {resumeError ? <Text className="text-red-400">{resumeError}</Text> : null}
            {resumeLoading ? (
              <ActivityIndicator color={brand.accent} />
            ) : resumes.length === 0 ? (
              <Text className="text-white/50">No resumes yet.</Text>
            ) : (
              <Text className="text-white">{resumes[0].file_name || resumes[0].title}</Text>
            )}
          </View>
        </View>
      )}

      {activeTab === 'edit' && (
        <View className="mt-6 gap-4 rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
          {profileError ? <Text className="text-red-400">{profileError}</Text> : null}
          {profileSuccess ? <Text className="text-green-400">{profileSuccess}</Text> : null}
          <Text className="text-sm text-white/80">Name</Text>
          <TextInput
            className="rounded-lg border border-white/10 bg-[#2b2b2b] px-3 py-3 text-white"
            value={name}
            onChangeText={setName}
          />
          <View className="flex-row justify-between">
            <Text className="text-sm text-white/80">Bio</Text>
            <Pressable onPress={() => setBio(BIO_PLACEHOLDER)}>
              <Text style={{ color: brand.accent }}>Use template</Text>
            </Pressable>
          </View>
          <TextInput
            className="min-h-[160px] rounded-lg border border-white/10 bg-[#2b2b2b] px-3 py-3 text-white"
            multiline
            value={bio}
            onChangeText={setBio}
            placeholderTextColor="#666"
            placeholder={BIO_PLACEHOLDER}
          />
          <Text className="text-sm text-white/80">Resume (PDF or text, max 5MB)</Text>
          {resumeError ? <Text className="text-red-400">{resumeError}</Text> : null}
          {resumeSuccess ? <Text className="text-green-400">{resumeSuccess}</Text> : null}
          <Pressable
            onPress={pickResume}
            disabled={resumeUploading}
            className="items-center rounded-xl py-4"
            style={{ backgroundColor: brand.surface2 }}>
            <Text className="font-bold text-white">{resumeUploading ? 'Uploading…' : 'Choose file'}</Text>
          </Pressable>
          <Pressable
            onPress={saveProfile}
            disabled={profileLoading}
            className="items-center rounded-xl py-4"
            style={{ backgroundColor: brand.accent }}>
            <Text className="font-bold" style={{ color: brand.bg }}>
              {profileLoading ? 'Saving…' : 'Save'}
            </Text>
          </Pressable>
        </View>
      )}

      {activeTab === 'settings' && (
        <View className="mt-6 gap-4 rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
          <Text className="text-lg font-bold text-white">Change password</Text>
          {pwdError ? <Text className="text-red-400">{pwdError}</Text> : null}
          {pwdSuccess ? <Text className="text-green-400">{pwdSuccess}</Text> : null}
          <TextInput
            className="rounded-lg border border-white/10 bg-[#2b2b2b] px-3 py-3 text-white"
            placeholder="Current password"
            placeholderTextColor="#888"
            secureTextEntry
            value={pwd.current}
            onChangeText={(v) => setPwd((p) => ({ ...p, current: v }))}
          />
          <TextInput
            className="rounded-lg border border-white/10 bg-[#2b2b2b] px-3 py-3 text-white"
            placeholder="New password"
            placeholderTextColor="#888"
            secureTextEntry
            value={pwd.next}
            onChangeText={(v) => setPwd((p) => ({ ...p, next: v }))}
          />
          <TextInput
            className="rounded-lg border border-white/10 bg-[#2b2b2b] px-3 py-3 text-white"
            placeholder="Confirm new password"
            placeholderTextColor="#888"
            secureTextEntry
            value={pwd.confirm}
            onChangeText={(v) => setPwd((p) => ({ ...p, confirm: v }))}
          />
          <Pressable
            onPress={changePassword}
            disabled={pwdLoading}
            className="items-center rounded-xl py-4"
            style={{ backgroundColor: brand.accent }}>
            <Text className="font-bold" style={{ color: brand.bg }}>
              {pwdLoading ? 'Updating…' : 'Change password'}
            </Text>
          </Pressable>
        </View>
      )}

      {user.role === 'user' ? (
        <Pressable
          onPress={() => router.push('/upgrade')}
          className="mt-6 items-center rounded-xl py-4"
          style={{ backgroundColor: `${brand.accent}33` }}>
          <Text className="font-bold" style={{ color: brand.accent }}>
            Upgrade to Premium
          </Text>
        </Pressable>
      ) : null}

      <Pressable onPress={() => logout()} className="mt-4 items-center py-4">
        <Text className="font-bold text-red-400">Log out</Text>
      </Pressable>
    </ScrollView>
  );
}
