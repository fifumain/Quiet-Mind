import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { components } from '../../api/generated/schema';
import { theme } from '../../theme/theme';

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
        style={styles.search}
        placeholder="Search..."
        value={search}
        onChangeText={onChangeSearch}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, !selectedCategory && styles.chipActive]}
          onPress={() => onSelectCategory(undefined)}
        >
          <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>All</Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.chip, selectedCategory === category.slug && styles.chipActive]}
            onPress={() => onSelectCategory(category.slug)}
          >
            <Text style={[styles.chipText, selectedCategory === category.slug && styles.chipTextActive]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.sm, padding: theme.spacing.md },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    fontSize: theme.fontSize.md,
  },
  chips: { gap: theme.spacing.xs },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  chipActive: { backgroundColor: '#333', borderColor: '#333' },
  chipText: { fontSize: theme.fontSize.sm, color: '#333' },
  chipTextActive: { color: '#fff' },
});
