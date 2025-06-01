import { StatusBar } from 'expo-status-bar';
import React, { use, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, Alert, Linking, Platform  } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import { LeafletView } from 'react-native-leaflet-view';
import { useLocation } from '../../providers/location';

const Map: React.FC = () => {

  const router = useRouter();
  const getLocation: any = useLocation();
  
  const [webViewContent, setWebViewContent] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadMap = async () => {
      try {
        const path = require("./../../../assets/leaflet.html");
        const asset = Asset.fromModule(path);
        await asset.downloadAsync();
        const htmlContent = await FileSystem.readAsStringAsync(asset.localUri!);

        if (isMounted) {
          setWebViewContent(htmlContent);
        }
      } catch (error) {
        Alert.alert('Map', JSON.stringify('Error loading map'), [
          {
            text: 'OK', onPress: () => {
              router.replace('./../login/create-account')
            }
          },
        ]);
        console.error('Error loading map:', error);
      }
    };

    loadMap();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!webViewContent) {
    return <ActivityIndicator size="large" />
  }
    return (
      <>
        <LeafletView
          source={{ html: webViewContent }}
          mapCenterPosition={{
            lat: getLocation?.coords.latitude,
            lng: getLocation?.coords.longitude,
          }}
          mapMarkers={[
            {
              position: {
                lat: getLocation?.coords.latitude,
                lng: getLocation?.coords.longitude,
              },
              icon: `<img src='./../../assets/icons/location-services-active-svgrepo-com.svg' />`
            }
          ]}
          doDebug={false}
        />
      </>
    );
  }

  const styles = StyleSheet.create({
    button: {
      fontSize: 20,
      textDecorationLine: 'underline',
      color: '#fff',
    },
  });
  
  export default Map;