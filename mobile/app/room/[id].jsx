import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/apiClient';

export default function RoomScreen() {
  const { id: roomId } = useLocalSearchParams();
  const router = useRouter();
  const { socket, connected } = useSocket();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [media, setMedia] = useState([]);
  const [users, setUsers] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sharingLocation, setSharingLocation] = useState(false);

  useEffect(() => {
    if (!socket || !connected) return;

    socket.emit('join-room', { roomId });

    socket.on('room-data', ({ room }) => {
      setRoom(room);
      setMessages(room.messages || []);
      setMedia(room.media || []);
      setUsers(room.users || []);
    });

    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('new-media', (mediaItem) => {
      setMedia(prev => [...prev, mediaItem]);
    });

    socket.on('user-joined', ({ users }) => {
      setUsers(users);
    });

    socket.on('user-left', ({ users }) => {
      setUsers(users);
    });

    socket.on('room-ended', () => {
      Alert.alert('Room Ended', 'This room has been ended by the admin');
      router.replace('/dashboard');
    });

    socket.on('error', ({ message }) => {
      Alert.alert('Error', message);
      router.replace('/dashboard');
    });

    return () => {
      socket.emit('leave-room', { roomId });
      socket.off('room-data');
      socket.off('new-message');
      socket.off('new-media');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('room-ended');
      socket.off('error');
    };
  }, [socket, connected, roomId]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    socket?.emit('send-message', { roomId, text: messageText.trim() });
    setMessageText('');
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8
    });

    if (!result.canceled) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'photo.jpg'
      });
      formData.append('roomId', roomId);

      const { data } = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      socket?.emit('send-media', { roomId, url: data.url, type: data.type });
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const toggleLocationSharing = async () => {
    if (!sharingLocation) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      setSharingLocation(true);
      const subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        (location) => {
          socket?.emit('update-location', {
            roomId,
            lat: location.coords.latitude,
            lng: location.coords.longitude
          });
        }
      );

      return () => subscription.remove();
    } else {
      setSharingLocation(false);
    }
  };

  const handleLeave = () => {
    socket?.emit('leave-room', { roomId });
    router.replace('/dashboard');
  };

  if (!room) {
    return (
      <View style={styles.container}>
        <Text>Loading room...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.roomTitle}>Room: {roomId}</Text>
          <Text style={styles.memberCount}>{users.length} members</Text>
        </View>
        <TouchableOpacity onPress={handleLeave} style={styles.leaveButton}>
          <Text style={styles.leaveText}>Leave</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg) => (
          <View key={msg.id} style={styles.message}>
            <Text style={styles.messageSender}>{msg.userName}</Text>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
        {media.map((item) => (
          <View key={item.id} style={styles.mediaItem}>
            <Text style={styles.messageSender}>{item.userName}</Text>
            <Image source={{ uri: item.url }} style={styles.mediaImage} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={handlePickImage} style={styles.iconButton}>
          <Text>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleLocationSharing} style={styles.iconButton}>
          <Text>{sharingLocation ? '📍' : '📌'}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: 'white', padding: 15, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  roomTitle: { fontSize: 18, fontWeight: 'bold' },
  memberCount: { fontSize: 14, color: '#666', marginTop: 2 },
  leaveButton: { backgroundColor: '#ef4444', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6 },
  leaveText: { color: 'white', fontWeight: 'bold' },
  messagesContainer: { flex: 1, padding: 15 },
  message: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 10 },
  messageSender: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 4 },
  messageText: { fontSize: 16 },
  mediaItem: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 10 },
  mediaImage: { width: '100%', height: 200, borderRadius: 8, marginTop: 8 },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e5e5e5' },
  iconButton: { padding: 10, marginRight: 5 },
  input: { flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  sendButton: { backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, justifyContent: 'center' },
  sendText: { color: 'white', fontWeight: 'bold' }
});
