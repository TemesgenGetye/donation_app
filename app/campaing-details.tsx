import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  MapPin,
  MessageCircle,
  User,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  TextInput as RNTextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CampaignDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [messageModal, setMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    if (profile?.role === "recipient" && params.recipientId === profile.id) {
      fetchMessages();
    }
  }, [params.id, profile]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          profiles:sender_id (
            full_name
          )
        `
        )
        .eq("campaign_id", params.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = () => {
    if (!profile) return;
    setMessageModal(true);
  };

  const submitMessage = async () => {
    if (!profile || !messageText.trim()) return;
    setMessageLoading(true);
    try {
      const { error } = await supabase.from("messages").insert({
        campaign_id: params.id as string,
        sender_id: profile.id,
        receiver_id: params.recipientId as string,
        content: messageText.trim(),
      });
      if (error) throw error;
      setMessageModal(false);
      setMessageText("");
      Alert.alert("Success", "Message sent successfully!");
      // Optionally refresh messages if recipient
      if (profile.role === "recipient" && params.recipientId === profile.id) {
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
    } finally {
      setMessageLoading(false);
    }
  };

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
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Campaign Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {params.imageUrl && (
          <Image
            source={{ uri: params.imageUrl as string }}
            style={styles.image}
          />
        )}

        <View style={styles.details}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{params.title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(params.status as string) },
              ]}
            >
              <Text style={styles.statusText}>{params.status}</Text>
            </View>
          </View>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.metaText}>{params.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.metaText}>
                {new Date(params.createdAt as string).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Category:</Text>
            <Text style={styles.categoryValue}>{params.category}</Text>
          </View>

          {params.goalAmount && (
            <View style={styles.goalContainer}>
              <DollarSign size={20} color="#10B981" />
              <Text style={styles.goalText}>Goal: ${params.goalAmount}</Text>
            </View>
          )}

          <Text style={styles.description}>{params.description}</Text>

          <View style={styles.recipientSection}>
            <View style={styles.recipientInfo}>
              <User size={20} color="#2563EB" />
              <Text style={styles.recipientName}>{params.recipientName}</Text>
            </View>
          </View>

          {profile?.role === "donor" && (
            <>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleSendMessage}
              >
                <MessageCircle size={20} color="#ffffff" />
                <Text style={styles.messageButtonText}>Send Message</Text>
              </TouchableOpacity>
              <Modal
                visible={messageModal}
                animationType="slide"
                transparent
                onRequestClose={() => setMessageModal(false)}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.4)",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#fff",
                      padding: 24,
                      borderRadius: 16,
                      width: "85%",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        marginBottom: 12,
                      }}
                    >
                      Send Message
                    </Text>
                    <Text
                      style={{
                        color: "#374151",
                        marginBottom: 12,
                      }}
                    >
                      Send a message to {params.recipientName}
                    </Text>
                    <RNTextInput
                      style={{
                        borderWidth: 1,
                        borderColor: "#D1D5DB",
                        borderRadius: 8,
                        padding: 12,
                        minHeight: 80,
                        marginBottom: 16,
                        textAlignVertical: "top",
                      }}
                      multiline
                      numberOfLines={4}
                      value={messageText}
                      onChangeText={setMessageText}
                      placeholder="Type your message..."
                      editable={!messageLoading}
                    />
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        gap: 12,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => setMessageModal(false)}
                        disabled={messageLoading}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 16,
                        }}
                      >
                        <Text
                          style={{
                            color: "#6B7280",
                            fontWeight: "500",
                          }}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={submitMessage}
                        disabled={messageLoading || !messageText.trim()}
                        style={{
                          backgroundColor: "#2563EB",
                          borderRadius: 8,
                          paddingVertical: 8,
                          paddingHorizontal: 16,
                          opacity:
                            messageLoading || !messageText.trim() ? 0.6 : 1,
                        }}
                      >
                        {messageLoading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "600",
                            }}
                          >
                            Send
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </>
          )}

          {profile?.role === "recipient" &&
            params.recipientId === profile.id &&
            messages.length > 0 && (
              <View style={styles.messagesSection}>
                <Text style={styles.messagesTitle}>
                  Messages ({messages.length})
                </Text>
                {messages.map((message) => (
                  <View key={message.id} style={styles.messageCard}>
                    <View style={styles.messageHeader}>
                      <Text style={styles.senderName}>
                        {message.profiles?.full_name}
                      </Text>
                      <Text style={styles.messageDate}>
                        {new Date(message.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.messageContent}>{message.content}</Text>
                  </View>
                ))}
              </View>
            )}
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: 250,
  },
  details: {
    padding: 20,
    backgroundColor: "#ffffff",
  },
  titleRow: {
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
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginRight: 8,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  goalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 4,
  },
  description: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 24,
  },
  recipientSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 24,
  },
  recipientInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
    marginLeft: 8,
  },
  messageButton: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  messageButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  messagesSection: {
    marginTop: 24,
  },
  messagesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  messageCard: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  senderName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  messageDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  messageContent: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
});
