import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator to access localhost
// For physical device, replace with your machine's local IP address (e.g., http://192.168.1.5:8000)
export const API_URL = Platform.OS === 'android' ? 'http://192.168.56.1:8000' : 'http://localhost:8000';
