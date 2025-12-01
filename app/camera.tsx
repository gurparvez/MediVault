import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Button, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  if (!permission) {
    // Camera permissions are still loading.
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  // Function to take picture
  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true, // We need this for Gemini later
      });
      setPhoto(photo?.uri || null);
    }
  };

  // If photo is taken (or selected), show preview
  if (photo) {
    return (
      <SafeAreaView style={styles.container}>
        <Image source={{ uri: photo }} style={styles.preview} />
        <View style={styles.previewButtons}>
          <TouchableOpacity style={styles.retakeBtn} onPress={() => setPhoto(null)}>
             <Ionicons name="trash" size={24} color="white" />
             <Text style={styles.btnText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={() => alert('Sending to Gemini...')}>
             <Ionicons name="checkmark-circle" size={24} color="white" />
             <Text style={styles.btnText}>Process</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <Ionicons name="images" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.flipButton} onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}>
              <Ionicons name="camera-reverse" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  message: { textAlign: 'center', paddingBottom: 10, color: 'white' },
  camera: { flex: 1 },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 30,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  captureButton: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  captureInner: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: 'white',
  },
  closeButton: { alignSelf: 'flex-start', padding: 10, marginTop: 20 },
  flipButton: { padding: 10 },
  galleryButton: { padding: 10 },
  
  // Preview Styles
  preview: { flex: 1, resizeMode: 'contain' },
  previewButtons: {
    flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: 'black',
  },
  retakeBtn: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: Colors.danger, borderRadius: 8 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: Colors.success, borderRadius: 8 },
  btnText: { color: 'white', marginLeft: 8, fontWeight: 'bold' },
});