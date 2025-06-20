import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../resources/utils/global";

const { width } = Dimensions.get("window");
const IMAGE_WIDTH = width * 0.78;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.56;
const IMAGE_RADIUS = 22;
const server = Constants.expoConfig?.extra?.SERVER;

const FirstNewEvent: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [eventName, setEventName] = useState("");

  const handleForm = () => {
    router.push({
      pathname: "/src/event/second-new-event",
      params: {
        event: JSON.stringify({
          title: eventName,
        }),
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Event</Text>

      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: `${server}img/event_1.jpg`,
          }}
          style={styles.eventImage}
        />
      </View>

      {/* TextInput */}
      <View style={styles.centeredContent}>
        <Text style={styles.title}>Create and manage your event.</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter event name"
          placeholderTextColor={Colors.gray}
          value={eventName}
          onChangeText={setEventName}
          underlineColorAndroid="transparent"
        />
        <View style={styles.inputUnderline} />
      </View>

      {/* Get Started Button */}
      <View style={styles.getStartedRow}>
        <TouchableOpacity
          style={styles.getStartedBtn}
          activeOpacity={0.85}
          onPress={handleForm}
        >
          <View style={styles.getStartedCircle}>
            <Ionicons name="arrow-forward" size={26} color="#fff" />
          </View>
          <Text style={styles.getStartedLabel}>Get started</Text>
        </TouchableOpacity>
      </View>

      {/* X Button */}
      <TouchableOpacity
        style={styles.fabCloseButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Ionicons name="close" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blue_dark_2,
    paddingHorizontal: 28,
    paddingTop: 36,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  header: {
    fontWeight: "bold",
    fontSize: 26,
    alignSelf: "center",
    marginBottom: 24,
    letterSpacing: 1,
    color: Colors.purple,
    opacity: 1,
  },
  imageContainer: {
    width: IMAGE_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  eventImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: IMAGE_RADIUS,
    backgroundColor: Colors.gray,
    resizeMode: "cover",
  },
  imagesRow: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
    flexDirection: "row",
    top: 0,
  },
  leftImageWrapper: {
    display: "none", // Not needed with new imageContainer
  },
  leftImage: {
    display: "none", // Not needed with new imageContainer
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 18,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  input: {
    width: "100%",
    color: "#fff",
    fontSize: 16,
    marginBottom: 0,
    marginTop: 6,
    paddingHorizontal: 0,
    paddingVertical: 8,
    backgroundColor: "transparent",
    borderRadius: 0,
  },
  inputUnderline: {
    width: "100%",
    height: 2,
    backgroundColor: Colors.purple,
    marginBottom: 18,
    borderRadius: 1,
  },
  getStartedRow: {
    position: "absolute",
    left: 28,
    bottom: 44,
    flexDirection: "row",
    alignItems: "center",
  },
  getStartedBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  getStartedCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.purple,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  getStartedLabel: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    marginLeft: 14,
    letterSpacing: 1,
  },
  fabCloseButton: {
    position: "absolute",
    right: 28,
    bottom: 32,
    backgroundColor: Colors.purple,
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  centeredContent: {
    flex: 1,
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "center",
    bottom: 150,
  },
});

export default FirstNewEvent;
