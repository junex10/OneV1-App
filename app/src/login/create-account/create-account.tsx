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
import { Ionicons } from "@expo/vector-icons"; // Add this import
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { Colors } from "./../../../../resources/utils/global";
import { Auth } from "../../../../resources/services";
import { CustomModal } from "../../../../resources/utils";

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

  const [emailFocused, setEmailFocused] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // Animation refs
  const emailAnim = useRef(new Animated.Value(1)).current;
  const usernameAnim = useRef(new Animated.Value(1)).current;
  const phoneAnim = useRef(new Animated.Value(1)).current;
  const passwordAnim = useRef(new Animated.Value(1)).current;
  const confirmPasswordAnim = useRef(new Animated.Value(1)).current;

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
        style={[
          { transform: [{ scale: emailAnim }], width: "100%" },
          styles.inputWrapper,
          emailFocused && styles.inputWrapperFocused,
        ]}
      >
        <Ionicons
          name="mail-outline"
          size={20}
          color={emailFocused ? Colors.purple : "#aaa"}
          style={styles.inputIcon}
        />
        <TextInput
          style={[
            styles.input,
            {
              color: emailFocused ? Colors.blue_dark : Colors.gray,
            },
          ]}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => {
            animateInput(emailAnim, 1.05);
            setEmailFocused(true);
          }}
          onBlur={() => {
            animateInput(emailAnim, 1);
            setEmailFocused(false);
          }}
        />
      </Animated.View>
      <Animated.View
        style={[
          { transform: [{ scale: usernameAnim }], width: "100%" },
          styles.inputWrapper,
          usernameFocused && styles.inputWrapperFocused,
        ]}
      >
        <Ionicons
          name="person-outline"
          size={20}
          color={usernameFocused ? Colors.purple : "#aaa"}
          style={styles.inputIcon}
        />
        <TextInput
          style={[
            styles.input,
            {
              color: usernameFocused ? Colors.blue_dark : Colors.gray,
            },
          ]}
          placeholder="Username"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          onFocus={() => {
            animateInput(usernameAnim, 1.05);
            setUsernameFocused(true);
          }}
          onBlur={() => {
            animateInput(usernameAnim, 1);
            setUsernameFocused(false);
          }}
        />
      </Animated.View>

      <Animated.View
        style={[
          { transform: [{ scale: phoneAnim }], width: "100%" },
          styles.inputWrapper,
          phoneFocused && styles.inputWrapperFocused,
        ]}
      >
        <Ionicons
          name="call-outline"
          size={20}
          color={phoneFocused ? Colors.purple : "#aaa"}
          style={styles.inputIcon}
        />
        <TextInput
          style={[
            styles.input,
            {
              color: phoneFocused ? Colors.blue_dark : Colors.gray,
            },
          ]}
          placeholder="Phone"
          placeholderTextColor="#aaa"
          value={phone}
          onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ""))}
          keyboardType="numeric"
          onFocus={() => {
            animateInput(phoneAnim, 1.05);
            setPhoneFocused(true);
          }}
          onBlur={() => {
            animateInput(phoneAnim, 1);
            setPhoneFocused(false);
          }}
        />
      </Animated.View>

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
          style={[
            styles.input,
            {
              color: passwordFocused ? Colors.blue_dark : Colors.gray,
            },
          ]}
          placeholder="Password"
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
        />
      </Animated.View>

      <Animated.View
        style={[
          { transform: [{ scale: confirmPasswordAnim }], width: "100%" },
          styles.inputWrapper,
          confirmPasswordFocused && styles.inputWrapperFocused,
        ]}
      >
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={confirmPasswordFocused ? Colors.purple : "#aaa"}
          style={styles.inputIcon}
        />
        <TextInput
          style={[
            styles.input,
            {
              color: confirmPasswordFocused ? Colors.blue_dark : Colors.gray,
            },
          ]}
          placeholder="Confirm password"
          placeholderTextColor="#aaa"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          onFocus={() => {
            animateInput(confirmPasswordAnim, 1.05);
            setConfirmPasswordFocused(true);
          }}
          onBlur={() => {
            animateInput(confirmPasswordAnim, 1);
            setConfirmPasswordFocused(false);
          }}
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
    color: Colors.blue_dark,
    fontSize: 16,
    paddingVertical: 14,
    backgroundColor: "transparent",
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
