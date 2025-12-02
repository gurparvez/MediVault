import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { MedicalDocument } from '../constants/Types';
import { apiService } from '../services/ApiService';
import { databaseService } from '../services/DatabaseService';

interface UploadFABsProps {
  onUploadComplete?: () => void;
}

export default function UploadFABs({ onUploadComplete }: UploadFABsProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setIsUploading(true);

      try {
        console.log('[UploadFABs] Analyzing image:', uri);
        const analysis = await apiService.analyzeImage(uri);
        console.log('[UploadFABs] Analysis complete');

        const newDoc: MedicalDocument = {
          id: Math.random().toString(36).substr(2, 9),
          uri: uri,
          name: `Upload_${new Date().toLocaleTimeString()}`,
          uploadDate: new Date().toISOString(),
          status: 'completed',
          summary: analysis.summary,
          category: analysis.category,
          context: analysis.context_text,
          embedding: analysis.embedding
        };

        console.log('[UploadFABs] Saving to DB...');
        await databaseService.addDocument(newDoc);
        console.log('[UploadFABs] Saved to DB');
        
        if (onUploadComplete) {
            onUploadComplete();
        }

        if (analysis.extracted_events && analysis.extracted_events.length > 0) {
          console.log('[UploadFABs] Events found:', analysis.extracted_events.length);
          setTimeout(() => {
            alertEventsFound(analysis.extracted_events);
          }, 500);
        }

      } catch (e) {
        console.error('[UploadFABs] Error:', e);
        Alert.alert('Error', 'Failed to analyze image.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const alertEventsFound = (events: any[]) => {
    Alert.alert(
      'Events Found',
      `Found ${events.length} event(s). Add to calendar?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            for (const event of events) {
              await databaseService.addEvent({
                ...event,
                id: Math.random().toString(36).substr(2, 9),
              });
            }
            Alert.alert('Success', 'Events added to calendar!');
            if (onUploadComplete) onUploadComplete();
          }
        }
      ]
    );
  };

  return (
    <View style={styles.fabContainer}>
      <TouchableOpacity
        style={[styles.fab, styles.fabSecondary]}
        onPress={pickImage}
        activeOpacity={0.8}
        disabled={isUploading}
      >
        {isUploading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
            <Ionicons name="images" size={24} color={Colors.primary} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/camera')}
        activeOpacity={0.8}
      >
        <Ionicons name="camera" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
