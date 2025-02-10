import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView ,BackHandler} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from '@react-navigation/native';

const Siddhivinayak = () => {
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
        <Text style={styles.title}>Siddhivinayak Ganpati</Text>
      </Animated.View>

      {/* Ganpati Image */}
      <Animated.View entering={FadeInDown.delay(200).duration(1000)}>
        <Image source={require("../../assets/images/Bappa.png")} style={styles.image} />
      </Animated.View>

      {/* Description Card */}
      <Animated.View entering={FadeInDown.delay(400).duration(1200)} style={styles.card}>
        <Text style={styles.subTitle}>About Siddhivinayak Temple</Text>
        <Text style={styles.description}>
          Siddhivinayak Temple is famous for its unique right-trunked Ganesh idol. The idol is 3 feet tall, and it is believed to be the site where Vishnu defeated the demons Madhu and Kaitabha.
        </Text>
        <Text style={styles.description}>
          The temple, located on a small hillock, faces north and was built by Peshwa general Haripant Phadake. It is known for its strict spiritual practices and legends of devotees' devotion.
        </Text>
        <Text style={styles.highlight}>
          Location: Near Bhima River, 48 km from Srigonda, Ahmadnagar district, on the Pune-Solapur highway.
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

export default Siddhivinayak;
