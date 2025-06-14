import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  User,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Donation = Database["public"]["Tables"]["donations"]["Row"] & {
  profiles: {
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
    email: string;
    location: string | null;
  };
};

export default function DonationDetailsScreen() {
  const { donationId } = useLocalSearchParams<{ donationId: string }>();
  const { profile } = useAuth();
  const router = useRouter();

  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    if (donationId) {
      fetchDonationDetails();
    }
  }, [donationId]);

  const fetchDonationDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("donations")
        .select(
          `
          *,
          profiles:donor_id (
            full_name,
            avatar_url,
            phone,
            email,
            location
          )
        `
        )
        .eq("id", donationId)
        .single();

      if (error) throw error;
      setDonation(data);
    } catch (error) {
      console.error("Error fetching donation details:", error);
      Alert.alert("Error", "Failed to load donation details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleContactDonor = (method: "phone" | "email") => {
    if (!donation?.profiles) return;

    if (method === "phone" && donation.profiles.phone) {
      Linking.openURL(`tel:${donation.profiles.phone}`);
    } else if (method === "email") {
      Linking.openURL(`mailto:${donation.profiles.email}`);
    } else {
      Alert.alert("Contact Info", "Contact information not available");
    }
  };

  const handleSendRequest = async () => {
    if (!requestMessage.trim()) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    if (!profile || !donation) return;

    setSendingRequest(true);
    try {
      const { error } = await supabase.from("requests").insert({
        donation_id: donation.id,
        recipient_id: profile.id,
        message: requestMessage.trim(),
        status: "pending",
      });

      if (error) {
        if (error.code === "23505") {
          Alert.alert(
            "Already Requested",
            "You have already sent a request for this donation."
          );
        } else {
          throw error;
        }
      } else {
        Alert.alert("Success", "Your request has been sent to the donor!");
        setRequestModalVisible(false);
        setRequestMessage("");
      }
    } catch (error) {
      console.error("Error sending request:", error);
      Alert.alert("Error", "Failed to send request");
    } finally {
      setSendingRequest(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "#10B981";
      case "claimed":
        return "#F59E0B";
      case "completed":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!donation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Donation not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isRecipient = profile?.role === "recipient";
  const isDonor = profile?.id === donation.donor_id;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Donation Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {donation.image_url && (
          <Image
            source={{ uri: donation.image_url }}
            style={styles.donationImage}
          />
        )}

        <View style={styles.detailsContainer}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{donation.title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(donation.status) },
              ]}
            >
              <Text style={styles.statusText}>{donation.status}</Text>
            </View>
          </View>

          <Text style={styles.description}>{donation.description}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{donation.category}</Text>
            </View>

            <View style={styles.infoItem}>
              <MapPin size={16} color="#6B7280" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{donation.location}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Clock size={16} color="#6B7280" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Posted</Text>
                <Text style={styles.infoValue}>
                  {new Date(donation.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Donor Information */}
          <View style={styles.donorSection}>
            <Text style={styles.sectionTitle}>Donor Information</Text>
            <View style={styles.donorCard}>
              <View style={styles.donorInfo}>
                <View style={styles.donorAvatar}>
                  <User size={24} color="#2563EB" />
                </View>
                <View style={styles.donorDetails}>
                  <Text style={styles.donorName}>
                    {donation?.profiles?.full_name}
                  </Text>
                  {donation?.profiles?.location && (
                    <Text style={styles?.donorLocation}>
                      {donation?.profiles?.location}
                    </Text>
                  )}
                </View>
              </View>

              {/* Contact buttons for recipients */}
              {isRecipient && !isDonor && (
                <View style={styles.contactButtons}>
                  {donation?.profiles?.phone && (
                    <TouchableOpacity
                      style={styles.contactButton}
                      onPress={() => handleContactDonor("phone")}
                    >
                      <Phone size={16} color="#2563EB" />
                      <Text style={styles.contactButtonText}>Call</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={() => handleContactDonor("email")}
                  >
                    <Mail size={16} color="#2563EB" />
                    <Text style={styles.contactButtonText}>Email</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Request button for recipients */}
      {isRecipient && !isDonor && donation?.status === "available" && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.requestButton}
            onPress={() => setRequestModalVisible(true)}
          >
            <MessageSquare size={20} color="#ffffff" />
            <Text style={styles.requestButtonText}>Request This Item</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Request Modal */}
      <Modal
        visible={requestModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setRequestModalVisible(false)}
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Request Item</Text>
            <View style={styles.modalSpacer} />
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
              Send a message to {donation?.profiles?.full_name} about
              {donation?.title}
            </Text>

            <View style={styles.messageInputContainer}>
              <Text style={styles.inputLabel}>Your Message</Text>
              <TextInput
                style={styles.messageInput}
                value={requestMessage}
                onChangeText={setRequestMessage}
                placeholder="Hi! I'm interested in this donation. Could we arrange a pickup time?"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.sendButton,
                sendingRequest && styles.sendButtonDisabled,
              ]}
              onPress={handleSendRequest}
              disabled={sendingRequest}
            >
              <Send size={20} color="#ffffff" />
              <Text style={styles.sendButtonText}>
                {sendingRequest ? "Sending..." : "Send Request"}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  donationImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#F3F4F6",
  },
  detailsContainer: {
    padding: 20,
  },
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
    textTransform: "capitalize",
  },
  description: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 24,
  },
  infoGrid: {
    gap: 16,
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  donorSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  donorCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  donorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  donorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  donorDetails: {
    flex: 1,
  },
  donorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  donorLocation: {
    fontSize: 14,
    color: "#6B7280",
  },
  contactButtons: {
    flexDirection: "row",
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
    gap: 6,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563EB",
  },
  bottomActions: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  requestButton: {
    backgroundColor: "#2563EB",
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  requestButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalCloseButton: {
    padding: 8,
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
  },
  modalSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center",
  },
  messageInputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  messageInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 120,
    textAlignVertical: "top",
  },
  sendButton: {
    backgroundColor: "#2563EB",
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: "#EF4444",
    marginBottom: 20,
    textAlign: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "500",
  },
});
