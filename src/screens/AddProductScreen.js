// src/screens/AddProductScreen.js
import React, { useState } from 'react';
import { View, Image, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText, Card, Divider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Picker } from '@react-native-picker/picker';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp, collection } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { uploadImageFromUri } from '../utils/upload';

const CATEGORY_OPTIONS = ['chairs', 'cupboards', 'tables', 'lamps'];

const schema = Yup.object({
  name: Yup.string().trim().min(2).required('Name is required'),
  description: Yup.string().trim().min(5).required('Description is required'),
  price: Yup.number().typeError('Number').positive().required('Price is required'),
  stock: Yup.number().typeError('Number').integer().min(0).required('Stock is required'),
  category: Yup.string().oneOf(CATEGORY_OPTIONS).required('Category is required'),
});

export default function AddProductScreen({ navigation }) {
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState(null);

  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', description: '', price: '', stock: '', category: '' },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return alert('Permission required');
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  const onSubmit = async (values) => {
    try {
      if (!imageUri) return alert('Select an image');
      setUploading(true);

      const ext = (imageUri.split('.').pop() || 'jpg').toLowerCase();
      const path = `products/${uuidv4()}.${ext}`;
      const { publicUrl, filePath } = await uploadImageFromUri(
        imageUri, path, `image/${ext === 'jpg' ? 'jpeg' : ext}`
      );

      const id = uuidv4();
      await setDoc(doc(collection(db, 'products'), id), {
        id,
        name: values.name.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        stock: Number(values.stock),
        category: values.category,
        imageUrl: publicUrl,
        imagePath: filePath,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert('Product added!');
      reset(); setImageUri(null); navigation.goBack();
    } catch (err) {
      console.error(err); alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const Field = ({ name, label, keyboardType, multiline }) => (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View style={{ marginBottom: 12 }}>
          <TextInput
            label={label}
            mode="outlined"
            value={String(value)}
            onChangeText={onChange}
            keyboardType={keyboardType}
            multiline={multiline}
          />
          <HelperText type="error" visible={!!errors[name]}>
            {errors[name]?.message}
          </HelperText>
        </View>
      )}
    />
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
      <Text variant="headlineMedium" style={{ fontWeight: '700', marginBottom: 12 }}>Add Product</Text>

      <Card style={{ borderRadius: 16, padding: 12 }}>
        <Card.Content>
          <Field name="name" label="Product name" />
          <Field name="description" label="Description" multiline />
          <Field name="price" label="Price" keyboardType="decimal-pad" />
          <Field name="stock" label="Stock" keyboardType="number-pad" />

          <Divider style={{ marginBottom: 8 }} />

          <Text variant="titleMedium" style={{ marginBottom: 6 }}>Category</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <View style={{
                borderWidth: 1, borderRadius: 4, borderColor: 'rgba(0,0,0,0.38)', overflow: 'hidden',
                backgroundColor: 'rgba(0,0,0,0.02)', marginBottom: 6,
              }}>
                <Picker selectedValue={value} onValueChange={(v) => { onChange(v); setValue('category', v, { shouldValidate: true }); }}>
                  <Picker.Item label="Select a category..." value="" color="#8a8a8a" />
                  {CATEGORY_OPTIONS.map((opt) => (
                    <Picker.Item key={opt} label={opt[0].toUpperCase() + opt.slice(1)} value={opt} />
                  ))}
                </Picker>
              </View>
            )}
          />
          <HelperText type="error" visible={!!errors.category}>{errors.category?.message}</HelperText>

          <Button mode="outlined" onPress={pickImage}>{imageUri ? 'Change image' : 'Pick image'}</Button>
          {imageUri ? <Image source={{ uri: imageUri }} style={{ width: '100%', height: 180, borderRadius: 12, marginTop: 8 }} /> : null}

          <Button style={{ marginTop: 12 }} mode="contained" onPress={handleSubmit(onSubmit)} loading={uploading} disabled={uploading}>
            Save Product
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
