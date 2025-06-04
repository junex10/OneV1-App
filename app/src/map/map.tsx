import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { GoogleMaps } from "./../../services";
import { CustomModal } from "../../resources";
import { useLocation } from "../../providers/location";
import { mapCustomStyle, Colors } from "../../global";
import Constants from "expo-constants";

const Map: React.FC = () => {
  const defaultZoom = 16;
  const meterThreshold = 10;

  const router = useRouter();
  const getLocation: any = useLocation();
  const apiKey = Constants.expoConfig?.extra?.GOOGLE_API_KEY;
  const [search, setSearch] = useState("");
  const [loadingInitialModel, setloadingInitialModel] = useState(true);
  const [loadingOnes, setLoadingOnes] = useState(true);
  const [heading, setHeading] = useState(0);
  const [events, setEvents] = useState([]);
  const [zoom, setZoom] = useState(0.01);
  const [showDirection, setShowDirection] = useState<boolean>(false); // -> Show message about go to a place
  const [hasArrived, setHasArrived] = useState(false);
  const [currentPlace, setCurrentPlace] = useState(null); // -> will store the place selected to ride
  const [currentRide, setCurrentRide] = useState(false); // -> will indicate whenever you're on the road to currentPlace
  const [showArrivedModal, setShowArrivedModal] = useState(false);

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
        { duration: 1200 }
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

    const data = await GoogleMaps.getEvents({
      latitude: getLocation.coords.latitude,
      longitude: getLocation.coords.longitude,
    });

    setEvents(data?.places);

    setLoadingOnes(true);
  };

  // Calculate distance in meters between two coordinates to display off the marker
  const getDistanceFromLatLonInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371000; // Radius of the earth in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  const getEvent = async (eventData: any) => {
    setShowDirection(true);
    setCurrentPlace(eventData);
    console.log(eventData);
  };

  const acceptRide = async (ride: boolean) => {
    setShowDirection(false);
    if (!ride) {
      // We remove the path and final destination
      setCurrentPlace(null);
      setHasArrived(true);

      // We restart the zoom
      animateZoom(defaultZoom);

      return;
    }

    // If yes we change the perspective of the map and we road

    setCurrentRide(true);
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription;
    (async () => {
      subscription = await Location.watchHeadingAsync((data) => {
        setHeading(data.trueHeading ?? data.magHeading ?? 0);
      });
    })();

    if (!getLocation?.coords)
      return () => {
        <ActivityIndicator size="large" />;
      };

    // We detect when they arrived at the place chose
    if (
      getLocation?.coords &&
      !hasArrived &&
      getDistanceFromLatLonInMeters(
        getLocation.coords.latitude,
        getLocation.coords.longitude,
        35.74753,
        -81.194394
      ) <= meterThreshold // 10 meters threshold
    ) {
      // We have to reset the values once the user arrives
      setHasArrived(true);
      setShowArrivedModal(true);

      setCurrentPlace(null); // -> Current place
      setCurrentRide(false); // -> We set in false to show normal map
      setShowDirection(false); // -> We close the direction

      animateZoom(defaultZoom);
    }

    return () => {
      subscription && subscription.remove();
    };
  }, [getLocation?.coords, hasArrived]);

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

      {/**  When you arrived to your one place */}

      <CustomModal
        visible={showArrivedModal}
        title="You have arrived!"
        message="Welcome to your destination."
        onClose={() => setShowArrivedModal(false)}
        timeout={4000}
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
                latitudeDelta: zoom,
                longitudeDelta: zoom,
              }
            : undefined
        }
        region={
          getLocation?.coords
            ? {
                latitude: getLocation.coords.latitude,
                longitude: getLocation.coords.longitude,
                latitudeDelta: zoom,
                longitudeDelta: zoom,
              }
            : undefined
        }
        showsUserLocation={true}
        zoomEnabled={true}
        zoomControlEnabled={false}
        customMapStyle={mapCustomStyle}
      >
        {/**  Show this when we wanna go that place chose */}
        {currentPlace && !hasArrived && getLocation?.coords && (
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
        )}
        {currentPlace &&
          !hasArrived &&
          getLocation?.coords &&
          getDistanceFromLatLonInMeters(
            getLocation.coords.latitude,
            getLocation.coords.longitude,
            35.74753,
            -81.194394
          ) > meterThreshold && ( // 10 meters threshold
            <Marker
              coordinate={{
                latitude: 35.74753,
                longitude: -81.194394,
              }}
              title="Destination"
              description="Final destination"
              pinColor={Colors.purple}
            />
          )}

        {/** When you're driving to the place change the angle */}

        {!hasArrived && currentRide && getLocation?.coords && (
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
              if (result.coordinates.length > 1) {
                const next = result.coordinates[0];
                mapRef.current?.animateCamera(
                  {
                    center: next,
                    pitch: 60,
                    heading,
                    zoom: 20,
                    altitude: 300,
                  },
                  { duration: 100 }
                );
              }
            }}
          />
        )}

        {/**  All the places around generated */}
        {events.length > 0 ? (
          <>
            {events.map((itemPlace: any, index) => (
              <Marker
                key={`event_marker_${index}`}
                coordinate={{
                  latitude: Number(itemPlace?.latitude),
                  longitude: Number(itemPlace?.longitude),
                }}
                title={itemPlace?.content}
                pinColor={Colors.purple}
                onPress={() => getEvent(itemPlace)}
              >
                <View style={styles.placeMarker}>
                  {itemPlace?.main_pic ? (
                    <Image
                      source={{ uri: itemPlace?.icon }}
                      style={styles.placeMarkerImg}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={Colors.purple}
                    />
                  )}
                </View>
              </Marker>
            ))}
          </>
        ) : (
          <></>
        )}
        {/*
          <Marker
            coordinate={{
              latitude: 35.3074169,
              longitude: -80.73521219999999,
            }}
            title="Destination"
            description="Final destination"
            pinColor={Colors.purple}
          />
        */}
      </MapView>
      {showDirection && (
        <View style={styles.destinationConfirm}>
          <Text style={styles.destinationConfirmText}>
            Are you sure you want to go to this final destination?
          </Text>
          <View style={styles.destinationConfirmButtons}>
            <TouchableOpacity
              style={styles.destinationConfirmBtn}
              onPress={() => acceptRide(true)}
            >
              <Text style={styles.destinationConfirmBtnText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.destinationConfirmBtn,
                { backgroundColor: Colors.gray },
              ]}
              onPress={() => acceptRide(false)}
            >
              <Text style={styles.destinationConfirmBtnText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  placeMarker: {
    backgroundColor: Colors.blue_dark_2,
    padding: 5,
    borderRadius: 24,
  },
  placeMarkerImg: {
    width: 20,
    height: 20,
    tintColor: Colors.purple,
  },
  placesContainer: {
    padding: 500,
  },
  destinationConfirm: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 80,
    backgroundColor: Colors.blue_dark_2,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    zIndex: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  destinationConfirmText: {
    color: Colors.gray,
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  destinationConfirmButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  destinationConfirmBtn: {
    flex: 1,
    backgroundColor: Colors.purple,
    borderRadius: 8,
    paddingVertical: 10,
    marginHorizontal: 8,
    alignItems: "center",
  },
  destinationConfirmBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Map;
