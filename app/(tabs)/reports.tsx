import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { Eye, Flag, Star, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ReportsScreen() {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<{ [id: string]: boolean }>(
    {}
  );

  useEffect(() => {
    if (profile?.role !== "admin") {
      router.replace("/(tabs)");
      return;
    }
    fetchReports();
  }, [profile]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setReports(data || []);
      // Fetch blocked status for all reported users
      const userIds = (data || [])
        .filter((r) => r.type === "user")
        .map((r) => r.reported_id);
      if (userIds.length > 0) {
        const { data: users, error: userError } = await supabase
          .from("profiles")
          .select("id, blocked")
          .in("id", userIds);
        if (!userError && users) {
          const blockedMap: { [id: string]: boolean } = {};
          users.forEach((u) => {
            blockedMap[u.id] = u.blocked;
          });
          setBlockedUsers(blockedMap);
        }
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (type: string, id: string) => {
    try {
      let table = "";
      if (type === "user") table = "profiles";
      if (type === "campaign") table = "campaigns";
      if (type === "donation") table = "donations";
      if (type === "request") table = "requests";
      if (!table) return;

      console.log("table", table, "id", id);

      const { error, count } = await supabase.from(table).delete().eq("id", id);

      if (error) throw error;
      if (count === 0) {
        Alert.alert("Error", "No rows were deleted. Check RLS or ID.");
        return;
      }
      Alert.alert(
        "Success",
        `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`
      );
      fetchReports();
    } catch (error) {
      console.error("Error deleting:", error);
      Alert.alert("Error", `Failed to delete ${type}`);
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ blocked: true })
        .eq("id", userId);
      if (error) throw error;
      Alert.alert("Success", "User has been blocked.");
      fetchReports();
    } catch (error) {
      console.error("Error blocking user:", error);
      Alert.alert("Error", "Failed to block user");
    }
  };

  const renderReports = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Reports Feed</Text>
      {reports.length === 0 ? (
        <Text style={styles.emptyText}>No reports found</Text>
      ) : (
        reports.map((report) => (
          <View key={report.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Flag size={18} color="#F59E0B" />
              <Text style={styles.cardTitle}>Type: {report.type}</Text>
              <View>
                <Text style={styles.cardSubtitle}>Reason: {report.reason}</Text>
              </View>
              {report.type === "user" && blockedUsers[report.reported_id] && (
                <Text
                  style={{
                    color: "#EF4444",
                    fontWeight: "bold",
                    marginLeft: 8,
                  }}
                >
                  Blocked
                </Text>
              )}
            </View>
            <Text style={styles.cardDescription}>{report.description}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleRemove(report.type, report.reported_id)}
              >
                <Trash2 size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Remove</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() =>
                  Alert.alert("View", `Reported ID: ${report.reported_id}`)
                }
              >
                <Eye size={16} color="#fff" />
                <Text style={styles.actionButtonText}>View</Text>
              </TouchableOpacity>
              {report.type === "user" && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.rejectButton,
                    blockedUsers[report.reported_id] && { opacity: 0.5 },
                  ]}
                  onPress={() => handleBlockUser(report.reported_id)}
                  disabled={blockedUsers[report.reported_id]}
                >
                  <Text style={styles.actionButtonText}>Block User</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}
    </View>
  );

  if (profile?.role !== "admin") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Access Denied</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.emptyText}>
            You need admin privileges to access this page.
          </Text>
          <Text style={styles.emptyText}>
            Current role: {profile?.role || "Unknown"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
      </View>
      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={styles.loader}
          />
        ) : (
          renderReports()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
    marginTop: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  cardDescription: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: "#10B981",
  },
  rejectButton: {
    backgroundColor: "#EF4444",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  loader: {
    marginTop: 50,
  },
});

export function RatingForm({ donationId, donorId, recipientId, onRated }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submitRating = async () => {
    if (!rating) {
      Alert.alert("Please select a rating.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("ratings").insert({
      donation_id: donationId,
      donor_id: donorId,
      recipient_id: recipientId,
      rating,
      comment: comment.trim() || null,
    });
    setLoading(false);
    if (error) {
      Alert.alert("Error", "Failed to submit rating.");
    } else {
      Alert.alert("Thank you!", "Your rating has been submitted.");
      onRated?.();
    }
  };

  return (
    <View style={{ marginVertical: 16 }}>
      <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
        Rate the Donor
      </Text>
      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Star
              size={32}
              color={star <= rating ? "#F59E0B" : "#D1D5DB"}
              fill={star <= rating ? "#F59E0B" : "none"}
            />
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        placeholder="Leave a comment (optional)"
        value={comment}
        onChangeText={setComment}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 8,
          marginBottom: 8,
        }}
        multiline
      />
      <TouchableOpacity
        onPress={submitRating}
        style={{
          backgroundColor: "#2563EB",
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
        }}
        disabled={loading}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          {loading ? "Submitting..." : "Submit Rating"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
