import { View } from "@/components/Themed";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

export default function MapScreen() {
  const { lat, lon } = useLocalSearchParams<{ lat?: string; lon?: string }>();

  const { address, candies } = useLocalSearchParams<{
    address?: string;
    candies?: string;
  }>();
  const addressT = address ? address : "N/A";
  const candiesT = candies ? candies : "N/A";

  const [region, setRegion] = useState<Region>({
    latitude: -37.8199,
    longitude: 144.9834,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    const getLocation = async () => {
      if (lat && lon) {
        setRegion({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          let location = await Location.getCurrentPositionAsync();
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        } else {
          try {
            const response = await fetch("https://ipapi.co/json/");
            const data = await response.json();
            setRegion({
              latitude: data.latitude,
              longitude: data.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          } catch (error) {
            console.log("error fetching rough location");
          }
        }
      }
    };
    getLocation();
  }, [lat, lon]);

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region}>
        <Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
          title={addressT}
          description={candiesT}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
