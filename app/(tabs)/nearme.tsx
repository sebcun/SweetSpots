import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActionSheetIOS,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import CandyCard from "@/components/CandyCard";
import { Text, View } from "@/components/Themed";

const MOCK_SPOTS = [
  {
    id: "1",
    address: "1 Brunton Ave",
    candies: "Snickers, Twix",
    lat: -37.8199,
    lon: 144.9834,
  },
  {
    id: "2",
    address: "1 Brunton Ave",
    candies: "KitKat, M&Ms",
    lat: -37.8152,
    lon: 145.0108,
  },
  {
    id: "3",
    address: "1 Brunton Ave",
    candies: "Reese's, Skittles",
    lat: -37.8254,
    lon: 144.9572,
  },
  {
    id: "4",
    address: "1 Brunton Ave",
    candies: "Milky Way, Starburst",
    lat: -37.8501,
    lon: 145.0306,
  },
  {
    id: "5",
    address: "1 Brunton Ave",
    candies: "Hershey's, Sour Patch",
    lat: -37.8029,
    lon: 144.9713,
  },
  {
    id: "6",
    address: "1 Brunton Ave",
    candies: "Butterfinger, Crunch",
    lat: -37.8772,
    lon: 145.0587,
  },
  {
    id: "7",
    address: "1 Brunton Ave",
    candies: "Twizzlers, Smarties",
    lat: -37.7941,
    lon: 144.9262,
  },
  {
    id: "8",
    address: "1 Brunton Ave",
    candies: "3 Musketeers, Toblerone",
    lat: -37.9004,
    lon: 145.0973,
  },
  {
    id: "9",
    address: "1 Brunton Ave",
    candies: "Skittles, KitKat",
    lat: -37.8435,
    lon: 144.9991,
  },
  {
    id: "10",
    address: "1 Brunton Ave",
    candies: "Reese's, Twix",
    lat: -37.8107,
    lon: 145.0375,
  },
  {
    id: "11",
    address: "1 Brunton Ave",
    candies: "Snickers, Milky Way",
    lat: -37.7713,
    lon: 144.9556,
  },
  {
    id: "12",
    address: "1 Brunton Ave",
    candies: "Starburst, M&Ms",
    lat: -37.8368,
    lon: 145.0844,
  },
  {
    id: "13",
    address: "1 Brunton Ave",
    candies: "Hershey's, Crunch",
    lat: -37.8641,
    lon: 145.0159,
  },
  {
    id: "14",
    address: "1 Brunton Ave",
    candies: "Sour Patch, Twizzlers",
    lat: -37.7902,
    lon: 144.9427,
  },
  {
    id: "15",
    address: "1 Brunton Ave",
    candies: "Butterfinger, KitKat",
    lat: -37.8793,
    lon: 145.0275,
  },
  {
    id: "16",
    address: "1 Brunton Ave",
    candies: "Toblerone, Skittles",
    lat: -37.8175,
    lon: 145.0622,
  },
  {
    id: "17",
    address: "1 Brunton Ave",
    candies: "Reese's, Hershey's",
    lat: -37.8018,
    lon: 144.9803,
  },
  {
    id: "18",
    address: "1 Brunton Ave",
    candies: "M&Ms, Snickers",
    lat: -37.7689,
    lon: 144.9048,
  },
  {
    id: "19",
    address: "1 Brunton Ave",
    candies: "Milky Way, Twix",
    lat: -37.8551,
    lon: 145.0719,
  },
  {
    id: "20",
    address: "1 Brunton Ave",
    candies: "Starburst, Smarties",
    lat: -37.8337,
    lon: 144.9612,
  },
  {
    id: "21",
    address: "1 Brunton Ave",
    candies: "Crunch, KitKat",
    lat: -37.8959,
    lon: 145.0358,
  },
  {
    id: "22",
    address: "1 Brunton Ave",
    candies: "Sour Patch, Reese's",
    lat: -37.8083,
    lon: 144.9345,
  },
  {
    id: "23",
    address: "1 Brunton Ave",
    candies: "Butterfinger, M&Ms",
    lat: -37.7742,
    lon: 145.0049,
  },
  {
    id: "24",
    address: "1 Brunton Ave",
    candies: "Twizzlers, Snickers",
    lat: -37.8617,
    lon: 145.0463,
  },
  {
    id: "25",
    address: "1 Brunton Ave",
    candies: "Hershey's, Starburst",
    lat: -37.8129,
    lon: 144.9736,
  },
  {
    id: "26",
    address: "1 Brunton Ave",
    candies: "Skittles, Crunch",
    lat: -37.7898,
    lon: 144.9924,
  },
  {
    id: "27",
    address: "1 Brunton Ave",
    candies: "KitKat, Reese's",
    lat: -37.8473,
    lon: 145.0111,
  },
  {
    id: "28",
    address: "1 Brunton Ave",
    candies: "Twix, Milky Way",
    lat: -37.7684,
    lon: 145.0428,
  },
  {
    id: "29",
    address: "1 Brunton Ave",
    candies: "Smarties, Toblerone",
    lat: -37.8266,
    lon: 144.9483,
  },
  {
    id: "30",
    address: "1 Brunton Ave",
    candies: "Butterfinger, Sour Patch",
    lat: -37.8822,
    lon: 145.0677,
  },
];

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
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  const [sortOrder, setSortOrder] = useState<"closest" | "farthest">("closest");

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
    if (!userLocation) return MOCK_SPOTS;
    return [...MOCK_SPOTS].sort((a, b) => {
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
  }, [userLocation, sortOrder]);

  const showSortOptions = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Closest First", "Farthest First"],
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          setSortOrder("closest");
        } else if (buttonIndex === 2) {
          setSortOrder("farthest");
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Near Me</Text>
      <TouchableOpacity onPress={showSortOptions} style={styles.sortButton}>
        <Text style={styles.sortButtonText}>
          Sort by Distance ({sortOrder === "closest" ? "Closest" : "Farthest"}{" "}
          First)
        </Text>
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {sortedSpots.map((s) => (
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
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    marginTop: 50,
  },
  list: {
    paddingBottom: 100,
  },
  sortButton: {
    alignSelf: "center",
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  sortButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
