import { supabase } from "@/lib/supabase";
import { Flag, X } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  reporterId: string;
  reportedId: string;
  reportedName: string;
  type: "user" | "donation";
}

export default function ReportModal({
  visible,
  onClose,
  reporterId,
  reportedId,
  reportedName,
  type,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const reasons = [
    "Inappropriate content",
    "Spam or misleading information",
    "Harassment or abuse",
    "Fraud or scam",
    "Violation of terms",
    "Other",
  ];

  const handleSubmitReport = async () => {
    if (!selectedReason) {
      Alert.alert("Error", "Please select a reason for reporting");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("reports").insert({
        reporter_id: reporterId,
        reported_id: reportedId,
        type,
        reason: selectedReason,
        description: description.trim() || null,
      });

      if (error) throw error;

      Alert.alert(
        "Success",
        "Report submitted successfully. We will review it shortly."
      );
      onClose();
      setSelectedReason("");
      setDescription("");
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert("Error", "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Flag size={24} color="#EF4444" />
              <Text style={styles.title}>
                Report {type === "user" ? "User" : "Donation"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Report {reportedName} for inappropriate behavior
          </Text>

          <ScrollView style={styles.content}>
            <View style={styles.reasonsContainer}>
              <Text style={styles.label}>Reason for reporting *</Text>
              {reasons.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonOption,
                    selectedReason === reason && styles.reasonOptionSelected,
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <View
                    style={[
                      styles.radioButton,
                      selectedReason === reason && styles.radioButtonSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.reasonText,
                      selectedReason === reason && styles.reasonTextSelected,
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Additional details (Optional)</Text>
              <TextInput
                style={styles.textArea}
                value={description}
                onChangeText={setDescription}
                placeholder="Provide more details about the issue..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitReport}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? "Submitting..." : "Submit Report"}
              </Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
  },
  content: {
    flex: 1,
  },
  reasonsContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
  },
  reasonOptionSelected: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#2563EB",
  },
  reasonText: {
    fontSize: 16,
    color: "#374151",
  },
  reasonTextSelected: {
    color: "#2563EB",
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 24,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  submitButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
