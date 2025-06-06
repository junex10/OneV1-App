import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "./../../../resources/global";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { CustomModal } from "../../../resources";
import { Auth } from "../../../services";

const NewPassword: React.FC = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [getUser, setUser] = useState<any>(null);

  const passwordAnim = useRef(new Animated.Value(1)).current;
  const confirmAnim = useRef(new Animated.Value(1)).current;

  const { user } = useLocalSearchParams();

  useEffect(() => {
    const userData = user ? JSON.parse(user as string) : null;
    setUser(userData);
  }, []);

  const animateInput = (animRef: Animated.Value, toValue: number) => {
    Animated.spring(animRef, {
      toValue,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handleSave = async () => {
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    const update = await Auth.resetPassword({
      password,
      password_confirmation: confirm,
      user_id: getUser?.id,
    });

    if (update?.result) router.replace("/src/login/login");

    // TODO: Call API to update password, then redirect
  };

  return (
    <View style={styles.container}>
      {success && (
        <CustomModal
          visible={success}
          title="Password changed!"
          message={"The password of your account has changed successfully!"}
          onClose={() => setSuccess(false)}
          timeout={4000}
        />
      )}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backBtn}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>Set New Password</Text>
      <Text style={styles.subtitle}>Enter your new password below.</Text>
      <Animated.View
        style={[
          { transform: [{ scale: passwordAnim }], width: "100%" },
          styles.inputWrapper,
          passwordFocused && styles.inputWrapperFocused,
        ]}
      >
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={passwordFocused ? Colors.purple : "#aaa"}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="New password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onFocus={() => {
            animateInput(passwordAnim, 1.05);
            setPasswordFocused(true);
          }}
          onBlur={() => {
            animateInput(passwordAnim, 1);
            setPasswordFocused(false);
          }}
          selectionColor={Colors.purple}
          returnKeyType="next"
        />
      </Animated.View>
      <Animated.View
        style={[
          { transform: [{ scale: confirmAnim }], width: "100%" },
          styles.inputWrapper,
          confirmFocused && styles.inputWrapperFocused,
        ]}
      >
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={confirmFocused ? Colors.purple : "#aaa"}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor="#aaa"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          onFocus={() => {
            animateInput(confirmAnim, 1.05);
            setConfirmFocused(true);
          }}
          onBlur={() => {
            animateInput(confirmAnim, 1);
            setConfirmFocused(false);
          }}
          selectionColor={Colors.purple}
          returnKeyType="done"
        />
      </Animated.View>
      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
      <TouchableOpacity
        style={[
          styles.saveBtn,
          {
            backgroundColor:
              password.length >= 6 && confirm.length >= 6
                ? Colors.purple
                : Colors.gray,
          },
        ]}
        onPress={handleSave}
        disabled={password.length < 6 || confirm.length < 6}
      >
        <Text style={styles.saveBtnText}>Save Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blue_dark_2,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  backBtn: {
    position: "absolute",
    top: 48,
    left: 24,
    backgroundColor: Colors.purple,
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    zIndex: 10,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    color: "#bfc3c9",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blue_dark,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  inputWrapperFocused: {
    borderColor: Colors.purple,
    backgroundColor: "#fff1fa",
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: Colors.gray,
    fontSize: 16,
    paddingVertical: 14,
    backgroundColor: "transparent",
  },
  error: {
    color: "#FD3A73",
    fontSize: 14,
    marginBottom: 8,
    marginTop: -8,
    textAlign: "center",
  },
  saveBtn: {
    width: "100%",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    left: 32,
    right: 32,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default NewPassword;
