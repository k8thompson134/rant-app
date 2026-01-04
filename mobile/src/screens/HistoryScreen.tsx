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
import { Ionicons } from '@expo/vector-icons';
import { getAllRantEntries, deleteRantEntry } from '../database/operations';
import {
  RantEntry,
  SYMPTOM_DISPLAY_NAMES,
  getSeverityColor,
  getSeverityBackgroundColor,
  formatActivityTrigger,
  formatSymptomDuration,
  formatTimeOfDay,
} from '../types';
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

  // Calculate overall entry severity
  const getEntrySeverity = (entry: RantEntry): 'mild' | 'moderate' | 'severe' => {
    const severities = entry.symptoms
      .map(s => s.severity)
      .filter((s): s is 'mild' | 'moderate' | 'severe' => s !== null && s !== undefined);

    if (severities.length === 0) return 'moderate';
    if (severities.includes('severe')) return 'severe';
    if (severities.includes('moderate')) return 'moderate';
    return 'mild';
  };

  const renderEntry = ({ item }: { item: RantEntry }) => {
    const entrySeverity = getEntrySeverity(item);
    const severityColor = getSeverityColor(entrySeverity, colors);

    return (
      <View style={[styles.entryCard, { borderLeftColor: severityColor }]}>
        <View style={styles.entryHeader}>
          <View style={styles.dateContainer}>
            <Text style={styles.entryDate}>{formatDate(item.timestamp)}</Text>
            <Text style={[styles.severityLabel, { color: severityColor }]}>
              {entrySeverity}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={[styles.deleteButton, { minHeight: touchTargetSize }]}
            accessible={true}
            accessibilityLabel="Delete entry"
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={18} color={colors.severityRough} />
          </TouchableOpacity>
        </View>

        <Text style={styles.entryText} numberOfLines={3}>
          "{item.text}"
        </Text>

        {item.symptoms.length > 0 && (
          <View style={styles.symptomsList}>
            {item.symptoms.map((symptom, index) => {
              const symptomSeverityColor = getSeverityColor(symptom.severity, colors);
              const symptomBgColor = getSeverityBackgroundColor(symptom.severity, colors);
              const displayName = SYMPTOM_DISPLAY_NAMES[symptom.symptom] || symptom.symptom;

              // Build context parts
              const contextParts: string[] = [];
              if (symptom.trigger) contextParts.push(formatActivityTrigger(symptom.trigger));
              if (symptom.duration) contextParts.push(formatSymptomDuration(symptom.duration));
              if (symptom.timeOfDay) contextParts.push(formatTimeOfDay(symptom.timeOfDay));
              const contextText = contextParts.join(' · ');

              // Pain location
              const painLocation = symptom.painDetails?.location;

              return (
                <View
                  key={`${item.id}-${index}`}
                  style={[styles.symptomItem, { backgroundColor: symptomBgColor }]}
                >
                  <View style={styles.symptomMainRow}>
                    <Text style={[styles.symptomName, { color: symptomSeverityColor }]}>
                      {displayName}
                      {painLocation && (
                        <Text style={styles.symptomLocation}> ({painLocation})</Text>
                      )}
                    </Text>
                    {symptom.severity && (
                      <Text style={[styles.symptomSeverityBadge, { color: symptomSeverityColor }]}>
                        {symptom.severity}
                      </Text>
                    )}
                  </View>
                  {contextText.length > 0 && (
                    <Text style={styles.symptomContext}>{contextText}</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

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
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>{entries.length} entries</Text>
      </View>
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accentPrimary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 2,
  },
  title: {
    ...typography.largeDisplay,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.sectionHeader,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 14,
  },
  entryCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  entryDate: {
    ...typography.small,
    color: colors.textSecondary,
    fontFamily: 'DMSans_500Medium',
  },
  severityLabel: {
    ...typography.caption,
    fontFamily: 'DMSans_700Bold',
    textTransform: 'capitalize',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  entryText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  symptomsList: {
    gap: 8,
  },
  symptomItem: {
    borderRadius: 10,
    padding: 10,
  },
  symptomMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symptomName: {
    ...typography.small,
    fontFamily: 'DMSans_500Medium',
    flex: 1,
  },
  symptomLocation: {
    ...typography.small,
    fontStyle: 'italic',
  },
  symptomSeverityBadge: {
    ...typography.caption,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'capitalize',
    marginLeft: 8,
  },
  symptomContext: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    ...typography.largeHeader,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
