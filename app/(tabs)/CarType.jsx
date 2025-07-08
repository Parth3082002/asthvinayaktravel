import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  BackHandler,
  Dimensions,
  ImageBackground,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import Icon from 'react-native-vector-icons/Ionicons';
import { MotiView } from 'moti';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const CarType = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const {
    selectedPickupPointId,
    selectedPickupPoint,
    price,
    vehicleType,
    childWithSeatP,
    childWithoutSeatP,
    withoutBookingAmount,
    cityId,
    cityName,
    carType,
    carTotalSeat, // <-- add this line
  } = route.params || {};

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });
    // Debug log for carTotalSeat
    console.log('CarType screen received carTotalSeat:', carTotalSeat);
    return () => backHandler.remove();
  }, []);

  const handleBooking = () => {
    if (!carType) {
      alert('Please select a car type');
      return;
    }

    // Format date as "2025-07-05" (YYYY-MM-DD)
    const formattedDate = date.toISOString().split('T')[0];
    
    // Format time as "2025-07-05T10:30:00" (YYYY-MM-DDTHH:MM:SS)
    let formattedTime;
    if (time) {
      // If time is selected, combine date and time
      const [hours, minutes] = time.split(':');
      const combinedDateTime = new Date(date);
      combinedDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      // Format as "2025-07-05T10:30:00" without milliseconds and timezone
      const year = combinedDateTime.getFullYear();
      const month = String(combinedDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(combinedDateTime.getDate()).padStart(2, '0');
      const hour = String(combinedDateTime.getHours()).padStart(2, '0');
      const minute = String(combinedDateTime.getMinutes()).padStart(2, '0');
      const second = String(combinedDateTime.getSeconds()).padStart(2, '0');
      formattedTime = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    } else {
      // If no time selected, use current time
      const now = new Date();
      const combinedDateTime = new Date(date);
      combinedDateTime.setHours(now.getHours(), now.getMinutes(), 0, 0);
      // Format as "2025-07-05T10:30:00" without milliseconds and timezone
      const year = combinedDateTime.getFullYear();
      const month = String(combinedDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(combinedDateTime.getDate()).padStart(2, '0');
      const hour = String(combinedDateTime.getHours()).padStart(2, '0');
      const minute = String(combinedDateTime.getMinutes()).padStart(2, '0');
      const second = String(combinedDateTime.getSeconds()).padStart(2, '0');
      formattedTime = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    }

    const bookingData = {
      carType,
      date: formattedDate,    // "2025-07-05" format
      time: formattedTime,    // "2025-07-05T10:30:00" format
      selectedPickupPointId,
      selectedPickupPoint,
      price,
      vehicleType,
      childWithSeatP,
      childWithoutSeatP,
      withoutBookingAmount,
      cityId,
      cityName,
      status: 'Confirmed',
      carTotalSeat // <-- add this line
    };
    
    console.log("=== CarType - Booking Data ===");
    console.log("Formatted Date:", formattedDate);
    console.log("Formatted Time:", formattedTime);
    console.log("Original Date Object:", date);
    console.log("Original Time String:", time);
    console.log("=== End Booking Data ===");
    
    navigation.navigate('CarBook', {
      ...route.params,
      bookingData,
      carTotalSeat // <-- add this line
    });
  };

  return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600 }}
          style={styles.card}
        >
          <LottieView
            source={require('../../assets/caranimation.json')}
            autoPlay
            loop
            style={styles.lottie}
          />

          <Text style={styles.heading}>🚘 Schedule Your Trip</Text>

          <Text style={styles.subheading}>Selected Car Type</Text>
          <Text style={styles.carType}>{carType || 'N/A'}</Text>
          <Text style={styles.subheading}>Car Total Seats</Text>
          <Text style={styles.carType}>{carTotalSeat || 'N/A'}</Text>

          <Text style={styles.subheading}>Select Date</Text>
          <TouchableOpacity style={styles.inputGroup} onPress={() => setShowDatePicker(true)}>
            <Icon name="calendar-outline" size={22} color="#444" />
            <Text style={styles.inputText}>{date.toDateString()}</Text>
          </TouchableOpacity>
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

          <Text style={styles.subheading}>Enter Time (HH:MM)</Text>
          <TouchableOpacity style={styles.inputGroup} onPress={() => setShowTimePicker(true)}>
            <Icon name="time-outline" size={22} color="#444" />
            <Text style={styles.inputText}>{time || 'Tap to select time'}</Text>
          </TouchableOpacity>
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

          <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
            <View style={styles.solidButton}>
              <Text style={styles.bookText}>Next Step</Text>
            </View>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  card: {
    width: width * 0.9,
    padding: 24,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 6,
  },
  carType: {
    fontSize: 18,
    color: '#FF5722',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  inputText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  bookButton: {
    marginTop: 24,
  },
  solidButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#FF512F', // Use a solid color instead of gradient
  },
  bookText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  lottie: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 10,
  },
});

export default CarType;
