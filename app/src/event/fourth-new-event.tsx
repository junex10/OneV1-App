import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { useLocalSearchParams, useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
  Colors,
  eventBus,
  getBase64FromUri,
  mapCustomStyle,
  SocketEvents,
} from "../../../resources/utils/global";
import { Events } from "../../../resources/services";
import { CustomModal, Storage } from "../../../resources/utils";

const DEFAULT_LATITUDE = 37.7749;
const DEFAULT_LONGITUDE = -122.4194;

const FourthNewEvent: React.FC = () => {
  const { event } = useLocalSearchParams();
  const router = useRouter();

  const [form, setForm] = useState<any>();
  const [eventType, setEventType] = useState<any>();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const eventForm = event ? JSON.parse(event as string) : null;
    setForm(eventForm);

    (async () => {
      const getUser = await Storage.get("user");
      setUser(getUser);

      const data = await Events.getEventsTypeById(eventForm?.event_type_id);
      setEventType(data.item);
    })();
  }, []);

  const handleSend = async () => {
    const base64 = await getBase64FromUri(form.main_pic?.uri);
    let formData = {
      ...form,
      user_id: user.user.id,
      main_pic: {
        ...form.main_pic,
        base64,
      },
    };

    try {
      const data = await Events.setEvent(formData);
      await Storage.set("current_event", data);
      router.replace("/src/map/map");
    } catch (e) {
      Alert.alert("An error has ocurred");
    }
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ alignItems: "center" }}
      >
        {/* Header Image with Stats Overlay */}
        <View style={styles.headerImageContainer}>
          <Image
            source={{ uri: form?.main_pic?.uri }}
            style={styles.headerImage}
          />
          <View style={styles.statsOverlay}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>Event</Text>
              <Text style={styles.statLabel}>{eventType?.name}</Text>
            </View>
            {form?.starting_event && (
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {moment(form?.starting_event, [
                    "HH:mm",
                    moment.ISO_8601,
                  ]).format("HH:mm a")}
                </Text>
                <Text style={styles.statLabel}>Starting</Text>
                <Text style={styles.statDate}>
                  {moment(form?.starting_event).format("MMM D, YYYY")}
                </Text>
              </View>
            )}
            {form?.expiration_time && (
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {moment(form?.expiration_time, [
                    "HH:mm",
                    moment.ISO_8601,
                  ]).format("HH:mm a")}
                </Text>
                <Text style={styles.statLabel}>Ending</Text>
                <Text style={styles.statDate}>
                  {moment(form?.expiration_time).format("MMM D, YYYY")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Event Info */}
        <View style={styles.contentContainer}>
          <Text style={styles.eventTitle}>{form?.title}</Text>
          <Text style={styles.eventDescription}>{form?.content}</Text>

          <Text style={styles.eventTitle}>Location of the Event</Text>
          <View style={styles.mapContainer}>
            {/* MapView */}
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              showsBuildings
              initialRegion={{
                latitude: form?.latitude ?? DEFAULT_LATITUDE,
                longitude: form?.longitude ?? DEFAULT_LONGITUDE,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              region={{
                latitude: form?.latitude ?? DEFAULT_LATITUDE,
                longitude: form?.longitude ?? DEFAULT_LONGITUDE,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation={true}
              zoomEnabled={true}
              zoomControlEnabled={false}
              customMapStyle={mapCustomStyle}
              showsMyLocationButton={false}
              pointerEvents="none"
            >
              <Marker
                coordinate={{
                  latitude: form?.latitude ?? DEFAULT_LATITUDE,
                  longitude: form?.longitude ?? DEFAULT_LONGITUDE,
                }}
              />
            </MapView>
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttonRow}>
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
        <TouchableOpacity style={styles.backBtn} onPress={handleSend}>
          <Ionicons name="checkmark" size={22} color="#fff" />
          <Text style={styles.postBtnText}>Post Event</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const HEADER_IMAGE_HEIGHT = 220;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blue_dark_2,
  },
  headerImageContainer: {
    width: "100%",
    height: HEADER_IMAGE_HEIGHT,
    position: "relative",
    marginBottom: 0,
  },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  statsOverlay: {
    position: "absolute",
    bottom: 18,
    left: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 18,
    backgroundColor: "rgba(0,0,0,0.72)",
    paddingVertical: 8,
  },
  statBox: {
    alignItems: "center",
    minWidth: 70,
  },
  statNumber: {
    color: Colors.purple,
    fontWeight: "bold",
    fontSize: 20,
  },
  statLabel: {
    color: "#fff",
    fontSize: 13,
    marginTop: 2,
    opacity: 0.8,
  },
  eventInfo: {
    width: "95%",
    backgroundColor: "#2d3b3f",
    borderRadius: 18,
    padding: 18,
    marginTop: 28,
    marginBottom: 32,
    alignItems: "flex-start",
    elevation: 2,
  },
  contentContainer: {
    width: "100%",
    backgroundColor: Colors.blue_dark_2,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    marginTop: -18,
    alignItems: "flex-start",
    minHeight: 320,
    height: "100%",
  },
  eventTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 8,
  },
  eventDescription: {
    color: Colors.gray,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 32,
  },
  postBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    marginLeft: 12,
    letterSpacing: 1,
  },
  mapContainer: {
    width: "100%",
    height: "50%",
    borderRadius: 22,
    overflow: "hidden",
    marginTop: 0,
    marginBottom: 32,
    alignSelf: "center",
    paddingHorizontal: 0,
    top: 43,
  },
  map: {
    width: "100%",
    height: "100%",
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.purple,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    bottom: 32,
    left: 0,
    paddingHorizontal: 28,
    zIndex: 10,
  },
  statDate: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
});

export default FourthNewEvent;
