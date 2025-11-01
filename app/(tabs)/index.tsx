import { View } from "@/components/Themed";
import { Spot } from "@/constants/types";
import { loadSpots } from "@/utils/spots";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

export default function MapScreen() {
  const { lat, lon } = useLocalSearchParams<{ lat?: string; lon?: string }>();
  const router = useRouter();

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

  const [spots, setSpots] = useState<Spot[]>([]);

  const loadSpotsData = async () => {
    const data = await loadSpots();
    setSpots(data);
  };

  useEffect(() => {
    loadSpotsData();
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
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{
              latitude: spot.lat,
              longitude: spot.lon,
            }}
            title={spot.address}
            description={spot.candies}
            image={require("../../assets/images/pumpkin.png")}
          />
        ))}
      </MapView>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/modal")}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
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
  fab: {
    position: "absolute",
    bottom: 23,
    right: 18,
    backgroundColor: "#eb6223",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
