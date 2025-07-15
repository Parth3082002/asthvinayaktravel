// app/(tabs)/PaymentScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Debug: Log all received parameters
  useEffect(() => {
    console.log("=== PaymentScreen - Received Parameters ===");
    console.log("All params:", params);
    console.log("PackageId:", params.packageId);
    console.log("BookingDate:", params.bookingDate);
    console.log("BookingTime:", params.bookingTime);
    console.log("CarType:", params.carType);
    console.log("CategoryId:", params.categoryId);
    console.log("PackageName:", params.packageName);
    console.log("CategoryName:", params.categoryName);
    console.log("CarPayment:", params.carPayment);
    console.log("Adults:", params.adults);
    console.log("ChildWithSeat:", params.childWithSeat);
    console.log("ChildWithoutSeat:", params.childWithoutSeat);
    console.log("=== End PaymentScreen Parameters ===");
  }, [params]);

  const {
    amount = "0",
    userId = "",
    userName = "",
    email = "",
    phone = "",
    razorpayKeyId = "",
    bookingDate = "",
    bookingTime = "",
    carType = "",
    categoryId = "",
    packageId = "",
    packageName = "",
    categoryName = "",
    cityId = "",
    cityName = "",
    seatNumbers = "", 
    roomType = "",
    adults = "",
    childWithSeat = "",
    childWithoutSeat = "",
    totalAmount = "",
    tripId = "",
    pickupPointId = "",
    droppoint = "",
    droppointId = "",
    selectedDate,
    carPayment,
    remainingPayment,
    pickupLocation,
    transactionId,
    bookingId    // Extract other params as needed
  } = params;

  // Function to call demo API after successful payment
  const handleSuccessfulPayment = async (paymentId) => {
    try {

      if(remainingPayment == "true"){
        console.log("-------remaining payment body------");
        console.log("transactionid: ",transactionId);
        console.log("bookingid:", bookingId);
        console.log("remaining amount:",amount);
        console.log("transactionReference:",paymentId);
        
        const remainingPaymentBody={
          transactionId: transactionId,
          bookingId: bookingId,
          paymentMethod: "RazorPay",
          amount: amount,
          paymentStatus: "Confirmed",
          userId: parseInt(userId),
          transactionReference: paymentId
        };
        const response = await axios.post(
          "https://ashtavinayak.itastourism.com/api/Booking/UpdatePayment",
          remainingPaymentBody,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${params.token}`
            }
          }
        );
  
        if (response.status === 200 || response.status === 201) {
          Alert.alert("Success", "Remaining Amount Paid Successfully!", [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(tabs)/SelectVehicle1");
              }
            }
          ]);
        } else {
          Alert.alert("Payment Failed", "Unexpected server response.");
        }
        return; // Exit early for remaining payment
      }
      
      // Only execute this for new bookings (not remaining payments)
      const now = new Date();
      const formattedDate = new Date(bookingDate || now).toISOString();
      const formattedTime = now.toISOString();
  
      const transactionData = {
        transactionId: 0,
        paymentMethod: "Razorpay",
        transactionDate: formattedTime,
        amount: parseFloat(amount),
        paymentStatus: "Completed",
        userId: parseInt(userId),
        transactionReference: paymentId
      };
      console.log("Transaction data : ", transactionData);
      if (carPayment === 'true' || carPayment === true) {
        // 🚗 Car Booking Request
        console.log("=== Car Booking API Parameters ===");
        console.log("PackageId:", packageId);
        console.log("BookingDate:", bookingDate);
        console.log("BookingTime:", bookingTime);
        console.log("CarType:", carType);
        console.log("CategoryId:", categoryId);
        console.log("PackageName:", packageName);
        console.log("CategoryName:", categoryName);
        console.log("Adults:", adults);
        console.log("ChildWithSeat:", childWithSeat);
        console.log("ChildWithoutSeat:", childWithoutSeat);
        console.log("=== End Car Booking Parameters ===");
        
        const carBookingBody = {
          userId: parseInt(userId),
          tripId: parseInt(tripId) || 0,
          // pickupPointId: parseInt(pickupPointId),
          pickuppointname: pickupLocation?.trim(),
          droppoint: droppoint?.trim(),
          roomType: roomType || "shared",
          status: "Confirmed",
          totalPayment: parseFloat(totalAmount),
          advance: parseFloat(amount),
          carType: carType || "",
          date: bookingDate, // Use bookingDate from CarBook
          time: bookingTime, // Use bookingTime from CarBook
          packageId: parseInt(packageId),
          categoryId: parseInt(categoryId),
          packageName: packageName,
          categoryName: categoryName,
          cityId: parseInt(cityId),
          cityName: cityName,
          adults: parseInt(adults) || 0,
          childWithSeat: parseInt(childWithSeat) || 0,
          childWithoutSeat: parseInt(childWithoutSeat) || 0,
          transaction: transactionData
        };
        console.log("Car Booking : ", carBookingBody);
        const response = await axios.post(
          "https://ashtavinayak.itastourism.com/api/Booking/BookCar",
          carBookingBody,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${params.token}`
            }
          }
        );
  
        if (response.status === 200 || response.status === 201) {
          Alert.alert("Success", "Car booking successful!", [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(tabs)/SelectVehicle1");
              }
            }
          ]);
        } else {
          Alert.alert("Booking Failed", "Unexpected server response.");
        }
  
      } else {
        // 👥 Standard Passenger Booking with Seats
        const seatBookingBody = {
          carType: carType || "",
          date: formattedDate.split("T")[0],
          time: formattedTime,
          userId: parseInt(userId),
          tripId: parseInt(tripId),
          pickupPointId: parseInt(pickupPointId),
          droppoint: droppoint?.trim(),
          droppointId: droppointId ? parseInt(droppointId) : 0,
          bookingDate: selectedDate,
          roomType: "shared",
          status: "Confirmed",
          totalPayment: parseFloat(totalAmount),
          advance: parseFloat(amount),
          bookingCode: "",
          seatNumbers: seatNumbers,
          adults: parseInt(adults) || 0,
          childwithseat: parseInt(childWithSeat) || 0,
          childwithoutseat: parseInt(childWithoutSeat) || 0,
          categoryId: parseInt(categoryId),
          cityId: parseInt(cityId),
          packageId: parseInt(packageId),
          transaction: transactionData
        };
        console.log("Bus Booking : ",seatBookingBody);
        const response = await axios.post(
          "https://ashtavinayak.itastourism.com/api/Booking/CreateBookingWithSeats",
          seatBookingBody,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${params.token}`
            }
          }
        );
  
        if (response.status === 200 || response.status === 201) {
          Alert.alert("Success", "Booking successful!", [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(tabs)/SelectVehicle1");
              }
            }
          ]);
        } else {
          Alert.alert("Booking Failed", "Unexpected server response.");
        }
      }
  
    } catch (error) {
      console.error("Booking API Error:", error);
      Alert.alert("Error", "Failed to complete booking. Please try again.");
    }
  };
  

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'payment_success') {
        // Handle successful payment
        console.log("Payment successful:", data.paymentId);
        
        // Call the function to handle successful payment
        handleSuccessfulPayment(data.paymentId);
      } else if (data.type === 'payment_cancelled') {
        console.log("Payment cancelled");
        router.back();
      }
    } catch (error) {
      console.error('Error processing WebView message:', error);
      router.back();
    }
  };

  // Create the HTML for the Razorpay checkout
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </head>
    <body style="background-color: #f5f5f5; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
      <div style="text-align: center;">
        <p>Please do not close this page until payment is complete</p>
      </div>
      <script>
        const options = {
          key: '${razorpayKeyId}',
          amount: ${parseFloat(amount) * 100},
          currency: 'INR',
          name: 'Ashtavinayak Tours',
          description: 'Tour Booking Payment',
          image: 'https://i.imgur.com/3g7nmJC.png',
          handler: function(response) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'payment_success',
              paymentId: response.razorpay_payment_id
            }));
          },
          prefill: {
            name: '${userName || ''}',
            email: '${email || ''}',
            contact: '${phone || ''}'
          },
          theme: {
            color: '#D44206'
          },
          modal: {
            ondismiss: function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment_cancelled'
              }));
            }
          }
        };
        
        const rzp = new Razorpay(options);
        rzp.open();
      </script>
    </body>
    </html>
  `;

  // Make sure WebView is installed
  useEffect(() => {
    // You can add any initialization logic here
  }, []);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D44206" />
          <Text style={styles.loadingText}>Initializing payment...</Text>
        </View>
      )}
      <WebView
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 45, // Add padding for status bar
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginTop: Platform.OS === 'ios' ? 0 : 20, // Add margin for Android
  },
  backButtonContainer: {
    marginRight: 15,
  },
  backButtonCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    fontSize: 20,
    color: "#333",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 100, // Add padding at bottom for better scrolling
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 10,
    color: '#D44206',
  },
});