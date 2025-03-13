import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Checkbox } from 'react-native-paper';

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
    const [price, setPrice] = useState(0);

    const navigation = useNavigation();
    const route = useRoute();
    const { selectedCityId, vehicleType } = route.params || {}; 

    useFocusEffect(
        React.useCallback(() => {
            setSelectedCategory(null);
            setSelectedPackage(null);
            setPackages([]);
        }, [])
    );

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
            const response = await fetch('https://ashtavinayak.somee.com/api/categorys');
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
            const response = await fetch('https://ashtavinayak.somee.com/api/City');
            const cities = await response.json();
            const selectedCityData = cities.find(city => city.cityId === cityId);

            if (selectedCityData) {
                setCityId(selectedCityData.cityId);
                setCityName(selectedCityData.cityName);
                if (selectedCategory) {
                    fetchPackages(selectedCityData.cityId, selectedCategory);
                }
            } else {
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
        if (!categoryId) return;

        setPackageLoading(true);
        try {
            const response = await fetch(`https://ashtavinayak.somee.com/api/Package/GetPackages/${cityId}/${categoryId}`);
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

    const handlePackageSelection = (item) => {
        setSelectedPackage(item.packageId);
        setSelectedPackageName(item.packageName);
        setChildWithSeatP(parseInt(item.child3To8YrsWithSeat, 10) || 0);
        setChildWithoutSeatP(parseInt(item.child3To8YrsWithoutSeat, 10) || 0);
        setPrice(parseInt(item.adultPrice, 10) || 0);
    };

    const handleNextPress = () => {
        if (selectedCategory && selectedPackage && cityId) {
            console.log('Navigating with values:', {
                selectedCategory,
                selectedCategoryName,
                selectedPackage,
                selectedPackageName,
                cityId,
                cityName,
                vehicleType,
                childWithSeatP,
                childWithoutSeatP,
                price
            });
            navigation.navigate('Standardpu12', {
                selectedCategory,
                selectedCategoryName,
                selectedPackage,
                selectedPackageName,
                cityId,
                cityName,
                vehicleType,
                childWithSeatP,
                childWithoutSeatP,
                price
            });
        } else {
            alert('Please select both category and package!');
        }
    };
    return (
        <View style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('SelectVehicle1')} style={styles.backButtonContainer}>
                    <View style={styles.backButtonCircle}>
                        <Text style={styles.backButton}>{'<'}</Text>
                    </View>
                </TouchableOpacity>
                <Text style={styles.headerText}>Select Categories & Packages</Text>
            </View>

            {/* Scrollable Content Below Header & Above Button */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Select Category */}
                <Text style={styles.sectionTitle}>Select Category</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#FF5722" />
                ) : (
                    categories.map((item) => (
                        <TouchableOpacity
                            key={item.categoryId}
                            style={[
                                styles.categoryItem,
                                selectedCategory === item.categoryId && styles.selectedCategory
                            ]}
                            onPress={() => {
                                setSelectedCategory(item.categoryId);
                                setSelectedCategoryName(item.categoryName || '');
                                setPackages([]);
                                fetchPackages(cityId, item.categoryId);
                            }}
                        >
                            <Text style={styles.categoryText}>{item.categoryName}</Text>
                        </TouchableOpacity>
                    ))
                )}

                {selectedCategory && (
                    <>
                        <Text style={packages.length > 0 ? styles.sectionTitle1 : styles.noPackageText}>
                            {packages.length > 0 ? "Select Package" : "No packages available"}
                        </Text>

                        {packageLoading ? (
                            <ActivityIndicator size="large" color="#FF5722" />
                        ) : (
                            packages.length > 0 && packages.map((item) => (
                                <View key={item.packageId} style={styles.packageItemContainer}>
                                    <View style={styles.packageRow}>
                                        <Checkbox
                                            status={selectedPackage === item.packageId ? 'checked' : 'unchecked'}
                                            onPress={() => handlePackageSelection(item)}
                                            color="#007AFF"
                                        />
                                        <Text style={styles.packageItemText}>{item.packageName}</Text>
                                    </View>
                                    <View style={styles.line} />
                                    <Text style={styles.bulletText}>• Adult Price: ₹{item.adultPrice}</Text>
                                    <Text style={styles.bulletText}>• Child (3-8) With Seat: ₹{item.child3To8YrsWithSeat}</Text>
                                    <Text style={styles.bulletText}>• Child (3-8) Without Seat: ₹{item.child3To8YrsWithoutSeat}</Text>
                                </View>
                            ))
                        )}
                    </>
                )}
            </ScrollView>

            {/* Button Container */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleNextPress} style={styles.nextButton}>
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}   



const styles = StyleSheet.create({
   
        container: {
            flex: 1,
            backgroundColor: '#fff',
            marginTop:40,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 16,
            backgroundColor: '#FF5722',
        },
        backButtonContainer: {
            marginRight: 12,
        },
        backButtonCircle: {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
        },
        backButton: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#FF5722',
        },
        headerText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#fff',
            textAlign:'center'
        },
        scrollContainer: {
            flexGrow: 1,
            padding: 16,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333',
            marginBottom: 10,
        },
        sectionTitle1: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#333',
            marginTop: 20,
            marginBottom: 10,
        },
        categoryItem: {
            backgroundColor: '#fff',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 8,
            marginBottom: 10,
            elevation: 5, // For Android shadow
            shadowColor: '#000', // Shadow color
            shadowOffset: { width: 0, height: 2 }, // Shadow direction
            shadowOpacity: 0.2, // Shadow transparency
            shadowRadius: 4, // Shadow blur
        },
        
        selectedCategory: {
            borderColor: "#007AFF",
            borderWidth: 2,
        },
        categoryText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#333',
        },
        packageItemContainer: {
            backgroundColor: '#fff',
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: '#ddd',

            elevation: 5, // For Android shadow
            shadowColor: '#000', // Shadow color
            shadowOffset: { width: 0, height: 2 }, // Shadow direction
            shadowOpacity: 0.2, // Shadow transparency
            shadowRadius: 4, // Shadow blur
        },
        packageRow: {
            flexDirection: 'row',
            alignItems: 'center',

        },
        packageItemText: {
            fontSize: 16,
            marginLeft: 8,
            color: '#333',
            fontWeight:'bold'
        },
        line: {
            height: 1,
            backgroundColor: '#ddd',
            marginVertical: 8,
        },
        bulletText: {
            fontSize: 14,
            color: 'green',
            marginBottom: 2,
            fontWeight:'bold'
        },
        noPackageText: {
            fontSize: 16,
            color: '#555',
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: 20,
        },
        buttonContainer: {
            paddingVertical: 16,
            paddingHorizontal: 16,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderColor: '#ddd',
        },
        nextButton: {
            backgroundColor: '#FF5722',
            paddingVertical: 16,
            borderRadius: 8,
            alignItems: 'center',
        },
        nextButtonText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#fff',
        },
    
    
    
});


export default SelectTour;
