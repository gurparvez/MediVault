import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarEvents from '../../components/CalendarEvents';
import RecentUploads from '../../components/RecentUploads';
import { Colors } from '../../constants/Colors';
import { MedicalDocument, MedicalEvent } from '../../constants/Types';
import { geminiService } from '../../services/GeminiService';

export default function HomeScreen() {
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadData = useCallback(async () => {
    const [fetchedEvents, fetchedDocs] = await Promise.all([
      geminiService.getUpcomingEvents(),
      geminiService.getRecentUploads(),
    ]);
    setEvents(fetchedEvents);
    setDocuments(fetchedDocs);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      // In a real app, we would navigate to a processing screen or the camera preview screen with this image
      // For now, let's just alert
      alert('Image selected! Ready to process.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.spacer} />
        <CalendarEvents events={events} />
        <RecentUploads documents={documents} />
        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.fabSecondary]}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          <Ionicons name="images" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/camera')}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100, // Space for FAB
  },
  spacer: {
    height: 20,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'center',
  },
  fab: {
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
  fabSecondary: {
    backgroundColor: Colors.card,
    marginBottom: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});