import ReportModal from "@/components/ReportModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";
import { useRouter } from "expo-router";
import {
  Clock,
  DollarSign,
  Filter,
  Flag,
  MapPin,
  MessageCircle,
  Search,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"] & {
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
};

export default function CampaignsScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [reportModal, setReportModal] = useState({
    visible: false,
    reportedId: "",
    reportedName: "",
    type: "campaign",
  });
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  const categories = [
    "All",
    "Food",
    "Clothing",
    "Electronics",
    "Books",
    "Furniture",
    "Medical",
    "Education",
    "Other",
  ];

  useEffect(() => {
    fetchCampaigns();
  }, [profile?.role]);

  const fetchCampaigns = async () => {
    try {
      let query = supabase
        .from("campaigns")
        .select(
          `
          *,
          profiles:recipient_id (
            full_name,
            avatar_url
          )
        `
        )
        .order("created_at", { ascending: false });

      if (profile?.role === "recipient") {
        query = query.eq("recipient_id", profile.id);
      } else {
        query = query.eq("status", "active");
      }

      const { data, error } = await query;

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCampaigns();
  };

  const handleMessageCampaign = async (campaign: Campaign) => {
    if (!profile) return;

    Alert.prompt(
      "Send Message",
      `Send a message to ${campaign.profiles?.full_name}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: async (message) => {
            if (!message?.trim()) return;

            try {
              const { error } = await supabase.from("messages").insert({
                campaign_id: campaign.id,
                sender_id: profile.id,
                receiver_id: campaign.recipient_id,
                content: message.trim(),
              });

              if (error) throw error;
              Alert.alert("Success", "Message sent successfully!");
            } catch (error) {
              console.error("Error sending message:", error);
              Alert.alert("Error", "Failed to send message");
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const handleReportCampaign = (campaignId: string, campaignTitle: string) => {
    setReportModal({
      visible: true,
      reportedId: campaignId,
      reportedName: campaignTitle,
      type: "campaign",
    });
  };

  const handleViewDetails = (campaign: Campaign) => {
    router.push({
      pathname: "/campaing-details",
      params: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        category: campaign.category,
        location: campaign.location,
        goalAmount: campaign.goal_amount?.toString() || "",
        imageUrl: campaign.image_url || "",
        status: campaign.status,
        createdAt: campaign.created_at,
        recipientName: campaign.profiles?.full_name || "",
        recipientId: campaign.recipient_id,
      },
    });
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || campaign.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderCampaignCard = ({ item }: { item: Campaign }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleViewDetails(item)}
    >
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.cardImage} />
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.cardDescription} numberOfLines={3}>
          {item.description}
        </Text>

        {item.goal_amount && (
          <View style={styles.goalContainer}>
            <DollarSign size={16} color="#10B981" />
            <Text style={styles.goalText}>Goal: ${item.goal_amount}</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Clock size={16} color="#6B7280" />
            <Text style={styles.timeText}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.campaignInfo}>
          <Text style={styles.campaignOwner}>
            by {item.profiles?.full_name}
          </Text>
          {profile?.role === "donor" && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleMessageCampaign(item);
                }}
              >
                <MessageCircle size={16} color="#2563EB" />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.reportButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleReportCampaign(item.id, item.title);
                }}
              >
                <Flag size={16} color="#EF4444" />
                <Text style={styles.reportButtonText}>Report</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10B981";
      case "paused":
        return "#F59E0B";
      case "completed":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {profile?.role === "recipient" ? "My Campaigns" : "Active Campaigns"}
        </Text>

        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search campaigns..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={categories}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === item && styles.categoryButtonTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      <FlatList
        data={filteredCampaigns}
        renderItem={renderCampaignCard}
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
              {profile?.role === "recipient"
                ? "No campaigns yet. Create your first campaign!"
                : "No active campaigns at the moment."}
            </Text>
          </View>
        }
      />

      <ReportModal
        visible={reportModal.visible}
        onClose={() => setReportModal({ ...reportModal, visible: false })}
        reporterId={profile?.id || ""}
        reportedId={reportModal.reportedId}
        reportedName={reportModal.reportedName}
        type={reportModal.type}
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
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  filterButton: {
    padding: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 0,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#F3F4F6",
  },
  categoryButtonActive: {
    backgroundColor: "#2563EB",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  categoryButtonTextActive: {
    color: "#ffffff",
  },
  listContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
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
  cardImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#ffffff",
    textTransform: "capitalize",
  },
  cardDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  goalContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  goalText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  campaignInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  campaignOwner: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "500",
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  messageButtonText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "500",
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  reportButtonText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
    marginLeft: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    margin: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  reportInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  submitButton: {
    backgroundColor: "#EF4444",
  },
  cancelButtonText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
