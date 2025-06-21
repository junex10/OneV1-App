import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import DatePicker from "react-native-date-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors, mapCustomStyle } from "../../../resources/utils/global";
import { useLocation } from "../../../resources/providers/location";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";

interface Picture {
  fileName: string | null | undefined;
  mimeType: string | null | undefined;
  base64: string | null | undefined;
}

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width * 0.82;
const IMAGE_RADIUS = 22;
const defaultZoom = 16;

const getDeltaForZoom = (zoomLevel: number) => 360 / Math.pow(2, zoomLevel); // -> This adjust the zoom level
// Dummy Google Map placeholder (replace with your map component)
const GoogleMapTab = ({
  visible,
  onClose,
  coordinates,
  zoom,
  zoomIn,
  zoomOut,
  onPress,
  selectedCoords,
  mapRef,
}: {
  visible: boolean;
  onClose: () => void;
  coordinates: any;
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  onPress: (item: any) => void;
  selectedCoords: any;
  mapRef: any;
}) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.mapTabContainer}>
      <View style={styles.mapHeader}>
        <TouchableOpacity style={styles.mapBackBtn} onPress={onClose}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.mapHeaderText}>Pick Location</Text>
      </View>
      {/** Zoom control */}
      <View style={{ position: "absolute", top: 140, right: 20, zIndex: 30 }}>
        <TouchableOpacity
          style={{
            backgroundColor: Colors.blue_dark_2,
            borderRadius: 20,
            padding: 10,
            marginBottom: 10,
            alignItems: "center",
          }}
          onPress={zoomIn}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: Colors.blue_dark_2,
            borderRadius: 20,
            padding: 10,
            alignItems: "center",
          }}
          onPress={zoomOut}
        >
          <Ionicons name="remove" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <MapView
        ref={mapRef}
        showsBuildings
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={
          coordinates?.coords
            ? {
                latitude: coordinates.coords.latitude,
                longitude: coordinates.coords.longitude,
                latitudeDelta: getDeltaForZoom(zoom),
                longitudeDelta: getDeltaForZoom(zoom),
              }
            : undefined
        }
        region={
          coordinates?.coords
            ? {
                latitude: coordinates.coords.latitude,
                longitude: coordinates.coords.longitude,
                latitudeDelta: getDeltaForZoom(zoom),
                longitudeDelta: getDeltaForZoom(zoom),
              }
            : undefined
        }
        showsUserLocation={true}
        zoomEnabled={true}
        zoomControlEnabled={false}
        customMapStyle={mapCustomStyle}
        showsMyLocationButton={false}
        onPress={onPress}
      >
        {selectedCoords && (
          <Marker coordinate={selectedCoords} pinColor={Colors.purple} />
        )}
      </MapView>

      {/* Confirm Coordinates Button */}
      {selectedCoords && (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={onClose}
          activeOpacity={0.85}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            Confirm Location
          </Text>
        </TouchableOpacity>
      )}
    </View>
  </Modal>
);

const SecondNewEvent: React.FC = () => {
  const { event } = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);
  const getLocation: any = useLocation();
  const router = useRouter();

  const [mainPic, setMainPic] = useState<Picture | null>(null);
  const [showMainPic, setShowMainPic] = useState<string>();
  const [content, setContent] = useState<string>("");
  const [mapTabVisible, setMapTabVisible] = useState(false);
  const [form, setForm] = useState();

  // Date pickers
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showExpirePicker, setShowExpirePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [expireDate, setExpireDate] = useState<Date | null>(null);

  const [zoom, setZoom] = useState(defaultZoom);
  const [selectedCoords, setSelectedCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [nextEnable, setNextEnable] = useState(false); // will enable next button to continue

  useEffect(() => {
    const eventForm = event ? JSON.parse(event as string) : null;
    setForm(eventForm);

    if (content.length > 0 && mainPic && selectedCoords) {
      setNextEnable(true);
    } else {
      setNextEnable(false);
    }
  }, [content, mainPic, selectedCoords]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selected = result.assets[0];
      setShowMainPic(selected.uri);
      const base64 = await FileSystem.readAsStringAsync(selected.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setMainPic({
        fileName: selected.fileName,
        mimeType: selected.mimeType,
        base64, // send base64 string
      });
    }
  };

  const animateZoom = (newZoom: number) => {
    if (mapRef.current && getLocation?.coords) {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: getLocation.coords.latitude,
            longitude: getLocation.coords.longitude,
          },
          zoom: newZoom,
          altitude: newZoom * 2,
        },
        { duration: 1200 }
      );
    }
  };

  const handleNext = async () => {
    let formData = {};

    if (startDate) {
      formData = {
        starting_event: startDate,
      };
    }
    if (expireDate) {
      formData = {
        ...formData,
        expiration_time: expireDate,
      };
    }

    formData = {
      ...formData,
      main_pic: mainPic,
      content,
      latitude: selectedCoords?.latitude,
      longitude: selectedCoords?.longitude,
    };
    if (nextEnable) {
      router.push({
        pathname: "/src/event/third-new-event",
        params: {
          event: JSON.stringify(formData),
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Pic */}
      <TouchableOpacity
        style={styles.picContainer}
        onPress={pickImage}
        activeOpacity={0.85}
      >
        {mainPic ? (
          <Image source={{ uri: showMainPic }} style={styles.mainPic} />
        ) : (
          <View style={styles.picPlaceholder}>
            <Ionicons name="camera" size={38} color={Colors.purple} />
            <Text style={styles.picPlaceholderText}>Add main picture</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Content Field */}
      <Text style={styles.label}>Event Description</Text>
      <TextInput
        style={styles.bigInput}
        placeholder="Describe your event..."
        placeholderTextColor={Colors.gray}
        value={content}
        onChangeText={(text) => {
          setContent(text);
        }}
        multiline
        numberOfLines={7}
        textAlignVertical="top"
        underlineColorAndroid="transparent"
      />

      <Text style={styles.optionalLabel}>Optional</Text>
      <View style={styles.datesRow}>
        <TouchableOpacity
          style={styles.dateBtnImproved}
          onPress={() => setShowStartPicker(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="calendar" size={20} color={Colors.purple} />
          <Text style={styles.dateBtnTextImproved}>
            {startDate ? startDate.toLocaleString() : "Starting event"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dateBtnImproved}
          onPress={() => setShowExpirePicker(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="calendar-outline" size={20} color={Colors.purple} />
          <Text style={styles.dateBtnTextImproved}>
            {expireDate ? expireDate.toLocaleString() : "Expiration date"}
          </Text>
        </TouchableOpacity>
      </View>

      {/** Start picking modal */}
      <DatePicker
        modal
        open={showStartPicker}
        date={startDate || new Date()}
        minimumDate={new Date()}
        mode="datetime"
        onConfirm={(date) => {
          setShowStartPicker(false);
          setStartDate(date);
        }}
        onCancel={() => setShowStartPicker(false)}
        theme="dark"
      />
      <DatePicker
        modal
        open={showExpirePicker}
        date={expireDate || new Date()}
        minimumDate={new Date()}
        mode="datetime"
        onConfirm={(date) => {
          setShowExpirePicker(false);
          setExpireDate(date);
        }}
        onCancel={() => setShowExpirePicker(false)}
        theme="dark"
      />

      {/* Google Map Button */}
      <TouchableOpacity
        style={styles.mapBtn}
        onPress={() => setMapTabVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="location" size={22} color="#fff" />
        <Text style={styles.mapBtnText}>Pick event location</Text>
      </TouchableOpacity>
      {/* Google Map Tab */}
      <GoogleMapTab
        visible={mapTabVisible}
        onClose={() => setMapTabVisible(false)}
        coordinates={getLocation}
        zoom={defaultZoom}
        zoomIn={() => {
          const newZoom = zoom + 1;
          setZoom(newZoom);
          animateZoom(newZoom);
        }}
        zoomOut={() => {
          const newZoom = zoom - 1;
          setZoom(newZoom);
          animateZoom(newZoom);
        }}
        onPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setSelectedCoords({ latitude, longitude });
        }}
        selectedCoords={selectedCoords}
        mapRef={mapRef}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: width,
          position: "absolute",
          bottom: 32,
          left: 0,
          paddingHorizontal: 28,
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: nextEnable ? Colors.purple : Colors.gray,
            borderRadius: 28,
            paddingHorizontal: 18,
            paddingVertical: 12,
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={!nextEnable}
        >
          <Ionicons name="arrow-forward" size={22} color="#fff" />
          <Text
            style={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: 16,
              marginLeft: 10,
            }}
          >
            Next
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
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
          }}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-undo" size={22} color="#fff" />
          <Text
            style={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: 16,
              marginLeft: 10,
            }}
          >
            Skip
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  confirmButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: Colors.purple,
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  map: {
    width: "100%",
    height: "100%",
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.blue_dark_2,
    paddingHorizontal: 28,
    paddingTop: 38,
    alignItems: "center",
  },
  picContainer: {
    width: width,
    height: IMAGE_SIZE * 0.56,
    borderRadius: IMAGE_RADIUS,
    backgroundColor: Colors.blue_gray,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.purple,
  },
  mainPic: {
    width: "100%",
    height: "100%",
    borderRadius: IMAGE_RADIUS,
    resizeMode: "cover",
  },
  picPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  picPlaceholderText: {
    color: Colors.purple,
    fontWeight: "bold",
    fontSize: 15,
    marginTop: 8,
  },
  label: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    alignSelf: "flex-start",
    marginBottom: 10,
    marginLeft: 2,
  },
  bigInput: {
    width: "100%",
    minHeight: 120,
    backgroundColor: Colors.blue_gray,
    borderRadius: 18,
    color: "#fff",
    fontSize: 17,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: Colors.purple,
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blue_dark,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    alignSelf: "stretch",
    borderWidth: 1,
    borderColor: Colors.purple,
  },
  dateBtnText: {
    color: "#fff",
    fontSize: 15,
    marginLeft: 10,
  },
  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.purple,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 14,
    alignSelf: "center",
    marginTop: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    top: 100,
  },
  mapBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
    letterSpacing: 1,
  },
  // Google Map Tab styles
  mapTabContainer: {
    flex: 1,
    backgroundColor: Colors.blue_dark,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 0,
  },
  mapHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blue_dark_2,
    paddingTop: 48,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 8,
    zIndex: 10,
  },
  mapBackBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  mapHeaderText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    letterSpacing: 1,
  },
  optionalLabel: {
    color: Colors.gray,
    fontSize: 14,
    alignSelf: "flex-start",
    marginBottom: 6,
    marginTop: 2,
    marginLeft: 2,
  },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 16,
    gap: 10, // for spacing between fields
  },
  dateBtnImproved: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blue_gray,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: Colors.purple,
    marginHorizontal: 2,
    shadowColor: Colors.purple,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  dateBtnTextImproved: {
    color: "#fff",
    fontSize: 15,
    marginLeft: 8,
    fontWeight: "bold",
  },
});

export default SecondNewEvent;
