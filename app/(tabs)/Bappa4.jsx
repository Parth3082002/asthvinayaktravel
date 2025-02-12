import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, BackHandler } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from '@react-navigation/native';

const Varadavinayak = () => {
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
        <Text style={styles.title}>Varadavinayak Ganpati</Text>
      </Animated.View>

      {/* Ganpati Image */}
      <Animated.View entering={FadeInDown.delay(200).duration(1000)}>
        <Image source={require("../../assets/images/vardavinayak.png")} style={styles.image} />
      </Animated.View>

      {/* Description Card */}
      <Animated.View entering={FadeInDown.delay(400).duration(1200)} style={styles.card}>
        <Text style={styles.subTitle}>About Varadavinayak Temple</Text>
        <Text style={styles.description}>
          Varadavinayak is the Ganesha who grants success and bountiful blessings. The idol was discovered in a lake by Dhondu Paudkar in 1690 AD and was later enshrined in the temple built by Ramji Mahadev Biwalkar in 1725 AD.
        </Text>
        <Text style={styles.description}>
          The idol faces east with its trunk to the left. The temple is famous for the continuously burning oil lamp since 1892 and the four elephant idols surrounding the temple. This is one of the only temples where devotees can personally pay respects to the idol.
        </Text>
        <Text style={styles.highlight}>
          Location: Mahad, 80 km from Pune and 3 km off the Mumbai-Pune highway, near Khopoli.
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

export default Varadavinayak;
