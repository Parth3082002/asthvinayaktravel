import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, BackHandler } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from '@react-navigation/native';

const Mahaganapati = () => {
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
        <Text style={styles.title}>Mahaganapati Ganpati</Text>
      </Animated.View>

      {/* Ganpati Image */}
      <Animated.View entering={FadeInDown.delay(200).duration(1000)}>
        <Image source={require("../../assets/images/mahaganpati.png")} style={styles.image} />
      </Animated.View>

      {/* Description Card */}
      <Animated.View entering={FadeInDown.delay(400).duration(1200)} style={styles.card}>
        <Text style={styles.subTitle}>About Mahaganapati Temple</Text>
        <Text style={styles.description}>
          The Mahaganapati Temple is located in Ranjangaon, where Lord Shiva is believed to have worshipped Ganesha before battling the demon Tripurasura. This temple is one of the Ashtavinayaka temples, celebrating eight key legends of Lord Ganesha.
        </Text>
        <Text style={styles.description}>
          The temple was built between the 9th and 10th centuries, and it is said that the original idol of Mahaganapati, which is hidden in a basement, has 10 trunks and 20 hands. However, the temple authorities deny the existence of this idol. The idol in the temple faces east and is seated in a cross-legged position with a broad forehead, and its trunk points to the left.
        </Text>
        <Text style={styles.description}>
          The temple’s architecture resembles that of the 9th-10th century and has been constructed to allow the sun's rays to fall directly on the idol during the Southward movement of the sun (Dakshinayan).
        </Text>
        <Text style={styles.highlight}>
          Location: 50 km from Pune, located on the Pune-Nagar highway, 21 km before Shirur.
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

export default Mahaganapati;
