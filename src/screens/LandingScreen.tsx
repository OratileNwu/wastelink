/**
 * WasteLink landing page (React Native), a single self-contained file.
 * Needs: @react-navigation/native-stack, react-native-safe-area-context,
 * and the hero photo at assets/images/hero-recycling.jpg (two folders above this file).
 * Navigates to the routes "Register" and "Login".
 */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  ImageBackground,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

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

interface ScrollBus {
  state: { y: number; height: number };
  notify: () => void;
  subscribe: (fn: () => void) => () => void;
}

function useScrollBus(): ScrollBus {
  const ref = useRef<ScrollBus | null>(null);
  if (!ref.current) {
    const listeners = new Set<() => void>();
    ref.current = {
      state: { y: 0, height: 0 },
      notify: () => listeners.forEach((fn) => fn()),
      subscribe: (fn) => {
        listeners.add(fn);
        return () => {
          listeners.delete(fn);
        };
      },
    };
  }
  return ref.current;
}

const VisibleContext = createContext(true);

interface RevealSectionProps {
  bus: ScrollBus;
  style?: StyleProp<ViewStyle>;
  onLayout?: (e: LayoutChangeEvent) => void;
  children: React.ReactNode;
}

function RevealSection({ bus, style, onLayout, children }: RevealSectionProps) {
  const [visible, setVisible] = useState(false);
  const top = useRef<number | null>(null);
  const check = useCallback(() => {
    if (top.current === null) return;
    if (bus.state.y + bus.state.height * 0.9 > top.current + 24) setVisible(true);
  }, [bus]);
  useEffect(() => (visible ? undefined : bus.subscribe(check)), [visible, bus, check]);
  return (
    <VisibleContext.Provider value={visible}>
      <View
        style={style}
        onLayout={(e) => {
          top.current = e.nativeEvent.layout.y;
          onLayout?.(e);
          check();
        }}
      >
        {children}
      </View>
    </VisibleContext.Provider>
  );
}

interface RevealProps {
  delay?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

function Reveal({ delay = 0, style, children }: RevealProps) {
  const visible = useContext(VisibleContext);
  const reduce = useReduceMotion();
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!visible) return;
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
  }, [visible, reduce, delay, progress]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const stagger = (index: number) => Math.min(index, motion.staggerMax) * motion.staggerStep;

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

type PublicStackParamList = {
  Landing: undefined;
  Register: undefined;
  Login: undefined;
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const HERO_IMAGE = require('../../assets/images/hero-recycling.jpg');

type Props = NativeStackScreenProps<PublicStackParamList, 'Landing'>;
type SectionId = 'who' | 'how-it-works' | 'collection' | 'safeguards' | 'accounts';

const NAV_LINKS: { id: SectionId; label: string }[] = [
  { id: 'how-it-works', label: 'How it works' },
  { id: 'collection', label: 'Collection and delivery' },
  { id: 'safeguards', label: 'Safeguards' },
  { id: 'accounts', label: 'Accounts' },
];
const SPY_ORDER: SectionId[] = ['how-it-works', 'collection', 'safeguards', 'accounts'];

const AUDIENCES = [
  {
    title: 'For sellers',
    intro: 'Turn collected PET bottles into a listing that buyers can find and make offers on.',
    points: [
      'List your bottles with weight estimate, colour, condition, and whether they are sorted and clean.',
      'Add photographs and the date the bottles are available.',
      'Review offers, accept, reject, or counter with your own price.',
      'Offer delivery with your own transport and set your own fee.',
    ],
    cta: 'Start selling',
  },
  {
    title: 'For buyers',
    intro: 'Say what you need and let sellers come to you, or browse what is already listed.',
    points: [
      'Publish a purchasing requirement with weight range, price per kg, and accepted colours and conditions.',
      'Choose the collection areas and methods that suit you.',
      'Browse and match listings, then send an offer with your proposed price.',
      'Track each purchase through to confirmation.',
    ],
    cta: 'Start buying',
  },
];

const STEPS = [
  { title: 'List or request', text: 'Sellers publish PET bottle listings. Buyers publish what they want to purchase.' },
  { title: 'Make an offer', text: 'A buyer offers a price per kg on a listing. The seller accepts, rejects, or counters.' },
  { title: 'Agree the terms', text: 'Both sides settle the price, the collection method, and any delivery fee, using in-app messages.' },
  { title: 'Weigh and confirm', text: 'The bottles are weighed, both parties confirm, and the final amount is calculated from the verified weight.' },
];

const METHODS = [
  {
    title: 'Buyer collection',
    text: "The buyer arranges transport and collects from the seller's agreed collection address.",
    facts: [['Transport', 'arranged by the buyer'], ['Seller delivery fee', 'none']],
  },
  {
    title: 'Seller delivery',
    text: "The seller delivers to the buyer's agreed delivery address using their own transport.",
    facts: [['Transport', 'arranged by the seller'], ['Seller delivery fee', 'set by the seller, in ZAR']],
  },
  {
    title: 'Both methods',
    text: 'The seller supports collection and delivery. The buyer picks their preferred method before accepting.',
    facts: [['Transport', 'depends on the method chosen'], ['Seller delivery fee', 'shown before the buyer accepts']],
  },
];

const SAFEGUARDS = [
  { title: 'Estimated and verified weight are kept apart', text: "A seller's estimate is never shown as a verified weight. The final amount is based on the verified weight only." },
  { title: 'Weighing is recorded', text: 'Gross weight, container weight, and net weight are stored with photographs, and the record shows who entered and who verified each measurement.' },
  { title: 'Agreed values are locked in', text: 'The agreed price per kg and delivery fee are saved with the transaction and protected from unauthorised changes.' },
  { title: 'Your deals stay private', text: 'Only the buyer and seller involved can see an offer or transaction. Permissions are enforced by the platform, not only by the interface.' },
];

const ACTIVITIES = [
  { title: 'Seller only', text: 'List PET bottles and manage offers, sales, and your own deliveries.' },
  { title: 'Buyer only', text: 'Publish purchasing requirements, find listings, and manage your purchases.' },
  { title: 'Seller and buyer', text: 'Enable both activities and switch workspaces from one dashboard.' },
];

export function LandingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  const bus = useScrollBus();
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Partial<Record<SectionId, number>>>({});
  const [active, setActive] = useState<SectionId | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const goRegister = useCallback(() => navigation.navigate('Register'), [navigation]);
  const goLogin = useCallback(() => navigation.navigate('Login'), [navigation]);
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      bus.state.y = y;
      bus.notify();
      const isScrolled = y > 8;
      setScrolled((prev) => (prev === isScrolled ? prev : isScrolled));
      let current: SectionId | null = null;
      for (const id of SPY_ORDER) {
        const top = sectionY.current[id];
        if (top !== undefined && top <= y + 80) current = id;
      }
      setActive((prev) => (prev === current ? prev : current));
    },
    [bus],
  );
  const scrollToSection = (id: SectionId) =>
    scrollRef.current?.scrollTo({ y: sectionY.current[id] ?? 0, animated: true });
  const onSectionLayout = (id: SectionId, y: number) => {
    sectionY.current[id] = y;
  };
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <Header
        topInset={insets.top}
        compact={width < 380}
        scrolled={scrolled}
        active={active}
        onSelect={scrollToSection}
        onLogin={goLogin}
        onRegister={goRegister}
      />
      <ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onLayout={(e) => {
          bus.state.height = e.nativeEvent.layout.height;
          bus.notify();
        }}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground source={HERO_IMAGE} style={styles.hero}>
          <View style={styles.heroOverlay} />
          <Container>
            <View style={styles.heroCopy}>
              <Reveal delay={stagger(0)}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>PET plastic bottles</Text>
                </View>
              </Reveal>
              <Reveal delay={stagger(1)}>
                <Text accessibilityRole="header" style={[styles.heroTitle, wide && styles.heroTitleWide]}>
                  Buy and sell PET bottles directly
                </Text>
              </Reveal>
              <Reveal delay={stagger(2)}>
                <Text style={styles.heroLead}>
                  WasteLink connects sellers who have PET bottles available with buyers who need them. Agree the price and the
                  collection arrangement, then confirm the weight before the deal is completed.
                </Text>
              </Reveal>
              <Reveal delay={stagger(3)} style={styles.heroActions}>
                <Button label="Create account" variant="onDark" size="lg" onPress={goRegister} />
                <Button label="Log in" variant="outlineOnDark" size="lg" onPress={goLogin} />
              </Reveal>
              <Reveal delay={stagger(4)}>
                <Text style={styles.heroNote}>WasteLink currently supports PET plastic bottles only.</Text>
              </Reveal>
            </View>
          </Container>
        </ImageBackground>

        <Section id="who" alt bus={bus} onSectionLayout={onSectionLayout}>
          <Reveal>
            <Heading title="Built for both sides of the trade" body="Choose the activity that fits you. You can enable one or both on the same account." />
          </Reveal>
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.title} delay={stagger(i + 1)} style={styles.stackItem}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{a.title}</Text>
                <Text style={styles.body}>{a.intro}</Text>
                <View style={styles.checkList}>
                  {a.points.map((p) => (
                    <View key={p} style={styles.checkRow}>
                      <Text style={styles.checkMark}>✓</Text>
                      <Text style={[styles.body, styles.checkText]}>{p}</Text>
                    </View>
                  ))}
                </View>
                <Button label={a.cta} onPress={goRegister} />
              </View>
            </Reveal>
          ))}
        </Section>

        <Section id="how-it-works" bus={bus} onSectionLayout={onSectionLayout}>
          <Reveal>
            <Heading title="How a transaction works" body="Each purchase follows the same four stages, from first listing to completed deal." />
          </Reveal>
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={stagger(i + 1)}>
              <View style={styles.stepRow}>
                <View style={styles.stepRail}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </View>
                  {i < STEPS.length - 1 ? <View style={styles.stepLine} /> : null}
                </View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.body}>{step.text}</Text>
                </View>
              </View>
            </Reveal>
          ))}
        </Section>

        <Section id="collection" alt bus={bus} onSectionLayout={onSectionLayout}>
          <Reveal>
            <Heading
              title="Collection and delivery"
              body="Every listing states how the bottles can change hands. There is no separate transport service: each party uses their own."
            />
          </Reveal>
          {METHODS.map((m, i) => (
            <Reveal key={m.title} delay={stagger(i + 1)} style={styles.stackItem}>
              <View style={styles.card}>
                <Text style={styles.cardTitleSm}>{m.title}</Text>
                <Text style={styles.body}>{m.text}</Text>
                <View style={styles.facts}>
                  {m.facts.map(([label, value]) => (
                    <Text key={label} style={styles.factText}>
                      <Text style={styles.factLabel}>{label}: </Text>
                      {value}
                    </Text>
                  ))}
                </View>
              </View>
            </Reveal>
          ))}
          <Reveal delay={stagger(4)}>
            <Text style={[styles.body, styles.smallNote]}>
              Delivery fees are agreed per transaction. If a seller later changes the fee on a listing, deals that have already
              been agreed keep the fee that was agreed.
            </Text>
          </Reveal>
        </Section>

        <Section id="safeguards" bus={bus} onSectionLayout={onSectionLayout}>
          <Reveal>
            <Heading title="Clear numbers and a clear record" body="WasteLink is designed so that both parties can see what was agreed and what was measured." />
          </Reveal>
          {SAFEGUARDS.map((s, i) => (
            <Reveal key={s.title} delay={stagger(i + 1)} style={styles.stackItem}>
              <Text style={styles.cardTitleSm}>{s.title}</Text>
              <Text style={styles.body}>{s.text}</Text>
            </Reveal>
          ))}
        </Section>

        <Section id="accounts" alt bus={bus} onSectionLayout={onSectionLayout}>
          <Reveal>
            <Heading
              title="One account, two workspaces"
              body="Create your account once, then choose what you want to do on WasteLink. You land on a single dashboard and, if both activities are enabled, switch between the Seller and Buyer workspaces whenever you need to."
            />
          </Reveal>
          {ACTIVITIES.map((a, i) => (
            <Reveal key={a.title} delay={stagger(i + 1)} style={styles.stackItem}>
              <View style={styles.activity}>
                <Text style={styles.activityTitle}>{a.title}</Text>
                <Text style={styles.bodySmall}>{a.text}</Text>
              </View>
            </Reveal>
          ))}
          <Reveal delay={stagger(4)} style={styles.rowActions}>
            <Button label="Create account" onPress={goRegister} />
            <Button label="Log in" variant="outline" onPress={goLogin} />
          </Reveal>
        </Section>

        <RevealSection bus={bus} style={styles.ctaBand}>
          <Container>
            <Reveal>
              <Text accessibilityRole="header" style={styles.ctaTitle}>
                Ready to trade PET bottles?
              </Text>
              <Text style={styles.ctaBody}>Create your account and choose whether to sell, buy, or do both.</Text>
            </Reveal>
            <Reveal delay={stagger(1)} style={styles.ctaActions}>
              <Button label="Create account" variant="onDark" size="lg" fullWidth onPress={goRegister} />
              <Button label="Log in" variant="outlineOnDark" size="lg" fullWidth onPress={goLogin} />
            </Reveal>
          </Container>
        </RevealSection>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Container>
            <Text style={styles.footerBrand}>WasteLink</Text>
            <Text style={styles.bodySmall}>Connecting waste to opportunity.</Text>
            <View style={styles.footerLinks}>
              <Button label="Log in" variant="ghost" size="sm" onPress={goLogin} />
              <Button label="Create account" variant="ghost" size="sm" onPress={goRegister} />
            </View>
            <Text style={styles.legal}>© 2026 WasteLink. PET plastic bottles only.</Text>
          </Container>
        </View>
      </ScrollView>
    </View>
  );
}

interface HeaderProps {
  topInset: number;
  compact: boolean;
  scrolled: boolean;
  active: SectionId | null;
  onSelect: (id: SectionId) => void;
  onLogin: () => void;
  onRegister: () => void;
}

function Header({ topInset, compact, scrolled, active, onSelect, onLogin, onRegister }: HeaderProps) {
  const stripRef = useRef<ScrollView>(null);
  const stripWidth = useRef(0);
  const linkBox = useRef<Partial<Record<SectionId, { x: number; width: number }>>>({});
  useEffect(() => {
    if (!active) return;
    const box = linkBox.current[active];
    if (box) stripRef.current?.scrollTo({ x: Math.max(0, box.x - (stripWidth.current - box.width) / 2), animated: true });
  }, [active]);
  return (
    <View style={[styles.header, { paddingTop: topInset }, scrolled && shadow.sm]}>
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <View style={styles.logoLeaf} />
          </View>
          {compact ? null : <Text style={styles.brand}>WasteLink</Text>}
        </View>
        <View style={styles.headerActions}>
          <Button label="Log in" variant="outline" size="sm" onPress={onLogin} />
          <Button label="Create account" size="sm" onPress={onRegister} />
        </View>
      </View>
      <ScrollView
        ref={stripRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onLayout={(e) => {
          stripWidth.current = e.nativeEvent.layout.width;
        }}
        contentContainerStyle={styles.strip}
      >
        {NAV_LINKS.map((link) => {
          const isActive = active === link.id;
          return (
            <Pressable
              key={link.id}
              accessibilityRole="link"
              accessibilityState={{ selected: isActive }}
              onPress={() => onSelect(link.id)}
              onLayout={(e: LayoutChangeEvent) => {
                linkBox.current[link.id] = { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width };
              }}
              style={styles.link}
            >
              <Text style={[styles.linkText, isActive && styles.linkTextActive]}>{link.label}</Text>
              <View style={[styles.linkUnderline, isActive && styles.linkUnderlineActive]} />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return <View style={styles.container}>{children}</View>;
}

function Heading({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.heading}>
      <Text accessibilityRole="header" style={styles.h2}>
        {title}
      </Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

interface SectionProps {
  id: SectionId;
  bus: ScrollBus;
  onSectionLayout: (id: SectionId, y: number) => void;
  alt?: boolean;
  children: React.ReactNode;
}

function Section({ id, bus, onSectionLayout, alt, children }: SectionProps) {
  return (
    <RevealSection
      bus={bus}
      style={[styles.section, alt && styles.sectionAlt]}
      onLayout={(e) => onSectionLayout(id, e.nativeEvent.layout.y)}
    >
      <Container>{children}</Container>
    </RevealSection>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { width: '100%', maxWidth: layout.contentMaxWidth, alignSelf: 'center', paddingHorizontal: spacing.lg - 4 },
  header: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, zIndex: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: { width: 28, height: 28, borderRadius: radius.sm, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoLeaf: { width: 12, height: 12, backgroundColor: colors.white, borderTopLeftRadius: 2, borderTopRightRadius: 8, borderBottomRightRadius: 2, borderBottomLeftRadius: 8 },
  brand: { fontSize: fontSize.lg + 2, fontWeight: fontWeight.extrabold, color: colors.primary },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm - 2 },
  strip: { paddingHorizontal: spacing.md, gap: spacing.lg },
  link: { paddingTop: spacing.sm, paddingBottom: 0 },
  linkText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.textSecondary, paddingBottom: spacing.sm },
  linkTextActive: { color: colors.primary },
  linkUnderline: { height: 2, backgroundColor: 'transparent' },
  linkUnderlineActive: { backgroundColor: colors.primary },
  hero: { paddingVertical: 56 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.heroOverlay },
  heroCopy: { alignItems: 'flex-start', gap: spacing.md, maxWidth: 600 },
  badge: { backgroundColor: colors.primaryLight, borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 10 },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: '#166534' },
  heroTitle: { fontSize: 34, lineHeight: 40, fontWeight: fontWeight.bold, letterSpacing: -0.6, color: colors.white },
  heroTitleWide: { fontSize: 46, lineHeight: 52 },
  heroLead: { fontSize: fontSize.md + 1, lineHeight: 27, color: colors.onDarkSoft },
  heroActions: { alignItems: 'flex-start', gap: spacing.sm + 4, marginTop: spacing.sm },
  heroNote: { fontSize: fontSize.sm, color: colors.onDarkMuted },
  section: { paddingVertical: spacing.xl + 8 },
  sectionAlt: { backgroundColor: colors.surface, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  heading: { gap: spacing.sm, marginBottom: spacing.lg },
  h2: { fontSize: fontSize.xxl, lineHeight: 32, fontWeight: fontWeight.bold, color: colors.text },
  body: { fontSize: fontSize.md, lineHeight: 25, color: colors.textSecondary },
  bodySmall: { fontSize: fontSize.sm, lineHeight: 21, color: colors.textSecondary },
  stackItem: { marginBottom: spacing.md },
  smallNote: { fontSize: fontSize.sm, lineHeight: 21, marginTop: spacing.xs },
  rowActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm + 4, marginTop: spacing.sm },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.lg - 4, gap: spacing.md - 2, alignItems: 'flex-start', ...shadow.sm },
  cardTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  cardTitleSm: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text, marginBottom: 4 },
  checkList: { gap: spacing.sm + 4, alignSelf: 'stretch' },
  checkRow: { flexDirection: 'row', gap: spacing.sm + 2 },
  checkMark: { fontSize: fontSize.md, lineHeight: 25, fontWeight: fontWeight.bold, color: colors.primary },
  checkText: { flex: 1 },
  facts: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.xs, paddingTop: spacing.md - 2, borderTopWidth: 1, borderTopColor: colors.border },
  factText: { fontSize: fontSize.sm, lineHeight: 21, color: colors.textSecondary },
  factLabel: { fontWeight: fontWeight.semibold, color: colors.text },
  stepRow: { flexDirection: 'row', gap: spacing.md },
  stepRail: { alignItems: 'center', width: 32 },
  stepNumber: { width: 32, height: 32, borderRadius: radius.pill, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primaryDark },
  stepLine: { flex: 1, width: 2, backgroundColor: colors.primaryLight, marginVertical: 4 },
  stepBody: { flex: 1, gap: 4, paddingBottom: spacing.lg },
  stepTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.text },
  activity: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: colors.primary, borderRadius: radius.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.lg - 4, gap: 4 },
  activityTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.text },
  ctaBand: { backgroundColor: colors.primary, paddingVertical: spacing.xl + 16 },
  ctaTitle: { fontSize: fontSize.xxl, lineHeight: 32, fontWeight: fontWeight.bold, color: colors.white, marginBottom: 6 },
  ctaBody: { fontSize: fontSize.md, lineHeight: 25, color: colors.onDarkSoft },
  ctaActions: { gap: spacing.sm + 4, marginTop: spacing.lg },
  footer: { backgroundColor: colors.surface, paddingTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border },
  footerBrand: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.primary, marginBottom: 4 },
  footerLinks: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, marginLeft: -14 },
  legal: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
