import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import { withAuthenticator } from "aws-amplify-react-native";

import Amplify, { API, graphqlOperation, Logger } from "aws-amplify";
import { createGame } from "./src/graphql/mutations";
import { listGames } from "./src/graphql/queries";
import config from "./aws-exports";
Amplify.configure(config);

const initialState = { name: "" };

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetchGames();
  }, []);

  function setInput(key: number, value: String) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchGames() {
    try {
      const gameData = await API.graphql(graphqlOperation(listGames));
      const games = gameData.data.listGames.items;
      setGames(games);
    } catch (err) {
      console.log("error fetching games");
    }
  }

  async function addGame() {
    try {
      const game = { ...formState };
      setGames([...games, game]);
      setFormState(initialState);
      await API.graphql(graphqlOperation(createGame, { input: game }));
    } catch (err) {
      console.log("error creating game:", err);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        onChangeText={(val) => setInput("name", val)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <Button title="Create Game" onPress={addGame} />
      {games.map((game, index) => (
        <View key={game.id ? game.id : index} style={styles.game}>
          <Text style={styles.gameName}>{game.name}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  game: { marginBottom: 15 },
  input: { height: 50, backgroundColor: "#ddd", marginBottom: 10, padding: 8 },
  gameName: { fontSize: 18 },
});

export default withAuthenticator(App);
