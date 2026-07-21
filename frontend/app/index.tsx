import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type ViewStyle } from 'react-native';
import { AnimatedText } from '../src/components/landing/AnimatedText';
import { CardSwap } from '../src/components/landing/CardSwap';
import { GradientText } from '../src/components/landing/GradientText';
import { Marquee } from '../src/components/landing/Marquee';
import { ScreenMockup } from '../src/components/landing/ScreenMockup';
import { ScrollReveal } from '../src/components/landing/ScrollReveal';
import { ShinyText } from '../src/components/landing/ShinyText';
import { TopBar } from '../src/components/landing/TopBar';
import { ClickSpark } from '../src/components/common/ClickSpark';
import { CountUp } from '../src/components/common/CountUp';
import { GlassBackground } from '../src/components/common/GlassBackground';
import { GlassCard } from '../src/components/common/GlassCard';
import { RotatingText } from '../src/components/common/RotatingText';
import { SpecularButton } from '../src/components/common/SpecularButton';
import { useAuthStore } from '../src/store/authStore';
import { theme } from '../src/theme/theme';

const HERO_PHRASES = [
  'Listens when you need to be heard.',
  'Asks questions — never diagnoses.',
  'Points you to a book, an author, an idea.',
  'Always here, without judgment.',
];

const FEATURES = [
  {
    title: 'Conversation, not advice',
    body: 'Alex listens and asks guiding questions. No diagnoses, no ready-made fixes — just space to think out loud.',
  },
  {
    title: 'Ideas from psychology',
    body: 'When it fits, your companion brings up relevant concepts, books and quotes — from Stoicism to attachment theory.',
  },
  {
    title: 'A library at hand',
    body: 'A curated collection of psychology quotes and books — searchable and filterable by topic, always one tap away.',
  },
  {
    title: 'Gentle with you',
    body: 'A calm tone, privacy, and soft care for how you feel — if the conversation needs a pause, Alex senses it.',
  },
];

const SCREENS = [
  {
    kind: 'today' as const,
    caption: 'Today — quote of the day & featured book',
    heading: 'Start your day grounded',
    body: 'A quote and a featured book waiting for you each morning — a small nudge before the day gets loud.',
  },
  {
    kind: 'chat' as const,
    caption: 'Chat — talk with Alex',
    heading: 'Talk it through with Alex',
    body: 'Guiding questions, not advice. Alex listens, reflects, and brings up an idea only when it truly fits.',
  },
  {
    kind: 'library' as const,
    caption: 'Library — quotes & books',
    heading: 'A library at your side',
    body: 'Quotes and books from psychology, organized by topic — searchable whenever a conversation needs one.',
  },
];

const TOPICS = [
  'Stoicism',
  'Attachment',
  'Mindfulness',
  'Boundaries',
  'Cognitive Distortions',
  'Emotional Intelligence',
  'Meaning and Existence',
  'Self-Knowledge',
];

const STATS = [
  { value: 33, label: 'quotes' },
  { value: 17, label: 'books' },
  { value: 8, label: 'topics' },
  { value: 16, label: 'authors' },
];

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isWide = width >= 900;
  const [activeScreen, setActiveScreen] = useState(0);
  const activeScreenInfo = SCREENS[activeScreen] ?? SCREENS[0];

  // ---- Card-stack geometry (derived, so it survives any window width) ----
  // Fit the stack into whatever horizontal room the showcase column has, then
  // derive the fan offsets and the exact stage height from the card size.
  const CAPTION_W = 300;
  const containerW = Math.min(1100, width - theme.spacing.lg * 2);
  const stageW = isWide ? containerW - CAPTION_W - theme.spacing.xl : containerW;
  // /1.22 leaves room for the rightward fan so back cards don't clip.
  const cardW = Math.round(Math.max(300, Math.min(720, stageW / 1.22)));
  const cardH = Math.round(cardW * 0.72);
  const vDist = Math.round(cardH * 0.15);
  const cardDist = Math.round(cardW * 0.075);
  const stackTopPad = vDist * 2; // headroom for the cards that fan upward
  const stageHeight = stackTopPad + cardH; // front card's bottom == stage bottom
  // Gap between the resting stack and the stats bubble below (shared so the
  // stage's clip line and the bubble's offset always line up exactly).
  const bubbleGap = theme.spacing.xl;

  const primaryCta = () => router.navigate(accessToken ? '/(tabs)/today' : '/register');

  return (
    <GlassBackground>
      <TopBar />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ---- Hero ---- */}
        <View style={styles.hero}>
          <ShinyText style={styles.eyebrow}>AN AI COMPANION FOR PSYCHOLOGY</ShinyText>
          <AnimatedText text="A space where you are" style={styles.heroLine} />
          <GradientText style={styles.heroLine}>truly heard</GradientText>
          <View style={styles.rotatingWrap}>
            <RotatingText phrases={HERO_PHRASES} style={styles.rotating} />
          </View>
          <View style={styles.heroActions}>
            <ClickSpark onPress={primaryCta}>
              <SpecularButton style={styles.ctaPrimary} onPress={primaryCta}>
                <Text style={styles.ctaPrimaryText}>{accessToken ? 'Open the app' : 'Start free'}</Text>
              </SpecularButton>
            </ClickSpark>
            {!accessToken ? (
              <Pressable style={styles.ctaGhost} onPress={() => router.navigate('/login')}>
                <Text style={styles.ctaGhostText}>I already have an account</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* ---- Topics marquee ---- */}
        <View style={styles.marqueeSection}>
          <Marquee items={TOPICS} />
        </View>

        {/* ---- Features ---- */}
        <Section id="features" title="What Alex does" subtitle="A companion, not a therapist — and that is its strength.">
          <View style={[styles.featureGrid, isWide && styles.featureGridWide]}>
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 90} style={isWide ? styles.featureCellWide : styles.featureCell}>
                <GlassCard style={styles.featureCard}>
                  <View style={styles.featureMark} />
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureBody}>{f.body}</Text>
                </GlassCard>
              </ScrollReveal>
            ))}
          </View>
        </Section>

        {/* ---- Screens showcase ---- */}
        <Section id="screens" title="How it looks" subtitle="One calm interface across every device.">
          <View style={[styles.showcaseRow, !isWide && styles.showcaseColumn]}>
            {/* stackTopPad pushes the stack down just enough that the cards
                fanning UPWARD clear the top edge. The clip box itself is
                extended by bubbleGap and pulled back up with an equal
                negative marginBottom — a no-op for layout (the row's height
                and the bubble's position below are unaffected) but it moves
                the overflow:hidden edge down to exactly where the stats
                bubble begins, so the falling card is cleanly cropped there
                instead of merely ghosting through the glass blur. */}
            <View style={[styles.swapStage, { height: stageHeight + bubbleGap, marginBottom: -bubbleGap }]}>
              <View style={{ marginTop: stackTopPad }}>
                <CardSwap
                  width={cardW}
                  height={cardH}
                  cardDistance={cardDist}
                  verticalDistance={vDist}
                  onActiveChange={setActiveScreen}
                  items={SCREENS.map((s) => (
                    <ScreenMockup key={s.kind} kind={s.kind} caption={s.caption} />
                  ))}
                />
              </View>
            </View>

            {/* Flat description that swaps in sync with the front card — sits
                outside the 3D/skew transform so it stays easy to read. */}
            <View style={[styles.screenCaption, !isWide && styles.screenCaptionNarrow]}>
              <Text style={styles.screenCaptionIndex}>
                {String(activeScreen + 1).padStart(2, '0')} / {String(SCREENS.length).padStart(2, '0')}
              </Text>
              <GradientText style={styles.screenCaptionTitle}>{activeScreenInfo.heading}</GradientText>
              <Text style={styles.screenCaptionBody}>{activeScreenInfo.body}</Text>
            </View>
          </View>

          {/* ---- Stats, in a glass bubble the card stack visually clips into ---- */}
          <ScrollReveal>
            <View style={[styles.statsBubbleWrap, { marginTop: bubbleGap }]}>
              <GlassCard strong style={styles.statsBubble}>
                <View style={styles.statsRow}>
                  {STATS.map((s) => (
                    <View key={s.label} style={styles.statCell}>
                      <View style={styles.statValueRow}>
                        <CountUp target={s.value} style={styles.statValue} />
                      </View>
                      <Text style={styles.statLabel}>{s.label}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </View>
          </ScrollReveal>
        </Section>

        {/* ---- Topics grid ---- */}
        <Section id="topics" title="Topics you can talk about" subtitle="From everyday anxiety to the big questions of meaning.">
          <View style={styles.topicsWrap}>
            {TOPICS.map((t) => (
              <View key={t} style={styles.topicChip}>
                <Text style={styles.topicChipText}>{t}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* ---- Final CTA ---- */}
        <ScrollReveal>
          <GlassCard strong style={styles.finalCta}>
            <GradientText style={styles.finalTitle}>Start the conversation today</GradientText>
            <Text style={styles.finalBody}>
              Free, without judgment, at your own pace. Alex is ready to listen.
            </Text>
            <ClickSpark onPress={primaryCta}>
              <SpecularButton style={styles.ctaPrimary} onPress={primaryCta}>
                <Text style={styles.ctaPrimaryText}>{accessToken ? 'Open the app' : 'Create account'}</Text>
              </SpecularButton>
            </ClickSpark>
          </GlassCard>
        </ScrollReveal>

        {/* ---- Footer ---- */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>Alex</Text>
          <Text style={styles.footerNote}>
            This is a companion, not a substitute for professional help. In a crisis, please reach out to a specialist.
          </Text>
        </View>
      </ScrollView>
    </GlassBackground>
  );
}

function Section({ id, title, subtitle, children }: { id: string; title: string; subtitle: string; children: ReactNode }) {
  const anchorProps = Platform.OS === 'web' ? ({ nativeID: id } as object) : {};
  return (
    <View style={styles.section} {...anchorProps}>
      <ScrollReveal>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </ScrollReveal>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const contentWidth: ViewStyle = { width: '100%', maxWidth: 1100, alignSelf: 'center' };

const styles = StyleSheet.create({
  scroll: { paddingBottom: theme.spacing.xl * 2 },

  hero: { ...contentWidth, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xl * 2, paddingBottom: theme.spacing.xl, alignItems: 'center', gap: theme.spacing.md },
  eyebrow: { fontSize: theme.fontSize.sm, fontWeight: '700', letterSpacing: 1.5 },
  heroLine: { fontSize: 44, lineHeight: 52, fontWeight: '700', color: theme.colors.textPrimary, textAlign: 'center' },
  rotatingWrap: { height: 30, marginTop: theme.spacing.sm },
  rotating: { fontSize: theme.fontSize.lg, color: theme.colors.textSecondary, textAlign: 'center' },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md, marginTop: theme.spacing.lg, alignItems: 'center', justifyContent: 'center' },
  ctaPrimary: { backgroundColor: theme.colors.accent, borderRadius: theme.radius.md, paddingVertical: 14, paddingHorizontal: theme.spacing.xl, alignItems: 'center' },
  ctaPrimaryText: { color: theme.gradient[0], fontSize: theme.fontSize.md, fontWeight: '700' },
  ctaGhost: { paddingVertical: 14, paddingHorizontal: theme.spacing.lg },
  ctaGhostText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.md, fontWeight: '600', textDecorationLine: 'underline' },

  marqueeSection: { paddingVertical: theme.spacing.xl },

  section: { ...contentWidth, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.xl },
  sectionTitle: { fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.textPrimary, textAlign: 'center' },
  sectionSubtitle: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg },
  sectionBody: {},

  featureGrid: { gap: theme.spacing.md },
  featureGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  featureCell: { width: '100%' },
  featureCellWide: { width: '48%' },
  featureCard: { gap: theme.spacing.sm, minHeight: 160 },
  featureMark: { width: 28, height: 28, borderRadius: 8, backgroundColor: theme.colors.accent, opacity: 0.85, marginBottom: theme.spacing.xs },
  featureTitle: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.textPrimary },
  featureBody: { fontSize: theme.fontSize.sm, lineHeight: 22, color: theme.colors.textSecondary },

  showcaseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.xl },
  showcaseColumn: { flexDirection: 'column', gap: theme.spacing.lg },
  swapStage: { flex: 1, alignItems: 'center', overflow: 'hidden' },
  screenCaption: { width: 300, gap: theme.spacing.xs },
  screenCaptionNarrow: { width: '100%', alignItems: 'center' },
  screenCaptionIndex: { fontSize: theme.fontSize.xs, fontWeight: '700', letterSpacing: 1.5, color: theme.colors.accent },
  screenCaptionTitle: { fontSize: theme.fontSize.xl, fontWeight: '700', color: theme.colors.textPrimary, marginTop: theme.spacing.xs },
  screenCaptionBody: { fontSize: theme.fontSize.md, lineHeight: 24, color: theme.colors.textSecondary },

  statsBubbleWrap: { ...contentWidth, paddingHorizontal: theme.spacing.lg, zIndex: 1 },
  statsBubble: { borderRadius: theme.radius.pill, paddingVertical: theme.spacing.lg },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: theme.spacing.xl },
  statCell: { alignItems: 'center', minWidth: 90 },
  statValueRow: { flexDirection: 'row' },
  statValue: { fontSize: 40, fontWeight: '700', color: theme.colors.accent },
  statLabel: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, marginTop: 2 },

  topicsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, justifyContent: 'center' },
  topicChip: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.glass.border, backgroundColor: theme.glass.fillSubtle },
  topicChipText: { color: theme.colors.textSecondary, fontSize: theme.fontSize.sm, fontWeight: '600' },

  finalCta: { ...contentWidth, marginHorizontal: theme.spacing.lg, marginTop: theme.spacing.xl, alignItems: 'center', gap: theme.spacing.md, paddingVertical: theme.spacing.xl },
  finalTitle: { fontSize: theme.fontSize.xl, fontWeight: '700', textAlign: 'center' },
  finalBody: { fontSize: theme.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center', maxWidth: 460 },

  footer: { ...contentWidth, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xl * 2, alignItems: 'center', gap: theme.spacing.sm },
  footerBrand: { fontSize: theme.fontSize.lg, fontWeight: '700', color: theme.colors.textPrimary },
  footerNote: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted, textAlign: 'center', maxWidth: 520, lineHeight: 18 },
});
