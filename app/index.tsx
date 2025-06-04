import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";

const Index: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    let timeOut;

    timeOut = setTimeout(() => {
      router.replace("/src/map/map");
    }, 1000);

    return () => {
      if (timeOut) clearTimeout(timeOut);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>One</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: "white",
    fontSize: 30,
  },
  titleContainer: {
    backgroundColor: "#25292e",
    padding: 20,
  },
  buttonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    top: "18%",
  },
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
  },
  button: {
    fontSize: 20,
    color: "#fff",
    backgroundColor: "#FD3A73",
    marginTop: 20,
    padding: 10,
    borderRadius: 25,
    width: "90%",
    textAlign: "center",
  },
});

export default Index;
