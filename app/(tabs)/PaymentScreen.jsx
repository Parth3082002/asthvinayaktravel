// app/(tabs)/PaymentScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const {
    amount = "0",
    userId = "",
    userName = "",
    email = "",
    phone = "",
    razorpayKeyId = "",
    // Extract other params as needed
  } = params;

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

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'payment_success') {
        // Handle successful payment
        console.log("Payment successful:", data.paymentId);
        
        // Navigate back or to a success page
        router.back();
        // Or to a success page:
        // router.push('/(tabs)/PaymentSuccess');
      } else if (data.type === 'payment_cancelled') {
        console.log("Payment cancelled");
        router.back();
      }
    } catch (error) {
      console.error('Error processing WebView message:', error);
      router.back();
    }
  };

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
    backgroundColor: '#f5f5f5',
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