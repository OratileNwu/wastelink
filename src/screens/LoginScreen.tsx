import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type LoginData = {
  email: string;
  password: string;
};

type Props = {
  onBack?: () => void;
  onRegister?: () => void;
  onForgotPassword?: () => void;
  onSubmit?: (data: LoginData) => void;
};

const GREEN = "#166534";
const LIGHT_GREEN = "#DCFCE7";
const BACKGROUND = "#F8FAF5";
const TEXT = "#1F2937";
const MUTED = "#78716C";
const BORDER = "#E5E7EB";

export default function LoginScreen({
  onBack,
  onRegister,
  onForgotPassword,
  onSubmit,
}: Props): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitForm = (): void => {
    onSubmit?.({ email, password });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={BACKGROUND} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logo}><Text style={styles.logoText}>W</Text></View>
          <Text style={styles.brand}>WasteLink</Text>
        </View>

        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.illustration}>
          <View style={styles.illustrationCircle}><Text style={styles.recycle}>♻</Text></View>
          <View style={styles.leafOne} />
          <View style={styles.leafTwo} />
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Log in to your WasteLink account and continue connecting waste to opportunity.
        </Text>

        <View style={styles.card}>
          <Text style={styles.formTitle}>Log in to your account</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="#9CA3AF" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="Enter your password" placeholderTextColor="#9CA3AF" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false} />
          </View>

          <TouchableOpacity style={styles.forgotButton} onPress={onForgotPassword}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={submitForm} activeOpacity={0.85}>
            <Text style={styles.submitText}>Login</Text>
          </TouchableOpacity>
          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>Don't have an account?</Text>
            <TouchableOpacity onPress={onRegister}><Text style={styles.link}> Register</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.security}>
          <View style={styles.securityIcon}><Text style={styles.securityCheck}>✓</Text></View>
          <Text style={styles.securityText}>Keep your account details private and secure.</Text>
        </View>
        <Text style={styles.footer}>WasteLink · Connecting Waste to Opportunity</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
  container: { flexGrow: 1, paddingHorizontal: 22, paddingTop: 18, paddingBottom: 28 },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 40, height: 40, borderRadius: 11, backgroundColor: GREEN, alignItems: "center", justifyContent: "center" },
  logoText: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  brand: { fontSize: 21, color: GREEN, fontWeight: "800" },
  backButton: { width: 36, height: 36, borderRadius: 9, borderWidth: 1, borderColor: BORDER, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginTop: 22, marginBottom: 14 },
  backText: { fontSize: 29, color: TEXT, marginTop: -4 },
  illustration: { height: 145, borderRadius: 20, backgroundColor: "#EAF7E9", alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: 20 },
  illustrationCircle: { width: 86, height: 86, borderRadius: 43, backgroundColor: GREEN, alignItems: "center", justifyContent: "center", zIndex: 2 },
  recycle: { fontSize: 57, color: "#FFFFFF" },
  leafOne: { position: "absolute", width: 22, height: 45, borderRadius: 22, backgroundColor: "#86CF8B", left: "25%", top: 20, transform: [{ rotate: "-35deg" }] },
  leafTwo: { position: "absolute", width: 22, height: 45, borderRadius: 22, backgroundColor: "#B0E2AA", right: "25%", bottom: 15, transform: [{ rotate: "35deg" }] },
  title: { color: TEXT, fontSize: 30, fontWeight: "800" },
  subtitle: { color: MUTED, fontSize: 13, lineHeight: 21, marginTop: 8, marginBottom: 20 },
  card: { padding: 18, borderRadius: 15, borderWidth: 1, borderColor: BORDER, backgroundColor: "#FFFFFF" },
  formTitle: { color: TEXT, fontSize: 16, fontWeight: "700", marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { color: TEXT, fontSize: 12, fontWeight: "600", marginBottom: 7 },
  input: { minHeight: 49, borderWidth: 1, borderColor: BORDER, borderRadius: 8, paddingHorizontal: 13, paddingVertical: 10, fontSize: 13, color: TEXT, backgroundColor: "#FFFFFF" },
  forgotButton: { alignSelf: "flex-end", paddingVertical: 5, marginTop: -6, marginBottom: 14 },
  forgotText: { color: GREEN, fontSize: 12, fontWeight: "700" },
  submitButton: { minHeight: 51, borderRadius: 9, backgroundColor: GREEN, alignItems: "center", justifyContent: "center" },
  submitText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  registerRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", flexWrap: "wrap", marginTop: 19 },
  registerPrompt: { color: MUTED, fontSize: 12 },
  link: { color: GREEN, fontSize: 12, fontWeight: "700" },
  security: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20 },
  securityIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: LIGHT_GREEN, alignItems: "center", justifyContent: "center" },
  securityCheck: { color: GREEN, fontSize: 13, fontWeight: "800" },
  securityText: { color: MUTED, fontSize: 11, flexShrink: 1 },
  footer: { color: MUTED, textAlign: "center", fontSize: 10, marginTop: 20 },
});
