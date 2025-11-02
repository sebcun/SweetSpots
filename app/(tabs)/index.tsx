import RatingModal from "@/components/RatingModal";
import { View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Spot } from "@/constants/types";
import { loadSpots } from "@/utils/spots";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

interface Ghost {
  id: string;
  position: { latitude: number; longitude: number };
}

export default function MapScreen() {
  const { lat, lon } = useLocalSearchParams<{ lat?: string; lon?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();

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

  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const ghostTimers = useRef<NodeJS.Timeout[]>([]);

  const getRandomNearbyPosition = () => {
    const latOffset = (Math.random() - 0.5) * region.latitudeDelta * 2;
    const lonOffset = (Math.random() - 0.5) * region.longitudeDelta * 2;
    return {
      latitude: region.latitude + latOffset,
      longitude: region.longitude + lonOffset,
    };
  };

  const spawnGhost = () => {
    const id = `ghost-${Date.now()}-${Math.random()}`;
    const startPos = getRandomNearbyPosition();
    const newGhost: Ghost = { id, position: startPos };
    setGhosts((prev) => [...prev, newGhost]);

    let count = 0;
    const interval = setInterval(() => {
      const newPos = getRandomNearbyPosition();
      setGhosts((prev) =>
        prev.map((g) => (g.id === id ? { ...g, position: newPos } : g))
      );
      count++;
      if (count >= 5) {
        clearInterval(interval);
        setGhosts((prev) => prev.filter((g) => g.id !== id));
      }
    }, 1000);
  };

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        spawnGhost();
      }
    }, 5000);

    ghostTimers.current.push(spawnInterval);

    return () => {
      ghostTimers.current.forEach(clearInterval);
      ghostTimers.current = [];
    };
  }, [region]);

  const themedStyles = useMemo(() => {
    const colors = Colors[colorScheme ?? "light"];
    return StyleSheet.create({
      calloutContainer: {
        width: 250,
        padding: 10,
        backgroundColor: colors.background,
        borderRadius: 8,
      },
      calloutTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        color: colors.text,
      },
      calloutDescription: {
        fontSize: 14,
        marginBottom: 5,
        color: colors.text,
      },
      ratingContainer: {
        marginTop: 5,
      },
      ratingText: {
        fontSize: 14,
        marginBottom: 5,
        color: colors.text,
      },
      starsContainer: {
        flexDirection: "row",
      },
      noRatingText: {
        fontSize: 14,
        color: "#888",
      },
      rateButton: {
        marginTop: 10,
        padding: 8,
        backgroundColor: "#eb6223",
        borderRadius: 5,
        alignItems: "center",
      },
      rateButtonText: {
        color: "white",
        fontSize: 14,
      },
    });
  }, [colorScheme]);

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
            image={require("../../assets/images/pumpkin.png")}
            onPress={() => {
              setSelectedSpot(spot);
              setRatingModalVisible(true);
            }}
          />
        ))}
        {ghosts.map((ghost) => (
          <Marker
            key={ghost.id}
            coordinate={ghost.position}
            image={require("../../assets/images/ghost.png")}
          />
        ))}
      </MapView>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/modal")}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
      <RatingModal
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible(false)}
        spot={selectedSpot}
        onRatingSubmitted={loadSpotsData}
      />
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
