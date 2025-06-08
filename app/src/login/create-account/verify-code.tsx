import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { Colors } from "./../../../../resources/utils/global";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { Auth } from "../../../../resources/services";
import { Storage } from "../../../../resources/utils";

const CODE_LENGTH = 6;

const VerifyCode: React.FC = () => {
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
  const [getUser, setUser] = useState<any>(null);

  const inputs = useRef<Array<TextInput | null>>([]);
  const router = useRouter();
  const { user } = useLocalSearchParams();

  useEffect(() => {
    const userData = user ? JSON.parse(user as string) : null;
    setUser(userData);
  }, []);

  const handleChange = (text: string, idx: number) => {
    if (!/^\d*$/.test(text)) return; // Only allow digits
    const newCode = [...code];
    newCode[idx] = text.slice(-1); // Only last digit
    setCode(newCode);

    // Move to next input if filled
    if (text && idx < CODE_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
    // If last digit, dismiss keyboard
    if (idx === CODE_LENGTH - 1 && text) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[idx] && idx > 0) {
      const newCode = [...code];
      newCode[idx - 1] = "";
      setCode(newCode);
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleConfirm = async () => {
    const data = await Auth.verifyUser(Number(code.join("")));
    if (data?.message) {
      Storage.set("user", getUser);
      router.replace("/src/map/map");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter confirmation code</Text>
      <View style={styles.codeContainer}>
        {code.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={(ref) => {
              inputs.current[idx] = ref as TextInput | null;
            }}
            style={[
              styles.codeInput,
              digit ? styles.codeInputFilled : undefined,
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, idx)}
            onKeyPress={(e) => handleKeyPress(e, idx)}
            autoFocus={idx === 0}
            selectionColor={Colors.purple}
            textAlign="center"
            returnKeyType="done"
          />
        ))}
      </View>
      <TouchableOpacity
        style={[
          styles.confirmBtn,
          {
            backgroundColor: code.every((d) => d) ? Colors.purple : Colors.gray,
          },
        ]}
        onPress={handleConfirm}
        disabled={!code.every((d) => d)}
      >
        <Text style={styles.confirmBtnText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

const INPUT_SIZE = 48;

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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
    gap: 12,
  },
  codeInput: {
    width: INPUT_SIZE,
    height: INPUT_SIZE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray,
    backgroundColor: Colors.blue_dark,
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  codeInputFilled: {
    borderColor: Colors.purple,
    backgroundColor: "#fff1fa",
    color: Colors.purple,
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

export default VerifyCode;
