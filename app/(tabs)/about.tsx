import Constants from "expo-constants";
import { StyleSheet, TouchableOpacity } from "react-native";

import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const versionColor = colorScheme === "dark" ? "#ccc" : "#666";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SweetSpots</Text>
      <Text style={styles.description}>
        SweetSpots helps you find houses with the candy you want nearby!
      </Text>
      <View>
        <Text style={styles.version}>
          Version {Constants.expoConfig?.version || "1.0.0"}
        </Text>
        <TouchableOpacity onPress={() => router.push("/privacy")}>
          <Text style={styles.link}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
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
  version: {
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
