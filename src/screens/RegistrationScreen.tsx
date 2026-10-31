/**
 * WasteLink registration screen (React Native), a single self-contained file.
 * Needs: @react-navigation/native-stack, react-native-safe-area-context,
 * the hero photo at assets/images/hero-recycling.jpg (two folders above this file),
 * and the team's AuthContext (context/AuthContext) exposing signUp.
 * Navigates to the routes "Landing", "Register" and "Login".
 */
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// ======================================================================
// DESIGN TOKENS (mirror global.css)
// ======================================================================

const colors = {
  primary: '#166534',
  primaryDark: '#14532D',
  primaryLight: '#DCFCE7',
  secondary: '#22C55E',
  background: '#F8FAF5',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#78716C',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  danger: '#DC2626',
  white: '#FFFFFF',
  onDarkSoft: 'rgba(255,255,255,0.88)',
  onDarkMuted: 'rgba(255,255,255,0.72)',
  heroOverlay: 'rgba(20,83,45,0.86)',
  alertErrorBg: '#FEF2F2',
  alertErrorText: '#991B1B',
  alertErrorBorder: '#FECACA',
  alertSuccessBg: '#F0FDF4',
  alertSuccessText: '#166534',
  alertSuccessBorder: '#BBF7D0',
} as const;

const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40 } as const;
const radius = { sm: 8, md: 12, lg: 20, pill: 999 } as const;
const fontSize = { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 26 } as const;
const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

const layout = { contentMaxWidth: 720, formMaxWidth: 480 } as const;
const motion = { fast: 100, reveal: 520, staggerStep: 80, staggerMax: 4 } as const;

const shadow = {
  sm: (Platform.select<ViewStyle>({
    ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
    android: { elevation: 1 },
    default: {},
  }) ?? {}) as ViewStyle,
  md: (Platform.select<ViewStyle>({
    ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
    android: { elevation: 4 },
    default: {},
  }) ?? {}) as ViewStyle,
};

// ======================================================================
// MOTION
// ======================================================================

function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => mounted && setReduce(value));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

function Reveal({ delay = 0, style, children }: { delay?: number; style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  const reduce = useReduceMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduce) {
      progress.setValue(1);
      return;
    }
    Animated.timing(progress, {
      toValue: 1,
      duration: motion.reveal,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [reduce, delay, progress]);

  return (
    <Animated.View
      style={[
        style,
        { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const stagger = (index: number) => Math.min(index, motion.staggerMax) * motion.staggerStep;

// ======================================================================
// BUTTON
// ======================================================================

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'onDark' | 'outlineOnDark';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

const VARIANTS: Record<ButtonVariant, { bg: string; pressedBg: string; border: string; text: string }> = {
  primary: { bg: colors.primary, pressedBg: colors.primaryDark, border: 'transparent', text: colors.white },
  secondary: { bg: colors.primaryLight, pressedBg: '#BBF7D0', border: 'transparent', text: colors.primaryDark },
  outline: { bg: 'transparent', pressedBg: colors.primaryLight, border: colors.border, text: colors.text },
  ghost: { bg: 'transparent', pressedBg: colors.primaryLight, border: 'transparent', text: colors.primary },
  onDark: { bg: colors.white, pressedBg: colors.primaryLight, border: 'transparent', text: colors.primaryDark },
  outlineOnDark: { bg: 'transparent', pressedBg: 'rgba(255,255,255,0.12)', border: 'rgba(255,255,255,0.6)', text: colors.white },
};

const SIZES: Record<ButtonSize, { minHeight: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { minHeight: 38, paddingHorizontal: 14, fontSize: 13 },
  md: { minHeight: 48, paddingHorizontal: 20, fontSize: 15 },
  lg: { minHeight: 54, paddingHorizontal: 26, fontSize: 16 },
};

function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  accessibilityHint,
  style,
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const inactive = disabled || loading;

  const animateTo = (toValue: number) =>
    Animated.timing(scale, { toValue, duration: motion.fast, useNativeDriver: true }).start();

  return (
    <Animated.View style={[fullWidth ? buttonStyles.full : buttonStyles.auto, { transform: [{ scale }] }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: inactive, busy: loading }}
        disabled={inactive}
        onPress={onPress}
        onPressIn={() => animateTo(0.98)}
        onPressOut={() => animateTo(1)}
        style={({ pressed }) => [
          buttonStyles.base,
          {
            minHeight: s.minHeight,
            paddingHorizontal: s.paddingHorizontal,
            backgroundColor: pressed ? v.pressedBg : v.bg,
            borderColor: v.border,
            opacity: disabled ? 0.55 : 1,
          },
        ]}
      >
        {loading ? <ActivityIndicator size="small" color={v.text} style={buttonStyles.spinner} /> : null}
        <Text style={[buttonStyles.label, { color: v.text, fontSize: s.fontSize }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const buttonStyles = StyleSheet.create({
  auto: { flexShrink: 0 },
  full: { alignSelf: 'stretch' },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
  },
  label: { fontWeight: fontWeight.semibold },
  spinner: { marginRight: 8 },
});

// ======================================================================
// TEXT FIELD
// ======================================================================

interface TextFieldProps extends Omit<TextInputProps, 'secureTextEntry' | 'style'> {
  label: string;
  error?: string;
  helper?: string;
  secure?: boolean;
}

const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, helper, secure = false, onFocus, onBlur, ...inputProps },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={fieldStyles.group}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[fieldStyles.field, { borderColor }]}>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secure && hidden}
          style={fieldStyles.input}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            hitSlop={8}
            onPress={() => setHidden((h) => !h)}
            style={fieldStyles.toggle}
          >
            <Text style={fieldStyles.toggleText}>{hidden ? 'Show' : 'Hide'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={fieldStyles.error}>
          {error}
        </Text>
      ) : helper ? (
        <Text style={fieldStyles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
});

const fieldStyles = StyleSheet.create({
  group: { gap: spacing.sm },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.text },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  input: { flex: 1, minHeight: 48, fontSize: fontSize.md, color: colors.text, paddingVertical: 12 },
  toggle: { paddingLeft: spacing.sm },
  toggleText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary },
  error: { fontSize: fontSize.xs + 1, color: colors.alertErrorText },
  helper: { fontSize: fontSize.xs + 1, color: colors.textSecondary },
});

// ======================================================================
// BANNER
// ======================================================================

interface BannerProps {
  kind: 'error' | 'success';
  message: string;
}

function Banner({ kind, message }: BannerProps) {
  const isError = kind === 'error';
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        bannerStyles.box,
        {
          backgroundColor: isError ? colors.alertErrorBg : colors.alertSuccessBg,
          borderColor: isError ? colors.alertErrorBorder : colors.alertSuccessBorder,
        },
      ]}
    >
      <Text style={{ fontSize: fontSize.sm, color: isError ? colors.alertErrorText : colors.alertSuccessText }}>
        {message}
      </Text>
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  box: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: radius.sm, borderWidth: 1 },
});

// ======================================================================
// AUTH LAYOUT
// ======================================================================

// eslint-disable-next-line @typescript-eslint/no-var-requires
const HERO_IMAGE = require('../../assets/images/hero-recycling.jpg');

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}

function AuthLayout({ title, subtitle, onBack, children, footer }: AuthLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={layoutStyles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <ScrollView
        style={layoutStyles.flex}
        contentContainerStyle={layoutStyles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground source={HERO_IMAGE} style={[layoutStyles.header, { paddingTop: insets.top + spacing.md }]}>
          <View style={layoutStyles.overlay} />
          <View style={layoutStyles.headerInner}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
              onPress={onBack}
              style={({ pressed }) => [layoutStyles.back, pressed && layoutStyles.backPressed]}
            >
              <Text style={layoutStyles.backIcon}>‹</Text>
            </Pressable>
            <Reveal>
              <Text style={layoutStyles.brand}>WasteLink</Text>
            </Reveal>
            <Reveal delay={stagger(1)}>
              <Text accessibilityRole="header" style={layoutStyles.title}>{title}</Text>
            </Reveal>
            <Reveal delay={stagger(2)}>
              <Text style={layoutStyles.subtitle}>{subtitle}</Text>
            </Reveal>
          </View>
        </ImageBackground>
        <View style={[layoutStyles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={layoutStyles.sheetInner}>
            <Reveal delay={stagger(2)} style={layoutStyles.form}>{children}</Reveal>
            <Reveal delay={stagger(3)}>{footer}</Reveal>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const layoutStyles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.primaryDark },
  scroll: { flexGrow: 1 },
  header: { paddingBottom: spacing.xl + spacing.lg },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.heroOverlay },
  headerInner: {
    width: '100%',
    maxWidth: layout.formMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  back: {
    width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)', marginBottom: spacing.md,
  },
  backPressed: { backgroundColor: 'rgba(255,255,255,0.26)' },
  backIcon: { color: colors.white, fontSize: 28, lineHeight: 30, marginTop: -2 },
  brand: { color: colors.onDarkSoft, fontSize: fontSize.md, fontWeight: fontWeight.extrabold },
  title: { color: colors.white, fontSize: 30, lineHeight: 36, fontWeight: fontWeight.bold, letterSpacing: -0.4 },
  subtitle: { color: colors.onDarkSoft, fontSize: fontSize.md, lineHeight: 24 },
  sheet: {
    flex: 1, marginTop: -spacing.lg, paddingTop: spacing.xl, paddingHorizontal: spacing.lg,
    backgroundColor: colors.background, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
  },
  sheetInner: { width: '100%', maxWidth: layout.formMaxWidth, alignSelf: 'center', gap: spacing.lg },
  form: { gap: spacing.md },
});

// ======================================================================
// AUTH ACTIONS
// ======================================================================

interface RegisterInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

function useAuthActions(): AuthActions {
  const { signIn, signUp, resetPassword } = useAuth();
  return { signIn, signUp, resetPassword };
}

// ======================================================================
// VALIDATION AND FIREBASE ERROR WORDING
// ======================================================================

type RegisterField = 'fullName' | 'email' | 'phoneNumber' | 'password' | 'confirmPassword';
type RegisterValues = Record<RegisterField, string>;
type FieldErrors<T extends string> = Partial<Record<T, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function normalisePhone(value: string): string {
  return value.replace(/[\s\-()]/g, '');
}

function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'Enter your email address.';
  if (!EMAIL_PATTERN.test(value.trim())) return 'Enter a valid email address.';
  return undefined;
}

function validateRegisterField(field: RegisterField, values: RegisterValues): string | undefined {
  const value = values[field];
  switch (field) {
    case 'fullName':
      return value.trim().length < 2 ? 'Enter your full name.' : undefined;
    case 'email':
      return validateEmail(value);
    case 'phoneNumber':
      if (!value.trim()) return 'Enter your phone number.';
      return /^\+?\d{9,15}$/.test(normalisePhone(value)) ? undefined : 'Enter a valid phone number.';
    case 'password':
      if (value.length < 8) return 'Use at least 8 characters.';
      if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Include at least one letter and one number.';
      return undefined;
    case 'confirmPassword':
      return value !== values.password ? 'Passwords do not match.' : undefined;
  }
}

function validateRegister(values: RegisterValues): FieldErrors<RegisterField> {
  const fields: RegisterField[] = ['fullName', 'email', 'phoneNumber', 'password', 'confirmPassword'];
  const errors: FieldErrors<RegisterField> = {};
  fields.forEach((field) => {
    const message = validateRegisterField(field, values);
    if (message) errors[field] = message;
  });
  return errors;
}

function getAuthErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : '';
  switch (code) {
    case 'auth/email-already-in-use': return 'An account with this email already exists. Log in instead.';
    case 'auth/invalid-email': return 'Enter a valid email address.';
    case 'auth/weak-password': return 'Choose a stronger password with at least 8 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'The email or password is incorrect.';
    case 'auth/user-disabled': return 'This account has been disabled. Contact support for help.';
    case 'auth/too-many-requests': return 'Too many attempts. Wait a few minutes and try again.';
    case 'auth/network-request-failed': return 'No connection. Check your internet and try again.';
    default: return 'Something went wrong. Try again.';
  }
}

// ======================================================================
// RegisterScreen
// ======================================================================

type PublicStackParamList = { Landing: undefined; Register: undefined; Login: undefined };
type Props = NativeStackScreenProps<PublicStackParamList, 'Register'>;
type BannerState = { kind: 'error' | 'success'; message: string } | null;

const EMPTY: RegisterValues = { fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' };

export function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuthActions();
  const [values, setValues] = useState<RegisterValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<RegisterField>>({});
  const [banner, setBanner] = useState<BannerState>(null);
  const [submitting, setSubmitting] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const setField = (field: RegisterField) => (text: string) => {
    const next = { ...values, [field]: text };
    setValues(next);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: validateRegisterField(field, next) }));
  };

  const checkField = (field: RegisterField) => () =>
    setErrors((prev) => ({ ...prev, [field]: validateRegisterField(field, values) }));

  const goBack = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Landing'));

  const handleSubmit = async () => {
    if (submitting) return;
    Keyboard.dismiss();
    const found = validateRegister(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setBanner(null);
    try {
      await signUp({
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        phoneNumber: normalisePhone(values.phoneNumber),
        password: values.password,
      });
      setBanner({ kind: 'success', message: 'Account created. Setting up your workspace.' });
    } catch (error) {
      setBanner({ kind: 'error', message: getAuthErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start trading PET bottles. You choose whether to sell, buy, or both once you are in."
      onBack={goBack}
      footer={
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Button label="Log in" variant="ghost" size="sm" onPress={() => navigation.replace('Login')} />
        </View>
      }
    >
      {banner ? <Banner kind={banner.kind} message={banner.message} /> : null}
      <TextField
        label="Full name" value={values.fullName} onChangeText={setField('fullName')}
        onBlur={checkField('fullName')} error={errors.fullName} autoCapitalize="words" autoComplete="name"
        textContentType="name" returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()}
      />
      <TextField
        ref={emailRef} label="Email" value={values.email} onChangeText={setField('email')}
        onBlur={checkField('email')} error={errors.email} keyboardType="email-address" autoCapitalize="none"
        autoCorrect={false} autoComplete="email" textContentType="emailAddress" returnKeyType="next"
        onSubmitEditing={() => phoneRef.current?.focus()}
      />
      <TextField
        ref={phoneRef} label="Phone number" value={values.phoneNumber} onChangeText={setField('phoneNumber')}
        onBlur={checkField('phoneNumber')} error={errors.phoneNumber} keyboardType="phone-pad"
        autoComplete="tel" textContentType="telephoneNumber" returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef} label="Password" value={values.password} onChangeText={setField('password')}
        onBlur={checkField('password')} error={errors.password}
        helper="At least 8 characters, with a letter and a number." secure autoCapitalize="none"
        autoComplete="new-password" textContentType="newPassword" returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
      />
      <TextField
        ref={confirmRef} label="Confirm password" value={values.confirmPassword}
        onChangeText={setField('confirmPassword')} onBlur={checkField('confirmPassword')}
        error={errors.confirmPassword} secure autoCapitalize="none" autoComplete="new-password"
        textContentType="newPassword" returnKeyType="done" onSubmitEditing={handleSubmit}
      />
      <Button label="Create account" size="lg" fullWidth loading={submitting} onPress={handleSubmit} style={styles.submit} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: spacing.sm },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  footerText: { fontSize: fontSize.sm, fontWeight: fontWeight.regular, color: colors.textSecondary },
});
