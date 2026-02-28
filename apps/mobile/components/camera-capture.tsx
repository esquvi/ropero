import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface CameraCaptureProps {
  imageUri: string | null;
  onImageSelected: (uri: string) => void;
  onImageRemoved: () => void;
}

export function CameraCapture({ imageUri, onImageSelected, onImageRemoved }: CameraCaptureProps) {
  const [loading, setLoading] = useState(false);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take photos.');
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } finally {
      setLoading(false);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library access is required.');
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } finally {
      setLoading(false);
    }
  };

  if (imageUri) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: imageUri }} style={styles.preview} />
        <TouchableOpacity style={styles.removeButton} onPress={onImageRemoved}>
          <Ionicons name="close-circle" size={28} color="#ef4444" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.captureButton}
        onPress={takePhoto}
        disabled={loading}
      >
        <Ionicons name="camera" size={32} color="#6b7280" />
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.captureButton}
        onPress={pickFromGallery}
        disabled={loading}
      >
        <Ionicons name="images" size={32} color="#6b7280" />
        <Text style={styles.buttonText}>Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  captureButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  previewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
  },
});
