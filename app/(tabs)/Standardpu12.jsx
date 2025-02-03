import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

const PackageDetails = ({ route: propRoute }) => {
  const route = useRoute();
  const [error, setError] = useState(null);
  const routeParams = route.params || {};
  const { selectedCategory, selectedPackage, cityId, cityName } = route.params || {};
  const categoryId = propRoute?.categoryId || routeParams.categoryId;
  const packageId = propRoute?.packageId || routeParams.packageId;

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cityId && selectedCategory && selectedPackage && cityName) {
      fetchPackageDetails(cityId, selectedCategory, selectedPackage);
    } else {
      setLoading(false);
      setError("Invalid parameters received");
    }
  }, [cityId, selectedCategory, selectedPackage, cityName]);

  const fetchPackageDetails = async (cityId, categoryId, packageId) => {
    try {
      setLoading(true);
      setError(null);
      const encodedPackageId = encodeURIComponent(packageId);
      const apiUrl = `http://ashtavinayak.somee.com/api/Package/GetPackagePrice/${cityId}/${categoryId}/${encodedPackageId}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }

      const data = await response.json();
      setPackageData(data || {});
    } catch (error) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const groupRoutesByDay = (routes) => {
    if (!routes || routes.length === 0) return [];

    const groupedRoutes = {};

    routes.forEach((route) => {
      const day = route.day || "Day1"; // Default to "Day1" if no day is specified
      if (!groupedRoutes[day]) {
        groupedRoutes[day] = [];
      }
      groupedRoutes[day].push(route);
    });

    return groupedRoutes;
  };

  const groupSubRoutes = (dayRoutes) => {
    const mainRoutes = [];
    const subRoutes = {};

    dayRoutes.forEach((route) => {
      if (route.parentId === null) {
        mainRoutes.push(route); // Main route
      } else {
        if (!subRoutes[route.parentId]) {
          subRoutes[route.parentId] = [];
        }
        subRoutes[route.parentId].push(route); // Sub-route
      }
    });

    return { mainRoutes, subRoutes };
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading package details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Package Details</Text>
      {packageData ? (
        <View style={styles.card}>
          <Text style={styles.packageTitle}>
            {packageData.packageName} - ${packageData.price}
          </Text>
          <Text style={styles.info}>Category: {packageData.category}</Text>
          <Text style={styles.info}>City: {packageData.city}</Text>
          <Text style={styles.info}>Inclusions: {packageData.inclusions}</Text>

          <Text style={styles.subHeading}>Routes:</Text>

          {Object.keys(groupRoutesByDay(packageData.routes)).map((day) => {
            const { mainRoutes, subRoutes } = groupSubRoutes(groupRoutesByDay(packageData.routes)[day]);

            return (
              <View key={day}>
                <Text style={styles.dayHeading}>{day}</Text>

                {/* Render Main Routes */}
                {mainRoutes.map((route) => (
                  <View key={route.trid}>
                    <Text style={styles.route}>
                      {route.pointName}
                    </Text>
                    {/* Render Sub-routes under the Main Route */}
                    {subRoutes[route.trid] && subRoutes[route.trid].map((subRoute) => (
                      <Text key={subRoute.trid} style={styles.subRoute}>
                        {subRoute.pointName}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.errorText}>No package details available.</Text>
      )}
    </View>
  );
};

export default PackageDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  info: {
    fontSize: 16,
    marginBottom: 4,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
  },
  dayHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    color: "#007bff",
  },
  route: {
    fontSize: 16,
    paddingVertical: 2,
  },
  subRoute: {
    fontSize: 16,
    paddingVertical: 2,
    marginLeft: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});

