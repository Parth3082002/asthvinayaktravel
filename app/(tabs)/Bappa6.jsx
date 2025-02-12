import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView , BackHandler} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from '@react-navigation/native';
const Girijatmaj = () => {
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
        <Text style={styles.title}>Girijatmaj Ganpati</Text>
      </Animated.View>

      {/* Ganpati Image */}
      <Animated.View entering={FadeInDown.delay(200).duration(1000)}>
        <Image source={require("../../assets/images/girjamaj.png")} style={styles.image} />
      </Animated.View>

      {/* Description Card */}
      <Animated.View entering={FadeInDown.delay(400).duration(1200)} style={styles.card}>
        <Text style={styles.subTitle}>About Girijatmaj Temple</Text>
        <Text style={styles.description}>
          The Girijatmaj Temple is located in a cave complex of 18 Buddhist caves, known as Ganesha-leni, and is carved out of a single stone hill. The temple is dedicated to Lord Ganesha, who is believed to have been created here by Parvati through penance. 
        </Text>
        <Text style={styles.description}>
          The temple is unique as it faces south, and the idol faces north with its trunk to the left. The idol appears different from other Ashtavinayak idols, as it seems less intricately carved. The temple remains lit by natural sunlight during the day, with no electric bulbs inside.
        </Text>
        <Text style={styles.highlight}>
          Location: 12 km from Narayangaon, 94 km from Pune, on the Pune-Nashik highway.
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

export default Girijatmaj;
