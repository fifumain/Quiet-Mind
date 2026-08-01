import { memo, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from '../common/AppText';
import type { components } from '../../api/generated/schema';
import { glassBlur, theme } from '../../theme/theme';

type Category = components['schemas']['Category'];

interface FilterBarProps {
  categories: Category[];
  selectedCategory: string | undefined;
  onSelectCategory: (slug: string | undefined) => void;
  /** Called with the debounced query — not on every keystroke. */
  onSearch: (value: string) => void;
  debounceMs?: number;
}

/**
 * Owns the search text itself and only reports the debounced value upward.
 *
 * Previously the raw input value lived on the screen component, so every
 * keystroke re-rendered the whole screen — including a 20-row list where each
 * row is a backdrop-filtered glass panel. Keeping the per-character state local
 * means typing now re-renders exactly this component.
 */
export const FilterBar = memo(function FilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
  onSearch,
  debounceMs = 400,
}: FilterBarProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(text), debounceMs);
    return () => clearTimeout(timeout);
  }, [text, debounceMs, onSearch]);

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.search, glassBlur()]}
        placeholder="Search…"
        placeholderTextColor={theme.colors.textMuted}
        value={text}
        onChangeText={setText}
        accessibilityLabel="Search the library"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="All" active={!selectedCategory} onPress={() => onSelectCategory(undefined)} />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            active={selectedCategory === category.slug}
            onPress={() => onSelectCategory(category.slug)}
          />
        ))}
      </ScrollView>
    </View>
  );
});

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.md },
  search: {
    backgroundColor: theme.glass.fillSubtle,
    borderWidth: 1,
    borderColor: theme.glass.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 44,
    fontSize: theme.fontSize.md,
    fontFamily: theme.fonts.body,
    color: theme.colors.textPrimary,
  },
  chips: { gap: theme.spacing.sm, paddingRight: theme.spacing.md },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  chipActive: { backgroundColor: theme.glass.selected, borderColor: theme.glass.selectedBorder },
  chipText: { fontSize: theme.fontSize.xs, fontWeight: '600', color: theme.colors.textMuted },
  chipTextActive: { color: theme.colors.textPrimary },
});
