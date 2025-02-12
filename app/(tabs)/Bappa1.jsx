import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, BackHandler } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from '@react-navigation/native';

const Bappa1 = () => {
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
        <Text style={styles.title}>Mayureshwar Ganpati</Text>
      </Animated.View>

      {/* Ganpati Image */}
      <Animated.View entering={FadeInDown.delay(200).duration(1000)}>
        <Image source={require("../../assets/images/mayureshwar.png")} style={styles.image} />
      </Animated.View>

      {/* Description Card */}
      <Animated.View entering={FadeInDown.delay(400).duration(1200)} style={styles.card}>
        <Text style={styles.subTitle}>About Mayureshwar Temple</Text>
        <Text style={styles.description}>
          The Mayureshwar Temple in Morgaon is the most important temple of the Ashtavinayak Yatra. 
          Built from black stone, the temple has four grand gates and is surrounded by a 50-foot-tall wall. 
          A unique feature of this temple is a Nandi (Shiva's bull) at its entrance, which is rarely seen in Ganesha temples.
        </Text>
        <Text style={styles.description}>
          The idol of Lord Ganesha, known as Mayureshwara, rides a peacock and is believed to have slain the demon Sindhu at this location.
          The original murti, smaller in size, is said to be hidden behind the current idol.
        </Text>
        <Text style={styles.highlight}>
          Location: Morgaon, 55 km from Pune along the Karha River.
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

export default Bappa1;
