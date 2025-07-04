import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Colors } from "../resources/utils";

const server = Constants.expoConfig?.extra?.SERVER;

const Index: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    let timeOut;
    timeOut = setTimeout(() => {
      router.replace("/src/map/map");
    }, 3000);
    return () => {
      if (timeOut) clearTimeout(timeOut);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.confettiBg}>
        <Text style={styles.title}>
          Create &amp; find{"\n"}events in one place!
        </Text>
      </View>
      <View style={styles.centerContent}>
        <View style={styles.illustrationWrapper}>
          <Image
            source={{ uri: `${server}img/one_main_1.png` }}
            style={styles.illustration}
            resizeMode="contain"
            // Uncomment the next line if your image supports tintColor (monochrome SVG/PNG)
            // tintColor={Colors.blue_dark_2}
          />
        </View>
      </View>
      <Text style={styles.subtitle}>
        Discover, create, and join amazing events around you. One brings people
        together for parties, meetups, and unforgettable experiences—all in one
        place!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: Colors.blue_dark_2,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  illustrationContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 0,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 0,
    zIndex: 2,
  },
  button: {
    backgroundColor: "#FD3A73",
    borderRadius: 28,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  confettiBg: {
    width: "100%",
    height: 180,
    backgroundColor: "#25292e",
    borderBottomRightRadius: 80,
    borderBottomLeftRadius: 80,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 18,
    zIndex: 1,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    // Shadow for Android
    elevation: 16,
  },
  subtitle: {
    color: "#bfc8d6", // lighter for contrast
    fontSize: 15,
    textAlign: "center",
    marginHorizontal: 28,
    marginTop: 12,
    marginBottom: 24,
  },
  illustrationWrapper: {
    backgroundColor: Colors.blue_dark_2,
    borderRadius: 18,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: 320,
    height: 260,
    borderRadius: 12,
    zIndex: 2,
    // tintColor: Colors.blue_dark_2, // Uncomment if your image supports tintColor
  },
});

export default Index;
