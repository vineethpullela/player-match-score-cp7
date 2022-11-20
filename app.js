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
  const responsePlayer = (player) => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
    };
  };
  const resultPlayer = responsePlayer(player);
  response.send(resultPlayer);
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

//API 5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
     SELECT 
     match_id,
     match,
     year
     FROM (match_details NATURAL JOIN player_match_score
     ) 
     WHERE player_match_score.player_id = ${playerId}
     ORDER BY player_match_score.player_id;`;
  const playerMatches = await db.all(getPlayerMatchesQuery);
  const responsePlayerMatches = playerMatches.map((match) => {
    return {
      matchId: match.match_id,
      match: match.match,
      year: match.year,
    };
  });
  response.send(responsePlayerMatches);
});

//API 6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerMatchesQuery = `SELECT player_details.player_id,
  player_name FROM (match_details INNER JOIN player_match_score ON match_details.match_id=player_match_score.match_id) AS T INNER JOIN player_details ON T.player_id=player_details.player_id WHERE match_details.match_id = ${matchId};`;
  const playerMatchesArray = await db.all(getPlayerMatchesQuery);
  const responseObject = playerMatchesArray.map((player) => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
    };
  });
  response.send(responseObject);
});

//API 7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getStatisticsQuery = `
    SELECT player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(player_match_score.fours) AS totalFours,
    SUM(player_match_score.sixes) AS totalSixes
    FROM player_match_score INNER JOIN player_details ON player_match_score.player_id = player_details.player_id WHERE player_match_score.player_id = '${playerId}'
    GROUP BY player_match_score.player_id`;
  const playerStatistics = await db.get(getStatisticsQuery);
  const responsePlayerStatistics = (player) => {
    return {
      playerId: player.playerId,
      playerName: player.playerName,
      totalScore: player.totalScore,
      totalFours: player.totalFours,
      totalSixes: player.totalSixes,
    };
  };
  const result = responsePlayerStatistics(playerStatistics);

  response.send(result);
});

module.exports = app;
