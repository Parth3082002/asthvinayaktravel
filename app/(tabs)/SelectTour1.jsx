import React, { useState, useEffect } from 'react';
import { 
    View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, 
    BackHandler, FlatList 
} from 'react-native';
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
    const [childWithSeatP, setChildWithSeatP] = useState(0);
    const [childWithoutSeatP, setChildWithoutSeatP] = useState(0);

    const navigation = useNavigation();
    const route = useRoute();
    const { selectedCityId, vehicleType } = route.params || {}; 

    useFocusEffect(
        React.useCallback(() => {
            setSelectedCategory(null);
            setSelectedPackage(null);
        }, [])
    );

    useEffect(() => {
        const backAction = () => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [navigation]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCityId) {
            fetchCityDetails(selectedCityId);
        }
    }, [selectedCityId]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://ashtavinayak.somee.com/api/categorys');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
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
            const selectedCityData = cities.find(city => city.cityId === cityId);

            if (selectedCityData) {
                setCityId(selectedCityData.cityId);
                setCityName(selectedCityData.cityName);
                fetchPackages(selectedCityData.cityId, selectedCategory);
            } else {
                console.log('City not found');
                setPackages([]);
            }
        } catch (error) {
            console.error('Error fetching city details:', error);
            setPackages([]);
        } finally {
            setPackageLoading(false);
        }
    };

    const fetchPackages = async (cityId, categoryId) => {
        try {
            const response = await fetch(`http://ashtavinayak.somee.com/api/Package/GetPackages/${cityId}/${categoryId}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
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
            console.log('Navigating with:', { selectedCategory, selectedPackage, cityId, cityName, vehicleType, childWithSeatP, childWithoutSeatP });
            navigation.navigate('Standardpu12', {
                selectedCategory,
                selectedPackage,
                cityId,
                cityName,
                vehicleType,
                childWithSeatP,
                childWithoutSeatP,
            });
        } else {
            console.log('Please select both category and package!');
            alert('Please select both category and package!');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Select Category</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#FF5722" />
            ) : (
                categories.map((category) => (
                    <TouchableOpacity
                        key={category.categoryId}
                        style={selectedCategory === category.categoryId ? styles.selectedCategory : styles.categoryContainer}
                        onPress={() => {
                            setSelectedCategory(category.categoryId);
                            setChildWithSeatP(category.childwithseatP);
                            setChildWithoutSeatP(category.childwithoutseatP);
                            fetchPackages(cityId, category.categoryId);
                        }}
                    >
                        <Text style={styles.categoryTitle}>{category.categoryName}</Text>
                        <Text style={styles.packageDetail}>Bus Type: {category.busType}</Text>
                        <Text style={styles.packageDetail}>Stay Type: {category.stayType}</Text>
                        <Text style={styles.packageDetail}>Child with Seat Price: {category.childwithseatP}</Text>
                        <Text style={styles.packageDetail}>Child without Seat Price: {category.childwithoutseatP}</Text>
                    </TouchableOpacity>
                ))
            )}

            <Text style={styles.sectionTitle}>Select Package</Text>
            <FlatList
                data={packages}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={selectedPackage === item.packageId ? styles.selectedPackage : styles.packageItemContainer}
                        onPress={() => setSelectedPackage(item.packageId)}
                    >
                        <Text style={styles.packageItemText}>{item.packageName}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.packageId.toString()}
                numColumns={3}
            />

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
        // position: 'absolute',
        bottom: 0,
        left: 20,
        right: 20,
        marginLeft:-5,
        marginRight:35,
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