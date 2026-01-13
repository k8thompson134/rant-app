/**
 * SymptomDetailModal
 * Shows symptom details and allows adding custom words
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useTypography, useTouchTargetSize, useAnimationConfig } from '../contexts/AccessibilityContext';
import { SYMPTOM_DISPLAY_NAMES, CustomLemmaEntry } from '../types';

interface SymptomDetailModalProps {
  visible: boolean;
  symptomName: string; // Internal name like 'brain_fog'
  recognizedWords: string[]; // Words that already map to this symptom
  customWords: CustomLemmaEntry[]; // User's custom words for this symptom
  onAddWord: (word: string, symptom: string) => Promise<void>;
  onDeleteWord: (lemma: CustomLemmaEntry) => void;
  onClose: () => void;
}

export function SymptomDetailModal({
  visible,
  symptomName,
  recognizedWords,
  customWords,
  onAddWord,
  onDeleteWord,
  onClose,
}: SymptomDetailModalProps) {
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();
  const animationConfig = useAnimationConfig();
  const styles = useMemo(() => createStyles(colors, typography, touchTargetSize), [colors, typography, touchTargetSize]);

  const [newWord, setNewWord] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const displayName = SYMPTOM_DISPLAY_NAMES[symptomName] || symptomName.replace(/_/g, ' ');

  // Filter custom words for this specific symptom
  const myCustomWords = customWords.filter(w => w.symptom === symptomName);

  const handleAddWord = async () => {
    if (!newWord.trim()) {
      Alert.alert('Missing Word', 'Please enter a word to add.');
      return;
    }

    setIsAdding(true);
    try {
      await onAddWord(newWord.trim().toLowerCase(), symptomName);
      setNewWord('');
      Alert.alert('Added!', `"${newWord.trim()}" will now be recognized as ${displayName}.`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add word');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteWord = (lemma: CustomLemmaEntry) => {
    Alert.alert(
      'Remove Word',
      `Remove "${lemma.word}" from your custom words?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onDeleteWord(lemma),
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType={animationConfig.duration === 0 ? 'none' : 'slide'}
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <View
        style={styles.container}
        accessible={true}
        accessibilityLabel={`${displayName} symptom details`}
        accessibilityRole="none"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close symptom details"
            accessibilityHint="Returns to the help screen"
          >
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>{displayName}</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Built-in words section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Built-in Words</Text>
            <Text style={styles.sectionSubtitle}>
              These words are automatically recognized
            </Text>
            <View style={styles.wordChips}>
              {recognizedWords.map((word) => (
                <View key={word} style={styles.wordChip}>
                  <Text style={styles.wordChipText}>{word}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Custom words section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Custom Words</Text>
            <Text style={styles.sectionSubtitle}>
              Add your own words for this symptom
            </Text>

            {myCustomWords.length > 0 ? (
              <View style={styles.customWordsList}>
                {myCustomWords.map((lemma) => (
                  <View key={lemma.id} style={styles.customWordItem}>
                    <Text style={styles.customWordText}>"{lemma.word}"</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteWord(lemma)}
                      style={styles.deleteButton}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${lemma.word}`}
                      accessibilityHint="Removes this custom word from the symptom"
                    >
                      <Ionicons name="trash-outline" size={22} color={colors.severityRough} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noCustomWords}>
                No custom words added yet
              </Text>
            )}

            {/* Add word input */}
            <View style={styles.addWordContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a word..."
                placeholderTextColor={colors.textMuted}
                value={newWord}
                onChangeText={setNewWord}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleAddWord}
                returnKeyType="done"
                accessibilityLabel="Custom word input"
                accessibilityHint="Enter a word you use to describe this symptom"
              />
              <TouchableOpacity
                style={[styles.addButton, isAdding && styles.addButtonDisabled]}
                onPress={handleAddWord}
                disabled={isAdding}
                accessibilityRole="button"
                accessibilityLabel={isAdding ? 'Adding word' : 'Add custom word'}
                accessibilityHint="Adds this word to the symptom recognition list"
                accessibilityState={{ disabled: isAdding }}
              >
                <Ionicons name="add" size={24} color={colors.bgPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={20} color={colors.accentPrimary} />
            <Text style={styles.tipText}>
              Add slang, abbreviations, or personal terms you use to describe this symptom.
              Multi-word phrases like "brain is mush" work too!
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any, typography: any, touchTargetSize: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgPrimary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.bgElevated,
    },
    // ACCESSIBILITY: Close button must meet 48-64pt minimum touch target for users with tremors
    closeButton: {
      width: touchTargetSize,
      height: touchTargetSize,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      ...typography.largeHeader,
      color: colors.textPrimary,
      textTransform: 'capitalize',
      flex: 1,
      textAlign: 'center',
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 40,
    },
    section: {
      marginBottom: 28,
    },
    sectionTitle: {
      ...typography.header,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    sectionSubtitle: {
      ...typography.small,
      color: colors.textMuted,
      marginBottom: 16,
    },
    wordChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    wordChip: {
      backgroundColor: colors.bgElevated,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    wordChipText: {
      ...typography.small,
      color: colors.textSecondary,
    },
    customWordsList: {
      gap: 8,
      marginBottom: 16,
    },
    customWordItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgElevated,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
    },
    customWordText: {
      ...typography.body,
      color: colors.accentPrimary,
    },
    // ACCESSIBILITY: Delete button with 48pt minimum touch target
    deleteButton: {
      minWidth: 48,
      minHeight: 48,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noCustomWords: {
      ...typography.body,
      color: colors.textMuted,
      fontStyle: 'italic',
      marginBottom: 16,
    },
    addWordContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    input: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
      backgroundColor: colors.bgElevated,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: touchTargetSize,
    },
    addButton: {
      backgroundColor: colors.accentPrimary,
      width: touchTargetSize,
      height: touchTargetSize,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonDisabled: {
      opacity: 0.5,
    },
    tipBox: {
      flexDirection: 'row',
      gap: 12,
      padding: 16,
      backgroundColor: colors.accentLight,
      borderRadius: 12,
    },
    tipText: {
      ...typography.small,
      color: colors.textPrimary,
      flex: 1,
      lineHeight: 20,
    },
  });
