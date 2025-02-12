import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView,BackHandler } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from '@react-navigation/native';

const Chintamani = () => {
    const navigation = useNavigation();

    useEffect(() => {
      // Handler for the back button press to reset the stack
      const backAction = () => {
        navigation.reset({
          index: 0, // Set the index to 0 to go to the first screen
          routes: [{ name: 'Dashboard' }], // Replace the entire stack with the Dashboard screen
        });
        return true; // Prevent default back button behavior
      };
  
      // Add event listener for back button
      BackHandler.addEventListener('hardwareBackPress', backAction);
  
      // Clean up the event listener on unmount
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', backAction);
      };
    }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Title Section */}
      <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.header}>
        <Text style={styles.title}>Chintamani Ganpati</Text>
      </Animated.View>

      {/* Ganpati Image */}
      <Animated.View entering={FadeInDown.delay(200).duration(1000)}>
        <Image source={require("../../assets/images/chintamani.png")} style={styles.image} />
      </Animated.View>

      {/* Description Card */}
      <Animated.View entering={FadeInDown.delay(400).duration(1200)} style={styles.card}>
        <Text style={styles.subTitle}>About Chintamani Temple</Text>
        <Text style={styles.description}>
          The Chintamani Ganpati is believed to have retrieved the precious Chintamani jewel from the greedy Guna for sage Kapila. This jewel was placed on Ganesha’s neck, giving him the name "Chintamani Vinayak."
        </Text>
        <Text style={styles.description}>
          The temple was originally built by Dharanidhar Maharaj Dev, with the outer wooden hall constructed later by the Peshwas. The idol faces east, and it has carbuncles and diamonds in its eyes.
        </Text>
        <Text style={styles.highlight}>
          Location: Theur, 22 km from Pune, at the confluence of the Mula, Mutha, and Bhima rivers.
        </Text>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#f8f8f8",
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop:20
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ff5e62",
    textAlign: "center",
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    marginBottom: 20,
  },
  card: {
    width: "90%",
    borderRadius: 15,
    padding: 20,
    backgroundColor: "#ff6600",  // solid color background for card
    elevation: 4,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 8,
    textAlign: "justify",
    lineHeight: 22,
  },
  highlight: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffd700",
    marginTop: 10,
    textAlign: "center",
  },
});

export default Chintamani;
