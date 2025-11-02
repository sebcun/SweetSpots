import Colors from "@/constants/Colors";
import { Spot } from "@/constants/types";
import { addRating, addReport, getUserIP } from "@/utils/spots";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useColorScheme } from "./useColorScheme";

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  spot: Spot | null;
  onRatingSubmitted: () => void;
}

export default function RatingModal({
  visible,
  onClose,
  spot,
  onRatingSubmitted,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleSubmit = async () => {
    if (rating === 0 || !spot) return;
    const ip = await getUserIP();
    const success = await addRating(spot.id, rating, ip, comment);
    if (success) {
      onRatingSubmitted();
      onClose();
      setRating(0);
      setComment("");
    } else {
      alert("Failed to submit rating. Try again.");
    }
  };

  const handleReport = () => {
    if (!spot) return;
    Alert.prompt(
      "Report Spot",
      "Why are you reporting this spot?",
      async (reason) => {
        if (reason) {
          const ip = await getUserIP();
          const success = await addReport(spot.id, reason, ip);
          if (success) {
            alert("Report submitted.");
          } else {
            alert("Failed to submit report.");
          }
        }
      }
    );
  };

  if (!spot) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            {spot.address}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {spot.candies}
          </Text>
          {typeof spot.average_rating === "number" &&
          typeof spot.num_ratings === "number" ? (
            <Text style={[styles.currentRating, { color: colors.text }]}>
              Current Rating: {spot.average_rating.toFixed(1)} (
              {spot.num_ratings} reviews)
            </Text>
          ) : (
            <Text style={[styles.noRating, { color: colors.text }]}>
              No ratings yet
            </Text>
          )}
          <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
            <Text style={styles.reportButtonText}>Report This Spot</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() =>
              Linking.openURL(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  spot.address
                )}`
              )
            }
          >
            <Text style={styles.mapButtonText}>Open in Maps</Text>
          </TouchableOpacity>
          <Text style={[styles.rateTitle, { color: colors.text }]}>
            Your Rating:
          </Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={32}
                  color="#FFD700"
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.text },
            ]}
            placeholder="Optional comment..."
            placeholderTextColor={colors.text}
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
  },
  currentRating: {
    fontSize: 14,
    marginBottom: 10,
  },
  noRating: {
    fontSize: 14,
    marginBottom: 10,
    color: "#888",
  },
  reportButton: {
    backgroundColor: "#ff4444",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  reportButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  mapButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  mapButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  stars: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    height: 80,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  submitButton: {
    backgroundColor: "#eb6223",
    borderRadius: 5,
  },
  buttonText: {
    color: "#888",
  },
  submitText: {
    color: "white",
  },
});
