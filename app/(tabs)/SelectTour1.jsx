import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, BackHandler, ScrollView, FlatList } from 'react-native';
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
            // console.error('Error fetching categories:', error);
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
            // console.error('Error fetching Spackages:', error);
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

    const renderPackageItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.packageItemContainer,
                selectedPackage === item.packageId && styles.selectedPackageItemContainer
            ]}
            onPress={() => setSelectedPackage(item.packageId)}
        >
            <Text style={styles.packageItemText}>{item.packageName}</Text>
        </TouchableOpacity>
    );

    return (
       
            <View style={styles.container}>
                <View style={styles.header}></View>
                  <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButtonContainer}>
                    <View style={styles.backButtonCircle}>
                        <Text style={styles.backButton}>{'<'}</Text>
                    </View>
                  </TouchableOpacity>
        
                {/* Scrollable Content */}
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={true}>                    <Text style={styles.sectionTitle}>Select Category</Text>
        
                    {loading ? (
                        <ActivityIndicator size="large" color="#FF5722" />
                    ) : (
                        <View style={styles.leftAlignedOptionsContainer}>
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category.categoryId}
                                    style={[
                                        styles.packageContainer,
                                        selectedCategory === category.categoryId && styles.selectedPackage,
                                    ]}
                                    onPress={() => setSelectedCategory(category.categoryId)}
                                >
                                    <View style={styles.row}>
                                        <View
                                            style={[
                                                styles.checkbox,
                                                selectedCategory === category.categoryId && styles.checkboxSelected,
                                            ]}
                                        >
                                            {selectedCategory === category.categoryId && (
                                                <Text style={styles.tick}>✔</Text>
                                            )}
                                        </View>
                                        <Text style={styles.packageTitle}>{category.categoryName}</Text>
                                    </View>
                                    <View style={styles.separator} />
                                    <View>
                                        {category.busType.split(',').map((item, index) => (
                                            <Text key={`bus-${index}`} style={styles.packageDetail}>
                                                • {item.trim()}
                                            </Text>
                                        ))}
                                        {category.stayType.split(',').map((item, index) => (
                                            <Text key={`stay-${index}`} style={styles.packageDetail}>
                                                • Stay in {item.trim()}
                                            </Text>
                                        ))}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
        
                    <Text style={styles.sectionTitle1}>Select Package</Text>
                      <View style={styles.durationContainer}>
                        {packageLoading ? (
                            <ActivityIndicator size="large" color="#FF5722" />
                        ) : packages.length > 0 ? (
                            <FlatList
                                data={packages}
                                renderItem={renderPackageItem}
                                keyExtractor={(item) => item.packageId.toString()}
                                numColumns={3}
                                contentContainerStyle={styles.packageListContainer}
                            />
                        ) : (
                            <Text style={styles.noPackagesText}>No packages available for this city.</Text>
                        )}
                      </View>
                    </ScrollView>
                    <TouchableOpacity onPress={handleNextPress} style={styles.nextButton}>
                      <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
        );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9F9",
    },


      packageContainer: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginHorizontal: 15,
        borderWidth: 1,
        borderColor: 'transparent',
      },
      selectedPackage: {
        borderColor: '#007AFF', // Blue border for selected category
      },
      row: {
        flexDirection: 'row',
        alignItems: 'center',
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
      packageTitle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
      separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 10,
      },
      packageDetail: {
        fontSize: 14,
        color: '#555',
      },
        
    header: {
        height: 50,
        backgroundColor: "#E65100",
        justifyContent: "center",
        paddingHorizontal: 15,
    },
    backButtonContainer: {
        position: 'absolute',
        top: 60,
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
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 60,
        marginLeft: 15,
    },
    sectionTitle1: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 20,
        marginLeft: 15,
    },
    packageContainer: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginHorizontal: 15,
    },
    selectedPackage: {
        borderColor: "white",
        borderWidth: 1,
    },
    packageHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    packageTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 10,
    },
    packageDetail: {
        fontSize: 14,
        color: "#555",
    },
    durationContainer: {
        flex: 1,
        paddingHorizontal: 15
    },
    packageListContainer: {
        justifyContent: 'space-between',
    },
    packageItemContainer: {
        width: '30%',
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: '1.5%',
    },
    selectedPackageItemContainer: {
        borderColor: "#007AFF",
        borderWidth: 2,
    },
    packageItemText: {
        fontSize: 14,
        fontWeight: "bold",
        textAlign: 'center',
    },
    nextButton: {
        position: 'absolute',
        bottom: 0,
        left: 20,
        right: 20,
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
    noPackagesText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#555',
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
    scrollContainer: {
        flexGrow: 1,
      //  height:10,
        paddingBottom: 80, // Ensures scrolling space at the bottom
    },
   
});

export default SelectTour;