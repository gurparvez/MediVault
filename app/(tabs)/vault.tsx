import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function VaultScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Medical Records Vault</Text>
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