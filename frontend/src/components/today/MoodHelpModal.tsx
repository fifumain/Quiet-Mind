import { useRouter } from 'expo-router';
import BookOpen from 'lucide-react-native/icons/book-open';
import GraduationCap from 'lucide-react-native/icons/graduation-cap';
import MessageCircle from 'lucide-react-native/icons/message-circle';
import { StyleSheet, View } from 'react-native';
import { Text } from '../common/AppText';
import { Modal } from '../common/Modal';
import { FlowingMenuRow } from './FlowingMenuRow';
import { theme } from '../../theme/theme';

/**
 * The reaction to a "low"/"struggling" mood check-in — see MoodPrompt, which
 * opens this instead of the inline confirmation whenever that happens.
 *
 * Deliberately generic and deliberately just three links: no attempt to guess
 * *why* the day is hard (the note is never read for this), no crisis-keyword
 * scanning, no streak detection. See the plan this was built from
 * (virtual-watching-unicorn.md) for why both are explicitly out of scope —
 * the crisis path stays chat-only, where the guardrail already lives.
 */
export function MoodHelpModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();

  const go = (path: '/chat' | '/library' | '/courses') => {
    onClose();
    router.navigate(path);
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Text style={styles.title}>We're sorry you're having a hard time</Text>
        <Text style={styles.body}>We'd like to help — pick whichever feels right for today.</Text>
      </View>

      <View style={styles.rows}>
        <FlowingMenuRow label="Talk to Alex" Icon={MessageCircle} onPress={() => go('/chat')} />
        <FlowingMenuRow label="Browse the library" Icon={BookOpen} onPress={() => go('/library')} />
        <FlowingMenuRow label="Try a course" Icon={GraduationCap} onPress={() => go('/courses')} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: { padding: theme.spacing.lg, gap: theme.spacing.xs },
  title: { fontFamily: theme.fonts.display, fontSize: theme.fontSize.lg, color: theme.colors.textPrimary },
  body: { fontFamily: theme.fonts.body, fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  rows: { marginTop: theme.spacing.xs },
});
