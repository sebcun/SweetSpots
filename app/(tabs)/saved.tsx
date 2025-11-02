import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import CandyCard from "@/components/CandyCard";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Spot } from "@/constants/types";
import { getSavedSpotIds, loadSpotsByIds, unsaveSpotId } from "@/utils/spots";

export default function SavedScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCandies, setSelectedCandies] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [spots, setSpots] = useState<Spot[]>([]);

  const allCandies = useMemo(() => {
    const candySet = new Set<string>();
    spots.forEach((spot) =>
      spot.candies.split(", ").forEach((candy) => candySet.add(candy.trim()))
    );
    return Array.from(candySet).sort();
  }, [spots]);

  const loadData = async () => {
    const ids = await getSavedSpotIds();
    const data = await loadSpotsByIds(ids);
    setSpots(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSpots = useMemo(() => {
    if (selectedCandies.length === 0) return spots;
    return spots.filter((spot) =>
      selectedCandies.every((candy) => spot.candies.includes(candy))
    );
  }, [spots, selectedCandies]);

  const toggleCandy = (candy: string) => {
    setSelectedCandies((prev) =>
      prev.includes(candy) ? prev.filter((c) => c !== candy) : [...prev, candy]
    );
  };

  const handleUnsave = async (id: number) => {
    await unsaveSpotId(id);
    loadData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="filter" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredSpots.length === 0 ? (
          <Text style={styles.noHousesText}>No saved spots</Text>
        ) : (
          filteredSpots.map((s) => (
            <CandyCard
              key={s.id}
              address={s.address}
              candies={s.candies}
              lat={s.lat}
              lon={s.lon}
              onUnsave={() => handleUnsave(s.id)}
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
