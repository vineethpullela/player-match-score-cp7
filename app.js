const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const playerMatchScoresDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3004, () => {
      console.log("Server Running at http://localhost:3004");
    });
  } catch (e) {
    console.log(`DB error ${e.message}`);
  }
};

playerMatchScoresDbServer();

//API 1

app.get("/players/", async (request, response) => {
  const getAllPlayerQuery = `
    SELECT * FROM player_details;`;
  const allPlayersArray = await db.all(getAllPlayerQuery);
  const responsePlayer = allPlayersArray.map((player) => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
    };
  });
  response.send(responsePlayer);
});

//API 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM player_details WHERE player_id = ${playerId};`;

  const player = await db.get(getPlayerQuery);
  /*const responsePlayer = (player) => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
    };
  };
  const resultPlayer = responsePlayer(player);*/
  response.send(player);
});

//API 3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerQuery = `
    UPDATE player_details SET player_name ='${playerName}';`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuery = `
    SELECT * FROM match_details WHERE match_id = ${matchId};`;

  const matchDetails = await db.get(getMatchDetailsQuery);
  const responseMatchDetails = (match) => {
    return {
      matchId: match.match_id,
      match: match.match,
      year: match.year,
    };
  };
  const resultMatch = responseMatchDetails(matchDetails);
  response.send(resultMatch);
});
