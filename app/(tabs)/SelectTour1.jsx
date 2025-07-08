import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, BackHandler, Platform
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
    const [childWithSeatP, setChildWithSeatP] = useState(0);
    const [childWithoutSeatP, setChildWithoutSeatP] = useState(0);
    const [price, setPrice] = useState(0);
    const [withoutBookingAmount, setWithoutBookingAmount] = useState(0);
    const [carTotalSeat, setCarTotalSeat] = useState(0);

    const navigation = useNavigation();
    const route = useRoute();
    
    // Log all parameters received
    console.log('SelectTour1 - All route params:', route.params);
    
    const { 
        selectedCityId, 
        selectedCityName,
        destinationId,
        destinationName,
        vehicleType,
        selectedVehicleId,
        selectedBus,
        tuljapur
    } = route.params || {};

    useFocusEffect(
        React.useCallback(() => {
            setSelectedCategory(null);
        }, [])
    );
    useEffect(() => {
        const backAction = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [navigation]);
    useEffect(() => {
        fetchCategories();
    }, [selectedCityId, tuljapur]);

    const fetchCategories = async () => {
        try {
            // Use the new API with cityId and tuljapur parameters
            const url = `https://newenglishschool-001-site1.ktempurl.com/api/Categorys/GetCategories?cityid=${selectedCityId}&isTulsapur=${tuljapur}`;
            console.log('Fetching categories from:', url);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            console.log('Categories API response:', result);
            setCategories(result || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPackages = async (categoryId) => {
        if (!categoryId) return;

        setPackageLoading(true);
        try {
            // Determine isCarType based on selectedBus
            const isCarType = selectedBus ? false : true;
            const url = `https://newenglishschool-001-site1.ktempurl.com/api/package/GetPackageByCateGoryId?id=${categoryId}&isCarType=${isCarType}`;
            console.log('Fetching packages from:', url);
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            console.log('Packages API response:', result);
            setPackages(result || []);
        } catch (error) {
            console.error('Error fetching packages:', error);
            setPackages([]);
        } finally {
            setPackageLoading(false);
        }
    };

    const handleCategorySelection = (item) => {
        // If same category is selected again, clear everything
        if (selectedCategory === item.categoryId) {
            setSelectedCategory(null);
            setSelectedCategoryName('');
            setSelectedPackage(null);
            setSelectedPackageName('');
            setPackages([]);
            setChildWithSeatP(0);
            setChildWithoutSeatP(0);
            setPrice(0);
            setWithoutBookingAmount(0);
            setCarTotalSeat(0);
            console.log('Category deselected:', item.categoryId, item.categoryName);
            return;
        }
        
        // Select new category
        setSelectedCategory(item.categoryId);
        setSelectedCategoryName(item.categoryName || '');
        setSelectedPackage(null);
        setSelectedPackageName('');
        setPackages([]);
        setChildWithSeatP(0);
        setChildWithoutSeatP(0);
        setPrice(0);
        setWithoutBookingAmount(0);
        setCarTotalSeat(0);
        console.log('Selected category:', item.categoryId, item.categoryName);
        fetchPackages(item.categoryId);
    };

    const handlePackageSelection = (item) => {
        // If same package is selected again, unselect it
        if (selectedPackage === item.packageId) {
            setSelectedPackage(null);
            setSelectedPackageName('');
            setChildWithSeatP(0);
            setChildWithoutSeatP(0);
            setPrice(0);
            setWithoutBookingAmount(0);
            setCarTotalSeat(0); // Reset carTotalSeat
            console.log('Package deselected:', item.packageId, item.packageName);
            return;
        }
        
        // Select new package
        setSelectedPackage(item.packageId);
        setSelectedPackageName(item.packageName);
        setChildWithSeatP(parseInt(item.child3To8YrswithSeat, 10) || 0);
        setChildWithoutSeatP(parseInt(item.child3To8YrsWithoutSeat, 10) || 0);
        // Set price based on selectedBus
        if (selectedBus === true) {
            setPrice(parseInt(item.adultPrice, 10) || 0);
        } else {
            setPrice(parseInt(item.carPackagePrice, 10) || 0);
        }
        // Set withoutBookingAmount if selectedBus is false and the parameter exists
        if (selectedBus === false && item.withoutBookingAmount !== undefined) {
            setWithoutBookingAmount(parseInt(item.withoutBookingAmount, 10) || 0);
            console.log('Without Booking Amount set:', item.withoutBookingAmount);
        } else {
            setWithoutBookingAmount(0);
        }
        // Set carTotalSeat if selectedBus is false
        if (selectedBus === false && item.carTotalSeat !== undefined) {
            setCarTotalSeat(parseInt(item.carTotalSeat, 10) || 0);
        } else {
            setCarTotalSeat(0);
        }
        console.log('Selected package:', item.packageId, item.packageName);
        console.log('Package details:', {
            packageId: item.packageId,
            packageName: item.packageName,
            adultPrice: item.adultPrice,
            childWithSeat: item.child3To8YrswithSeat,
            childWithoutSeat: item.child3To8YrsWithoutSeat,
            withoutBookingAmount: item.withoutBookingAmount,
            carTotalSeat: item.carTotalSeat,
            selectedBus: selectedBus
        });
    };

    const handleNextPress = () => {
        if (selectedCategory && selectedPackage) {
            console.log('=== SelectTour1 - Next Button Pressed ===');
            console.log('Selected Category ID:', selectedCategory);
            console.log('Selected Category Name:', selectedCategoryName);
            console.log('Selected Package ID:', selectedPackage);
            console.log('Selected Package Name:', selectedPackageName);
            console.log('Child With Seat Price:', childWithSeatP);
            console.log('Child Without Seat Price:', childWithoutSeatP);
            console.log('Adult Price:', price);
            console.log('extra seat charges:', withoutBookingAmount);
            console.log('Car Total Seat:', carTotalSeat);
            console.log('Complete parameter object:', {
                selectedCategory,
                selectedCategoryName,
                selectedPackage,
                selectedPackageName,
                selectedCityId,
                withoutBookingAmount,
                selectedCityName,
                destinationId,
                destinationName,
                vehicleType,
                selectedVehicleId,
                selectedBus,
                childWithSeatP,
                childWithoutSeatP,
                price,
                tuljapur,
                carTotalSeat,
                ...(selectedBus === false && selectedPackage && packages.find(p => p.packageId === selectedPackage)?.carType ? { carType: packages.find(p => p.packageId === selectedPackage).carType } : {})
            });
            console.log('=== End SelectTour1 Parameters ===');
            
            navigation.navigate('Standardpu12', {
                selectedCategory,
                selectedCategoryName,
                selectedPackage,
                selectedPackageName,
                selectedCityId,
                selectedCityName,
                destinationId,
                destinationName,
                vehicleType,
                selectedVehicleId,
                selectedBus,
                childWithSeatP,
                childWithoutSeatP,
                price,
                withoutBookingAmount,
                tuljapur,
                carTotalSeat,
                ...(selectedBus === false && selectedPackage && packages.find(p => p.packageId === selectedPackage)?.carType ? { carType: packages.find(p => p.packageId === selectedPackage).carType } : {})
            });
        } else {
            alert('Please select both category and package!');
        }
    };
    return (
        <View style={styles.container}>
            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("SelectVehicle1")} style={styles.backButtonContainer}>
                    <View style={styles.backButtonCircle}>
                        <Text style={styles.backButton}>{'<'}</Text>
                    </View>
                </TouchableOpacity>
                <Text style={styles.headerText}>Select Category</Text>
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
                                handleCategorySelection(item);
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
                                <TouchableOpacity
                                    key={item.packageId}
                                    style={[
                                        styles.packageItemContainer,
                                        selectedPackage === item.packageId && styles.selectedPackage
                                    ]}
                                    onPress={() => handlePackageSelection(item)}
                                >
                                    <View style={styles.packageHeader}>
                                        <View style={styles.packageTitleSection}>
                                            <Text style={styles.packageName}>{item.packageName}</Text>
                                            <Text style={styles.packageDuration}>{item.duration}</Text>
                                        </View>
                                        <View style={styles.packagePrice}>
                                            {/* Show carPackagePrice if selectedBus is false, else show adultPrice */}
                                            {selectedBus === false ? (
                                                <Text style={styles.priceText}>₹{item.carPackagePrice}</Text>
                                            ) : (
                                                <Text style={styles.priceText}>₹{item.adultPrice}</Text>
                                            )}
                                        </View>
                                    </View>
                                    {/* Show carType and carTotalSeat if selectedBus is false and carType exists */}
                                    {selectedBus === false && item.carType && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 4 }}>
                                            <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Car Type : {item.carType}</Text>
                                            <Text style={{ color: '#007AFF', fontWeight: 'bold', marginLeft: 10 }}>Seats: {item.carTotalSeat}</Text>
                                        </View>
                                    )}
                                    {/* Pricing Cards: Only show if selectedBus is true */}
                                    {selectedBus !== false && (
                                        <View style={styles.pricingSection}>
                                            <View style={styles.priceCard}>
                                                <Text style={styles.priceCardTitle}>Adult Price</Text>
                                                <Text style={styles.priceCardAmount}>₹{item.adultPrice}</Text>
                                            </View>
                                            <View style={styles.priceCard}>
                                                <Text style={styles.priceCardTitle}>Child (3-8 yrs)</Text>
                                                <Text style={styles.priceCardSubtitle}>With Seat</Text>
                                                <Text style={styles.priceCardAmount}>₹{item.child3To8YrswithSeat}</Text>
                                            </View>
                                            <View style={styles.priceCard}>
                                                <Text style={styles.priceCardTitle}>Child (3-8 yrs)</Text>
                                                <Text style={styles.priceCardSubtitle}>Without Seat</Text>
                                                <Text style={styles.priceCardAmount}>₹{item.child3To8YrsWithoutSeat}</Text>
                                            </View>
                                        </View>
                                    )}
                                    {/* Show withoutBookingAmount if selectedBus is false and it exists */}
                                    {selectedBus === false && item.withoutBookingAmount && (
                                        <View style={styles.extraChargesSection}>
                                            <Text style={styles.extraChargesTitle}>Extra Seat Charges</Text>
                                            <Text style={styles.extraChargesAmount}>₹{item.withoutBookingAmount}</Text>
                                        </View>
                                    )}
                                    <View style={styles.packageDetails}>
                                        <View style={styles.detailSection}>
                                            <Text style={styles.detailTitle}>✅ Inclusions:</Text>
                                            <Text style={styles.detailText}>{item.inclusions}</Text>
                                        </View>
                                        <View style={styles.detailSection}>
                                            <Text style={styles.detailTitle}>❌ Exclusions:</Text>
                                            <Text style={styles.detailText}>{item.exclusions}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
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
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FF5722',
        marginBottom: 10,
    },
    backButtonContainer: {
        marginRight: 12,
        zIndex: 1,
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
        textAlign: 'center',
        flex: 1,
        marginRight: 30,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 16,
        paddingBottom: 20,
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
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    
    selectedCategory: {
        borderColor: "#007AFF",
        borderWidth: 2,
    },
    selectedPackage: {
        borderColor: "#007AFF",
        borderWidth: 2,
        backgroundColor: '#f0f8ff',
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

        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
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
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
        position: 'relative',
        bottom: 0,
        left: 0,
        right: 0,
    },
    nextButton: {
        backgroundColor: '#FF5722',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: Platform.OS === 'ios' ? 10 : 20,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    packageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    packageTitleSection: {
        flex: 1,
    },
    packageName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    packageDuration: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    packagePrice: {
        alignItems: 'flex-end',
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF5722',
    },
    pricingSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 12,
        gap: 8,
    },
    priceCard: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e9ecef',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    priceCardTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#495057',
        textAlign: 'center',
        marginBottom: 2,
    },
    priceCardSubtitle: {
        fontSize: 10,
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 4,
    },
    priceCardAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FF5722',
        textAlign: 'center',
    },
    packageDetails: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    detailSection: {
        marginBottom: 8,
    },
    detailTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    detailText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        paddingLeft: 8,
    },
    extraChargesSection: {
        backgroundColor: '#fff3cd',
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ffeaa7',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    extraChargesTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#856404',
    },
    extraChargesAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF5722',
    },
});


export default SelectTour;
