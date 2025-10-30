import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "../components/Themed";

type CandyCardProps = {
  address: string;
  candies: string;
  lat: number;
  lon: number;
  userLat?: number;
  userLon?: number;
  onPress?: () => void;
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
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

function formatDistance(dist: number): string {
  if (dist < 1000) {
    return Math.round(dist) + "m";
  } else {
    return (dist / 1000).toFixed(1) + "km";
  }
}

export default function CandyCard({
  address,
  candies,
  lat,
  lon,
  userLat,
  userLon,
  onPress,
}: CandyCardProps) {
  const distance =
    userLat && userLon
      ? formatDistance(getDistance(userLat, userLon, lat, lon))
      : "...";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.touchable}
    >
      <View style={styles.card} lightColor="#ffffff" darkColor="#111111ff">
        <View style={styles.row} lightColor="#ffffff" darkColor="#111111ff">
          <View
            style={styles.content}
            lightColor="#ffffff"
            darkColor="#111111ff"
          >
            <Text style={styles.address} lightColor="#111" darkColor="#fff">
              {address}
            </Text>
            <Text style={styles.candies} lightColor="#444" darkColor="#d1d5db">
              {candies}
            </Text>
          </View>
          <Text style={styles.distance} lightColor="#111" darkColor="#fff">
            {distance}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  emoji: {
    fontSize: 40,
    marginRight: 12,
    lineHeight: 40,
  },
  content: {
    flex: 1,
  },
  address: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  distance: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 6,
    marginLeft: 25,
  },
  candies: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.9,
  },
});
