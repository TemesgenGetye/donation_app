import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";

export default function IndexScreen() {
  const { session, loading, profile, signOut } = useAuth();
  const router = useRouter();
  const [blockedHandled, setBlockedHandled] = useState(false);
  const alertShown = useRef(false);

  console.log("blockedHandled", blockedHandled);
  console.log("alertShown", alertShown.current);

  useEffect(() => {
    if (
      !loading &&
      profile?.blocked &&
      !blockedHandled &&
      !alertShown.current
    ) {
      alertShown.current = true;
      setBlockedHandled(true);
      Alert.alert(
        "Blocked",
        "Your account has been blocked. Please contact support for more information.",
        [
          {
            text: "OK",
            onPress: async () => {
              await signOut();
              router.replace("/(auth)/login");
            },
          },
        ],
        { cancelable: false }
      );
      return;
    }
    if (!loading && profile?.blocked) {
      // Blocked, do nothing else
      return;
    }
    if (!loading && session && profile && !profile?.blocked) {
      router.replace("/(tabs)");
    } else if (!loading && session && !profile) {
      // Stay on loading screen while profile is being fetched
    } else if (!loading && !session) {
      router.replace("/(auth)/login");
    }
  }, [session, loading, profile, router, signOut, blockedHandled]);

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
    backgroundColor: "#F9FAFB",
  },
});
