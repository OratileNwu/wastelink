import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  onGetStarted?: () => void;
  onLogin?: () => void;
};

const GREEN = "#166534";
const DARK_GREEN = "#14532D";
const LIGHT_GREEN = "#DCFCE7";
const BACKGROUND = "#F8FAF5";
const TEXT = "#1F2937";
const MUTED = "#78716C";

export default function LandingScreen({
  onGetStarted,
  onLogin,
}: Props): React.JSX.Element {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BACKGROUND} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>W</Text>
          </View>
          <View>
            <Text style={styles.brand}>WasteLink</Text>
            <Text style={styles.tagline}>Connecting Waste to Opportunity</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.circle}>
            <Text style={styles.recycle}>♻</Text>
          </View>
          <Text style={styles.heroTitle}>
            Turn PET Waste{"\n"}into <Text style={styles.greenText}>Value.</Text>
          </Text>
          <Text style={styles.description}>
            Connect with PET bottle buyers and sellers. Find recyclable
            material and make collection easier.
          </Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>A smarter way to recycle</Text>
          </View>
        </View>

        <View style={styles.benefit}>
          <View style={styles.benefitIcon}><Text style={styles.iconText}>↗</Text></View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Sell PET bottles</Text>
            <Text style={styles.benefitDescription}>List available materials for buyers.</Text>
          </View>
        </View>
        <View style={styles.benefit}>
          <View style={styles.benefitIcon}><Text style={styles.iconText}>✓</Text></View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Find recyclable materials</Text>
            <Text style={styles.benefitDescription}>Buyers can discover listings and quantities.</Text>
          </View>
        </View>
        <View style={styles.benefit}>
          <View style={styles.benefitIcon}><Text style={styles.iconText}>♻</Text></View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Arrange collection</Text>
            <Text style={styles.benefitDescription}>Share collection details with other users.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={onGetStarted} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onLogin} activeOpacity={0.85}>
          <Text style={styles.secondaryButtonText}>Login</Text>
        </TouchableOpacity>
        <Text style={styles.footer}>Building a greener future, one bottle at a time.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
  container: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 28 },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 46, height: 46, borderRadius: 13, backgroundColor: GREEN, alignItems: "center", justifyContent: "center" },
  logoText: { color: "#FFFFFF", fontSize: 25, fontWeight: "800" },
  brand: { fontSize: 23, fontWeight: "800", color: GREEN },
  tagline: { fontSize: 10, color: MUTED },
  hero: { backgroundColor: "#EAF7E9", borderRadius: 22, padding: 22, alignItems: "center", marginTop: 28, marginBottom: 22 },
  circle: { width: 94, height: 94, borderRadius: 47, backgroundColor: GREEN, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  recycle: { fontSize: 62, color: "#FFFFFF" },
  heroTitle: { fontSize: 30, fontWeight: "800", color: TEXT, textAlign: "center", lineHeight: 37 },
  greenText: { color: GREEN },
  description: { color: MUTED, fontSize: 13, lineHeight: 21, textAlign: "center", marginTop: 12 },
  pill: { backgroundColor: LIGHT_GREEN, borderRadius: 30, paddingHorizontal: 14, paddingVertical: 8, marginTop: 15 },
  pillText: { color: DARK_GREEN, fontSize: 12, fontWeight: "700" },
  benefit: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 17 },
  benefitIcon: { width: 43, height: 43, borderRadius: 12, backgroundColor: LIGHT_GREEN, alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: 22, color: GREEN, fontWeight: "700" },
  benefitContent: { flex: 1 },
  benefitTitle: { color: TEXT, fontWeight: "700", fontSize: 14 },
  benefitDescription: { color: MUTED, fontSize: 12, marginTop: 3 },
  primaryButton: { minHeight: 52, backgroundColor: GREEN, borderRadius: 9, alignItems: "center", justifyContent: "center", marginTop: 8 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  arrow: { position: "absolute", right: 18, color: "#FFFFFF", fontSize: 20 },
  secondaryButton: { minHeight: 50, borderRadius: 9, borderWidth: 1, borderColor: GREEN, alignItems: "center", justifyContent: "center", marginTop: 11 },
  secondaryButtonText: { color: GREEN, fontSize: 15, fontWeight: "700" },
  footer: { color: MUTED, fontSize: 11, textAlign: "center", marginTop: 19 },
});
