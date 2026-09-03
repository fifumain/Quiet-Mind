import CloudRain from 'lucide-react-native/icons/cloud-rain';
import Frown from 'lucide-react-native/icons/frown';
import Laugh from 'lucide-react-native/icons/laugh';
import Meh from 'lucide-react-native/icons/meh';
import Smile from 'lucide-react-native/icons/smile';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '../common/AppText';
import { useSubmitMood, useTodayMood } from '../../hooks/useMood';
import { theme } from '../../theme/theme';
import type { MoodValue } from '../../api/endpoints/mood';
import { MoodHelpModal } from './MoodHelpModal';

const MOODS: { value: MoodValue; label: string; Icon: typeof Laugh }[] = [
  { value: 'great', label: 'Great', Icon: Laugh },
  { value: 'good', label: 'Good', Icon: Smile },
  { value: 'okay', label: 'Okay', Icon: Meh },
  { value: 'low', label: 'Low', Icon: Frown },
  { value: 'struggling', label: 'Struggling', Icon: CloudRain },
];

const NEGATIVE: MoodValue[] = ['low', 'struggling'];

/**
 * A daily one-tap mood check-in, shown at the top of the Today screen.
 *
 * Deliberately not scanning `note` for crisis language or looking at history
 * for patterns — see the plan this was built from (virtual-watching-unicorn.md)
 * for why both are explicitly out of scope. The one reaction this widget has
 * is a fixed, generic modal — three links to places already in the app —
 * opened only immediately after submitting a "low"/"struggling" mood in this
 * mount, not on every later visit to an already-submitted low day.
 */
export function MoodPrompt() {
  const today = useTodayMood();
  const submit = useSubmitMood();

  const [editing, setEditing] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [note, setNote] = useState('');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [lastMood, setLastMood] = useState<MoodValue | null>(null);

  if (today.isLoading) return null;

  const handlePick = (value: MoodValue) => {
    setLastMood(value);
    setEditing(false);
    setAddingNote(false);
    setNote('');
    submit.mutate(
      { mood: value },
      { onSuccess: (result) => setHelpModalOpen(NEGATIVE.includes(result.mood)) },
    );
  };

  const handleSaveNote = () => {
    if (!lastMood) return;
    submit.mutate({ mood: lastMood, note });
    setAddingNote(false);
  };

  const showPicker = editing || !today.data;
  const moodMeta = MOODS.find((m) => m.value === today.data?.mood);

  return (
    <>
      {showPicker ? (
        <View style={styles.wrap}>
          <Text style={styles.prompt}>How are you today?</Text>
          <View style={styles.pillRow}>
            {MOODS.map(({ value, label, Icon }) => (
              <Pressable
                key={value}
                onPress={() => handlePick(value)}
                style={[styles.pill, today.data?.mood === value && styles.pillActive]}
                accessibilityRole="button"
                accessibilityLabel={label}
              >
                <Icon size={18} color={theme.colors.textPrimary} strokeWidth={2} />
                <Text style={styles.pillLabel}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.wrap}>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmText}>
              Today: {moodMeta?.label}
              {today.data?.note ? ` — ${today.data.note}` : ''}
            </Text>
            <Pressable onPress={() => setEditing(true)} accessibilityRole="button">
              <Text style={styles.changeLink}>Change</Text>
            </Pressable>
          </View>

          {addingNote ? (
            <View style={styles.noteRow}>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Add a short note…"
                placeholderTextColor={theme.colors.textFaint}
                style={styles.noteInput}
                multiline
              />
              <Pressable onPress={handleSaveNote} style={styles.saveBtn} accessibilityRole="button">
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          ) : !today.data?.note ? (
            <Pressable onPress={() => { setLastMood(today.data!.mood); setAddingNote(true); }} accessibilityRole="button">
              <Text style={styles.addNoteLink}>+ Add a note</Text>
            </Pressable>
          ) : null}
        </View>
      )}

      <MoodHelpModal visible={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: theme.spacing.lg, gap: theme.spacing.sm },
  prompt: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.textSecondary },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.glass.border,
    backgroundColor: theme.glass.fillSubtle,
  },
  pillActive: { backgroundColor: theme.glass.selected, borderColor: theme.glass.selectedBorder },
  pillLabel: { fontSize: theme.fontSize.xs, fontWeight: '600', color: theme.colors.textPrimary },

  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, flexWrap: 'wrap' },
  confirmText: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary, flexShrink: 1 },
  changeLink: { fontSize: theme.fontSize.sm, fontWeight: '600', color: theme.colors.accent },

  addNoteLink: { fontSize: theme.fontSize.xs, color: theme.colors.textMuted, minHeight: 44, textAlignVertical: 'center' },
  noteRow: { gap: theme.spacing.sm },
  noteInput: {
    borderWidth: 1,
    borderColor: theme.glass.border,
    backgroundColor: theme.glass.fillSubtle,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    minHeight: 44,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.sm,
  },
  saveBtn: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
  },
  saveBtnText: { fontWeight: '700', fontSize: theme.fontSize.sm, color: theme.gradient[0] },
});
