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
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedPackageName, setSelectedPackageName] = useState('');
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
            setPackages([]); // Reset packages when screen is focused
        }, [])
    );

    useEffect(() => {
        const backAction = () => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'SelectVehicle1' }], 
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
                if (selectedCategory) {
                    fetchPackages(selectedCityData.cityId, selectedCategory); // Fetch packages if category is selected
                }
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
        if (!categoryId) return; // Don't fetch packages if no category is selected

        setPackageLoading(true);
        try {
            const response = await fetch(`http://ashtavinayak.somee.com/api/Package/GetPackages/${cityId}/${categoryId}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            setPackages(result || []);
        } catch (error) {
            // console.error('Error fetching packages:', error);
            setPackages([]);
        } finally {
            setPackageLoading(false);
        }
    };

    const handleNextPress = () => {
        if (selectedCategory && selectedPackage && cityId) {
            console.log('Selected Category ID:', selectedCategory);
            console.log('Selected Category Name:', selectedCategoryName);
            console.log('Selected Package ID:', selectedPackage);
            console.log('Selected Package Name:', selectedPackageName);
            console.log('Selected childwithseat:', childWithSeatP);
            console.log('Selected childwithoutseat:', childWithoutSeatP);
            navigation.navigate('Standardpu12', {
                selectedCategory,
                selectedCategoryName, // Sending the selectedCategoryName
                selectedPackage,      // Sending the selectedPackage ID
                selectedPackageName,  // Sending the selectedPackageName
                cityId,
                cityName,
                vehicleType,
                childWithSeatP: parseInt(childWithSeatP, 10), // Ensure it's an integer
                childWithoutSeatP: parseInt(childWithoutSeatP, 10), // Ensure it's an integer
            });
        } else {
            console.log('Please select both category and package!');
            alert('Please select both category and package!');
        }
    };

    const renderPackageItem = ({ item }) => (
        <TouchableOpacity
            style={[ 
                styles.packageItemContainer,
                selectedPackage === item.packageId && styles.selectedPackageItemContainer
            ]}
            onPress={() => {
                setSelectedPackage(item.packageId);
                setSelectedPackageName(item.packageName); // Set the selected package name
            }}
        >
            <Text style={styles.packageItemText}>{item.packageName}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header} />
            <TouchableOpacity onPress={() => navigation.navigate('SelectVehicle1')} style={styles.backButtonContainer}>
                <View style={styles.backButtonCircle}>
                    <Text style={styles.backButton}>{'<'}</Text>
                </View>
            </TouchableOpacity>

            <FlatList
                ListHeaderComponent={
                    <>
                        <Text style={styles.sectionTitle}>Select Category</Text>
                        {loading ? (
                            <ActivityIndicator size="large" color="#FF5722" />
                        ) : (
                            <View style={styles.leftAlignedOptionsContainer}>
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category.categoryId}
                                        style={[ 
                                            styles.packageContainer, 
                                            selectedCategory === category.categoryId && styles.selectedPackage 
                                        ]}
                                        onPress={() => {
                                            setSelectedCategory(category.categoryId);
                                            setSelectedCategoryName(category.categoryName || ''); // Ensure it's a string
                                            console.log('Selected Category ID:', category.categoryId);
                                            setPackages([]); // Reset packages when category changes
                                            fetchPackages(cityId, category.categoryId); // Fetch packages for the selected category
                                            // Set child prices as integers
                                            setChildWithSeatP(parseInt(category.childwithseatP, 10) || 0);
                                            setChildWithoutSeatP(parseInt(category.childwithoutseatP, 10) || 0);
                                        }}
                                    >
                                        <View style={styles.row}>
                                            <View style={[ 
                                                styles.checkbox, 
                                                selectedCategory === category.categoryId && styles.checkboxSelected 
                                            ]}>
                                                {selectedCategory === category.categoryId && <Text style={styles.tick}>✔</Text>}
                                            </View>
                                            <Text style={styles.packageTitle}>{category.categoryName}</Text>
                                        </View>
                                        <View style={styles.separator} />
                                        <View>
                                            {category.busType && category.busType.split(',').map((item, index) => (
                                                <Text key={`bus-${index}`} style={[styles.packageDetail,{fontWeight:"bold"}]}>
                                                    • {item.trim()}
                                                </Text>
                                            ))}
                                            {category.stayType && category.stayType.split(',').map((item, index) => (
                                                <Text key={`stay-${index}`} style={[styles.packageDetail,{fontWeight:"bold"}]}>
                                                    • {item.trim()}
                                                </Text>
                                            ))}
                                            <Text style={[styles.packageDetail,{ color: "green",fontWeight:"bold" }]}>Child with Seat Price: {category.childwithseatP}</Text>
                                            <Text style={[styles.packageDetail,{ color: "green",fontWeight:"bold" }]}>Child without Seat Price: {category.childwithoutseatP}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                        <Text style={styles.sectionTitle1}>Select Package</Text>
                    </>
                }
                data={packages}
                renderItem={renderPackageItem}
                keyExtractor={(item) => item.packageId.toString()}
                numColumns={3}
                contentContainerStyle={styles.packageListContainer}
            />

            {packageLoading && (
                <ActivityIndicator size="large" color="#FF5722" />
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
        borderColor: '#007AFF',
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
});

export default SelectTour;
