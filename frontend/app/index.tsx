import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View, type ViewStyle } from 'react-native';
import { Text } from '../src/components/common/AppText';
import { AnimatedText } from '../src/components/landing/AnimatedText';
import { CardSwap } from '../src/components/landing/CardSwap';
import { GradientText } from '../src/components/landing/GradientText';
import { Marquee } from '../src/components/landing/Marquee';
import { ScreenMockup } from '../src/components/landing/ScreenMockup';
import { ScrollReveal } from '../src/components/landing/ScrollReveal';
import { ShinyText } from '../src/components/landing/ShinyText';
import { TopBar } from '../src/components/landing/TopBar';
import { ClickSpark } from '../src/components/common/ClickSpark';
import { GlassBackground } from '../src/components/common/GlassBackground';
import { GlassCard } from '../src/components/common/GlassCard';
import { SpecularButton } from '../src/components/common/SpecularButton';
import { useAuthStore } from '../src/store/authStore';
import { theme } from '../src/theme/theme';

const FEATURES = [
  {
    title: 'Conversation, not advice',
    body: 'Alex listens and asks guiding questions. No diagnoses, no ready-made fixes — just room to think out loud.',
  },
  {
    title: 'Ideas from psychology',
    body: 'When it fits, Alex brings up a relevant concept, book or quote — from Stoicism to attachment theory.',
  },
  {
    title: 'A library at hand',
    body: 'A hand-picked collection of psychology quotes and books — searchable and filterable by topic, always one tap away.',
  },
  {
    title: 'Courses, step by step',
    body: 'Short courses on specific themes — confidence, resilience, boundaries. Taken one stage at a time, at your own pace.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: "You write what is on your mind",
    body: 'In your own words — no form, no questionnaire. Start from a suggested opener if the first sentence is hard.',
  },
  {
    step: '02',
    title: 'Alex asks questions',
    body: 'No diagnoses, no instructions. It helps you lay the situation out and hear yourself.',
  },
  {
    step: '03',
    title: 'It gives you something to sit with',
    body: 'Where it fits, Alex recalls a book, an author or an idea from psychology. Save it and come back later.',
  },
];

const FAQ = [
  {
    q: 'Is this therapy?',
    a: 'No. Alex is a companion, not a therapist, and it does not replace working with a professional. It gives no diagnoses and no personal recommendations about your situation.',
  },
  {
    q: 'Who reads my messages?',
    a: 'Your conversation is tied to your account and visible only to you. The text is sent to a language model to generate a reply. You can delete the whole thread at any time with "Clear conversation".',
  },
  {
    q: 'What does it cost?',
    a: "It is free right now — this is a learning project, not a commercial product. If paid features ever appear, free access to quotes, books and basic conversation stays.",
  },
  {
    q: "What if I am in a really bad place?",
    a: 'Alex detects mentions of self-harm and, in that case, stops the ordinary conversation and points you to a professional or a helpline. It is not a substitute for emergency help.',
  },
];

const SCREENS = [
  {
    kind: 'today' as const,
    caption: 'Today — quote of the day and book of the week',
    heading: 'Start the day with something to stand on',
    body: 'A quote and a book wait for you each morning — a small reason to pause before the day gets loud.',
  },
  {
    kind: 'chat' as const,
    caption: 'Chat — talking with Alex',
    heading: 'Talk it through with Alex',
    body: 'Guiding questions instead of advice. Alex listens, reflects, and brings up an idea only when it genuinely fits.',
  },
  {
    kind: 'library' as const,
    caption: 'Library — quotes and books',
    heading: 'The library, close at hand',
    body: 'Psychology quotes and books sorted by topic — find the right one when a conversation leads there.',
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
          <AnimatedText text="A place where you are" style={styles.heroLine} />
          <GradientText style={styles.heroLine}>actually listened to</GradientText>
          {/* Static, and specific: a rotating line meant the visitor never saw
              the whole proposition at once — only one fragment of four. */}
          <Text style={styles.heroSub}>
            Tell Alex what is on your mind. It listens, asks guiding questions, and points you to a
            book or an idea from psychology — no diagnoses, no instructions on what to do.
          </Text>
          <View style={styles.heroActions}>
            <ClickSpark onPress={primaryCta}>
              <SpecularButton style={styles.ctaPrimary} onPress={primaryCta}>
                <Text style={styles.ctaPrimaryText}>
                  {accessToken ? 'Open the app' : 'Start free'}
                </Text>
              </SpecularButton>
            </ClickSpark>
            {!accessToken ? (
              <Pressable style={styles.ctaGhost} onPress={() => router.navigate('/login')}>
                <Text style={styles.ctaGhostText}>I already have an account</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.heroDisclaimer}>
            Alex is a companion, not a therapist, and does not replace working with a professional.
          </Text>
        </View>

        {/* ---- Topics marquee ---- */}
        <View style={styles.marqueeSection}>
          <Marquee items={TOPICS} />
        </View>

        {/* ---- Features ---- */}
        <Section id="features" title="What Alex does" subtitle="A companion, not a therapist — and that is the point.">
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

          {/*
            The glass bubble the card stack visually clips into. It used to hold
            four counters (33 quotes / 17 books / 8 topics / 16 authors) animating
            up in 40px gold — seed-data counts dressed as traction, which mostly
            told a visitor the database is empty. Same bubble, but now it answers
            the question the page never did: what actually happens here.
          */}
          <ScrollReveal>
            <View style={[styles.statsBubbleWrap, { marginTop: bubbleGap }]}>
              <GlassCard strong style={styles.statsBubble}>
                <View style={[styles.stepsRow, !isWide && styles.stepsColumn]}>
                  {HOW_IT_WORKS.map((s) => (
                    <View key={s.step} style={styles.stepCell}>
                      <Text style={styles.stepNum}>{s.step}</Text>
                      <Text style={styles.stepTitle}>{s.title}</Text>
                      <Text style={styles.stepBody}>{s.body}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </View>
          </ScrollReveal>
        </Section>

        {/* ---- Topics grid ---- */}
        <Section id="topics" title="What you can talk about" subtitle="From everyday anxiety to the big questions about meaning.">
          <View style={styles.topicsWrap}>
            {TOPICS.map((t) => (
              <View key={t} style={styles.topicChip}>
                <Text style={styles.topicChipText}>{t}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* ---- Privacy & boundaries: the objection the page never answered ---- */}
        <Section
          id="privacy"
          title="Privacy and boundaries"
          subtitle="What Alex does, what it doesn't, and what happens to your words."
        >
          <View style={[styles.boundaryGrid, isWide && styles.boundaryGridWide]}>
            {[
              {
                title: 'No diagnoses',
                body: 'Alex gives no diagnoses and no instructions about your particular situation. It talks about general ideas from psychology.',
              },
              {
                title: 'The conversation is yours',
                body: 'Your thread is tied to your account and visible only to you. Delete all of it in one tap.',
              },
              {
                title: 'In a crisis, to people',
                body: 'If a message signals a threat to yourself, Alex stops the ordinary conversation and points you to a professional.',
              },
            ].map((b, i) => (
              <ScrollReveal key={b.title} delay={i * 90} style={isWide ? styles.boundaryCellWide : styles.featureCell}>
                <GlassCard style={styles.boundaryCard}>
                  <Text style={styles.featureTitle}>{b.title}</Text>
                  <Text style={styles.featureBody}>{b.body}</Text>
                </GlassCard>
              </ScrollReveal>
            ))}
          </View>
        </Section>

        {/* ---- FAQ ---- */}
        <Section id="faq" title="Common questions" subtitle="Briefly, the things people ask before signing up.">
          <View style={styles.faqWrap}>
            {FAQ.map((item, i) => (
              <ScrollReveal key={item.q} delay={i * 70}>
                <View style={styles.faqItem}>
                  <Text style={styles.faqQ}>{item.q}</Text>
                  <Text style={styles.faqA}>{item.a}</Text>
                </View>
              </ScrollReveal>
            ))}
          </View>
        </Section>

        {/* ---- Final CTA ---- */}
        <ScrollReveal>
          <GlassCard strong style={styles.finalCta}>
            <GradientText style={styles.finalTitle}>Start the conversation today</GradientText>
            <Text style={styles.finalBody}>
              Free, without judgement, at your own pace. Alex is ready to listen.
            </Text>
            <ClickSpark onPress={primaryCta}>
              <SpecularButton style={styles.ctaPrimary} onPress={primaryCta}>
                <Text style={styles.ctaPrimaryText}>
                  {accessToken ? 'Open the app' : 'Create account'}
                </Text>
              </SpecularButton>
            </ClickSpark>
          </GlassCard>
        </ScrollReveal>

        {/* ---- Footer ---- */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>Alex</Text>
          <Text style={styles.footerNote}>
            Alex is a companion, not a replacement for professional help. In a crisis, please reach
            out to a professional or a mental-health helpline.
          </Text>
          <Text style={styles.footerMeta}>
            A learning project. Quotes and books belong to their respective authors and rights holders.
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
  heroSub: {
    fontSize: theme.fontSize.md,
    lineHeight: 27,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 620,
    marginTop: theme.spacing.md,
  },
  heroDisclaimer: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    maxWidth: 520,
  },
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
  stepsRow: { flexDirection: 'row', gap: theme.spacing.xl },
  stepsColumn: { flexDirection: 'column', gap: theme.spacing.lg },
  stepCell: { flex: 1, gap: 6 },
  stepNum: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: theme.fontSize.xs,
    letterSpacing: 1.5,
    color: theme.colors.accent,
  },
  stepTitle: { fontFamily: theme.fonts.display, fontSize: theme.fontSize.md, color: theme.colors.textPrimary },
  stepBody: { fontSize: theme.fontSize.sm, lineHeight: 21, color: theme.colors.textSecondary },
  boundaryGrid: { gap: theme.spacing.md },
  // Three across on wide screens — reusing the 4-up feature cell (48%) here
  // left a half-empty second row.
  boundaryGridWide: { flexDirection: 'row', flexWrap: 'nowrap' },
  boundaryCellWide: { flex: 1 },
  boundaryCard: { gap: theme.spacing.sm, minHeight: 150, height: '100%' },
  faqWrap: { gap: theme.spacing.md, maxWidth: 760, width: '100%', alignSelf: 'center' },
  faqItem: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.glass.fillSubtle,
    borderWidth: 1,
    borderColor: theme.glass.border,
    gap: 6,
  },
  faqQ: { fontFamily: theme.fonts.display, fontSize: theme.fontSize.md, color: theme.colors.textPrimary },
  faqA: { fontSize: theme.fontSize.sm, lineHeight: 22, color: theme.colors.textSecondary },
  footerMeta: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textFaint,
    textAlign: 'center',
    maxWidth: 520,
    marginTop: theme.spacing.sm,
  },

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
