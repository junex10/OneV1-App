import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import { Colors } from "./../../resources/global";
import { Ionicons } from "@expo/vector-icons";

const Login: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Animation refs
  const usernameAnim = useRef(new Animated.Value(1)).current;
  const passwordAnim = useRef(new Animated.Value(1)).current;

  const animateInput = (animRef: Animated.Value, toValue: number) => {
    Animated.spring(animRef, {
      toValue,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handleLogin = () => {
    // Add your login logic here
    // Example: router.replace('/src/map/map');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backBtn}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.title}>Welcome to One</Text>
      <Animated.View
        style={[
          { transform: [{ scale: usernameAnim }], width: "100%" },
          styles.inputWrapper,
          // Highlight border if focused
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
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginBtnText}>Login</Text>
      </TouchableOpacity>
      <View style={styles.linksContainer}>
        <TouchableOpacity
          onPress={() => router.push("/src/login/forgot-password")}
        >
          <Text style={styles.link}>Forgot password?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            router.push("/src/login/create-account/create-account")
          }
        >
          <Text style={styles.link}>Don't have an account?</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
  },
  input: {
    flex: 1,
    color: Colors.blue_dark,
    fontSize: 16,
    paddingVertical: 14,
    backgroundColor: "transparent",
  },
  loginBtn: {
    width: "100%",
    backgroundColor: Colors.purple,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  linksContainer: {
    width: "100%",
    alignItems: "center",
  },
  link: {
    color: Colors.purple,
    fontSize: 16,
    marginVertical: 4,
    textDecorationLine: "underline",
  },
});

export default Login;
