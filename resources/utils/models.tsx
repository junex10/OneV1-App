import React, { useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "./../../resources/utils/global";

interface CustomModalProps {
  visible: boolean;
  iconName?: string;
  iconColor?: string;
  iconSize?: number;
  title?: string;
  message?: string;
  buttons?: Array<{
    label: string;
    onPress: () => void;
    color?: string;
  }>;
  onClose: () => void;
  timeout?: number;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  iconName,
  iconColor = "#FD3A73",
  iconSize = 48,
  title,
  message,
  buttons = [],
  onClose,
  timeout,
  onConfirm,
  confirmText,
  cancelText,
}) => {
  useEffect(() => {
    let timeOut: any;

    if (timeout)
      timeOut = setTimeout(() => {
        onClose();
      }, timeout);

    return () => {
      clearTimeout(timeOut);
    };
  }, [timeout, onClose]);

  const renderButtons = () => {
    if (onConfirm || confirmText || cancelText) {
      return (
        <View style={styles.buttonsRow}>
          {cancelText && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: Colors.gray }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>{cancelText}</Text>
            </TouchableOpacity>
          )}
          {confirmText && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#FD3A73" }]}
              onPress={onConfirm}
            >
              <Text style={styles.buttonText}>{confirmText}</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    // Fallback to custom buttons array
    return (
      <View style={styles.buttonsRow}>
        {buttons.map((btn, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.button, { backgroundColor: btn.color || "#FD3A73" }]}
            onPress={btn.onPress}
          >
            <Text style={styles.buttonText}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {iconName ? (
            <View style={styles.iconContainer}>
              <Ionicons
                name={iconName as any}
                size={iconSize}
                color={iconColor}
              />
            </View>
          ) : null}
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
          {renderButtons()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    backgroundColor: Colors.blue_dark_2,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    position: "relative",
  },
  iconContainer: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2,
  },
  title: {
    marginTop: 28,
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.purple,
    textAlign: "center",
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    marginBottom: 32,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default CustomModal;
