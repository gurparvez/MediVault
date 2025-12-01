import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { MedicalDocument } from '../constants/Types';

interface RecentUploadsProps {
  documents: MedicalDocument[];
}

export default function RecentUploads({ documents }: RecentUploadsProps) {
  const renderDocumentItem = ({ item }: { item: MedicalDocument }) => {
    const date = new Date(item.uploadDate);
    const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.imageContainer}>
           {/* In a real app, this would be a thumbnail. Using a placeholder icon for now if uri is not an image or just to show structure */}
           <View style={styles.placeholderImage}>
             <Ionicons name="document-text" size={32} color={Colors.primary} />
           </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.date}>{dateString}</Text>
          <View style={styles.statusContainer}>
             <View style={[styles.statusDot, { backgroundColor: item.status === 'completed' ? Colors.success : Colors.warning }]} />
             <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recent Uploads</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        {documents.map((doc) => (
            <View key={doc.id} style={{marginBottom: 12}}>
                {renderDocumentItem({ item: doc })}
            </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  listContainer: {
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
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
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
});
