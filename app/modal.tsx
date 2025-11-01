import { Text, View } from "@/components/Themed";
import { COMMON_CANDIES } from "@/constants/types";
import { addSpot, getUserIP } from "@/utils/spots";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

export default function AddSpotModal() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [selectedCandies, setSelectedCandies] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [region, setRegion] = useState<Region>({
    latitude: -37.8199,
    longitude: 144.9834,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [markerPosition, setMarkerPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initializeLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync();
        const initialRegion = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(initialRegion);
        setMarkerPosition({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
        await reverseGeocode({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      } else {
        try {
          const response = await fetch("https://ipapi.co/json/");
          const data = await response.json();
          const fallbackRegion = {
            latitude: data.latitude,
            longitude: data.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
          setRegion(fallbackRegion);
          setMarkerPosition({
            latitude: data.latitude,
            longitude: data.longitude,
          });
          setLocation({ lat: data.latitude, lon: data.longitude });
          await reverseGeocode({
            latitude: data.latitude,
            longitude: data.longitude,
          });
        } catch (error) {
          Alert.alert(
            "Location Unavailable",
            "Unable to get location. Please tap on the map to select a spot."
          );
        }
      }
    };
    initializeLocation();
  }, []);

  const reverseGeocode = async (coord: {
    latitude: number;
    longitude: number;
  }) => {
    setIsReverseGeocoding(true);
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: coord.latitude,
        longitude: coord.longitude,
      });
      if (addresses.length > 0) {
        setAddress(addresses[0].name || "");
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
    setIsReverseGeocoding(false);
  };

  const forwardGeocode = async (addr: string) => {
    try {
      const geocoded = await Location.geocodeAsync(addr);
      if (geocoded.length > 0) {
        const coord = {
          latitude: geocoded[0].latitude,
          longitude: geocoded[0].longitude,
        };
        setMarkerPosition(coord);
        setLocation({ lat: coord.latitude, lon: coord.longitude });
        setRegion({
          ...region,
          latitude: coord.latitude,
          longitude: coord.longitude,
        });
      }
    } catch (error) {
      console.error("Error forward geocoding:", error);
    }
  };

  const handleAddressChange = (text: string) => {
    setAddress(text);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (!isReverseGeocoding && text.trim()) {
        forwardGeocode(text);
      }
    }, 1000);
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setMarkerPosition(coordinate);
    setLocation({ lat: coordinate.latitude, lon: coordinate.longitude });
    reverseGeocode(coordinate);
  };

  const toggleCandy = (candy: string) => {
    setSelectedCandies((prev) =>
      prev.includes(candy) ? prev.filter((c) => c !== candy) : [...prev, candy]
    );
  };

  const handleSave = async () => {
    if (!address.trim() || selectedCandies.length === 0 || !location) {
      Alert.alert(
        "Incomplete",
        "Please select a location on the map and at least one candy."
      );
      return;
    }
    const ip = await getUserIP();
    const newSpot = await addSpot({
      address: address.trim(),
      candies: selectedCandies.join(", "),
      lat: location.lat,
      lon: location.lon,
      ip,
    });
    if (newSpot) {
      Alert.alert("Success", "Spot added!");
      router.back();
    } else {
      Alert.alert("Error", "Failed to add spot. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.modalTitle}>Add a Sweet Spot</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <MapView
        style={styles.map}
        region={region}
        onPress={handleMapPress}
        onRegionChangeComplete={setRegion}
      >
        {markerPosition && (
          <Marker
            coordinate={markerPosition}
            title="Selected Spot"
            description="Drag to adjust or edit address below"
            draggable
            onDragEnd={(e) => {
              const coord = e.nativeEvent.coordinate;
              setMarkerPosition(coord);
              setLocation({ lat: coord.latitude, lon: coord.longitude });
              reverseGeocode(coord);
            }}
          />
        )}
      </MapView>
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={handleAddressChange}
      />
      <Text style={styles.subtitle}>Select Candies:</Text>
      <FlatList
        data={COMMON_CANDIES}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.candyItem}
            onPress={() => toggleCandy(item)}
          >
            <Text style={styles.candyText}>
              {selectedCandies.includes(item) ? "✓ " : ""}
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Spot</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  map: {
    height: 300,
    marginBottom: 10,
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    color: "#fff",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  flatListContent: {
    paddingBottom: 80,
  },
  candyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  candyText: {
    fontSize: 18,
  },
  saveButton: {
    position: "absolute",
    bottom: 43,
    left: 20,
    right: 20,
    paddingVertical: 12,
    backgroundColor: "#eb6123",
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
