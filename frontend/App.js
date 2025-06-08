import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './app/screens/HomeScreen';
import SelfAssessmentScreen from './app/screens/SelfAssessmentScreen';
import BurnoutScreen from './app/screens/BurnoutScreen';
import StressScreen from './app/screens/StressScreen';
import RecommendationsScreen from './app/screens/RecommendationsScreen';
import EmergencyScreen from './app/screens/EmergencyScreen';
import ResourcesScreen from './app/screens/ResourcesScreen';
import HistoryScreen from './app/screens/HistoryScreen';
import AuthScreen from './app/screens/AuthScreen';
import { auth } from './app/firebase'; // Adjust the import based on your file structure

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = React.useState(null);
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? "Home" : "Auth"}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="SelfAssessment" component={SelfAssessmentScreen} />
            <Stack.Screen name="Burnout" component={BurnoutScreen} />
            <Stack.Screen name="Stress" component={StressScreen} />
            <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
            <Stack.Screen name="Emergency" component={EmergencyScreen} />
            <Stack.Screen name="Resources" component={ResourcesScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}