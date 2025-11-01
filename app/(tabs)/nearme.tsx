import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import CandyCard from "@/components/CandyCard";
import { Text, View } from "@/components/Themed";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

import { Spot } from "@/constants/types";
import { loadSpots } from "@/utils/spots";

function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const p3 = ((lat2 - lat1) * Math.PI) / 180;
  const p4 = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(p3 / 2) * Math.sin(p3 / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(p4 / 2) * Math.sin(p4 / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function NearMeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  const [sortOrder, setSortOrder] = useState<"closest" | "farthest">("closest");
  const [selectedCandies, setSelectedCandies] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [spots, setSpots] = useState<Spot[]>([]);

  const allCandies = useMemo(() => {
    const candySet = new Set<string>();
    spots.forEach((spot) =>
      spot.candies.split(", ").forEach((candy) => candySet.add(candy.trim()))
    );
    return Array.from(candySet).sort();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const data = await loadSpots();
      setSpots(data);
    };
    loadData();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      });
    })();
  }, []);

  const sortedSpots = useMemo(() => {
    if (!userLocation) return spots;
    return [...spots].sort((a, b) => {
      const distA = getDistance(
        userLocation.lat,
        userLocation.lon,
        a.lat,
        a.lon
      );
      const distB = getDistance(
        userLocation.lat,
        userLocation.lon,
        b.lat,
        b.lon
      );
      if (sortOrder === "closest") {
        return distA - distB;
      } else {
        return distB - distA;
      }
    });
  }, [userLocation, sortOrder, spots]);

  const filteredSpots = useMemo(() => {
    if (selectedCandies.length === 0) return sortedSpots;
    return sortedSpots.filter((spot) =>
      selectedCandies.every((candy) => spot.candies.includes(candy))
    );
  }, [sortedSpots, selectedCandies]);

  const toggleCandy = (candy: string) => {
    setSelectedCandies((prev) =>
      prev.includes(candy) ? prev.filter((c) => c !== candy) : [...prev, candy]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            setSortOrder(sortOrder === "closest" ? "farthest" : "closest")
          }
        >
          <Ionicons
            name={sortOrder === "closest" ? "arrow-up" : "arrow-down"}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Near Me</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="filter" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {filteredSpots.length === 0 ? (
          <Text style={styles.noHousesText}>No houses found near you</Text>
        ) : (
          filteredSpots.map((s) => (
            <CandyCard
              key={s.id}
              address={s.address}
              candies={s.candies}
              lat={s.lat}
              lon={s.lon}
              userLat={userLocation?.lat}
              userLon={userLocation?.lon}
              onPress={() => {
                router.push(
                  `/?lat=${s.lat}&lon=${s.lon}&address=${s.address}&candies=${s.candies}`
                );
              }}
            />
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Candies to Filter</Text>
          <FlatList
            data={allCandies}
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
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 50,
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  list: {
    paddingBottom: 100,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
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
  doneButton: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    paddingVertical: 12,
    backgroundColor: "#eb6123",
    borderRadius: 8,
    alignItems: "center",
  },
  doneButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  noHousesText: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 50,
  },
});
