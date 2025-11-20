import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

export default function Dashboard() {
  const [joinCode, setJoinCode] = useState('');
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleCreateRoom = async () => {
    try {
      const { data } = await api.post('/rooms/create');
      router.push(`/room/${data.roomId}`);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create room');
    }
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a room code');
      return;
    }
    router.push(`/room/${joinCode.trim()}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ephemeral Rooms</Text>
        <Text style={styles.subtitle}>Welcome, {user?.name}</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create New Room</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateRoom}>
            <Text style={styles.buttonText}>Create Room</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Join Existing Room</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter room code"
            value={joinCode}
            onChangeText={setJoinCode}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.secondaryButton} onPress={handleJoinRoom}>
            <Text style={styles.buttonText}>Join Room</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: 'white', padding: 20, paddingTop: 60, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666' },
  logoutButton: { marginTop: 10 },
  logoutText: { color: '#ef4444', fontSize: 16 },
  content: { flex: 1, padding: 20 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  primaryButton: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 8 },
  secondaryButton: { backgroundColor: '#10b981', padding: 15, borderRadius: 8 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }
});
