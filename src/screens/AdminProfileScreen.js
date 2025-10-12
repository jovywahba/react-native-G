import React, { useContext, useMemo, useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { supabase, SUPABASE_BUCKET } from "../supabase";
import colors from "../constants/colors";
import styles from "../styles/ProfileScreen.styles";

export default function AdminProfileScreen() {
  const { user, profile, loading, logout } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [me, setMe] = useState(profile || {});
  const [name, setName] = useState(profile?.username || "");
  const [preview, setPreview] = useState(null);

  const avatar = useMemo(
    () => preview || me?.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    [preview, me?.photoURL]
  );

  const handleLogout = async () => {
    try {
      await logout(); // do not navigate; RootNavigator handles stack switch
    } catch (e) {
      Alert.alert("Error", e?.message || "Logout failed");
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission required", "Please allow photo access.");
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!r.canceled) setPreview(r.assets[0].uri);
  };

  const upload = async (uri) => {
    const resp = await fetch(uri);
    const buf = await resp.arrayBuffer();
    const ext = uri.split(".").pop()?.toLowerCase() || "jpg";
    const path = `avatars/${user.uid}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(SUPABASE_BUCKET).upload(path, new Uint8Array(buf), {
      contentType: resp.headers.get("Content-Type") || "image/jpeg",
      upsert: false,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
    return { photoURL: data.publicUrl, photoPath: path };
  };

  const save = async () => {
    if (!name.trim() && !preview) return;
    try {
      setBusy(true);
      const ref = doc(db, "users", user.uid);
      const patch = {};
      if (name.trim()) patch.username = name.trim();
      if (preview) Object.assign(patch, await upload(preview));
      if (Object.keys(patch).length) await updateDoc(ref, patch);
      const snap = await getDoc(ref);
      if (snap.exists()) setMe(snap.data());
      setPreview(null);
      setOpen(false);
    } catch (e) {
      Alert.alert("Error", e?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.gray }}>No admin logged in</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <TouchableOpacity
          style={styles.editIcon}
          onPress={() => {
            setName(me?.username || "");
            setOpen(true);
          }}
        >
          <MaterialCommunityIcons name="pencil" color={colors.white} size={18} />
        </TouchableOpacity>
      </View>

      <Text style={styles.username}>{me?.username || "Admin"}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" color="red" size={22} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit profile</Text>

            <Image source={{ uri: avatar }} style={styles.modalAvatar} />

            <TouchableOpacity
              onPress={pickImage}
              style={{ marginTop: 8, marginBottom: 12, backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 10, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Change Photo</Text>
            </TouchableOpacity>

            <TextInput style={styles.input} placeholder="Enter new username" value={name} onChangeText={setName} />

            <TouchableOpacity style={styles.saveButton} onPress={save} disabled={busy}>
              <Text style={styles.saveText}>{busy ? "Saving…" : "Save changes"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
