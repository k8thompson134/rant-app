/**
 * HistoryScreen - View past rant entries
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { getAllRantEntries, deleteRantEntry } from '../database/operations';
import { RantEntry, SYMPTOM_DISPLAY_NAMES, SEVERITY_COLORS } from '../types';
import { useTheme, useTypography, useTouchTargetSize } from '../contexts/AccessibilityContext';

export function HistoryScreen() {
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const [entries, setEntries] = useState<RantEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    try {
      const allEntries = await getAllRantEntries();
      setEntries(allEntries);
    } catch (error) {
      console.error('Failed to load entries:', error);
      Alert.alert('Error', 'Failed to load history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEntries();
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this rant?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRantEntry(id);
              await loadEntries();
            } catch (error) {
              console.error('Failed to delete entry:', error);
              Alert.alert('Error', 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const renderEntry = ({ item }: { item: RantEntry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{formatDate(item.timestamp)}</Text>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={[styles.deleteButton, { minHeight: touchTargetSize }]}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.entryText} numberOfLines={3}>
        {item.text}
      </Text>

      {item.symptoms.length > 0 && (
        <View style={styles.symptomTags}>
          {item.symptoms.slice(0, 4).map((symptom, index) => (
            <View key={`${item.id}-${index}`} style={styles.symptomTag}>
              {symptom.severity && (
                <View
                  style={[
                    styles.severityDot,
                    { backgroundColor: SEVERITY_COLORS[symptom.severity] },
                  ]}
                />
              )}
              <Text style={styles.symptomTagText}>
                {SYMPTOM_DISPLAY_NAMES[symptom.symptom] || symptom.symptom}
              </Text>
            </View>
          ))}
          {item.symptoms.length > 4 && (
            <Text style={styles.moreSymptoms}>
              +{item.symptoms.length - 4} more
            </Text>
          )}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No entries yet</Text>
          <Text style={styles.emptyText}>
            Your saved rants will appear here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  entryCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.bgElevated,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'DMSans_500Medium',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  deleteButtonText: {
    ...typography.caption,
    color: colors.severityRough,
    fontFamily: 'DMSans_500Medium',
  },
  entryText: {
    ...typography.small,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  symptomTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  symptomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  symptomTagText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'DMSans_500Medium',
  },
  moreSymptoms: {
    ...typography.caption,
    color: colors.textMuted,
    alignSelf: 'center',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    ...typography.bodyMedium,
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
