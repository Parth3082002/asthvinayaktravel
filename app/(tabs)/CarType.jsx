import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const CarPage = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { userId, tripId, pickupPointId, dropPoint } = route.params || {};

    const [carType, setCarType] = useState('');
    const [acType, setAcType] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [time, setTime] = useState('');
    const [showTimePicker, setShowTimePicker] = useState(false);

    const handleBooking = () => {
        if (carType === '17 Seater' && !acType) {
            alert('Please select AC type for 17 Seater');
            return;
        }

        const bookingData = {
            carType: carType === '17 Seater' ? `${carType} (${acType})` : carType,
            date: date.toISOString().split('T')[0],
            time,
            userId,
            tripId,
            pickupPointId,
            droppoint: dropPoint,
            status: 'Confirmed',
            acType,  // Pass acType to the next page
        };

        // Redirect to CarBook page with booking data
        navigation.navigate('CarBook', { bookingData });
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Car Booking</Text>

                {/* Car Type Selection */}
                <Text style={styles.label}>Select Car Type:</Text>
                <View style={styles.buttonGroup}>
                    {['4 Seater', '6 Seater', '17 Seater'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.button, carType === type && styles.selectedButton]}
                            onPress={() => {
                                setCarType(type);
                                if (type !== '17 Seater') {
                                    setAcType('');  // Reset AC type when car type is changed
                                }
                            }}
                        >
                            <Text style={[styles.buttonText, carType === type && styles.selectedText]}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* AC/Non-AC Selection (Only for 17 Seater) */}
                {carType === '17 Seater' && (
                    <View>
                        <Text style={styles.label}>Select AC Type:</Text>
                        <View style={styles.buttonGroup}>
                            {['AC', 'Non-AC'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.button, acType === type && styles.selectedButton]}
                                    onPress={() => setAcType(type)}
                                >
                                    <Text style={[styles.buttonText, acType === type && styles.selectedText]}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Date Selection with Icon */}
                <Text style={styles.label}>Select Date:</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { paddingRight: 40 }]} // Adjusting padding for the icon
                        value={date.toDateString()}
                        editable={false}
                        placeholder="Select Date"
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

                {/* Time Input with Clock Icon */}
                <Text style={styles.label}>Enter Time (HH:MM):</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { paddingRight: 40 }]} // Adjusting padding for the icon
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

export default CarPage;
