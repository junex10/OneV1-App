import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { Colors } from "./../../../resources/global";
import { Auth } from "../../../services";
import { CustomModal } from "../../../resources";

const CreateAccount: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<any>(null);

  // Animation refs
  const emailAnim = useRef(new Animated.Value(1)).current;
  const usernameAnim = useRef(new Animated.Value(1)).current;
  const phoneAnim = useRef(new Animated.Value(1)).current;
  const passwordAnim = useRef(new Animated.Value(1)).current;

  const animateInput = (animRef: Animated.Value, toValue: number) => {
    Animated.spring(animRef, {
      toValue,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handleSaveAccount = async () => {
    // Basic empty checks
    if (
      !email.trim() ||
      !username.trim() ||
      !phone.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError(true);
      setErrorMessage("All fields are required");
      return null;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(true);
      setErrorMessage("Please enter a valid email address");
      return null;
    }

    const phoneRegex = /^\d{7,10}$/;
    if (!phoneRegex.test(phone)) {
      setError(true);
      setErrorMessage(
        "Please enter a valid phone number (7-10 digits, numbers only)"
      );
      return null;
    }

    if (password != confirmPassword) {
      setError(true);
      setErrorMessage("Password must be equal");
      return null;
    }

    const usernameCheck = await Auth.verifyNewAccount({
      username,
    });
    if (usernameCheck?.error) {
      setError(true);
      setErrorMessage("The username is already in used");
      return null;
    }

    const phoneCheck = await Auth.verifyNewAccount({ phone });
    if (phoneCheck?.error) {
      setError(true);
      setErrorMessage("The phone is already in used");
      return null;
    }

    const emailCheck = await Auth.verifyNewAccount({ email });
    if (emailCheck?.error) {
      setError(true);
      setErrorMessage("The email is already in used");
      return null;
    }
    const data = {
      email,
      username,
      phone,
      password,
      password_confirmation: password,
    };

    router.push({
      pathname: "/src/login/create-account/upload-photo",
      params: { user: JSON.stringify(data) },
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/**  Show modal when you made a mistake */}
      {error && (
        <CustomModal
          visible={error}
          title="Error"
          message={errorMessage}
          onClose={() => setError(false)}
          timeout={4000}
        />
      )}

      <Text style={styles.title}>Create Account</Text>
      <Animated.View
        style={{ transform: [{ scale: emailAnim }], width: "100%" }}
      >
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => animateInput(emailAnim, 1.05)}
          onBlur={() => animateInput(emailAnim, 1)}
        />
      </Animated.View>
      <Animated.View
        style={{ transform: [{ scale: usernameAnim }], width: "100%" }}
      >
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          onFocus={() => animateInput(usernameAnim, 1.05)}
          onBlur={() => animateInput(usernameAnim, 1)}
        />
      </Animated.View>
      <Animated.View
        style={{ transform: [{ scale: phoneAnim }], width: "100%" }}
      >
        <TextInput
          style={styles.input}
          placeholder="Phone"
          placeholderTextColor="#aaa"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          onFocus={() => animateInput(phoneAnim, 1.05)}
          onBlur={() => animateInput(phoneAnim, 1)}
        />
      </Animated.View>
      <Animated.View
        style={{ transform: [{ scale: passwordAnim }], width: "100%" }}
      >
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onFocus={() => animateInput(passwordAnim, 1.05)}
          onBlur={() => animateInput(passwordAnim, 1)}
        />
      </Animated.View>
      <Animated.View
        style={{ transform: [{ scale: passwordAnim }], width: "100%" }}
      >
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor="#aaa"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          onFocus={() => animateInput(passwordAnim, 1.05)}
          onBlur={() => animateInput(passwordAnim, 1)}
        />
      </Animated.View>
      <TouchableOpacity style={styles.createBtn} onPress={handleSaveAccount}>
        <Text style={styles.createBtnText}>Next</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.blue_dark_2,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
  },
  input: {
    width: "100%",
    backgroundColor: Colors.blue_dark,
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  createBtn: {
    width: "100%",
    backgroundColor: Colors.purple,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  createBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  link: {
    color: Colors.purple,
    fontSize: 16,
    marginVertical: 4,
    textDecorationLine: "underline",
    textAlign: "center",
  },
});

export default CreateAccount;
