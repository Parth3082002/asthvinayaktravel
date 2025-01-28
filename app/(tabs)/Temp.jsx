import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Temp = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={require('../../assets/images/back.png')}
        style={styles.headerImage}
      >
        <View style={styles.headerContent}>
  <View style={styles.inclusionRow}>
    <Text style={styles.inclusionText}>Inclusion:</Text>
    <Text style={styles.cityText}>Pune</Text>
  </View>
  <Text style={styles.inclusionDetails}>
  •  Non-AC Deluxe Bus{'\n'}
  •  1 Night Stay at Bhakt-Niwas                            {'\t'} at Lenyadri/Ozar{'\n'}
    {'\n'}
    •  Meals{'\n'}
         {'\t\t'}- 2 Breakfast{'\n'}
         {'\t\t'}- 2 Lunch{'\n'}
         {'\t\t'}- 1 Dinner
  </Text>
</View>

      </ImageBackground>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>1 Night 2 Days (Standard)</Text>
        <View style={styles.searchBox}>
          <Ionicons name="location" size={23} color="#ff5722" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Pickup Location"
            placeholderTextColor="#888"
          />
        </View>
      </View>

      {/* Itinerary */}
      <View style={styles.dayContainer}>
        {/* Day 1 */}
        <Text style={styles.dayText}>DAY 1 -</Text>
        <View style={styles.itineraryRow}>
          {/* Image */}
          <Image
            source={require('../../assets/images/Day1.png')} // Replace with Day 1 image URL
            style={styles.dayImage}
          />

          {/* Timeline */}
          <View style={styles.timelineContainer}>
  {/* Vertical Line with Dots and Lines */}
  <View style={styles.verticalLine}>
    {['Pune', 'Morgaon', 'Siddhatek', 'Theur', 'Ranjangaon'].map((location, index) => (
      <React.Fragment key={index}>
        {/* If it's the first location, show the vertical line first */}
        {index === 0 && (
          <View style={{ height: 28, width: 2, backgroundColor: '#ccc',marginTop:-20 }} />
        )}
        <View style={styles.dot} />
        {/* Line before dot (except for the last one) */}
        {index < 5 && (
          <View style={{ height: 0,  backgroundColor: '#ccc',  }} />
        )}
      </React.Fragment>
    ))}
  </View>

  {/* Locations */}
  <View style={styles.timeline}>
    {['Pune', 'Morgaon', 'Siddhatek', 'Theur', 'Ranjangaon'].map((location, index) => (
      <Text key={index} style={styles.timelineText}>{location}</Text>
    ))}
  </View>
</View>


        </View>
        <Text style={styles.nightText}>Night Halt at Lenyadri Or Ozar</Text>

        {/* Day 2 */}
        <Text style={styles.dayText}>DAY 2 -</Text>
<View style={styles.itineraryRow}>
  {/* Image */}
  <Image
     source={require('../../assets/images/Day2.png')} // Replace with Day 2 image URL
    style={styles.dayImage}
  />

  {/* Timeline */}
  <View style={styles.timelineContainer}>
  {/* Vertical Line with Dots and Lines */}
  <View style={styles.verticalLine}>
    {['Lenyadri', 'Ozar', 'Pali', 'Mahad', 'Pune'].map((location, index) => (
      <React.Fragment key={index}>
        {/* If it's the first location, show the vertical line first */}
        {index === 0 && (
          <View style={{ height: 28, width: 2, backgroundColor: '#ccc', marginTop:-20 }} />
        )}
        <View style={styles.dot} />
        {/* Line before dot (except for the last one) */}
        {index < 4 && (
          <View style={{ height: 0, backgroundColor: '#ccc',}} />
        )}
      </React.Fragment>
    ))}
  </View>

  {/* Locations */}
  <View style={styles.timeline}>
    {['Lenyadri', 'Ozar', 'Pali', 'Mahad', 'Pune'].map((location, index) => (
      <Text key={index} style={styles.timelineText}>{location}</Text>
    ))}
  </View>
</View>

</View>
</View>

      {/* Footer */}
      <View style={styles.footer}>
  <View>
    <Text style={styles.costText}>Tour Cost</Text>
    <Text style={styles.priceText}>₹ 2500</Text>
  </View>
  <View style={styles.bookButton}>
  <Text style={styles.bookButtonText}>Book Now</Text>
  <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 10 }} />
</View>

</View>


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerImage: {
    width: '100%',
    height: 230,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:40,
  },
  headerContent: {
    padding: 38,
  },
  inclusionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inclusionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  cityText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  inclusionDetails: {
    fontSize: 15,
    color: '#fff',
    marginTop: 10,
    textAlign: 'left',
    fontWeight:'bold',
  },
 
  titleContainer: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 2,
  },
  searchInput: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
  dayContainer: {
    padding: 20,
    marginTop:-20,
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color:'rgba(0, 122, 211, 1)',
  },
  itineraryRow: {
    flexDirection: 'row',
    marginVertical: 30,
  },
  dayImage: {
    width: 135,
    height: 215,
    // borderRadius: 10?,
    marginRight: 20,
    borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  marginVertical:-15,
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    // marginVertical: 20,
  },
  verticalLine: {
    position: 'relative',
    width: 2,
    backgroundColor: '#ccc', // Vertical line color
    marginRight: 20,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 122, 211, 1)', // Dot color
    marginBottom: 30, // Space between dots
  },
  timeline: {
    justifyContent: 'flex-start',
  },
  timelineText: {
    fontSize: 16,
    color: '#555', // Text color
    marginBottom: 20, // Space between text and dots
    // marginTop:20,
    
  },
  nightText: {
    fontSize: 16,
    // fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -5,

    color: '#555',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginTop:-40,
    // borderTopWidth: 1,
    // borderColor: '#ddd',
  },
  costText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft:5,
  },
  priceText: {
    fontSize: 18,
    color: 'rgba(0, 227, 9, 1)',
    fontWeight: 'bold',
    marginLeft:5,
  },
  bookButton: {
    backgroundColor: '#ff5722',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row', // This makes the text and icon align horizontally
    alignItems: 'center',  // Vertically centers the text and the icon
    justifyContent: 'center', // Centers the content
  },  
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 0,  // Adds space between text and the arrow
    marginLeft:10,
    
  },
  
});

export default Temp;
