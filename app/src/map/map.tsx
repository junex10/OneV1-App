import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { Ionicons } from "@expo/vector-icons";
import { GoogleMaps } from "./../../services";
import { CustomModal } from "../../resources";
import { useLocation } from "../../providers/location";
import { mapCustomStyle, Colors } from "../../global";
import Constants from "expo-constants";

const Map: React.FC = () => {
  const router = useRouter();
  const getLocation: any = useLocation();
  const apiKey = Constants.expoConfig?.extra?.GOOGLE_API_KEY;
  const [search, setSearch] = useState("");
  const [loadingInitialModel, setloadingInitialModel] = useState(true);
  const [loadingOnes, setLoadingOnes] = useState(true);
  const [zoom, setZoom] = useState(0.01);
  const mapRef = useRef<MapView>(null);

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
        { duration: 1000 }
      );
    }
  };

  const placesNearby = async () => {
    if (!getLocation?.coords)
      return Alert.alert("We couldn't get your current location");

    console.log(
      {
        latitude: getLocation.coords.latitude,
        longitude: getLocation.coords.longitude,
      },
      "CURRENT COORDS"
    );
    animateZoom(12);

    /*const data = await GoogleMaps.placesNearby({
      latitude: getLocation.coords.latitude,
      longitude: getLocation.coords.longitude,
    });*/

    setLoadingOnes(true);
  };

  useEffect(() => {
    if (!getLocation?.coords)
      return () => {
        <ActivityIndicator size="large" />;
      };
  }, []);

  return (
    <View style={styles.container}>
      {/** LoadingInitialModel */}
      <CustomModal
        visible={loadingInitialModel}
        title="One"
        message="Finding juices one places!"
        onClose={() => setloadingInitialModel(false)}
        timeout={3000}
      />
      {/** loadingOnes */}
      <CustomModal
        visible={loadingOnes}
        title="One"
        message="Finding funny places!"
        onClose={() => setLoadingOnes(false)}
        timeout={3000}
      />

      {/**  Search One */}
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
        ref={mapRef}
        showsBuildings
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
      >
        {/**  Show this when we wanna go that place chose */}
        {/*getLocation?.coords && (
          <MapViewDirections
            strokeColor={Colors.purple}
            strokeWidth={5}
            origin={{
              latitude: getLocation.coords.latitude,
              longitude: getLocation.coords.longitude,
            }}
            destination={{
              latitude: 35.74753,
              longitude: -81.194394,
            }}
            apikey={apiKey}
            onReady={(result) => {
              // This will fit the map to the route with padding
              mapRef.current?.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
                animated: true,
              });
            }}
          />
        )
        <Marker
          coordinate={{
            latitude: 35.74753,
            longitude: -81.194394,
          }}
          title="Destination"
          description="Final destination"
          pinColor={Colors.purple}
        />
        */}
      </MapView>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/home")}
        >
          <Ionicons name="star-outline" size={28} color={Colors.purple} />
          <Text style={styles.navLabel}>Fav</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={placesNearby}>
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
