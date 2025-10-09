import React, { useContext, useState } from "react";
import {  View,  Text,  Image,  TouchableOpacity,  ActivityIndicator,  Modal,  TextInput,} from "react-native";
import { AuthContext } from "../context/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import colors from "../constants/colors";
import styles from "../styles/ProfileScreen.styles"; 

export default function ProfileScreen({ navigation }) {
  const { user, profile, loading, logout } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace("Login");
    } catch (error) {
      console.log("Logout Error:", error);
    }
  };

  const handleEditPress = () => {
    setUsername(localProfile?.username || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!username.trim()) return;
    try {
      setSaving(true);
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { username });
      setModalVisible(false);
      setRefreshing(true);

      const updatedDoc = await getDoc(userRef);
      if (updatedDoc.exists()) {
        setLocalProfile(updatedDoc.data());
      }
    } catch (err) {
      console.log("Error updating username:", err);
    } finally {
      setSaving(false);
      setTimeout(() => setRefreshing(false), 800);
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
        <Text style={{ color: colors.gray }}>No user logged in</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {refreshing && (
        <View style={styles.refreshOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          }}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.editIcon} onPress={handleEditPress}>
          <MaterialCommunityIcons name="pencil" color={colors.white} size={18} />
        </TouchableOpacity>
      </View>

      <Text style={styles.username}>{localProfile?.username || "User"}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons
          name="logout"
          color="red"
          size={22}
          style={{ marginRight: 8 }}
        />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              style={styles.modalAvatar}
            />

            <TouchableOpacity style={styles.changePicBtn} disabled>
              <Text style={{ color: colors.gray }}>Change photo (coming soon)</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Enter new username"
              value={username}
              onChangeText={setUsername}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
