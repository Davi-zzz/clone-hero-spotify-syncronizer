import puppeteer from 'puppeteer-core';
import fs from 'fs';
const select = require ('puppeteer-select');

interface SpotifySong {
  name: string;
  artists: string;
}

interface Song {
  name: string;
  artists: string;
}

export async function webScraping(playlist: string, execPath: string) {
  const browser = await puppeteer.launch({ headless: false, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome'});
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
      await page.waitForSelector('div.Song__title', { timeout: 3000 });

      // Infos da pesquisa
      const songs = await page.$$('div.Song__title');

      //  Download
      // const downloadLink = await page.waitForSelector('div.DownloadLink', { timeout: 3000 })
      // const link = await downloadLink?.$eval('a', (element) => element.href)
      // if (link) {
      //   await page.goto(link)
      // } else {
      //   console.log('Link de download não encontrado')
      // }
      
      const songList: Song[] = [];

      for (let song of songs) {
        const name = await song.$eval('b.Song__name', (el) => el.innerText);
        const artists = await song.$eval('span.Song__artist', (el) => el.innerText);


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

  const page2 = await browser.newPage();
  await page2.goto('https://chorus.fightthe.pw/');

  const downloadList = commonSongs;

  for (let songsDownload of downloadList) { 
    await page2.click(searchBarSelector);
    await page2.$eval(searchBarSelector, (el: HTMLInputElement) => (el.value = ''));
    await page2.type(searchBarSelector, `${songsDownload.name} ${songsDownload.artists}`); 
    await page2.click(searchButton);
    await page2.waitForSelector('div.Song__title', { timeout: 3000 });
    const songs = await page2.$$('div.Song__title');

    // Download
    for (let song of songs) {
      const downloadLink = await page2.waitForSelector('div.DownloadLink, div.DownloadLink--verified', { timeout: 3000 })
      const link: string | undefined = await downloadLink?.$eval('a', (element) => element.href)

      if (link) {
        await page2.goto(link);
        
        const buttonDownloadDriveSelector = 'button:contains("Fazer download de tudo")';
        await page2.waitForSelector(buttonDownloadDriveSelector);
        await page2.click(buttonDownloadDriveSelector)
        
        await page2.goBack();
        await new Promise(resolve => setTimeout(resolve, 4000));
      } else {
        console.error('Link de dowload não encontrado!');
      }
      break;
    }

  }

}
