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

const Login: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
      <Text style={styles.title}>Welcome to One</Text>
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
