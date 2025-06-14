import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";
import { Check, Clock, MessageSquare, User, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Request = Database["public"]["Tables"]["requests"]["Row"] & {
  donations: {
    title: string;
    image_url: string | null;
  };
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
};

export default function RequestsScreen() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [profile?.id, profile?.role]);

  const fetchRequests = async () => {
    if (!profile?.id) {
      console.log("No profile ID available");
      setRequests([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      console.log(
        "Fetching requests for profile:",
        profile.id,
        "role:",
        profile.role
      );

      let query = supabase
        .from("requests")
        .select(
          `
          *,
          donations (
            title,
            image_url
          ),
          profiles:recipient_id (
            full_name,
            avatar_url
          )
        `
        )
        .order("created_at", { ascending: false });

      if (profile.role === "donor") {
        // Show requests for donor's donations
        const { data: donorDonations, error: donationsError } = await supabase
          .from("donations")
          .select("id")
          .eq("donor_id", profile.id);

        if (donationsError) {
          console.error("Error fetching donor donations:", donationsError);
          throw donationsError;
        }

        const donationIds = donorDonations?.map((d) => d.id) || [];
        console.log("Donor donation IDs:", donationIds);

        if (donationIds.length > 0) {
          query = query.in("donation_id", donationIds);
        } else {
          console.log("No donations found for donor");
          setRequests([]);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      } else {
        // Show recipient's own requests
        query = query.eq("recipient_id", profile.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching requests:", error);
        throw error;
      }

      console.log("Requests fetched:", data?.length || 0);
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      Alert.alert("Error", "Failed to fetch requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleRequestAction = async (
    requestId: string,
    action: "approved" | "rejected"
  ) => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({ status: action, updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (error) throw error;

      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: action } : req
        )
      );

      Alert.alert("Success", `Request ${action} successfully!`);
    } catch (error) {
      console.error("Error updating request:", error);
      Alert.alert("Error", "Failed to update request");
    }
  };

  const renderRequestCard = ({ item }: { item: Request }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {item.donations?.image_url && (
          <Image
            source={{ uri: item.donations.image_url }}
            style={styles.itemImage}
          />
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.itemTitle}>{item.donations?.title}</Text>
          <View style={styles.userInfo}>
            <User size={16} color="#6B7280" />
            <Text style={styles.userName}>
              {profile?.role === "donor"
                ? item.profiles?.full_name
                : "Your request"}
            </Text>
          </View>
          <View style={styles.timeInfo}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.timeText}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.messageContainer}>
        <MessageSquare size={16} color="#6B7280" />
        <Text style={styles.messageText}>{item.message}</Text>
      </View>

      {profile?.role === "donor" && item.status === "pending" && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleRequestAction(item.id, "approved")}
          >
            <Check size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRequestAction(item.id, "rejected")}
          >
            <X size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "approved":
        return "#10B981";
      case "rejected":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  // Show loading state while profile is being fetched
  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {profile.role === "donor" ? "Donation Requests" : "My Requests"}
        </Text>
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequestCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {profile.role === "donor"
                ? "No requests for your donations yet."
                : "You haven't made any requests yet."}
            </Text>
          </View>
        }
      />
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
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  listContainer: {
    padding: 20,
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
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#ffffff",
    textTransform: "capitalize",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
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
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});
