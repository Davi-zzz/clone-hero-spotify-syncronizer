import dotenv from 'dotenv';
import axios, { AxiosRequestConfig } from 'axios';
import http from 'http';
import fs from 'fs';
import bodyParser from 'body-parser';
import { webScraping } from './services';
import { htmlLoader } from './utils/utils';

var opn = require('opn');
dotenv.config();

const port = process.env.PORT || 3000;
const client_id = process.env.CLIENT_ID || 'there_is_no_id';
const client_secret = process.env.CLIENT_SECRET || 'there_is_no_secret';
const execPath = process.env.BROWSER_PATH || 'there_is_no_path';

const config: AxiosRequestConfig = {
   data: {
      grant_type: 'client_credentials',
      client_id,
      client_secret,
   },
   headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
   },
};

const app2 = http.createServer(async (req, res) => {
   const request = await axios.post('https://accounts.spotify.com/api/token', config.data, config);

   const token = request.data['access_token'];

   if (req.method === 'POST' && req.url === '/form') {
      bodyParser.urlencoded({ extended: true })(req, res, async () => {
         // @ts-ignore
         if (req.body.data.match(/^https:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]+(\?si=[a-zA-Z0-9]+)?$/)) {
            //@ts-ignore
            // sample playlist
            // https://open.spotify.com/playlist/5mJg0V5mNVsiw9Hvl1ik69?si=8872a08a3d514a91
            var splId = `${req.body.data.match(/playlist\/(.+)\?si=/)[1]}`;

            var spotifyResponse = await axios.get(`https://api.spotify.com/v1/playlists/${splId}`, {
               headers: { Authorization: `Bearer ${token}` },
            });

            //@ts-ignore
            var tracks = spotifyResponse.data['tracks']['items'].map(({ track }) => {
               return {
                  name: track['name'],
                  artists: track['artists'][0]['name'],
               };
            });

            
            if (!fs.existsSync('./songlist-files')) fs.mkdirSync('./songlist-files');
            fs.writeFileSync(`songlist-files/spotify-tracks-${splId}.json`, JSON.stringify(tracks), { encoding: 'utf-8', flag: 'w' });
            
            await webScraping(`songlist-files/spotify-tracks-${splId}.json`, execPath);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(tracks, null, 2));
         }
         res.write('<script>alert("Invalid Playlist url!");</script>');
         htmlLoader(req, res, {statusCode: 400});
      });
   } else {
      htmlLoader(req, res);
   }
});

app2.listen(port, () => {
   console.log(`Server listening on http://localhost:${port}`);
   opn(`http://localhost:${port}`);
});
