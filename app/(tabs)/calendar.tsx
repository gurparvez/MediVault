import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { EventType, MedicalEvent } from '../../constants/Types';
import { databaseService } from '../../services/DatabaseService';

export default function CalendarScreen() {
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [time, setTime] = useState('09:00');
  const [type, setType] = useState<EventType>('appointment');
  const [description, setDescription] = useState('');

  const loadEvents = useCallback(async () => {
    const loadedEvents = await databaseService.getEvents();
    setEvents(loadedEvents);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleAddEvent = async () => {
    if (!title || !date) {
      Alert.alert('Error', 'Please enter a title and date');
      return;
    }

    const newEvent: MedicalEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      date: `${date}T${time}:00.000Z`, // Simple ISO construction
      type,
      description,
    };

    await databaseService.addEvent(newEvent);
    setModalVisible(false);
    resetForm();
    loadEvents();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('appointment');
  };

  const renderEventItem = ({ item }: { item: MedicalEvent }) => {
    const eventDate = new Date(item.date);
    const dateString = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeString = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    let iconName: keyof typeof Ionicons.glyphMap = 'calendar';
    let iconColor = Colors.primary;

    switch (item.type) {
      case 'medication':
        iconName = 'medkit';
        iconColor = Colors.success;
        break;
      case 'appointment':
        iconName = 'medical';
        iconColor = Colors.primary;
        break;
      case 'reminder':
        iconName = 'alarm';
        iconColor = Colors.warning;
        break;
    }

    return (
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{dateString} • {timeString}</Text>
          {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No upcoming events</Text>}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Add Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Event</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Event Title"
              value={title}
              onChangeText={setTitle}
            />

            <View style={styles.row}>
                <TextInput
                style={[styles.input, {flex: 1, marginRight: 8}]}
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
                />
                <TextInput
                style={[styles.input, {flex: 1}]}
                placeholder="HH:MM"
                value={time}
                onChangeText={setTime}
                />
            </View>

            <View style={styles.typeContainer}>
                {(['appointment', 'medication', 'reminder'] as EventType[]).map((t) => (
                    <TouchableOpacity
                        key={t}
                        style={[styles.typeButton, type === t && styles.typeButtonActive]}
                        onPress={() => setType(t)}
                    >
                        <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddEvent}>
                <Text style={styles.saveButtonText}>Save Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginTop: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  row: {
      flexDirection: 'row',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
  },
  typeButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors.primary,
  },
  typeButtonActive: {
      backgroundColor: Colors.primary,
  },
  typeText: {
      color: Colors.primary,
      fontSize: 12,
  },
  typeTextActive: {
      color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.background,
    marginRight: 8,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.text,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
