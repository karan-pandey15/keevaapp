import React from "react";
import { View, Text, Button } from "react-native";

export default function Screen3({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>Screen 3</Text>
      <Button title="Back to Screen 1" onPress={() => navigation.navigate("Screen1")} />
      <Button title="Go to Screen 2" onPress={() => navigation.navigate("Screen2")} />
    </View>
  );
}
