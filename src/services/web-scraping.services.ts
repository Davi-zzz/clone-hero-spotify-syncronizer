import puppeteer from 'puppeteer-core';
import fs from 'fs';

interface SpotifySong {
  name: string;
  artists: string;
}

interface Song {
  name: string;
  artists: string;
}

export async function webScraping(playlist: string, execPath: string) {
  const browser = await puppeteer.launch({ headless: false, executablePath: execPath});
  const page = await browser.newPage();

  await page.goto('https://chorus.fightthe.pw/');

  // Mapeando...
  const searchBarSelector = 'input.TextInput__input';
  const searchButton = 'button.SearchInput__button';

  // Lendo a lista de músicas da playlist do Spotify
  const spotifyList: SpotifySong[] = JSON.parse(fs.readFileSync(playlist, 'utf-8'));

  // Lista final de músicas em comum
  const commonSongs: Song[] = [];

  for (let spotifySong of spotifyList) {
    try {
      // Ação de pesquisa
      await page.click(searchBarSelector);
      await page.$eval(searchBarSelector, (el: HTMLInputElement) => (el.value = ''));
      await page.type(searchBarSelector, `${spotifySong.name} ${spotifySong.artists}`);
      await page.click(searchButton);

      // Espera pelos resultados antes de sair criando json
      // Se não achar em menos de 3seg ele parte pra próxima música
      await page.waitForSelector('div.Song__title', { timeout: 1500 });

      // Infos da pesquisa
      const songs = await page.$$('div.Song__title');

      const songList: Song[] = [];

      for (let song of songs) {
        const name = await song.$eval('b.Song__name', (el) => el.innerText);
        const artists = await song.$eval('span.Song__artist', (el) => el.innerText);
        await page.click('div.DownloadLink--verified.a');


        songList.push({ name, artists });
      }

      // Verificando se há músicas em comum
      for (let song of songList) {
        if (song.artists === spotifySong.artists && song.name === spotifySong.name) {
          commonSongs.push(song);
          break;
        }
      }
    } catch (err) {
      console.error(`Erro ao buscar ${spotifySong.name} - ${spotifySong.artists}`);
    }
  }

  console.log('Lista em Comum:');
  console.log(JSON.stringify(commonSongs, null, 2));

  // await browser.close();
}
