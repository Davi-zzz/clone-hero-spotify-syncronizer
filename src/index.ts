import dotenv from "dotenv";
import axios from "axios";
import http from "http";
import fs from "fs";
import bodyParser from "body-parser";

var opn = require("opn");
dotenv.config();

// const app: Application = express();
const port = process.env.PORT || 3000;
const client_id = process.env.CLIENT_ID || "there_is_no_id";
const client_secret = process.env.CLIENT_SECRET || "there_is_no_secret";

const app2 = http.createServer(async (req, res) => {
  const data = `grant_type=client_credentials&client_id=${client_id}&client_secret=${client_secret}`;
  
  const token = (await axios.post("https://accounts.spotify.com/api/token", data , { headers: { 'Content-Type': 'application/x-www-form-urlencoded'}} )).data['access_token'];
  
  if (req.method === "POST" && req.url === "/form") {
    
    bodyParser.urlencoded({ extended: true })(req, res, async () => {
      // console.log(req.body);
      //@ts-ignore
      // sample playlist
      // https://open.spotify.com/playlist/5mJg0V5mNVsiw9Hvl1ik69?si=8872a08a3d514a91
        var splId = ( `${req.body.data.match(/playlist\/(.+)\?si=/)[1]}`);

        console.log(splId);
        
        var spotifyResponse = await axios.get(`https://api.spotify.com/v1/playlists/${splId}`, { headers: { Authorization: `Bearer ${token}`}});

        //@ts-ignore
        var tracks = spotifyResponse.data['tracks']['items'].map( ({track}) => {
          console.log(track);
          
          return { "name": track['name'], "artists": track['artists'][0]['name'] }
        });
        console.log(tracks);
        
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(tracks, null, 2));
        
      });
  } else if (req.url === "/") {
    fs.readFile("src/views/index.html", (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "text/plain");
        res.end("Internal Server Error");
      } else {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.end(data);
      }
    });
  } else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Not Found");
  }
});

app2.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  opn(`http://localhost:${port}`);
});
