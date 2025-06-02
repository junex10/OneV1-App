import { StatusBar } from 'expo-status-bar';
import React, { use, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, Alert, Linking, Platform  } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { LeafletView } from 'react-native-leaflet-view';
import { useLocation } from '../../providers/location';
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { mapCustomStyle } from '../../global';

const Map: React.FC = () => {

  const router = useRouter();
  const getLocation: any = useLocation();


  useEffect(() => {
    
  }, []);

    return (
      <View style={styles.container}>
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
          zoomControlEnabled={true}
          customMapStyle={mapCustomStyle}
        />
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    button: {
      fontSize: 20,
      textDecorationLine: 'underline',
      color: '#fff',
    },
    map: {
      width: '100%',
      height: '100%',
      ...StyleSheet.absoluteFillObject
    },
  });
  
  export default Map;