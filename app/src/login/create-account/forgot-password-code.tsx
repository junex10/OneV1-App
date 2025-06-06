import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  Animated,
} from "react-native";
import { Colors } from "./../../../resources/global";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Auth } from "../../../services";
import { useLocalSearchParams } from "expo-router";
import { CustomModal } from "../../../resources";

const ForgotPasswordCode: React.FC = () => {
  const CODE_LENGTH = 6;
  const [code, setCode] = useState("");
  const [codeFocused, setCodeFocused] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [getUser, setUser] = useState<any>(null);
  const codeAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
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

  const handleChange = (text: string) => {
    // Only allow digits and max length
    if (!/^\d*$/.test(text)) return;
    if (text.length <= CODE_LENGTH) setCode(text);
    if (text.length === CODE_LENGTH) Keyboard.dismiss();
  };

  const handleConfirm = async () => {
    const checkCode = await Auth.checkCode({
      code: code.toString(),
      email: getUser?.email,
      user_id: getUser?.id,
    });
    if (!checkCode.result) {
      setError(true);
      return null;
    }
    router.push({
      pathname: "/src/login/create-account/new-password",
      params: {
        user: JSON.stringify(getUser),
      },
    });
    // router.replace("/src/login/login");
  };

  return (
    <View style={styles.container}>
      {/**  Show modal when you made a mistake */}
      {error && (
        <CustomModal
          visible={error}
          title="Error"
          message={"The code is not correct"}
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
      <Text style={styles.title}>Enter code</Text>
      <Animated.View
        style={[
          { transform: [{ scale: codeAnim }], width: "100%" },
          styles.inputWrapper,
          codeFocused && styles.inputWrapperFocused,
        ]}
      >
        <Ionicons
          name="key-outline"
          size={20}
          color={codeFocused ? Colors.purple : "#aaa"}
          style={styles.inputIcon}
        />
        <TextInput
          style={[
            styles.input,
            {
              color: codeFocused ? Colors.blue_dark : Colors.gray,
              letterSpacing: 8,
              textAlign: "center",
            },
          ]}
          placeholder="------"
          placeholderTextColor="#aaa"
          value={code}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          onFocus={() => {
            animateInput(codeAnim, 1.05);
            setCodeFocused(true);
          }}
          onBlur={() => {
            animateInput(codeAnim, 1);
            setCodeFocused(false);
          }}
          selectionColor={Colors.purple}
          returnKeyType="done"
        />
      </Animated.View>
      <TouchableOpacity
        style={[
          styles.confirmBtn,
          {
            backgroundColor:
              code.length === CODE_LENGTH ? Colors.purple : Colors.gray,
          },
        ]}
        onPress={handleConfirm}
        disabled={code.length !== CODE_LENGTH}
      >
        <Text style={styles.confirmBtnText}>Confirm</Text>
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
    marginBottom: 32,
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blue_dark,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 32,
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
    fontSize: 22,
    paddingVertical: 14,
    backgroundColor: "transparent",
    letterSpacing: 8,
    textAlign: "center",
  },
  confirmBtn: {
    width: "100%",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    left: 32,
    right: 32,
  },
  confirmBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ForgotPasswordCode;
