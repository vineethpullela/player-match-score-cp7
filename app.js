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
module.exports = app;
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
  const getPlayerQuery = `select  * from player_details where player_id = ${playerId}`;

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

app.get("players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
     select
     match_details.match_id,match_details.match,match_details.year  
     
     from (match_details inner join player_match_score on match_details.match_id=player_match_score.match_id)
     where player_id = ${playerId};`;
  const playerMatches = await db.all(getPlayerMatchesQuery);
  const responsePlayerMatches = playerMatches.map((match) => {
    return {
      matchId: match.match_id,
      match: match.match,
      year: match.year,
    };
  });
  response.send(playerMatches);
});

//API 6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerMatchesQuery = `select * from player_details left join player_match_score on player_details.player_id=player_match_score.player_id where match_id = ${matchId};`;
  const playerMatchesArray = await db.all(getPlayerMatchesQuery);
  response.send(playerMatchesArray);
});

//API 7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getStatisticsQuery = `
    select 
    player_id,player_name,sum(score) as score,count(fours) as fours,count(sixes) as sixes  from player_details inner join player_match_score on player_details.player_id=player_match_score.player_id where player_id = ${playerId};`;
  const playerStatistics = await db.all(getStatisticsQuery);
  const responsePlayerStatistics = (player) => {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
      totalScore: player.score,
      totalFours: player.fours,
      totalSixes: player.sixes,
    };
  };
  const result = responsePlayerStatistics(playerStatistics);
  response.send(result);
});
