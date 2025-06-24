import EventEmitter from "eventemitter3";
import * as FileSystem from "expo-file-system";
// Global functions/variables

export const Colors = {
  purple: "#FD3A73",
  skin: "#d59563",
  blue_dark: "#263c3f",
  green: "#6b9a76",
  blue_gray: "#38414e",
  blue_dark_2: "#212a37",
  gray: "#9ca5b3",
};

export const mapCustomStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: Colors.purple }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: Colors.skin }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: Colors.blue_dark }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: Colors.green }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: Colors.blue_gray }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: Colors.blue_dark_2 }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: Colors.gray }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#19222E" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: Colors.skin }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

export const SocketEvents = {
  USER_LOCATION: "user/location",
  NEW_MESSAGE: "chat/new-message",
  NEW_PIC_MESSAGE: "chat/new-pic-message",
  NEW_EVENT: "event/new-event",
};

export const eventBus = new EventEmitter();

export const getBase64FromUri = async (uri: string) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (e) {
    console.error("Failed to convert uri to base64:", e);
    return null;
  }
};
