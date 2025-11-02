import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Report } from "@/constants/types";
import { deleteReport, deleteSpot, loadReports } from "@/utils/spots";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [candyCount, setCandyCount] = useState(0);

  const loadReportsData = async () => {
    const data = await loadReports();
    setReports(data);
  };

  const loadCandyCount = async () => {
    const stored = await AsyncStorage.getItem("candyCount");
    if (stored) {
      setCandyCount(parseInt(stored, 10));
    }
  };

  const saveCandyCount = async (count: number) => {
    await AsyncStorage.setItem("candyCount", count.toString());
  };

  useEffect(() => {
    loadCandyCount();
  }, []);

  useEffect(() => {
    if (adminModalVisible) {
      loadReportsData();
    }
  }, [adminModalVisible]);

  const handleAdminPress = () => {
    Alert.prompt(
      "Admin Access",
      "Enter admin code:",
      (code) => {
        if (code === "123456") {
          setAdminModalVisible(true);
        } else {
          Alert.alert("Incorrect code");
        }
      },
      "secure-text"
    );
  };

  const handleDelete = async (report: Report) => {
    const success = await deleteSpot(report.spot_id);
    if (success) {
      await deleteReport(report.id);
      loadReportsData();
      Alert.alert("Spot and report deleted");
    } else {
      Alert.alert("Failed to delete");
    }
  };

  const handleIgnore = async (reportId: number) => {
    const success = await deleteReport(reportId);
    if (success) {
      loadReportsData();
      Alert.alert("Report ignored");
    } else {
      Alert.alert("Failed to ignore");
    }
  };

  const addCandy = () => {
    const newCount = candyCount + 1;
    setCandyCount(newCount);
    saveCandyCount(newCount);
  };

  const removeCandy = () => {
    if (candyCount > 0) {
      const newCount = candyCount - 1;
      setCandyCount(newCount);
      saveCandyCount(newCount);
    }
  };

  const renderReport = ({ item }: { item: Report }) => (
    <View style={styles.reportItem}>
      <Text style={[styles.reportText, { color: colors.text }]}>
        Spot: {item.spot?.address} - {item.spot?.candies}
      </Text>
      <Text style={[styles.reportText, { color: colors.text }]}>
        Reason: {item.reason}
      </Text>
      <View style={styles.reportButtons}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.buttonText}>DELETE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ignoreButton}
          onPress={() => handleIgnore(item.id)}
        >
          <Text style={styles.buttonText}>IGNORE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SweetSpots</Text>
      <Text style={styles.description}>
        SweetSpots helps you find houses with the candy you want nearby!
      </Text>
      <View style={styles.candySection}>
        <Text style={[styles.candyTitle, { color: colors.text }]}>
          Candy Collection
        </Text>
        <Text style={[styles.candyCount, { color: colors.text }]}>
          {candyCount} candies collected
        </Text>
        <View style={styles.candyButtons}>
          <TouchableOpacity style={styles.addButton} onPress={addCandy}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeButton} onPress={removeCandy}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <Text style={styles.version}>
          Version {Constants.expoConfig?.version || "1.0.0"}
        </Text>
        <TouchableOpacity onPress={() => router.push("/privacy")}>
          <Text style={styles.link}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleAdminPress}>
          <Text style={styles.link}>Admin</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={adminModalVisible} animationType="slide">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Admin Panel
          </Text>
          <FlatList
            data={reports}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderReport}
            ListEmptyComponent={
              <Text style={[styles.noReports, { color: colors.text }]}>
                No reports
              </Text>
            }
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setAdminModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 70,
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginHorizontal: 30,
  },
  candySection: {
    alignItems: "center",
    marginVertical: 20,
  },
  candyTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  candyCount: {
    fontSize: 16,
    marginVertical: 10,
  },
  candyButtons: {
    flexDirection: "row",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  removeButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 5,
  },
  version: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    textDecorationLine: "underline",
    marginTop: 10,
  },
  modal: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  reportItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
  },
  reportText: {
    fontSize: 16,
    marginBottom: 5,
  },
  reportButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  ignoreButton: {
    backgroundColor: "#4444ff",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  noReports: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 50,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#eb6223",
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
});
