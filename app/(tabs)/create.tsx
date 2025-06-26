import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { decode as atob } from "base-64";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, DollarSign, MapPin, Upload } from "lucide-react-native";
import { useState } from "react";
import {
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

export default function CreateScreen() {
  const { profile } = useAuth();
  const router = useRouter();

  // For donors - donation form
  const [donationTitle, setDonationTitle] = useState("");
  const [donationDescription, setDonationDescription] = useState("");
  const [donationCategory, setDonationCategory] = useState("");
  const [donationLocation, setDonationLocation] = useState("");
  const [donationImage, setDonationImage] = useState<string | null>(null);

  // For recipients - campaign form
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [campaignCategory, setCampaignCategory] = useState("");
  const [campaignLocation, setCampaignLocation] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [campaignImage, setCampaignImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const categories = [
    "Food",
    "Clothing",
    "Electronics",
    "Books",
    "Furniture",
    "Medical",
    "Education",
    "Other",
  ];

  // Unified image picker for both forms
  const pickImage = async (forDonation = true) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Camera roll permission is required to select images."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      if (forDonation) {
        setDonationImage(result.assets[0].uri);
      } else {
        setCampaignImage(result.assets[0].uri);
      }
    }
  };

  // Helper to convert base64 to Uint8Array
  function base64ToUint8Array(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // Accepts a uri, not using the global image state
  const uploadImage = async (uri: string | null) => {
    if (!uri) return null;
    try {
      let fileExt = uri.split(".").pop();
      if (!fileExt || fileExt.length > 5) fileExt = "jpg";
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      let fileData;
      let uploadOptions: any = {
        contentType: `image/${fileExt === "jpg" ? "jpeg" : fileExt}`,
        upsert: false,
      };
      if (Platform.OS === "web") {
        const response = await fetch(uri);
        fileData = await response.blob();
      } else {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        fileData = base64ToUint8Array(base64);
        if (uploadOptions.contentEncoding) delete uploadOptions.contentEncoding;
      }
      const uploadResult = await supabase.storage
        .from("donations")
        .upload(fileName, fileData, uploadOptions);
      if (uploadResult.error) {
        console.error("Upload error:", uploadResult.error);
        throw uploadResult.error;
      }
      const publicUrlResult = supabase.storage
        .from("donations")
        .getPublicUrl(fileName);
      if (!publicUrlResult.data || !publicUrlResult.data.publicUrl) {
        Alert.alert("Upload Error", "No image URL returned. Please try again.");
        return null;
      }
      return publicUrlResult.data.publicUrl;
    } catch {
      Alert.alert("Upload Error", "Failed to upload image. Please try again.");
      return null;
    }
  };

  const createDonation = async () => {
    if (
      !donationTitle ||
      !donationDescription ||
      !donationCategory ||
      !donationLocation
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    if (!profile) {
      Alert.alert("Error", "User profile not found");
      return;
    }
    setLoading(true);
    try {
      let imageUrl = null;
      if (donationImage) {
        imageUrl = await uploadImage(donationImage);
        if (!imageUrl) {
          setLoading(false);
          return;
        }
      }
      const insertResult = await supabase.from("donations").insert({
        donor_id: profile.id,
        title: donationTitle,
        description: donationDescription,
        category: donationCategory,
        location: donationLocation,
        image_url: imageUrl,
        status: "pending",
      });
      if (insertResult.error) throw insertResult.error;
      Alert.alert("Success", "Donation submitted for approval!", [
        { text: "OK", onPress: () => router.push("/(tabs)") },
      ]);
      setDonationTitle("");
      setDonationDescription("");
      setDonationCategory("");
      setDonationLocation("");
      setDonationImage(null);
    } catch {
      Alert.alert("Error", "Failed to create donation");
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (
      !campaignTitle ||
      !campaignDescription ||
      !campaignCategory ||
      !campaignLocation
    ) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    if (!profile) {
      Alert.alert("Error", "User profile not found");
      return;
    }
    setLoading(true);
    try {
      let imageUrl = null;
      if (campaignImage) {
        imageUrl = await uploadImage(campaignImage);
        if (!imageUrl) {
          setLoading(false);
          return;
        }
      }
      const insertResult = await supabase.from("campaigns").insert({
        recipient_id: profile.id,
        title: campaignTitle,
        description: campaignDescription,
        category: campaignCategory,
        location: campaignLocation,
        goal_amount: campaignGoal ? parseFloat(campaignGoal) : null,
        image_url: imageUrl,
        status: "pending",
      });
      if (insertResult.error) throw insertResult.error;
      Alert.alert("Success", "Campaign submitted for approval!", [
        { text: "OK", onPress: () => router.push({ pathname: "/campaigns" }) },
      ]);
      setCampaignTitle("");
      setCampaignDescription("");
      setCampaignCategory("");
      setCampaignLocation("");
      setCampaignGoal("");
      setCampaignImage(null);
    } catch {
      Alert.alert("Error", "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  // Show donation form for donors
  if (profile?.role === "donor") {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Donation</Text>
              <Text style={styles.subtitle}>Share what you want to donate</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={styles.input}
                  value={donationTitle}
                  onChangeText={setDonationTitle}
                  placeholder="What are you donating?"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={donationDescription}
                  onChangeText={setDonationDescription}
                  placeholder="Describe the item(s) in detail..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Category *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryContainer}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryButton,
                          donationCategory === cat &&
                            styles.categoryButtonActive,
                        ]}
                        onPress={() => setDonationCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.categoryButtonText,
                            donationCategory === cat &&
                              styles.categoryButtonTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Location *</Text>
                <View style={styles.locationInputContainer}>
                  <MapPin size={20} color="#6B7280" />
                  <TextInput
                    style={styles.locationInput}
                    value={donationLocation}
                    onChangeText={setDonationLocation}
                    placeholder="Enter pickup location"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Photo</Text>
                <TouchableOpacity
                  style={styles.imageUpload}
                  onPress={() => pickImage(true)}
                >
                  {donationImage ? (
                    <Image
                      source={{ uri: donationImage }}
                      style={styles.uploadedImage}
                    />
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Camera size={32} color="#6B7280" />
                      <Text style={styles.uploadText}>Add Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.createButton,
                  loading && styles.createButtonDisabled,
                ]}
                onPress={createDonation}
                disabled={loading}
              >
                <Upload size={20} color="#ffffff" />
                <Text style={styles.createButtonText}>
                  {loading ? "Creating..." : "Create Donation"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Show campaign form for recipients
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Campaign</Text>
            <Text style={styles.subtitle}>
              Tell your story and ask for help
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Campaign Title *</Text>
              <TextInput
                style={styles.input}
                value={campaignTitle}
                onChangeText={setCampaignTitle}
                placeholder="What do you need help with?"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={campaignDescription}
                onChangeText={setCampaignDescription}
                placeholder="Tell your story and explain why you need help..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryContainer}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        campaignCategory === cat && styles.categoryButtonActive,
                      ]}
                      onPress={() => setCampaignCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          campaignCategory === cat &&
                            styles.categoryButtonTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Goal Amount (Optional)</Text>
              <View style={styles.locationInputContainer}>
                <DollarSign size={20} color="#6B7280" />
                <TextInput
                  style={styles.locationInput}
                  value={campaignGoal}
                  onChangeText={setCampaignGoal}
                  placeholder="Enter target amount"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Location *</Text>
              <View style={styles.locationInputContainer}>
                <MapPin size={20} color="#6B7280" />
                <TextInput
                  style={styles.locationInput}
                  value={campaignLocation}
                  onChangeText={setCampaignLocation}
                  placeholder="Enter your location"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Photo</Text>
              <TouchableOpacity
                style={styles.imageUpload}
                onPress={() => pickImage(false)}
              >
                {campaignImage ? (
                  <Image
                    source={{ uri: campaignImage }}
                    style={styles.uploadedImage}
                  />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Camera size={32} color="#6B7280" />
                    <Text style={styles.uploadText}>Add Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.createButton,
                loading && styles.createButtonDisabled,
              ]}
              onPress={createCampaign}
              disabled={loading}
            >
              <Upload size={20} color="#ffffff" />
              <Text style={styles.createButtonText}>
                {loading ? "Creating..." : "Create Campaign"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  categoryContainer: {
    flexDirection: "row",
    paddingHorizontal: 0,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#ffffff",
  },
  categoryButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  categoryButtonTextActive: {
    color: "#ffffff",
  },
  locationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
  },
  locationInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#1F2937",
  },
  imageUpload: {
    height: 200,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  uploadPlaceholder: {
    alignItems: "center",
  },
  uploadText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  createButton: {
    backgroundColor: "#2563EB",
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
