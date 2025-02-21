import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const CarType = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { selectedPickupPointId, selectedPickupPoint, price, vehicleType, childWithSeatP, childWithoutSeatP, cityId, cityName } = route.params || {};

    const [carType, setCarType] = useState(null); // Changed to store integer
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [time, setTime] = useState('');
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        console.log("Received Params:", { selectedPickupPointId, selectedPickupPoint, price, vehicleType, childWithSeatP, childWithoutSeatP, cityId, cityName });
    }, [selectedPickupPointId, cityId, selectedPickupPoint, price, vehicleType, childWithSeatP, childWithoutSeatP, cityName]);

    const handleBooking = () => {
        if (!carType) {
            alert('Please select a car type');
            return;
        }
    
        // If time is not selected, use the current time
        let bookingTime = time;
        if (!time) {
            const currentDate = new Date();
            const currentHours = currentDate.getHours();
            const currentMinutes = currentDate.getMinutes();
            bookingTime = `${currentHours}:${currentMinutes < 10 ? '0' + currentMinutes : currentMinutes}`;
        }
    
        // Prepare booking data
        const bookingData = {
            carType, // Now passing integer
            date: date.toISOString().split('T')[0],
            time: bookingTime, // Pass either selected time or current time
            selectedPickupPointId,
            selectedPickupPoint,
            price,
            vehicleType,
            childWithSeatP,
            childWithoutSeatP,
            cityId,
            cityName,
            status: 'Confirmed',
        };
    
        console.log("Booking Data:", bookingData);
    
        // Navigate to the next screen with booking data
        navigation.navigate('CarBook', {
            ...route.params,
            bookingData,
        });
    };
    
    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Car Booking</Text>

                {/* Car Type Selection */}
                <Text style={styles.label}>Select Car Type:</Text>
                <View style={styles.buttonGroup}>
                    {[3, 6, 17].map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.button, carType === type && styles.selectedButton]}
                            onPress={() => setCarType(type)}
                        >
                            <Text style={[styles.buttonText, carType === type && styles.selectedText]}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Date Selection */}
                <Text style={styles.label}>Select Date:</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { paddingRight: 40 }]}
                        value={date.toDateString()}
                        editable={false}
                    />
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.iconButton}>
                        <MaterialIcons name="calendar-today" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) setDate(selectedDate);
                        }}
                    />
                )}

                {/* Time Selection */}
                <Text style={styles.label}>Enter Time (HH:MM):</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { paddingRight: 40 }]}
                        placeholder="HH:MM"
                        value={time}
                        onChangeText={setTime}
                        keyboardType="numeric"
                    />
                    <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.iconButton}>
                        <MaterialIcons name="access-time" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                {showTimePicker && (
                    <DateTimePicker
                        value={new Date(0, 0, 0, parseInt(time.split(':')[0] || 0), parseInt(time.split(':')[1] || 0))}
                        mode="time"
                        display="default"
                        onChange={(event, selectedTime) => {
                            setShowTimePicker(false);
                            if (selectedTime) {
                                const hours = selectedTime.getHours();
                                const minutes = selectedTime.getMinutes();
                                setTime(`${hours}:${minutes < 10 ? '0' + minutes : minutes}`);
                            }
                        }}
                    />
                )}

                {/* Submit Button */}
                <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
                    <Text style={styles.bookButtonText}>Next</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#f8f8f8',
    },
    container: {
        width: '90%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#ddd',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    selectedButton: {
        backgroundColor: '#007bff',
    },
    buttonText: {
        color: 'black',
        fontWeight: 'bold',
    },
    selectedText: {
        color: 'white',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        marginRight: 10,
    },
    iconButton: {
        position: 'absolute',
        right: 10,
    },
    bookButton: {
        backgroundColor: '#FF5722',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CarType;
