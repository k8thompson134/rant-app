/**
 * AddNewSymptomModal
 * Allows users to create entirely new custom symptoms
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

interface AddNewSymptomModalProps {
  visible: boolean;
  existingSymptoms: string[]; // List of existing symptom names to prevent duplicates
  onAddSymptom: (symptomName: string, words: string[]) => Promise<void>;
  onClose: () => void;
}

export function AddNewSymptomModal({
  visible,
  existingSymptoms,
  onAddSymptom,
  onClose,
}: AddNewSymptomModalProps) {
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();
  const animationConfig = useAnimationConfig();
  const styles = useMemo(() => createStyles(colors, typography, touchTargetSize), [colors, typography, touchTargetSize]);

  const [symptomName, setSymptomName] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const resetForm = () => {
    setSymptomName('');
    setWords([]);
    setNewWord('');
  };

  const handleAddWord = () => {
    const word = newWord.trim().toLowerCase();
    if (!word) return;

    if (words.includes(word)) {
      Alert.alert('Duplicate', 'This word is already in the list.');
      return;
    }

    setWords([...words, word]);
    setNewWord('');
  };

  const handleRemoveWord = (word: string) => {
    setWords(words.filter(w => w !== word));
  };

  const handleCreate = async () => {
    const name = symptomName.trim().toLowerCase().replace(/\s+/g, '_');

    if (!name) {
      Alert.alert('Missing Name', 'Please enter a name for your symptom.');
      return;
    }

    if (words.length === 0) {
      Alert.alert('Missing Words', 'Please add at least one word that triggers this symptom.');
      return;
    }

    // Check for duplicate symptom name
    if (existingSymptoms.includes(name)) {
      Alert.alert('Already Exists', 'A symptom with this name already exists. Try adding words to the existing symptom instead.');
      return;
    }

    setIsAdding(true);
    try {
      await onAddSymptom(name, words);
      Alert.alert(
        'Created!',
        `Your custom symptom "${symptomName.trim()}" has been created with ${words.length} word${words.length === 1 ? '' : 's'}.`,
        [{ text: 'OK', onPress: () => { resetForm(); onClose(); } }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create symptom');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType={animationConfig.duration === 0 ? 'none' : 'slide'}
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
      accessibilityViewIsModal={true}
    >
      <View
        style={styles.container}
        accessible={true}
        accessibilityLabel="Create new custom symptom"
        accessibilityRole="none"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close new symptom form"
            accessibilityHint="Returns to the help screen and discards changes"
          >
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>New Symptom</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Symptom name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Symptom Name</Text>
            <Text style={styles.sectionSubtitle}>
              What do you want to call this symptom?
            </Text>
            <TextInput
              style={styles.input}
              placeholder='e.g., "sensory overload", "coat hanger pain"'
              placeholderTextColor={colors.textMuted}
              value={symptomName}
              onChangeText={setSymptomName}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Symptom name input"
              accessibilityHint="Enter a name for your custom symptom"
            />
          </View>

          {/* Words */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trigger Words</Text>
            <Text style={styles.sectionSubtitle}>
              What words should trigger this symptom?
            </Text>

            {words.length > 0 && (
              <View style={styles.wordChips}>
                {words.map((word) => (
                  <TouchableOpacity
                    key={word}
                    style={styles.wordChip}
                    onPress={() => handleRemoveWord(word)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${word}`}
                    accessibilityHint="Removes this trigger word from the list"
                  >
                    <Text style={styles.wordChipText}>{word}</Text>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.addWordContainer}>
              <TextInput
                style={styles.wordInput}
                placeholder="Type a word..."
                placeholderTextColor={colors.textMuted}
                value={newWord}
                onChangeText={setNewWord}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleAddWord}
                returnKeyType="done"
                accessibilityLabel="Trigger word input"
                accessibilityHint="Enter a word that should trigger this symptom"
              />
              <TouchableOpacity
                style={styles.addWordButton}
                onPress={handleAddWord}
                accessibilityRole="button"
                accessibilityLabel="Add trigger word"
                accessibilityHint="Adds this word to the trigger words list"
              >
                <Ionicons name="add" size={24} color={colors.accentPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={20} color={colors.accentPrimary} />
            <View style={styles.tipContent}>
              <Text style={styles.tipText}>
                Create symptoms unique to your condition. Add multiple words including
                slang, abbreviations, or phrases you use.
              </Text>
            </View>
          </View>

          {/* Example */}
          <View style={styles.exampleBox}>
            <Text style={styles.exampleTitle}>Example</Text>
            <Text style={styles.exampleText}>
              Symptom: "coat hanger pain"{'\n'}
              Words: "coat hanger", "shoulder blade pain", "trapezius ache"
            </Text>
          </View>
        </ScrollView>

        {/* Footer with create button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            accessibilityHint="Closes this form and discards changes"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!symptomName.trim() || words.length === 0 || isAdding) && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={!symptomName.trim() || words.length === 0 || isAdding}
            accessibilityRole="button"
            accessibilityLabel={isAdding ? 'Creating symptom' : 'Create symptom'}
            accessibilityHint="Creates a new custom symptom with the trigger words you added"
            accessibilityState={{
              disabled: !symptomName.trim() || words.length === 0 || isAdding,
            }}
          >
            <Text style={styles.createButtonText}>
              {isAdding ? 'Creating...' : 'Create Symptom'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>, touchTargetSize: number) =>
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
      flex: 1,
      textAlign: 'center',
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 20,
    },
    section: {
      marginBottom: 28,
    },
    sectionTitle: {
      ...typography.largeHeader,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    sectionSubtitle: {
      ...typography.small,
      color: colors.textMuted,
      marginBottom: 16,
    },
    input: {
      ...typography.body,
      color: colors.textPrimary,
      backgroundColor: colors.bgElevated,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      minHeight: touchTargetSize,
    },
    wordChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    // ACCESSIBILITY: Word chips are tappable for removal, need adequate touch target
    wordChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.accentLight,
      paddingHorizontal: 12,
      paddingVertical: 12,
      minHeight: 48,
      borderRadius: 16,
    },
    wordChipText: {
      ...typography.small,
      color: colors.accentPrimary,
    },
    addWordContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    wordInput: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
      backgroundColor: colors.bgElevated,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: touchTargetSize,
    },
    addWordButton: {
      backgroundColor: colors.bgElevated,
      width: touchTargetSize,
      height: touchTargetSize,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tipBox: {
      flexDirection: 'row',
      gap: 12,
      padding: 16,
      backgroundColor: colors.accentLight,
      borderRadius: 12,
      marginBottom: 16,
    },
    tipContent: {
      flex: 1,
    },
    tipText: {
      ...typography.small,
      color: colors.textPrimary,
      lineHeight: 20,
    },
    exampleBox: {
      padding: 16,
      backgroundColor: colors.bgElevated,
      borderRadius: 12,
    },
    exampleTitle: {
      ...typography.bodyMedium,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    exampleText: {
      ...typography.small,
      color: colors.textMuted,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      gap: 12,
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.bgElevated,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.bgElevated,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      minHeight: touchTargetSize,
      justifyContent: 'center',
    },
    cancelButtonText: {
      ...typography.button,
      color: colors.textPrimary,
    },
    createButton: {
      flex: 2,
      backgroundColor: colors.accentPrimary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      minHeight: touchTargetSize,
      justifyContent: 'center',
    },
    createButtonDisabled: {
      opacity: 0.5,
    },
    createButtonText: {
      ...typography.button,
      color: colors.bgPrimary,
    },
  });
