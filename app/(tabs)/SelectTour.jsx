import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TourOptionsScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const navigation = useNavigation();

  const categories = [
    { id: 1, label: 'Standard', description: '(Non AC Bus & Stay in Bhakt Niwas)' },
    { id: 2, label: 'Delux', description: '(AC Bus & Stay in Deluxe Hotel)' },
    { id: 3, label: 'Premium', description: '(AC Bus & Stay in 3 Star Hotel)' },
  ];

  const packages = [
    { id: 1, label: '1Night / 2Days' },
    { id: 2, label: '2Night / 3Days' },
    { id: 3, label: 'Shastrokt' },
  ];

  const handleNextPress = () => {
    if (selectedCategory && selectedPackage) {
      console.log('Category:', selectedCategory, 'Package:', selectedPackage);
      navigation.navigate('NextPage');
    } else {
      console.log('Please select both category and package!');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
        <View style={styles.backButtonCircle}>
          <Text style={styles.backButton}>{'<'}</Text>
        </View>
      </TouchableOpacity>

      {/* Select Category */}
      <Text style={styles.sectionTitle}>Select Category</Text>
      <View style={styles.leftAlignedOptionsContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.option}
            onPress={() => setSelectedCategory(category.id)}
          >
            <View style={styles.optionContent}>
              <View
                style={[
                  styles.checkbox,
                  selectedCategory === category.id && styles.checkboxSelected,
                ]}
              >
                {selectedCategory === category.id && <Text style={styles.tick}>✔</Text>}
              </View>
              <View>
                <Text style={styles.optionLabel}>{category.label}</Text>
                <Text style={styles.optionDescription}>{category.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Select Package */}
     {/* Select Package */}
      <Text style={styles.sectionTitle1}>Select Package</Text>
      <View style={styles.optionsContainer}>
        {packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={styles.option1}
            onPress={() => setSelectedPackage(pkg.id)}
          >
            <Text style={styles.optionLabel}>{pkg.label}</Text>
            <View
              style={[
                styles.radioCircle,
                selectedPackage === pkg.id && styles.radioCircleSelected,
              ]}
            >
              {selectedPackage === pkg.id && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 1,
  },
  backButtonCircle: {
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  backButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 0,
    marginTop:80,
  },

  sectionTitle1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 0,
    marginTop:10,
  },

  leftAlignedOptionsContainer: {
    marginBottom: 20,
    alignItems: 'flex-start', // Align to left
  },
  rightAlignedOptionsContainer: {
    marginBottom: 20,
    alignItems: 'flex-end', // Align to right
  },

  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  optionDescription: {
    fontSize: 14,
    color: '#888',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxSelected: {
    borderColor: '#FF5722',
    backgroundColor: '#FF5722',
  },
  tick: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  radioCircleSelected: {
    borderColor: '#FF5722',
  },
  radioInner: {
    width: 10,
    height: 10,
    backgroundColor: '#FF5722',
    borderRadius: 5,
  },
  nextButton: {
    marginTop: 'auto',
    backgroundColor: '#FF5722',
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
   
  },
  option1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
 
 

  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#FF5722',
  },
  radioInner: {
    width: 10,
    height: 10,
    backgroundColor: '#FF5722',
    borderRadius: 5,
  },
  
 
});

export default TourOptionsScreen;
