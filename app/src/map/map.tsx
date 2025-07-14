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
  Dimensions,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { Events } from "./../../../resources/services";
import { CustomModal, Storage } from "../../../resources/utils";
import { useLocation } from "../../../resources/providers/location";
import {
  mapCustomStyle,
  Colors,
  SocketEvents,
} from "./../../../resources/utils/global";
import { socket } from "../../../resources/providers/socket";
import Constants from "expo-constants";

const { width, height } = Dimensions.get("window");
const server = Constants.expoConfig?.extra?.SERVER;

const Map: React.FC = () => {
  const defaultZoom = 16;
  const meterThreshold = 10;

  const router = useRouter();
  const getLocation: any = useLocation();
  const apiKey = Constants.expoConfig?.extra?.GOOGLE_API_KEY;
  const eventsListRef = useRef<FlatList>(null);
  const searchInputRef = useRef<TextInput>(null);

  const [search, setSearch] = useState("");
  const [loadingInitialModel, setloadingInitialModel] = useState(true);
  const [loadingOnes, setLoadingOnes] = useState(true);
  const [heading, setHeading] = useState(0);
  const [events, setEvents] = useState([]);
  const [showDirection, setShowDirection] = useState<boolean>(false); // -> Show message about go to a place
  const [hasArrived, setHasArrived] = useState(false);
  const [currentPlace, setCurrentPlace] = useState<any>(null); // -> will store the place selected to ride
  const [currentRide, setCurrentRide] = useState(false); // -> will indicate whenever you're on the road to currentPlace
  const [showArrivedModal, setShowArrivedModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [seekingEvent, setSeekingEvent] = useState<boolean>(false); // -> will indicate whenever the user is in process of seek an event and hide tab bar
  const [zoom, setZoom] = useState(defaultZoom);
  const [eventCreated, setEventCreated] = useState(false); // -> will show a modal when you create an event
  const [showSearchTab, setShowSearchTab] = useState(false);
  const [eventsList, setEventsList] = useState([]); // -> will contain a list of events to show when you're searching in the search bar
  const [searchEditable, setSearchEditable] = useState<boolean>(true); // will control the editable of the search bar
  const [newEventCreated, setNewEventCreated] = useState<boolean>(false); // When we create a new event, we'll skip the left event thing
  const [routeInfo, setRouteInfo] = useState<any>(null);

  const mapRef = useRef<MapView>(null);

  const getDeltaForZoom = (zoomLevel: number) => 360 / Math.pow(2, zoomLevel); // -> This adjust the zoom level

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

    if (events.length > 0) {
      // We reset the values if we already looked up places
      setCurrentEvent(currentPlace); // -> We store the current event for future references

      setCurrentPlace(null); // -> Current place
      setCurrentRide(false); // -> We set in false to show normal map
      setShowDirection(false); // -> We close the direction
      setSeekingEvent(false); // we reset the seeking event cuz we're not seeking anymore

      const removingEvents = events.filter(
        (item: any) => item?.id == currentPlace?.id
      );
      setEvents(removingEvents); // -> We remove every other marker but the one selected

      animateZoom(defaultZoom);
      setZoom(defaultZoom); // -> We update our current zoom
      return;
    }

    console.log(
      {
        latitude: getLocation.coords.latitude,
        longitude: getLocation.coords.longitude,
      },
      "CURRENT COORDS"
    );
    animateZoom(12);
    setZoom(12); // -> We update our current zoom

    const data = await Events.getEvents({
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
    setCurrentRide(false); // -> We set in false to show normal map
    setShowDirection(true);
    setHasArrived(false);
    setCurrentPlace(eventData);
    setSeekingEvent(true);
  };

  const acceptRide = async (ride: boolean) => {
    setShowDirection(false);
    if (!ride) {
      // We remove the path and final destination
      setCurrentPlace(null);
      setHasArrived(true);
      setCurrentRide(false);
      setEvents([]);
      // We restart the zoom
      animateZoom(defaultZoom);
      setSeekingEvent(false);

      return;
    }

    // If yes we change the perspective of the map and we road

    setCurrentRide(true);
  };

  const searchOne = async (text: string) => {
    setSearch(text);

    const data = await Events.getEvents({
      latitude: getLocation.coords.latitude,
      longitude: getLocation.coords.longitude,
      search: text,
    });
    setEventsList(data?.places);
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription;
    (async () => {
      subscription = await Location.watchHeadingAsync((data) => {
        setHeading(data.trueHeading ?? data.magHeading ?? 0);
      });
    })();

    return () => {
      subscription && subscription.remove();
    };
  }, []);

  useEffect(() => {
    // We verify if we have logged in

    (async () => {
      const getUser = await Storage.get("user");
      setUser(getUser);
    })();

    if (!getLocation?.coords)
      return () => {
        <ActivityIndicator size="large" />;
      };

    // We detect when they arrived at the place chosen
    if (
      getLocation?.coords &&
      !hasArrived &&
      getDistanceFromLatLonInMeters(
        getLocation.coords.latitude,
        getLocation.coords.longitude,
        Number(currentPlace?.latitude),
        Number(currentPlace?.longitude)
      ) <= meterThreshold // 10 meters threshold
    ) {
      //IF we joined, we must register the user on event users in db, we send a socket

      socket?.emit(SocketEvents.EVENTS.USER_JOINING, {
        user_id: user?.user.id,
        event_id: currentPlace?.id,
      });

      // We have to reset the values once the user arrives
      setCurrentEvent(currentPlace); // -> We store the current event for future references
      setHasArrived(true);
      setShowArrivedModal(true);

      setCurrentPlace(null); // -> Current place
      setCurrentRide(false); // -> We set in false to show normal map
      setShowDirection(false); // -> We close the direction
      setSeekingEvent(false); // we reset the seeking event cuz we're not seeking anymore

      const removingEvents = events.filter(
        (item: any) => item?.id == currentPlace?.id
      );
      setEvents(removingEvents); // -> We remove every other marker but the one selected

      animateZoom(defaultZoom);
    }

    // LEFT the event: if currentEvent is set, but user is now outside the threshold
    if (
      getLocation?.coords &&
      getDistanceFromLatLonInMeters(
        getLocation.coords.latitude,
        getLocation.coords.longitude,
        Number(currentEvent?.latitude),
        Number(currentEvent?.longitude)
      ) > meterThreshold
    ) {
      // We verify first if we create a new event, to avoid any error
      if (!newEventCreated) {
        //IF we left, we must delete the user on event users left in db, we send a socket

        socket?.emit(SocketEvents.EVENTS.USER_LEFT, {
          user_id: user?.user.id,
          event_id: currentEvent?.id,
        });

        const removingEvents = events.filter(
          (item: any) => item?.id == currentPlace?.id
        );
        setEvents(removingEvents); // -> We remove every other marker but the one selected

        setCurrentEvent(null); // -> Will set off the currentEvent because you just walk away from it
      }
    }
  }, [getLocation?.coords, hasArrived, currentEvent]);

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

      {/**  Modal that pop up once you create a new event */}

      <CustomModal
        visible={eventCreated}
        title="Event created!"
        message="You have created an new event!."
        onClose={() => setEventCreated(false)}
        timeout={4000}
      />

      {/**  Search One */}
      {/** Hiden it when we are on a route */}
      {!hasArrived && !currentRide && (
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={Colors.gray}
              style={{ marginRight: 10 }}
            />
            <TextInput
              ref={searchInputRef}
              style={styles.searchBarInput}
              placeholder="Find your One"
              value={search}
              placeholderTextColor={Colors.gray}
              underlineColorAndroid="transparent"
              onFocus={() => {
                setShowSearchTab(true);
                setSearchEditable(false);
              }}
              onBlur={() => {
                setShowSearchTab(true);
                setSearchEditable(false);
              }}
              editable={searchEditable}
            />
          </View>
        </View>
      )}

      {/**  Event search tab */}
      {showSearchTab && (
        <View style={styles.fullScreenTab}>
          {/* Search bar at the top of the tab */}
          <View style={styles.tabSearchBarContainer}>
            <View style={styles.tabSearchBar}>
              <Ionicons
                name="search"
                size={20}
                color={Colors.gray}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.tabSearchBarInput}
                placeholder="Search events"
                value={search}
                onChangeText={searchOne}
                placeholderTextColor={Colors.gray}
                underlineColorAndroid="transparent"
                autoFocus
              />
            </View>
          </View>
          <FlatList
            data={eventsList}
            keyExtractor={(item: any, idx) =>
              item.id?.toString() || idx.toString()
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.eventCard}
                onPress={() => {
                  setShowSearchTab(false);
                  setSearchEditable(true);
                  getEvent(item);
                }}
                activeOpacity={0.9}
              >
                <View style={styles.eventCardContent}>
                  <Text style={styles.eventCardTitle} numberOfLines={2}>
                    {item.content}
                  </Text>
                  {/* People avatars row */}
                  {item.people && item.people.length > 0 && (
                    <View style={styles.eventCardPeopleRow}>
                      {item?.people
                        .slice(0, 5)
                        .map((person: any, idx: number) => (
                          <Image
                            key={person?.id || idx}
                            source={{
                              uri: person?.photo
                                ? `${server}storage/${person?.photo}`
                                : `${server}img/random_location.jpg`,
                            }}
                            style={[
                              styles.eventCardPersonAvatar,
                              { marginLeft: idx === 0 ? 0 : -12 },
                            ]}
                            resizeMode="cover"
                          />
                        ))}
                      {item?.people?.length > 5 && (
                        <View style={styles.eventCardMorePeople}>
                          <Text style={styles.eventCardMorePeopleText}>
                            +{item?.people?.length - 5}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  <View style={styles.eventCardFooter}>
                    <Image
                      source={{
                        uri: item.main_pic
                          ? `${server}storage/${item.main_pic}`
                          : `${server}img/random_location.jpg`,
                      }}
                      style={styles.eventCardAvatar}
                      resizeMode="cover"
                    />
                    <Text style={styles.eventCardAddress} numberOfLines={1}>
                      {item.address}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ padding: 24, paddingTop: 80 }}
            showsVerticalScrollIndicator={false}
          />
          {/* Floating close button at bottom right */}
          <TouchableOpacity
            style={styles.fabCloseButton}
            onPress={() => {
              setShowSearchTab(false);
              setSearchEditable(true);
              searchInputRef.current?.blur();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      {!currentPlace && (
        <View style={{ position: "absolute", top: 140, right: 20, zIndex: 30 }}>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.blue_dark_2,
              borderRadius: 20,
              padding: 10,
              marginBottom: 10,
              alignItems: "center",
            }}
            onPress={() => {
              const newZoom = zoom + 1;
              setZoom(newZoom);
              animateZoom(newZoom);
            }}
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
            onPress={() => {
              const newZoom = zoom - 1;
              setZoom(newZoom);
              animateZoom(newZoom);
            }}
          >
            <Ionicons name="remove" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

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
                latitudeDelta: getDeltaForZoom(defaultZoom),
                longitudeDelta: getDeltaForZoom(defaultZoom),
              }
            : undefined
        }
        region={
          getLocation?.coords
            ? {
                latitude: getLocation.coords.latitude,
                longitude: getLocation.coords.longitude,
                latitudeDelta: getDeltaForZoom(defaultZoom),
                longitudeDelta: getDeltaForZoom(defaultZoom),
              }
            : undefined
        }
        showsUserLocation={true}
        zoomEnabled={true}
        zoomControlEnabled={false}
        customMapStyle={mapCustomStyle}
        showsMyLocationButton={false}
      >
        {/**  Show this when we wanna go that place chosen */}
        {currentPlace && !hasArrived && getLocation?.coords && (
          <MapViewDirections
            strokeColor={Colors.purple}
            strokeWidth={5}
            origin={{
              latitude: getLocation.coords.latitude,
              longitude: getLocation.coords.longitude,
            }}
            destination={{
              latitude: Number(currentPlace?.latitude),
              longitude: Number(currentPlace?.longitude),
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
            Number(currentPlace?.latitude),
            Number(currentPlace?.longitude)
          ) > meterThreshold && ( // 10 meters threshold
            <Marker
              coordinate={{
                latitude: Number(currentPlace?.latitude),
                longitude: Number(currentPlace?.longitude),
              }}
              title={currentPlace?.content}
              description={currentPlace?.likes.toString()}
              pinColor={Colors.purple}
              zIndex={999}
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
              latitude: Number(currentPlace?.latitude),
              longitude: Number(currentPlace?.longitude),
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
              // Calculate arrival time
              const now = new Date();
              const arrival = new Date(now.getTime() + result.duration * 60000);
              const arrivalStr = arrival.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              setRouteInfo({
                duration: result.duration,
                distance: result.distance,
                arrival: arrivalStr,
              });
            }}
          />
        )}

        {/**  All the places around generated */}
        {events.length > 0 && (
          <>
            {events.map((itemPlace: any, index) => (
              <Marker
                coordinate={{
                  latitude: Number(itemPlace?.latitude),
                  longitude: Number(itemPlace?.longitude),
                }}
                title={itemPlace?.content}
                pinColor={Colors.purple}
                zIndex={999}
                key={`event_displayed_${index}`}
              />
            ))}
          </>
        )}
      </MapView>

      {/** We show the information of the trip here */}
      {routeInfo && currentRide && !hasArrived && (
        <View style={styles.rideInformationTab}>
          <View>
            <Text
              style={{ color: Colors.gray, fontWeight: "bold", fontSize: 16 }}
            >
              ETA: {Math.round(routeInfo.duration)} min
            </Text>
            <Text style={{ color: Colors.gray, fontSize: 15 }}>
              Distance: {(routeInfo.distance * 0.621371).toFixed(2)} mi
            </Text>
            <Text style={{ color: Colors.gray, fontSize: 15 }}>
              Arrival: {routeInfo.arrival}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setCurrentRide(false);
              setShowDirection(false);
              setRouteInfo(null);
              setHasArrived(false);
              setCurrentPlace(null);
              setEvents([]);
              animateZoom(defaultZoom);
              setSeekingEvent(false);
            }}
            style={{
              backgroundColor: Colors.purple,
              borderRadius: 20,
              padding: 10,
              marginLeft: 16,
            }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {showDirection && (
        <View style={styles.destinationConfirm}>
          <Text style={styles.destinationConfirmText}>
            Are you sure you want to go to this one place?
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
      {!seekingEvent && (
        <View style={styles.fabNavContainer}>
          {user && (
            <TouchableOpacity
              style={styles.fabNavItem}
              onPress={() => router.push("/src/chat/friends-list")} // -> We redirect to our friends list
            >
              <Ionicons name="people-outline" size={34} color={Colors.purple} />
            </TouchableOpacity>
          )}
          {user && ( // We must verify that there isnt any event on going, if there is any, we hide the button
            <>
              <TouchableOpacity
                style={styles.fabNavItem}
                onPress={placesNearby}
              >
                <Ionicons
                  name="location-outline"
                  size={28}
                  color={Colors.purple}
                />
              </TouchableOpacity>
              {/** -> Add new event, show button where you arent in a current event, you need to log in first */}
              <TouchableOpacity
                style={styles.fabNavCenter}
                onPress={() => router.push("src/event/first-new-event")}
              >
                <Ionicons name="add-outline" size={28} color={"#fff"} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.fabNavItem}
                onPress={() => router.push("src/event/current-event-list")}
              >
                <Ionicons
                  name="diamond-outline"
                  size={28}
                  color={Colors.purple}
                />
              </TouchableOpacity>
            </>
          )}
          {!user ? (
            <TouchableOpacity
              style={styles.fabNavItem}
              onPress={() => router.push("/src/login/login")}
            >
              <Ionicons name="log-in-outline" size={28} color={Colors.purple} />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.fabNavItem}
                onPress={() => router.push("/src/profile/profile")}
              >
                <Ionicons
                  name="person-outline"
                  size={28}
                  color={Colors.purple}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
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
  fabNavContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    flexDirection: "row",
    backgroundColor: Colors.blue_dark_2,
    borderRadius: 40,
    height: 70,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 20,
  },
  fabNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fabNavCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.purple,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
    elevation: 10,
    shadowColor: Colors.purple,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBarContainer: {
    position: "absolute",
    top: 80,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blue_dark_2,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  searchBarInput: {
    flex: 1,
    color: Colors.gray,
    fontSize: 16,
    padding: 0,
    backgroundColor: "transparent",
  },
  searchTab: {
    position: "absolute",
    top: height / 3.5, // just below the search bar
    left: 2,
    right: 16,
    backgroundColor: Colors.blue_dark,
    borderRadius: 18,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 30,
    maxHeight: 320,
    width: width,
  },
  placeMarker: {
    backgroundColor: Colors.blue_dark_2,
    padding: 5,
    borderRadius: 24,
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
  fullScreenTab: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.blue_dark,
    zIndex: 50,
    justifyContent: "flex-start",
  },
  eventCard: {
    backgroundColor: Colors.blue_dark_2,
    borderRadius: 24,
    marginBottom: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  eventCardContent: {
    flexDirection: "column",
  },
  eventCardTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 18,
  },
  eventCardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventCardAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 2,
    borderColor: Colors.purple,
    backgroundColor: Colors.gray,
  },
  eventCardAddress: {
    color: Colors.gray,
    fontSize: 15,
    flex: 1,
  },
  tabSearchBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Colors.blue_dark,
    paddingTop: 32,
    paddingBottom: 12,
    paddingHorizontal: 24,
  },
  tabSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blue_dark_2,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  tabSearchBarInput: {
    flex: 1,
    color: Colors.gray,
    fontSize: 16,
    padding: 0,
    backgroundColor: "transparent",
  },
  fabCloseButton: {
    position: "absolute",
    bottom: 32,
    right: 32,
    backgroundColor: Colors.purple,
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 100,
  },
  eventCardPeopleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 2,
  },
  eventCardPersonAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.blue_dark,
    backgroundColor: Colors.gray,
  },
  eventCardMorePeople: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.purple,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -12,
    borderWidth: 2,
    borderColor: Colors.blue_dark,
  },
  eventCardMorePeopleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  rideInformationTab: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.blue_dark_2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 24,
    zIndex: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 120,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
  },
});

export default Map;
