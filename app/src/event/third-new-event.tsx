import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../resources/utils/global";
import { Events } from "../../../resources/services";
import { Storage } from "../../../resources/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import Constants from "expo-constants";

const { width } = Dimensions.get("window");

const EVENT_TYPES = [
  {
    key: "yoga",
    title: "Yoga and Meditation for Beginners",
    image: {
      uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    key: "languages",
    title: "Practice French, English And Chinese",
    image: {
      uri: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    key: "design",
    title: "Adobe XD Live Event in Europe",
    image: {
      uri: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
    },
  },
];

const CARD_HEIGHT = 170; // Increased height
const server = Constants.expoConfig?.extra?.SERVER;

const ThirdNewEvent: React.FC = () => {
  const router = useRouter();
  const { event } = useLocalSearchParams();

  const [form, setForm] = useState<any>();
  const [eventsType, setEventsType] = useState([]);

  useEffect(() => {
    const eventForm = event ? JSON.parse(event as string) : null;
    setForm(eventForm);

    (async () => {
      const data = await Events.getEventsType();
      setEventsType(data?.items);
    })();
  }, []);

  const handleSelect = (event_id: number) => {
    let formData = {};
    formData = {
      ...form,
      event_type_id: event_id,
    };

    router.push({
      pathname: "/src/event/fourth-new-event",
      params: {
        event: JSON.stringify(formData),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Event type</Text>
      <FlatList
        data={eventsType}
        keyExtractor={(item: any) => item?.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => handleSelect(item?.id)}
          >
            <ImageBackground
              source={{
                uri: server + item?.default_pic,
              }}
              style={styles.bg}
              imageStyle={styles.bgImage}
              resizeMode="cover"
            >
              <View style={styles.overlay} />
              <Text style={styles.title}>{item?.name}</Text>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="chevron-forward-circle"
                  size={48}
                  color={Colors.purple}
                  style={styles.icon}
                />
              </View>
            </ImageBackground>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 28 }} />}
      />
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.85}
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
            marginLeft: 10,
          }}
        >
          Back
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blue_dark_2,
    paddingHorizontal: 0,
  },
  screenTitle: {
    color: Colors.purple,
    fontWeight: "bold",
    fontSize: 26,
    alignSelf: "center",
    marginTop: 32,
    marginBottom: 24,
    letterSpacing: 1,
  },
  card: {
    width: width - 32,
    height: CARD_HEIGHT,
    alignSelf: "center",
    borderRadius: 28,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    backgroundColor: Colors.blue_dark,
  },
  bg: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    position: "relative",
  },
  bgImage: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    opacity: 0.44,
    borderRadius: 28,
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    letterSpacing: 0.5,
    zIndex: 2,
    flex: 1,
  },
  iconContainer: {
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 24,
  },
  icon: {
    opacity: 0.92,
  },
  backBtn: {
    position: "absolute",
    bottom: 32,
    left: 24,
    backgroundColor: Colors.purple,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default ThirdNewEvent;
