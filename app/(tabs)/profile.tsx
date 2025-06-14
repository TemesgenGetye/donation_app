import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Settings, 
  LogOut, 
  Edit3,
  Save,
  X
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { profile, signOut, updateProfile } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
  });

  const handleSave = async () => {
    const { error } = await updateProfile(editedProfile);
    
    if (error) {
      Alert.alert('Error', 'Failed to update profile');
    } else {
      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
    });
    setEditing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => editing ? handleCancel() : setEditing(true)}
        >
          {editing ? (
            <X size={24} color="#6B7280" />
          ) : (
            <Edit3 size={24} color="#6B7280" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <User size={48} color="#2563EB" />
          </View>
          
          <View style={styles.roleContainer}>
            <Text style={styles.roleText}>{profile?.role?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <User size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              {editing ? (
                <TextInput
                  style={styles.infoInput}
                  value={editedProfile.full_name}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, full_name: text }))}
                  placeholder="Enter your full name"
                />
              ) : (
                <Text style={styles.infoValue}>{profile?.full_name}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Mail size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile?.email}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Phone size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              {editing ? (
                <TextInput
                  style={styles.infoInput}
                  value={editedProfile.phone}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, phone: text }))}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{profile?.phone || 'Not provided'}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <MapPin size={20} color="#6B7280" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              {editing ? (
                <TextInput
                  style={styles.infoInput}
                  value={editedProfile.location}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, location: text }))}
                  placeholder="Enter your location"
                />
              ) : (
                <Text style={styles.infoValue}>{profile?.location || 'Not provided'}</Text>
              )}
            </View>
          </View>
        </View>

        {editing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color="#ffffff" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionItem}>
            <Settings size={20} color="#6B7280" />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, styles.signOutAction]} onPress={handleSignOut}>
            <LogOut size={20} color="#EF4444" />
            <Text style={[styles.actionText, styles.signOutText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  editButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  roleContainer: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 1,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
    paddingTop: 4,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
  },
  infoInput: {
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  saveButton: {
    backgroundColor: '#10B981',
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  signOutAction: {
    borderBottomWidth: 0,
  },
  actionText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 16,
  },
  signOutText: {
    color: '#EF4444',
  },
});