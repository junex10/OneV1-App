import { StatusBar } from "expo-status-bar";
import React, { use, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { LeafletView } from "react-native-leaflet-view";
import { useLocation } from "../../providers/location";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { mapCustomStyle, Colors } from "../../global";
import { Ionicons } from "@expo/vector-icons";

const Map: React.FC = () => {
  const router = useRouter();
  const getLocation: any = useLocation();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!getLocation?.coords)
      return () => {
        <ActivityIndicator size="large" />;
      };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Find your One"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={Colors.gray}
        />
      </View>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={
          getLocation?.coords
            ? {
                latitude: getLocation.coords.latitude,
                longitude: getLocation.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : undefined
        }
        region={
          getLocation?.coords
            ? {
                latitude: getLocation.coords.latitude,
                longitude: getLocation.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : undefined
        }
        showsUserLocation={true}
        zoomEnabled={true}
        zoomControlEnabled={false}
        customMapStyle={mapCustomStyle}
      />
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/home")}
        >
          <Ionicons name="star-outline" size={28} color={Colors.purple} />
          <Text style={styles.navLabel}>Fav</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/map")}
        >
          <Ionicons name="location-outline" size={28} color={Colors.purple} />
          <Text style={styles.navLabel}>One</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/profile")}
        >
          <Ionicons name="person-outline" size={28} color={Colors.purple} />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
  map: {
    width: "100%",
    height: "100%",
    ...StyleSheet.absoluteFillObject,
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    flexDirection: "row",
    backgroundColor: Colors.blue_dark_2,
    borderTopWidth: 1,
    borderTopColor: Colors.gray,
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  searchBarContainer: {
    position: "absolute",
    top: 80,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  searchBar: {
    backgroundColor: Colors.blue_dark_2,
    color: Colors.gray,
    borderRadius: 24,
    paddingHorizontal: 25,
    paddingVertical: 15,
    fontSize: 16,
    elevation: 2,
    shadowColor: Colors.gray,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
});

export default Map;
