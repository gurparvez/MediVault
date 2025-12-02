import UploadFABs from '@/components/UploadFABs';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { MedicalDocument } from '../../constants/Types';
import { databaseService } from '../../services/DatabaseService';

export default function VaultScreen() {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [categories, setCategories] = useState<{ category: string, count: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  const loadData = useCallback(async () => {
    const [docs, cats] = await Promise.all([
        databaseService.getDocuments(),
        databaseService.getCategories()
    ]);
    setDocuments(docs);
    setCategories(cats);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const deleteDocument = (id: string) => {
    const { Alert } = require('react-native');
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            await databaseService.deleteDocument(id);
            loadData();
          } 
        }
      ]
    );
  };

  const filteredDocuments = selectedCategory
    ? documents.filter(doc => doc.category === selectedCategory)
    : documents;

  const renderDocumentItem = ({ item }: { item: MedicalDocument }) => {
    const date = new Date(item.uploadDate);
    const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
             <Ionicons name="document-text" size={32} color={Colors.primary} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.date}>{dateString} • {item.category || 'Uncategorized'}</Text>
          <View style={styles.statusContainer}>
             <View style={[styles.statusDot, { backgroundColor: item.status === 'completed' ? Colors.success : Colors.warning }]} />
             <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => deleteDocument(item.id)} style={styles.deleteButton}>
             <Ionicons name="trash-outline" size={20} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
            <TouchableOpacity
                style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
                onPress={() => setSelectedCategory(null)}
            >
                <Text style={[styles.filterText, !selectedCategory && styles.filterTextActive]}>All</Text>
            </TouchableOpacity>
            {categories.map((cat, index) => (
                <TouchableOpacity
                    key={index}
                    style={[styles.filterChip, selectedCategory === cat.category && styles.filterChipActive]}
                    onPress={() => setSelectedCategory(cat.category)}
                >
                    <Text style={[styles.filterText, selectedCategory === cat.category && styles.filterTextActive]}>
                        {cat.category} ({cat.count})
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredDocuments}
        renderItem={renderDocumentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No documents found</Text>}
      />

      <UploadFABs onUploadComplete={loadData} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterContainer: {
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
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
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: 8,
  },
});
