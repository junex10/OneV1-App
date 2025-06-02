import axios from 'axios';
import { Coordinates } from './../interfaces'
import Constants from 'expo-constants';

const API = Constants.expoConfig?.extra?.API;

const GoogleMaps = {
    placesNearby: async (coordinates: Coordinates) => {
        try {
            const response = await axios.post(`${API}app/map/placesNearby`, coordinates);
            return response.data;
        } catch (error) {
            console.error('Error fetching places:', error);
            throw error;
        }
    }
}

export default GoogleMaps;