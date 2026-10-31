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

type Role = "Seller" | "Buyer";

export type RegistrationData = {
  role: Role;
  fullName: string;
  organisation: string;
  email: string;
  phone: string;
  area: string;
  password: string;
  confirmPassword: string;
};

type Props = {
  onBack?: () => void;
  onLogin?: () => void;
  onSubmit?: (data: RegistrationData) => void;
};

const GREEN = "#166534";
const LIGHT_GREEN = "#DCFCE7";
const BACKGROUND = "#F8FAF5";
const TEXT = "#1F2937";
const MUTED = "#78716C";
const BORDER = "#E5E7EB";

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words";
};

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: FieldProps): React.JSX.Element {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
    </View>
  );
}

export default function RegistrationScreen({
  onBack,
  onLogin,
  onSubmit,
}: Props): React.JSX.Element {
  const [role, setRole] = useState<Role>("Seller");
  const [fullName, setFullName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const submitForm = (): void => {
    onSubmit?.({ role, fullName, organisation, email, phone, area, password, confirmPassword });
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

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Join WasteLink and connect with the PET recycling community.
        </Text>

        <Text style={styles.sectionTitle}>I want to join as a</Text>
        <View style={styles.roleRow}>
          {(["Seller", "Buyer"] as const).map((item) => {
            const selected = role === item;
            return (
              <TouchableOpacity key={item} onPress={() => setRole(item)} activeOpacity={0.85} style={[styles.roleButton, selected && styles.roleButtonSelected]}>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioInner} />}
                </View>
                <View>
                  <Text style={[styles.roleTitle, selected && styles.selectedText]}>{item}</Text>
                  <Text style={styles.roleDescription}>{item === "Seller" ? "List PET bottles" : "Buy PET materials"}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.card}>
          <Field label="Full Name *" placeholder="Enter your full name" value={fullName} onChangeText={setFullName} />
          <Field label="Business or Organisation" placeholder="Optional" value={organisation} onChangeText={setOrganisation} />
          <Field label="Email Address *" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Field label="Phone Number *" placeholder="e.g. 071 234 5678" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Field label="City or Collection Area *" placeholder="Enter your area" value={area} onChangeText={setArea} />
          <Field label="Password *" placeholder="Create a password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
          <Field label="Confirm Password *" placeholder="Enter your password again" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoCapitalize="none" />

          <Text style={styles.note}>Your details will be used to set up your WasteLink account.</Text>
          <TouchableOpacity style={styles.submitButton} onPress={submitForm} activeOpacity={0.85}>
            <Text style={styles.submitText}>Register</Text>
          </TouchableOpacity>
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account?</Text>
            <TouchableOpacity onPress={onLogin}><Text style={styles.link}> Log in</Text></TouchableOpacity>
          </View>
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
  backButton: { width: 36, height: 36, borderRadius: 9, borderWidth: 1, borderColor: BORDER, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginTop: 22, marginBottom: 16 },
  backText: { fontSize: 29, color: TEXT, marginTop: -4 },
  title: { color: TEXT, fontSize: 30, fontWeight: "800" },
  subtitle: { color: MUTED, fontSize: 13, lineHeight: 21, marginTop: 7, marginBottom: 22 },
  sectionTitle: { color: TEXT, fontSize: 13, fontWeight: "700", marginBottom: 10 },
  roleRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  roleButton: { flex: 1, minHeight: 73, flexDirection: "row", alignItems: "center", gap: 9, padding: 10, borderWidth: 1, borderColor: BORDER, borderRadius: 11, backgroundColor: "#FFFFFF" },
  roleButtonSelected: { borderColor: GREEN, backgroundColor: "#F0FBF2" },
  radio: { width: 18, height: 18, borderWidth: 1.5, borderColor: "#A8A29E", borderRadius: 9, alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: GREEN },
  radioInner: { width: 9, height: 9, borderRadius: 5, backgroundColor: GREEN },
  roleTitle: { color: TEXT, fontWeight: "700", fontSize: 13 },
  selectedText: { color: GREEN },
  roleDescription: { color: MUTED, fontSize: 10, marginTop: 3 },
  card: { padding: 16, borderRadius: 14, borderWidth: 1, borderColor: BORDER, backgroundColor: "#FFFFFF" },
  field: { marginBottom: 14 },
  label: { color: TEXT, fontSize: 12, fontWeight: "600", marginBottom: 7 },
  input: { minHeight: 47, borderWidth: 1, borderColor: BORDER, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: TEXT, backgroundColor: "#FFFFFF" },
  note: { color: MUTED, fontSize: 11, lineHeight: 17, marginBottom: 12 },
  submitButton: { minHeight: 51, backgroundColor: GREEN, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  submitText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  loginRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 17, flexWrap: "wrap" },
  loginPrompt: { color: MUTED, fontSize: 12 },
  link: { color: GREEN, fontSize: 12, fontWeight: "700" },
  footer: { color: MUTED, textAlign: "center", fontSize: 10, marginTop: 20 },
});
