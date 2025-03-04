import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, BackHandler } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const CarType = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { selectedPickupPointId, selectedPickupPoint, price, vehicleType, childWithSeatP, childWithoutSeatP, cityId, cityName } = route.params || {};

    const [carType, setCarType] = useState(null); // Storing integer
    const [carTypeLabel, setCarTypeLabel] = useState(''); // Storing label
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [time, setTime] = useState('');
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Handling back button
    useEffect(() => {
        const backAction = () => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'SelectVehicle1' }],
            });
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, [navigation]);

    useEffect(() => {
        console.log("Received Params:", { selectedPickupPointId, selectedPickupPoint, price, vehicleType, childWithSeatP, childWithoutSeatP, cityId, cityName });
    }, [selectedPickupPointId, cityId, selectedPickupPoint, price, vehicleType, childWithSeatP, childWithoutSeatP, cityName]);

    // Handle car type selection
    const handleCarTypeSelection = (type, label) => {
        setCarType(type);
        setCarTypeLabel(label);
    };

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
            carType, // Integer value for calculation
            carTypeLabel, // Descriptive label for DB
            date: date.toISOString().split('T')[0],
            time: bookingTime,
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

        // Navigate to CarBook page with booking data
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
                    <TouchableOpacity
                        style={[styles.button, carType === 4 && styles.selectedButton]}
                        onPress={() => handleCarTypeSelection(4, '4')}
                    >
                        <Text style={[styles.buttonText, carType === 4 && styles.selectedText]}>4</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, carType === 6 && styles.selectedButton]}
                        onPress={() => handleCarTypeSelection(6, '6')}
                    >
                        <Text style={[styles.buttonText, carType === 6 && styles.selectedText]}>6</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
    style={[styles.button, carType === 17 && carTypeLabel === '17 AC' && styles.selectedButton]}
    onPress={() => handleCarTypeSelection(17, '17 AC')}
>
    <Text style={[styles.buttonText, carType === 17 && carTypeLabel === '17 AC' && styles.selectedText]}>17 AC</Text>
</TouchableOpacity>

<TouchableOpacity
    style={[styles.button, carType === 17 && carTypeLabel === '17 Non AC' && styles.selectedButton]}
    onPress={() => handleCarTypeSelection(17, '17 Non AC')}
>
    <Text style={[styles.buttonText, carType === 17 && carTypeLabel === '17 Non AC' && styles.selectedText]}>17 Non AC</Text>
</TouchableOpacity>

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
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#ddd',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginVertical: 5,
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
