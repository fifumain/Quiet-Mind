import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { components } from '../../api/generated/schema';
import { glassBlur, theme } from '../../theme/theme';

type Category = components['schemas']['Category'];

interface FilterBarProps {
  categories: Category[];
  selectedCategory: string | undefined;
  onSelectCategory: (slug: string | undefined) => void;
  search: string;
  onChangeSearch: (value: string) => void;
}

export function FilterBar({ categories, selectedCategory, onSelectCategory, search, onChangeSearch }: FilterBarProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.search, glassBlur()]}
        placeholder="Поиск…"
        placeholderTextColor={theme.colors.textMuted}
        value={search}
        onChangeText={onChangeSearch}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Все" active={!selectedCategory} onPress={() => onSelectCategory(undefined)} />
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
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
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
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  chips: { gap: theme.spacing.sm, paddingRight: theme.spacing.md },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  chipActive: { backgroundColor: theme.glass.fillStrong, borderColor: 'transparent' },
  chipText: { fontSize: theme.fontSize.xs, fontWeight: '600', color: theme.colors.textMuted },
  chipTextActive: { color: theme.colors.textPrimary },
});
