import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function IndexScreen() {
  const { session, loading, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log(
      "Index screen - loading:",
      loading,
      "session:",
      !!session,
      "profile:",
      !!profile
    );

    if (!loading) {
      if (session && profile) {
        console.log("Redirecting to tabs");
        router.replace("/(tabs)");
      } else if (session && !profile) {
        console.log("Session exists but no profile, staying on loading");
        // Stay on loading screen while profile is being fetched
      } else {
        console.log("Redirecting to login");
        router.replace("/(auth)/login");
      }
    }
  }, [session, loading, profile, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});
