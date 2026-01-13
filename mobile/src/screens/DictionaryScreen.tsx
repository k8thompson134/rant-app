/**
 * DictionaryScreen
 * Browse recognized symptoms and manage custom words
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useTypography, useTouchTargetSize } from '../contexts/AccessibilityContext';
import { useCustomLemmas } from '../contexts/CustomLemmasContext';
import { SYMPTOM_LEMMAS } from '../nlp/extractor';
import { SYMPTOM_DISPLAY_NAMES, CustomLemmaEntry } from '../types';
import {
  getAllCustomLemmas,
  addCustomLemma,
  deleteCustomLemma,
} from '../database/customLemmaOps';
import { SymptomDetailModal } from '../components/SymptomDetailModal';
import { AddNewSymptomModal } from '../components/AddNewSymptomModal';

type DictionarySection = 'symptoms' | 'custom';

interface SelectedSymptomData {
  name: string;
  displayName: string;
  words: string[];
}

export function DictionaryScreen() {
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();
  const { refreshLemmas } = useCustomLemmas();
  const [activeSection, setActiveSection] = useState<DictionarySection>('symptoms');
  const [searchQuery, setSearchQuery] = useState('');

  // Custom word state
  const [customLemmas, setCustomLemmas] = useState<CustomLemmaEntry[]>([]);
  const [newWord, setNewWord] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [showSymptomPicker, setShowSymptomPicker] = useState(false);
  const [symptomSearchQuery, setSymptomSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Symptom detail modal state
  const [selectedSymptomData, setSelectedSymptomData] = useState<SelectedSymptomData | null>(null);
  const [showSymptomDetail, setShowSymptomDetail] = useState(false);

  // Add new symptom modal state
  const [showAddNewSymptom, setShowAddNewSymptom] = useState(false);

  const styles = useMemo(() => createStyles(typography, colors), [typography, colors]);

  // Load custom lemmas on mount
  useEffect(() => {
    loadCustomLemmas();
  }, []);

  const loadCustomLemmas = async () => {
    try {
      const lemmas = await getAllCustomLemmas();
      setCustomLemmas(lemmas);
    } catch (error) {
      console.error('Failed to load custom lemmas:', error);
    }
  };

  // Get unique symptoms from SYMPTOM_LEMMAS values
  const availableSymptoms = useMemo(() => {
    const symptoms = new Set(Object.values(SYMPTOM_LEMMAS));
    return Array.from(symptoms)
      .map(symptom => ({
        value: symptom,
        label: SYMPTOM_DISPLAY_NAMES[symptom] || symptom.replace(/_/g, ' '),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  // Filter symptoms for picker
  const filteredPickerSymptoms = useMemo(() => {
    if (!symptomSearchQuery.trim()) return availableSymptoms;
    const query = symptomSearchQuery.toLowerCase();
    return availableSymptoms.filter(s =>
      s.label.toLowerCase().includes(query) ||
      s.value.toLowerCase().includes(query)
    );
  }, [availableSymptoms, symptomSearchQuery]);

  // Group symptoms by category - preserve internal name for lookups
  const symptomsByCategory = useMemo(() => {
    const categories: Record<string, Set<string>> = {};

    Object.entries(SYMPTOM_LEMMAS).forEach(([word, symptom]) => {
      if (!categories[symptom]) {
        categories[symptom] = new Set();
      }
      categories[symptom].add(word);
    });

    return Object.entries(categories)
      .map(([symptom, words]) => ({
        internalName: symptom,
        displayName: SYMPTOM_DISPLAY_NAMES[symptom] || symptom.replace(/_/g, ' '),
        words: Array.from(words).sort(),
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, []);

  // Filter symptoms based on search
  const filteredSymptoms = useMemo(() => {
    if (!searchQuery.trim()) return symptomsByCategory;

    const query = searchQuery.toLowerCase();
    return symptomsByCategory.filter(
      ({ displayName, internalName, words }) =>
        displayName.toLowerCase().includes(query) ||
        internalName.toLowerCase().includes(query) ||
        words.some(word => word.toLowerCase().includes(query))
    );
  }, [symptomsByCategory, searchQuery]);

  // Get list of all existing symptom names (for duplicate check)
  const existingSymptomNames = useMemo(() => {
    const builtIn = Object.values(SYMPTOM_LEMMAS);
    const custom = customLemmas.map(l => l.symptom);
    return [...new Set([...builtIn, ...custom])];
  }, [customLemmas]);

  const handleAddCustomWord = useCallback(async () => {
    if (!newWord.trim()) {
      Alert.alert('Missing Word', 'Please enter a word you want to add.');
      return;
    }
    if (!selectedSymptom) {
      Alert.alert('Missing Symptom', 'Please select which symptom this word means.');
      return;
    }

    setIsLoading(true);
    try {
      await addCustomLemma(newWord.trim(), selectedSymptom);
      await loadCustomLemmas();
      await refreshLemmas();
      setNewWord('');
      setSelectedSymptom('');
      Alert.alert('Added!', `"${newWord.trim()}" will now be recognized as ${SYMPTOM_DISPLAY_NAMES[selectedSymptom] || selectedSymptom}.`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add word');
    } finally {
      setIsLoading(false);
    }
  }, [newWord, selectedSymptom, refreshLemmas]);

  const handleDeleteCustomWord = useCallback((lemma: CustomLemmaEntry) => {
    Alert.alert(
      'Remove Custom Word',
      `Remove "${lemma.word}" from your custom words?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomLemma(lemma.id);
              await loadCustomLemmas();
              await refreshLemmas();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove word');
            }
          },
        },
      ]
    );
  }, [refreshLemmas]);

  // Handle tapping a symptom card to view details
  const handleSymptomPress = useCallback((symptom: typeof symptomsByCategory[0]) => {
    setSelectedSymptomData({
      name: symptom.internalName,
      displayName: symptom.displayName,
      words: symptom.words,
    });
    setShowSymptomDetail(true);
  }, []);

  // Handle adding a word from the symptom detail modal
  const handleAddWordFromModal = useCallback(async (word: string, symptomName: string) => {
    await addCustomLemma(word, symptomName);
    await loadCustomLemmas();
    await refreshLemmas();
  }, [refreshLemmas]);

  // Handle deleting a word from the symptom detail modal
  const handleDeleteWordFromModal = useCallback(async (lemma: CustomLemmaEntry) => {
    try {
      await deleteCustomLemma(lemma.id);
      await loadCustomLemmas();
      await refreshLemmas();
    } catch (error) {
      Alert.alert('Error', 'Failed to remove word');
    }
  }, [refreshLemmas]);

  // Handle creating a new custom symptom
  const handleAddNewSymptom = useCallback(async (symptomName: string, words: string[]) => {
    for (const word of words) {
      await addCustomLemma(word, symptomName);
    }
    await loadCustomLemmas();
    await refreshLemmas();
  }, [refreshLemmas]);

  const renderSymptomsSection = () => (
    <View style={styles.content}>
      <Text style={styles.paragraph}>
        Tap any symptom to add your own custom words for it.
      </Text>

      {/* Add New Symptom button */}
      <TouchableOpacity
        style={[styles.addNewSymptomButton, { minHeight: touchTargetSize }]}
        onPress={() => setShowAddNewSymptom(true)}
        accessibilityRole="button"
        accessibilityLabel="Create a new custom symptom"
        accessibilityHint="Opens a form to create a symptom unique to your condition"
      >
        <Ionicons name="add-circle-outline" size={24} color={colors.accentPrimary} />
        <Text style={styles.addNewSymptomText}>Create New Symptom</Text>
      </TouchableOpacity>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search symptoms or words..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={{ minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            accessibilityHint="Clears the search text and shows all symptoms"
          >
            <Ionicons name="close-circle" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.resultCount}>
        {filteredSymptoms.length} symptom{filteredSymptoms.length !== 1 ? 's' : ''} found
      </Text>

      {filteredSymptoms.map((symptom) => (
        <TouchableOpacity
          key={symptom.internalName}
          style={[styles.symptomCard, { minHeight: touchTargetSize }]}
          onPress={() => handleSymptomPress(symptom)}
          accessibilityRole="button"
          accessibilityLabel={`${symptom.displayName}. Tap to add custom words.`}
          accessibilityHint="Opens details to view recognized words and add your own custom words"
        >
          <View style={styles.symptomCardHeader}>
            <Text style={styles.symptomName}>{symptom.displayName}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
          <Text style={styles.symptomWords} numberOfLines={2}>
            {symptom.words.slice(0, 8).join(', ')}{symptom.words.length > 8 ? '...' : ''}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCustomSection = () => (
    <View style={styles.content}>
      <Text style={styles.paragraph}>
        Teach RantTrack your own words for symptoms. When you use these words, they'll be recognized automatically.
      </Text>

      {/* Add new word form */}
      <View style={styles.addWordSection}>
        <Text style={styles.subheading}>Add a New Word</Text>

        <Text style={styles.inputLabel}>Your word:</Text>
        <TextInput
          style={styles.textInput}
          placeholder='e.g., "wibbly", "floopy", "ugh"'
          placeholderTextColor={colors.textMuted}
          value={newWord}
          onChangeText={setNewWord}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.inputLabel}>What it means:</Text>
        <TouchableOpacity
          style={[styles.symptomSelect, { minHeight: touchTargetSize }]}
          onPress={() => setShowSymptomPicker(true)}
          accessibilityRole="button"
          accessibilityLabel={selectedSymptom
            ? `Selected symptom: ${SYMPTOM_DISPLAY_NAMES[selectedSymptom] || selectedSymptom.replace(/_/g, ' ')}`
            : 'Select a symptom'}
          accessibilityHint="Opens a list to choose which symptom this word means"
        >
          <Text style={selectedSymptom ? styles.symptomSelectText : styles.symptomSelectPlaceholder}>
            {selectedSymptom
              ? SYMPTOM_DISPLAY_NAMES[selectedSymptom] || selectedSymptom.replace(/_/g, ' ')
              : 'Tap to select a symptom...'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, { minHeight: touchTargetSize }, isLoading && styles.addButtonDisabled]}
          onPress={handleAddCustomWord}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel={isLoading ? 'Adding custom word' : 'Add custom word'}
          accessibilityHint="Saves your custom word to the symptom recognition list"
          accessibilityState={{ disabled: isLoading }}
        >
          <Ionicons name="add" size={20} color={colors.bgPrimary} />
          <Text style={styles.addButtonText}>
            {isLoading ? 'Adding...' : 'Add Custom Word'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom words list */}
      {customLemmas.length > 0 && (
        <>
          <Text style={styles.subheading}>Your Words ({customLemmas.length})</Text>
          {customLemmas.map((lemma) => (
            <View key={lemma.id} style={styles.customWordCard}>
              <View style={styles.customWordInfo}>
                <Text style={styles.customWord}>"{lemma.word}"</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
                <Text style={styles.customWordSymptom}>
                  {SYMPTOM_DISPLAY_NAMES[lemma.symptom] || lemma.symptom.replace(/_/g, ' ')}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.deleteButton, { minHeight: 48, minWidth: 48 }]}
                onPress={() => handleDeleteCustomWord(lemma)}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${lemma.word}`}
                accessibilityHint="Removes this custom word from the symptom recognition list"
              >
                <Ionicons name="trash-outline" size={22} color={colors.severityRough} />
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {customLemmas.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="add-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyStateText}>No custom words yet</Text>
          <Text style={styles.emptyStateHint}>
            Add words above that you use to describe your symptoms
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with tabs */}
      <View style={styles.header}>
        <Text style={styles.title}>Dictionary</Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              { minHeight: touchTargetSize },
              activeSection === 'symptoms' && styles.tabActive,
            ]}
            onPress={() => setActiveSection('symptoms')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeSection === 'symptoms' }}
          >
            <Ionicons
              name="list-outline"
              size={20}
              color={activeSection === 'symptoms' ? colors.accentPrimary : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                activeSection === 'symptoms' && styles.tabTextActive,
              ]}
            >
              Symptoms
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              { minHeight: touchTargetSize },
              activeSection === 'custom' && styles.tabActive,
            ]}
            onPress={() => setActiveSection('custom')}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeSection === 'custom' }}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={activeSection === 'custom' ? colors.accentPrimary : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                activeSection === 'custom' && styles.tabTextActive,
              ]}
            >
              Custom
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {activeSection === 'symptoms' && renderSymptomsSection()}
        {activeSection === 'custom' && renderCustomSection()}
      </ScrollView>

      {/* Symptom picker modal - outside ScrollView to avoid VirtualizedList nesting */}
      {showSymptomPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Symptom</Text>
              <TouchableOpacity
                onPress={() => setShowSymptomPicker(false)}
                style={{ minWidth: touchTargetSize, minHeight: touchTargetSize, alignItems: 'center', justifyContent: 'center' }}
                accessibilityRole="button"
                accessibilityLabel="Close symptom picker"
                accessibilityHint="Closes the picker without selecting a symptom"
              >
                <Ionicons name="close" size={28} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search symptoms..."
                placeholderTextColor={colors.textMuted}
                value={symptomSearchQuery}
                onChangeText={setSymptomSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <FlatList
              data={filteredPickerSymptoms}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerItem, { minHeight: touchTargetSize }]}
                  onPress={() => {
                    setSelectedSymptom(item.value);
                    setShowSymptomPicker(false);
                    setSymptomSearchQuery('');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: selectedSymptom === item.value }}
                  accessibilityHint="Selects this symptom and closes the picker"
                >
                  <Text style={styles.pickerItemText}>{item.label}</Text>
                  {selectedSymptom === item.value && (
                    <Ionicons name="checkmark" size={22} color={colors.accentPrimary} />
                  )}
                </TouchableOpacity>
              )}
              style={styles.pickerList}
            />
          </View>
        </View>
      )}

      {/* Symptom detail modal */}
      {selectedSymptomData && (
        <SymptomDetailModal
          visible={showSymptomDetail}
          symptomName={selectedSymptomData.name}
          recognizedWords={selectedSymptomData.words}
          customWords={customLemmas}
          onAddWord={handleAddWordFromModal}
          onDeleteWord={handleDeleteWordFromModal}
          onClose={() => {
            setShowSymptomDetail(false);
            setSelectedSymptomData(null);
          }}
        />
      )}

      {/* Add new symptom modal */}
      <AddNewSymptomModal
        visible={showAddNewSymptom}
        existingSymptoms={existingSymptomNames}
        onAddSymptom={handleAddNewSymptom}
        onClose={() => setShowAddNewSymptom(false)}
      />
    </View>
  );
}

const createStyles = (typography: any, colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgElevated,
  },
  title: {
    ...typography.largeDisplay,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.bgElevated,
  },
  tabActive: {
    backgroundColor: colors.accentLight,
  },
  tabText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.accentPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  subheading: {
    ...typography.header,
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchInput: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  resultCount: {
    ...typography.small,
    color: colors.textMuted,
    marginBottom: 12,
  },
  symptomCard: {
    padding: 16,
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.bgElevated,
  },
  symptomName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  symptomWords: {
    ...typography.small,
    color: colors.textMuted,
    lineHeight: 20,
  },
  symptomCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  addNewSymptomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
    borderStyle: 'dashed',
  },
  addNewSymptomText: {
    ...typography.bodyMedium,
    color: colors.accentPrimary,
  },
  addWordSection: {
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  inputLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.bgPrimary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.bgElevated,
  },
  symptomSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgPrimary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.bgElevated,
  },
  symptomSelectText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  symptomSelectPlaceholder: {
    ...typography.body,
    color: colors.textMuted,
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accentPrimary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    ...typography.bodyMedium,
    color: colors.bgPrimary,
  },
  customWordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  customWordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  customWord: {
    ...typography.bodyMedium,
    color: colors.accentPrimary,
  },
  customWordSymptom: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  deleteButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    marginTop: 24,
  },
  emptyStateText: {
    ...typography.header,
    color: colors.textMuted,
    marginTop: 16,
  },
  emptyStateHint: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  pickerContainer: {
    backgroundColor: colors.bgPrimary,
    borderRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgElevated,
  },
  pickerTitle: {
    ...typography.header,
    color: colors.textPrimary,
  },
  pickerList: {
    maxHeight: 400,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgElevated,
  },
  pickerItemText: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
