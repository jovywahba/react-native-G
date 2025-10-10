import React, { useState } from "react";
import { View, Image, ScrollView } from "react-native";
import { Text, TextInput, Button, HelperText, Card } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { db } from "../firebase";
import { supabase, SUPABASE_BUCKET } from "../supabase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { collection } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

// بديل بسيط لـ uuid لو مش عايز تبعيات:
// const uuidv4 = () => Math.random().toString(36).slice(2) + Date.now();

const schema = Yup.object({
  name: Yup.string().trim().min(2).required(),
  description: Yup.string().trim().min(5).required(),
  price: Yup.number().typeError("Enter a number").positive().required(),
  stock: Yup.number().typeError("Enter a number").integer().min(0).required(),
});

export default function AddProductScreen({ navigation }) {
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: "", description: "", price: "", stock: "" },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission required to access photos.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled) {
      setImageUri(res.assets[0].uri);
    }
  };

  const uploadToSupabase = async (uri) => {
    // حوّل uri → Blob
    const response = await fetch(uri);
    const blob = await response.blob();

    const ext = uri.split(".").pop() || "jpg";
    const filePath = `products/${uuidv4()}.${ext}`;

    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, blob, {
        upsert: false,
        contentType: blob.type || "image/jpeg",
      });
    if (error) throw error;

    const { data } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(filePath);
    return { filePath, publicUrl: data.publicUrl };
  };

  const onSubmit = async (values) => {
    try {
      if (!imageUri) {
        alert("Please select an image");
        return;
      }
      setUploading(true);

      // 1) ارفع الصورة لسوبا بيز
      const { publicUrl, filePath } = await uploadToSupabase(imageUri);

      // 2) خزّن الداتا في Firestore
      const id = uuidv4();
      const ref = doc(collection(db, "products"), id);
      await setDoc(ref, {
        id,
        name: values.name.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        stock: Number(values.stock),
        imageUrl: publicUrl,
        imagePath: filePath, // مفيد لو عايز تحذف من Supabase لاحقًا
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      alert("Product added!");
      reset();
      setImageUri(null);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, padding: 16, gap: 12, backgroundColor: "#fff" }}
    >
      <Text variant="headlineMedium" style={{ fontWeight: "700" }}>
        Add Product
      </Text>

      <Card style={{ borderRadius: 16, padding: 12 }}>
        <Card.Content style={{ gap: 12 }}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  label="Product name"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                />
                <HelperText type="error" visible={!!errors.name}>
                  {errors.name?.message}
                </HelperText>
              </>
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  label="Description"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  multiline
                />
                <HelperText type="error" visible={!!errors.description}>
                  {errors.description?.message}
                </HelperText>
              </>
            )}
          />

          <Controller
            control={control}
            name="price"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  label="Price"
                  mode="outlined"
                  value={String(value)}
                  onChangeText={onChange}
                  keyboardType="decimal-pad"
                />
                <HelperText type="error" visible={!!errors.price}>
                  {errors.price?.message}
                </HelperText>
              </>
            )}
          />

          <Controller
            control={control}
            name="stock"
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  label="Stock"
                  mode="outlined"
                  value={String(value)}
                  onChangeText={onChange}
                  keyboardType="number-pad"
                />
                <HelperText type="error" visible={!!errors.stock}>
                  {errors.stock?.message}
                </HelperText>
              </>
            )}
          />

          <Button mode="outlined" onPress={pickImage}>
            {imageUri ? "Change image" : "Pick image"}
          </Button>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{
                width: "100%",
                height: 180,
                borderRadius: 12,
                marginTop: 8,
              }}
            />
          ) : null}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={uploading}
            disabled={uploading}
          >
            Save Product
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
