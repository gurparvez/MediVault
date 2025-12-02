import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarEvents from '../../components/CalendarEvents';
import RecentUploads from '../../components/RecentUploads';
import UploadFABs from '../../components/UploadFABs';
import { Colors } from '../../constants/Colors';
import { MedicalDocument, MedicalEvent } from '../../constants/Types';
import { databaseService } from '../../services/DatabaseService';

export default function HomeScreen() {
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadData = useCallback(async () => {
    // Initialize DB if needed (safe to call multiple times)
    await databaseService.initDB();
    
    const [fetchedEvents, fetchedDocs] = await Promise.all([
      databaseService.getEvents(),
      databaseService.getDocuments(),
    ]);
    setEvents(fetchedEvents);
    setDocuments(fetchedDocs);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.spacer} />
        
        {/* Calendar Section */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => router.push('/calendar')}>
                <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
        </View>
        <CalendarEvents events={events} />

        <View style={styles.spacer} />

        {/* Vault Section */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Uploads</Text>
            <TouchableOpacity onPress={() => router.push('/vault')}>
                <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
        </View>
        <RecentUploads documents={documents} />
        
        <View style={styles.spacer} />
      </ScrollView>

      <UploadFABs onUploadComplete={loadData} />
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});