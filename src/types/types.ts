export interface SpotifyResponse {
   href: string;
   items: Item[];
   limit: number;
   next: string;
   offset: number;
   previous?: any;
   total: number;
}

export interface Item {
   added_at: string;
   added_by: Addedby;
   is_local: boolean;
   primary_color?: any;
   track: Track;
   video_thumbnail: Videothumbnail;
}

export interface Videothumbnail {
   url?: any;
}

export interface Track {
   album: Album;
   artists: Artist[];
   available_markets: string[];
   disc_number: number;
   duration_ms: number;
   episode: boolean;
   explicit: boolean;
   external_ids: Externalids;
   external_urls: Externalurls;
   href: string;
   id: string;
   is_local: boolean;
   name: string;
   popularity: number;
   preview_url?: string;
   track: boolean;
   track_number: number;
   type: string;
   uri: string;
}

export interface Externalids {
   isrc: string;
}

export interface Album {
   album_group: string;
   album_type: string;
   artists: Artist[];
   available_markets: string[];
   external_urls: Externalurls;
   href: string;
   id: string;
   images: Image[];
   is_playable: boolean;
   name: string;
   release_date: string;
   release_date_precision: string;
   total_tracks: number;
   type: string;
   uri: string;
}

export interface Image {
   height: number;
   url: string;
   width: number;
}

export interface Artist {
   external_urls: Externalurls;
   href: string;
   id: string;
   name: string;
   type: string;
   uri: string;
}

export interface Addedby {
   external_urls: Externalurls;
   href: string;
   id: string;
   type: string;
   uri: string;
}

export interface Externalurls {
   spotify: string;
}
