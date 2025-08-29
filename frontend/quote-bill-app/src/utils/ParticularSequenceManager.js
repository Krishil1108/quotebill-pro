// Custom Particulars Sequence Manager
class ParticularSequenceManager {
  constructor() {
    this.customSequence = [];
    this.loadFromStorage();
  }

  // Load custom sequence from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('customParticularsSequence');
      if (stored) {
        this.customSequence = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load custom particulars sequence:', error);
      this.customSequence = [];
    }
  }

  // Save custom sequence to localStorage
  saveToStorage() {
    try {
      localStorage.setItem('customParticularsSequence', JSON.stringify(this.customSequence));
    } catch (error) {
      console.error('Failed to save custom particulars sequence:', error);
    }
  }

  // Set new custom sequence
  setCustomSequence(sequence) {
    this.customSequence = sequence.map(item => item.trim()).filter(item => item.length > 0);
    this.saveToStorage();
    return this.customSequence;
  }

  // Get custom sequence
  getCustomSequence() {
    return [...this.customSequence];
  }

  // Get next items in sequence based on current item
  getNextItemsInSequence(currentItem, count = 5) {
    if (!currentItem || this.customSequence.length === 0) {
      return [];
    }

    const currentIndex = this.customSequence.findIndex(
      item => item.toLowerCase().includes(currentItem.toLowerCase()) ||
              currentItem.toLowerCase().includes(item.toLowerCase())
    );

    if (currentIndex === -1) {
      return [];
    }

    const nextItems = [];
    for (let i = 1; i <= count && currentIndex + i < this.customSequence.length; i++) {
      nextItems.push({
        particular: this.customSequence[currentIndex + i],
        sequence: currentIndex + i + 1,
        confidence: Math.max(0.9 - (i * 0.1), 0.5), // Decreasing confidence
        reason: `Next in sequence (${currentIndex + i + 1}/${this.customSequence.length})`
      });
    }

    return nextItems;
  }

  // Get items that come before a specific item
  getPreviousItemsInSequence(currentItem, count = 3) {
    if (!currentItem || this.customSequence.length === 0) {
      return [];
    }

    const currentIndex = this.customSequence.findIndex(
      item => item.toLowerCase().includes(currentItem.toLowerCase()) ||
              currentItem.toLowerCase().includes(item.toLowerCase())
    );

    if (currentIndex === -1) {
      return [];
    }

    const previousItems = [];
    for (let i = 1; i <= count && currentIndex - i >= 0; i++) {
      previousItems.unshift({
        particular: this.customSequence[currentIndex - i],
        sequence: currentIndex - i + 1,
        confidence: 0.7,
        reason: `Previous in sequence (${currentIndex - i + 1}/${this.customSequence.length})`
      });
    }

    return previousItems;
  }

  // Find items that match search term in sequence
  findInSequence(searchTerm, maxResults = 10) {
    if (!searchTerm || this.customSequence.length === 0) {
      return [];
    }

    const matches = [];
    const searchLower = searchTerm.toLowerCase();

    this.customSequence.forEach((item, index) => {
      if (item.toLowerCase().includes(searchLower)) {
        matches.push({
          particular: item,
          sequence: index + 1,
          confidence: item.toLowerCase() === searchLower ? 1.0 : 0.8,
          reason: `From custom sequence (${index + 1}/${this.customSequence.length})`
        });
      }
    });

    return matches.slice(0, maxResults);
  }

  // Get sequence completion percentage based on current items
  getSequenceCompletion(currentItems) {
    if (this.customSequence.length === 0) {
      return { percentage: 0, nextRecommended: [], missingItems: [] };
    }

    const completedItems = new Set();
    const currentItemsLower = currentItems.map(item => 
      item.particular ? item.particular.toLowerCase() : ''
    );

    // Find which sequence items are completed
    this.customSequence.forEach((seqItem, index) => {
      const seqItemLower = seqItem.toLowerCase();
      if (currentItemsLower.some(currentItem => 
        currentItem.includes(seqItemLower) || seqItemLower.includes(currentItem)
      )) {
        completedItems.add(index);
      }
    });

    const completionPercentage = (completedItems.size / this.customSequence.length) * 100;

    // Find next recommended items
    const nextRecommended = [];
    const missingItems = [];

    this.customSequence.forEach((item, index) => {
      if (!completedItems.has(index)) {
        if (nextRecommended.length < 3) {
          nextRecommended.push({
            particular: item,
            sequence: index + 1,
            confidence: 0.9,
            reason: `Next in your sequence (${index + 1}/${this.customSequence.length})`
          });
        }
        missingItems.push({
          particular: item,
          sequence: index + 1
        });
      }
    });

    return {
      percentage: Math.round(completionPercentage),
      completed: completedItems.size,
      total: this.customSequence.length,
      nextRecommended,
      missingItems
    };
  }

  // Check if custom sequence is available
  hasCustomSequence() {
    return this.customSequence.length > 0;
  }

  // Clear custom sequence
  clearCustomSequence() {
    this.customSequence = [];
    localStorage.removeItem('customParticularsSequence');
  }
}

// Create singleton instance
const particularSequenceManager = new ParticularSequenceManager();

export default particularSequenceManager;
