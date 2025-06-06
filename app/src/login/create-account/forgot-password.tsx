import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "./../../../resources/global";
import { useRouter } from "expo-router";
import { Auth } from "../../../services";
import { CustomModal } from "../../../resources";

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<boolean>(false);

  const handleCode = async () => {
    const emailCheck = await Auth.verifyNewAccount({ email, getUser: true });
    if (!emailCheck?.user) {
      setError(true);
      // This means email doesnt exist
      return null;
    } else {
      router.push({
        pathname: "/src/login/create-account/forgot-password-code",
        params: {
          user: JSON.stringify(emailCheck?.user),
        },
      }); // We redirect
    }
  };

  return (
    <View style={styles.container}>
      {error && (
        <CustomModal
          visible={error}
          title="Error"
          message={"This email doesn't exist"}
          onClose={() => setError(false)}
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
      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a code to reset password
        </Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={Colors.purple}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity style={styles.sendBtn} onPress={handleCode}>
          <Text style={styles.sendBtnText}>Send code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blue_dark_2,
    justifyContent: "center",
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
  content: {
    marginHorizontal: 32,
    backgroundColor: Colors.blue_dark,
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
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
    width: "100%",
    backgroundColor: Colors.blue_dark_2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.purple,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  sendBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 36,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    width: "100%",
  },
  sendBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default ForgotPassword;
