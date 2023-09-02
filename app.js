const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
app.use(express.json());

let db = null;

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};


const convertResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,    //updated 
    playerName: dbObject.player_name,
  };
};

const convertDbObjectToResponse = (dbObject) => {
  return {
    playerId: dbObject.player_id,    //updated 
    playerName: dbObject.player_name,
    totalScore: dbObject.score,
    totalFours: dbObject.fours,
    totalSixes: dbObject.sixes,
  };
};






const initializeDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, (Request, Response) => {
      console.log("RUNNING SERVER");
    });
  } catch (error) {
    console.log(`error is ${error.message}`);
    process.exit(1);
  }
};

initializeDatabase();

// GET API 1

app.get('/players/', async(Request,Response)=>{
    const getPlayerQuery = `select * from player_details`;
    const getPlayers = await db.all(getPlayerQuery)
   Response.send(
    getPlayers.map((eachPlayer) =>
      convertResponseObject(eachPlayer)));
   });

// GET API 2

app.get('/players/:playerId/',async(Request,Response)=>{
    const {playerId}  = Request.params
    const getPlayer = `
    select * from player_details where player_id=${playerId}`;
    const player = await db.get(getPlayer);
    Response.send(convertResponseObject(player));
   
    // Response.send(player)
})

// PUT API 3
app.put('/players/:playerId/',async(Request,Response)=>{
    const {playerId}  = Request.params
    const playerDetails = Request.body
    const {playerName} = playerDetails
    const updatePlayerDetails =  `
    UPDATE player_details
    SET 
    player_name='${playerName}'
    WHERE
    player_id=${playerId}
    `;
    const player = await db.run(updatePlayerDetails)
    // console.log(player);
    Response.send('Player Details Updated')
    
})

// GET API 4


app.get('/matches/:matchId/',async(Request,Response)=>{
    const {matchId}  = Request.params
    const getMatch = `
    select * from match_details where match_id=${matchId}`;
    const Match = await db.get(getMatch);
    Response.send(convertDbObjectToResponseObject(Match));
    // Response.send(Match)
})


// GET API 5


app.get('/players/:playerId/matches/',async(Request,Response)=>{
    const {playerId}  = Request.params
    const getMatch = `select * from match_details natural join player_details where player_id=${playerId}`;
    const Match = await db.all(getMatch);
    Response.send(Match.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)));
    // Response.send(Match)
})


// GET API 6

app.get('/matches/:matchId/players',async(Request,Response)=>{
    const {matchId}  = Request.params
    const getPlayer = `
    select * from player_match_score natural join player_details  where match_id=${matchId}
    `;
    const Player = await db.get(getPlayer);
    Response.send(convertResponseObject(Player));
    // Response.send(Player)
})


// GET API 7

app.get('/players/:playerId/playerScores',async(Request,Response)=>{
    const {playerId}  = Request.params
    const getPlayer = `
    select   *  from (player_match_score inner join player_details on player_match_score.player_id =  player_details.player_id) where player_id=${playerId}` ;
    const Player = await db.get(getPlayer);
     Response.send(convertDbObjectToResponse(Player));
    //  Response.send(Player)
})


module.exports = app;








