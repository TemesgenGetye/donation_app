import ReportModal from "@/components/ReportModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Flag,
  MapPin,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CampaignDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [unreadConversations, setUnreadConversations] = useState<Set<string>>(
    new Set()
  );
  const [reportModal, setReportModal] = useState({
    visible: false,
    reportedId: "",
    reportedName: "",
    type: "campaign",
  });

  const recipientId = params.recipientId as string;
  const campaignId = params.id as string;
  const isRecipient = profile?.id === recipientId;

  useEffect(() => {
    if (profile) {
      fetchMessages();
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) return;

    const channel = supabase
      .channel(`messages_for_${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;

          // Ignore our own messages
          if (!profile || newMessage.sender_id === profile.id) {
            fetchMessages();
            return;
          }

          // For the recipient, if they are not in the sender's chat, mark as unread
          if (isRecipient) {
            if (!selectedDonor || selectedDonor.id !== newMessage.sender_id) {
              setUnreadConversations((prev) =>
                new Set(prev).add(newMessage.sender_id)
              );
            }
          }

          // Refetch to get latest conversations or messages
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, campaignId, selectedDonor]);

  useEffect(() => {
    if (selectedDonor) {
      const relevantConversation = conversations.find(
        (c) => c.donor.id === selectedDonor.id
      );
      setMessages(relevantConversation ? relevantConversation.messages : []);
    } else {
      setMessages([]);
    }
  }, [selectedDonor, conversations]);

  const fetchMessages = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      if (isRecipient) {
        // Recipient: Fetch all conversations using the new RPC function
        const { data, error } = await supabase.rpc(
          "get_campaign_conversations",
          {
            p_campaign_id: campaignId,
            p_user_id: profile.id,
          }
        );

        if (error) throw error;

        const convos = (data || []).map((convo: any) => ({
          donor: {
            id: convo.other_user_id,
            full_name: convo.other_user_name,
          },
          messages: convo.messages,
          lastMessage: {
            content: convo.last_message_content,
            created_at: convo.last_message_at,
          },
        }));

        setConversations(convos);
      } else {
        // Donor: Fetch 1-to-1 chat history with the recipient
        const { data, error } = await supabase
          .from("messages")
          .select(`*, sender:sender_id(id, full_name)`)
          .eq("campaign_id", campaignId)
          .or(
            `and(sender_id.eq.${profile.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${profile.id})`
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        setMessages(data || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!profile || !messageText.trim()) return;
    const textToSend = messageText.trim();
    setMessageText("");

    let currentRecipientId = recipientId;
    if (isRecipient && selectedDonor) {
      currentRecipientId = selectedDonor.id;
    }

    try {
      const { error } = await supabase.from("messages").insert({
        campaign_id: campaignId,
        sender_id: profile.id,
        receiver_id: currentRecipientId,
        content: textToSend,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message.");
      setMessageText(textToSend); // Re-set text if sending failed
    }
  };

  const handleReportCampaign = () => {
    setReportModal({
      visible: true,
      reportedId: params.id as string,
      reportedName: params.title as string,
      type: "campaign",
    });
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ flexGrow: 1 }}
        >
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
              {profile?.role === "donor" && (
                <TouchableOpacity
                  style={styles.reportButton}
                  onPress={handleReportCampaign}
                >
                  <Flag size={16} color="#EF4444" />
                  <Text style={styles.reportButtonText}>Report</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        {isRecipient ? (
          <View style={styles.chatContainer}>
            {loading && <ActivityIndicator />}
            {selectedDonor ? (
              // Chat view
              <>
                <View style={styles.chatHeader}>
                  <TouchableOpacity onPress={() => setSelectedDonor(null)}>
                    <ArrowLeft size={24} color="#1F2937" />
                  </TouchableOpacity>
                  <Text style={styles.chatHeaderName}>
                    {selectedDonor.full_name}
                  </Text>
                  <View style={{ width: 24 }} />
                </View>
                <ScrollView
                  style={styles.messagesContainer}
                  contentContainerStyle={{ flexDirection: "column-reverse" }}
                >
                  {messages.map((msg) => (
                    <View
                      key={msg.id}
                      style={[
                        styles.messageBubble,
                        msg.sender_id === profile?.id
                          ? styles.myMessage
                          : styles.theirMessage,
                      ]}
                    >
                      <Text
                        style={
                          msg.sender_id === profile?.id
                            ? styles.myMessageText
                            : styles.theirMessageText
                        }
                      >
                        {msg.content}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={messageText}
                    onChangeText={setMessageText}
                    placeholder="Type your message..."
                  />
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    <Text style={styles.sendButtonText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // Conversations list
              <ScrollView style={styles.messagesContainer}>
                <Text style={styles.messagesTitle}>Conversations</Text>
                {conversations.map(({ donor, lastMessage }) => (
                  <TouchableOpacity
                    key={donor.id}
                    style={styles.conversationCard}
                    onPress={() => {
                      // When opening a convo, remove it from unread
                      setUnreadConversations((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(donor.id);
                        return newSet;
                      });
                      setSelectedDonor(donor);
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.senderName}>{donor.full_name}</Text>
                      <Text style={styles.messageContent} numberOfLines={1}>
                        {lastMessage.content}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.messageDate}>
                        {new Date(lastMessage.created_at).toLocaleDateString()}
                      </Text>
                      {unreadConversations.has(donor.id) && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <View style={styles.chatContainer}>
            <ScrollView
              style={styles.messagesContainer}
              contentContainerStyle={{ flexDirection: "column-reverse" }}
            >
              {loading && <ActivityIndicator />}
              {messages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.messageBubble,
                    msg.sender_id === profile?.id
                      ? styles.myMessage
                      : styles.theirMessage,
                  ]}
                >
                  <Text
                    style={
                      msg.sender_id === profile?.id
                        ? styles.myMessageText
                        : styles.theirMessageText
                    }
                  >
                    {msg.content}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={messageText}
                onChangeText={setMessageText}
                placeholder="Type your message..."
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>

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
  chatContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    marginVertical: 4,
    maxWidth: "80%",
  },
  myMessage: {
    backgroundColor: "#2563EB",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#E5E7EB",
    alignSelf: "flex-start",
  },
  myMessageText: {
    color: "#FFFFFF",
  },
  theirMessageText: {
    color: "#1F2937",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  messagesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  conversationCard: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  senderName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 14,
    color: "#6B7280",
  },
  messageDate: {
    fontSize: 12,
    color: "#6B7280",
    alignSelf: "flex-start",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
    marginTop: 8,
  },
});
