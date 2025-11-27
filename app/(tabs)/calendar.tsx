import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Appointments & Reminders</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: Colors.text,
  },
});