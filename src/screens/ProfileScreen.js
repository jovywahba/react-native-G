import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebase";
import { supabase, SUPABASE_BUCKET } from "../supabase";
import colors from "../constants/colors";
import styles from "../styles/ProfileScreen.styles";
import { useTranslation } from "react-i18next";

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, profile, loading, logout } = useContext(AuthContext);

  const [visible, setVisible] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(profile);
  const [preview, setPreview] = useState(null);

  const avatarUrl =
    me?.photoURL || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace("Login");
    } catch (e) {
      Alert.alert("Error", e?.message || "Logout failed");
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow photo access.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled) setPreview(res.assets[0].uri);
  };

  const upload = async (uri) => {
    const blob = await (await fetch(uri)).blob();
    const ext =
      uri.split(".").pop()?.toLowerCase() ||
      (blob.type.includes("png")
        ? "png"
        : blob.type.includes("webp")
        ? "webp"
        : "jpg");
    const path = `avatars/${user.uid}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(path, blob, { upsert: false, contentType: blob.type || "image/jpeg" });
    if (error) throw error;
    const { data } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
    return { photoURL: data.publicUrl, photoPath: path };
  };

  const save = async () => {
    if (!username.trim() && !preview) return;
    try {
      setSaving(true);
      const ref = doc(db, "users", user.uid);
      const patch = {};
      if (username.trim()) patch.username = username.trim();
      if (preview) Object.assign(patch, await upload(preview));
      if (Object.keys(patch).length) await updateDoc(ref, patch);
      const snap = await getDoc(ref);
      if (snap.exists()) setMe(snap.data());
      setPreview(null);
      setVisible(false);
    } catch (e) {
      Alert.alert("Error", e?.message || "Update failed");
    } finally {
      setSaving(false);
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
        <Text style={{ color: colors.gray }}>{t("no_user_logged_in")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <TouchableOpacity style={styles.editIcon} onPress={() => {
          setUsername(me?.username || "");
          setPreview(null);
          setVisible(true);
        }}>
          <MaterialCommunityIcons name="pencil" color={colors.white} size={18} />
        </TouchableOpacity>
      </View>

      <Text style={styles.username}>{me?.username || t("user")}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" color="red" size={22} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>{t("log_out")}</Text>
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t("edit_profile")}</Text>

            <Image
              source={{ uri: preview || me?.photoURL || avatarUrl }}
              style={styles.modalAvatar}
            />

            <TouchableOpacity
              onPress={pickImage}
              style={{
                marginTop: 8,
                marginBottom: 12,
                backgroundColor: colors.primary,
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {t("change_photo") || "Change Photo"}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder={t("enter_new_username")}
              value={username}
              onChangeText={setUsername}
            />

            <TouchableOpacity style={styles.saveButton} onPress={save} disabled={saving}>
              <Text style={styles.saveText}>{saving ? t("saving") : t("save_changes")}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={styles.cancelText}>{t("cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
