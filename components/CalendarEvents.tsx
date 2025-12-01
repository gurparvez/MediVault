import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { MedicalEvent } from '../constants/Types';

interface CalendarEventsProps {
  events: MedicalEvent[];
}

export default function CalendarEvents({ events }: CalendarEventsProps) {
  const renderEventItem = ({ item }: { item: MedicalEvent }) => {
    const date = new Date(item.date);
    const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeString = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

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
      <TouchableOpacity style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={iconName} size={24} color={iconColor} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.date}>{dateString} • {timeString}</Text>
          {item.location && <Text style={styles.location} numberOfLines={1}>{item.location}</Text>}
          {item.description && <Text style={styles.description} numberOfLines={1}>{item.description}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
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
  listContent: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
