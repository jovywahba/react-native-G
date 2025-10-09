import { StyleSheet } from "react-native";
import colors from "../constants/colors";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  editIcon: {
    position: "absolute",
    bottom: 15,
    right: 10,
    backgroundColor: colors.primary,
    borderRadius: 15,
    padding: 6,
    elevation: 4,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 6,
  },
  email: {
    fontSize: 16,
    color: colors.gray,
    marginBottom: 35,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "red",
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 25,
  },
  logoutText: {
    color: "red",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "85%",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 15,
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changePicBtn: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 10,
    width: "100%",
    padding: 10,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 10,
  },
  saveText: {
    color: "white",
    fontWeight: "600",
  },
  cancelText: {
    color: colors.gray,
  },
  refreshOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
});
