import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, BackHandler } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

const SelectTour = () => {
    const [categories, setCategories] = useState([]);
    const [packages, setPackages] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [packageLoading, setPackageLoading] = useState(false);
    const [cityId, setCityId] = useState(null);
    const [cityName, setCityName] = useState('');

    const navigation = useNavigation();
    const route = useRoute();
    const { selectedCityId } = route.params || {}; // Get the cityId from the route params
    const { vehicleType } = route.params || {};

    useFocusEffect(
        React.useCallback(() => {
            // Reset category and package states when the screen is focused again
            setSelectedCategory(null);
            setSelectedPackage(null);

            return () => {
                // Cleanup if needed
            };
        }, [])
    );

    useEffect(() => {
        const backAction = () => {
            // Reset navigation stack and navigate back to Home
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
            return true;  // Prevent default back action
        };

        // Add event listener for physical back button
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        // Clean up the event listener on component unmount
        return () => backHandler.remove();
    }, [navigation]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCityId) {
            fetchCityDetails(selectedCityId); // Use the cityId passed from the Home screen
        }
    }, [selectedCityId]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://ashtavinayak.somee.com/api/categorys');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result = await response.json();
            setCategories(result.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCityDetails = async (cityId) => {
        setPackageLoading(true);
        try {
            const response = await fetch('http://ashtavinayak.somee.com/api/City');
            const cities = await response.json();
            const selectedCityData = cities.find(city => city.cityId === cityId); // Use cityId for selection

            if (selectedCityData) {
                setCityId(selectedCityData.cityId);
                setCityName(selectedCityData.cityName);  // Store city name
                fetchPackages(selectedCityData.cityId);
            } else {
                console.log('City not found');
                setPackageLoading(false);
                setPackages([]);
            }
        } catch (error) {
            console.error('Error fetching city details:', error);
            setPackageLoading(false);
            setPackages([]);
        }
    };

    const fetchPackages = async (cityId) => {
        try {
            const response = await fetch(`http://ashtavinayak.somee.com/api/Package/GetPackages/${cityId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result = await response.json();
            setPackages(result || []);
        } catch (error) {
            console.error('Error fetching packages:', error);
            setPackages([]);
        } finally {
            setPackageLoading(false);
        }
    };

    const handleNextPress = () => {
        if (selectedCategory && selectedPackage && cityId) {
            console.log("Selected Vehicle Type:", vehicleType); 
            console.log("cityid",cityId);
            navigation.navigate('Standardpu12', {
                selectedCategory,
                selectedPackage,
                cityId,
                cityName,  // Send cityName along with cityId to the next screen
                vehicleType: vehicleType,
                
            });
        } else {
            console.log('Please select both category and package!');
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonContainer}>
                <View style={styles.backButtonCircle}>
                    <Text style={styles.backButton}>{'<'}</Text>
                </View>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Select Category</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#FF5722" />
            ) : (
                <View style={styles.leftAlignedOptionsContainer}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.categoryId}
                            style={styles.option}
                            onPress={() => setSelectedCategory(category.categoryId)}
                        >
                            <View style={styles.optionContent}>
                                <View style={[styles.checkbox, selectedCategory === category.categoryId && styles.checkboxSelected]}>
                                    {selectedCategory === category.categoryId && <Text style={styles.tick}>✔</Text>}
                                </View>
                                <View>
                                    <Text style={styles.optionLabel}>{category.categoryName}</Text>
                                    <Text style={styles.optionDescription}>
                                        {`${category.busType} Bus & Stay in ${category.stayType}`}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <Text style={styles.sectionTitle1}>Select Package</Text>

            {packageLoading ? (
                <ActivityIndicator size="large" color="#FF5722" />
            ) : packages.length > 0 ? (
                <View style={styles.optionsContainer}>
                    {packages.map((pkg) => (
                        <TouchableOpacity
                            key={pkg.packageId}
                            style={styles.option1}
                            onPress={() => setSelectedPackage(pkg.packageId)}
                        >
                            <View style={styles.optionContent}>
                                <View style={[styles.radioCircle, selectedPackage === pkg.packageId && styles.radioCircleSelected]}>
                                    {selectedPackage === pkg.packageId && <View style={styles.radioInner} />}
                                </View>
                                <Text style={styles.optionLabel}>{pkg.packageName}</Text>
                                <Text style={styles.optionDescription}>
                                    {pkg.description}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <Text>No packages available for this city.</Text>
            )}

            <TouchableOpacity onPress={handleNextPress} style={styles.nextButton}>
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
    marginRight: 10,  // Adjust margin to ensure they are in one row
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
    marginTop: 130,
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
  option1: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Ensure all options are left aligned
    alignItems: 'center',  // Align the radio button and text in a row
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
});

export default SelectTour;
