import { Text, View } from "@/components/Themed";
import { COMMON_CANDIES } from "@/constants/types";
import { addSpot, getUserIP } from "@/utils/spots";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function AddSpotModal() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [selectedCandies, setSelectedCandies] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );

  useEffect(() => {
    const fetchLocationAndAddress = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location access is needed to add spots."
        );
        router.back();
        return;
      }
      const loc = await Location.getCurrentPositionAsync();
      setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
      const addresses = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (addresses.length > 0) {
        setAddress(addresses[0].formattedAddress || "");
      }
    };
    fetchLocationAndAddress();
  }, []);

  const toggleCandy = (candy: string) => {
    setSelectedCandies((prev) =>
      prev.includes(candy) ? prev.filter((c) => c !== candy) : [...prev, candy]
    );
  };

  const handleSave = async () => {
    if (!address.trim() || selectedCandies.length === 0 || !location) {
      Alert.alert(
        "Incomplete",
        "Please fill in address and select at least one candy."
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
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
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
