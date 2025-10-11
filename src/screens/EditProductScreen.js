// src/screens/EditProductScreen.js
import React, { useEffect, useState } from "react";
import { View, Image, ScrollView, Alert } from "react-native";
import {
  Text, TextInput, Button, HelperText, Card, Divider, ActivityIndicator,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Picker } from "@react-native-picker/picker";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { supabase, SUPABASE_BUCKET } from "../supabase";
import { v4 as uuidv4 } from "uuid";

const CATEGORY_OPTIONS = ["chairs", "cupboards", "tables", "lamps"];

const schema = Yup.object({
  name: Yup.string().trim().min(2).required("Name is required"),
  description: Yup.string().trim().min(5).required("Description is required"),
  price: Yup.number().typeError("Number").positive().required("Price is required"),
  stock: Yup.number().typeError("Number").integer().min(0).required("Stock is required"),
  category: Yup.string().oneOf(CATEGORY_OPTIONS).required("Category is required"),
});

export default function EditProductScreen({ route, navigation }) {
  const { id } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUri, setImageUri] = useState(null); // لو اختار صورة جديدة
  const [existing, setExisting] = useState(null); // المنتج القديم

  const {
    control, handleSubmit, formState: { errors }, reset, setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: "", description: "", price: "", stock: "", category: "" },
  });

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (!snap.exists()) {
          Alert.alert("Not found", "Product not found");
          navigation.goBack();
          return;
        }
        const data = snap.data();
        setExisting(data);
        reset({
          name: data.name || "",
          description: data.description || "",
          price: String(data.price ?? ""),
          stock: String(data.stock ?? ""),
          category: data.category || "",
        });
      } catch (e) {
        console.error(e);
        Alert.alert("Error", e.message || "Failed to load product");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return alert("Permission required");
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9,
    });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  };

  const uploadToSupabase = async (uri) => {
    const blob = await (await fetch(uri)).blob();
    const ext = uri.split(".").pop() || "jpg";
    const filePath = `products/${uuidv4()}.${ext}`;
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, blob, { upsert: false, contentType: blob.type || "image/jpeg" });
    if (error) throw error;
    const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);
    return { filePath, publicUrl: data.publicUrl };
  };

  const onSave = async (values) => {
    try {
      setSaving(true);

      let imageUrl = existing?.imageUrl || null;
      let imagePath = existing?.imagePath || null;

      // لو اختار صورة جديدة: ارفع الجديدة واحذف القديمة (لو فيه path قديم)
      if (imageUri) {
        const uploaded = await uploadToSupabase(imageUri);
        if (imagePath) {
          await supabase.storage.from(SUPABASE_BUCKET).remove([imagePath]).catch(() => {});
        }
        imageUrl = uploaded.publicUrl;
        imagePath = uploaded.filePath;
      }

      await updateDoc(doc(db, "products", id), {
        name: values.name.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        stock: Number(values.stock),
        category: values.category,
        imageUrl,
        imagePath,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Saved", "Product updated");
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

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
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
      persistentScrollbar
    >
      <Text variant="headlineMedium" style={{ fontWeight: "700", marginBottom: 12 }}>
        Edit Product
      </Text>

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
                borderWidth: 1, borderRadius: 4, borderColor: "rgba(0,0,0,0.38)",
                overflow: "hidden", backgroundColor: "rgba(0,0,0,0.02)", marginBottom: 6,
              }}>
                <Picker selectedValue={value} onValueChange={onChange}>
                  <Picker.Item label="Select a category..." value="" color="#8a8a8a" />
                  {CATEGORY_OPTIONS.map((opt) => (
                    <Picker.Item key={opt} label={opt[0].toUpperCase() + opt.slice(1)} value={opt} />
                  ))}
                </Picker>
              </View>
            )}
          />
          <HelperText type="error" visible={!!errors.category}>{errors.category?.message}</HelperText>

          {/* Preview للصورة الحالية */}
          {existing?.imageUrl ? (
            <Image
              source={{ uri: existing.imageUrl }}
              style={{ width: "100%", height: 160, borderRadius: 12, marginBottom: 8 }}
            />
          ) : null}

          {/* اختيار صورة جديدة (اختياري) */}
          <Button mode="outlined" onPress={pickImage}>
            {imageUri ? "Change image" : "Pick new image (optional)"}
          </Button>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: 160, borderRadius: 12, marginTop: 8 }}
            />
          ) : null}

          <Button
            style={{ marginTop: 12 }}
            mode="contained"
            onPress={handleSubmit(onSave)}
            loading={saving}
            disabled={saving}
          >
            Save Changes
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
