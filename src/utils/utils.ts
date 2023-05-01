import { HttpStatusCode } from 'axios';
import fs from 'fs';
import http from 'http';

export function htmlLoader(
   req: http.IncomingMessage,
   res: http.ServerResponse<http.IncomingMessage>,
   options: HttpOptions = { statusCode: 200, headers: [{ 'Content-Type': 'text/html'}] },
) {
   fs.readFile('src/views/index.html', (err, data) => {
      if (err) {
         res.statusCode = 500;
         res.setHeader('Content-Type', 'text/plain');
         res.end('Internal Server Error');
      } else {
         res.statusCode = options.statusCode == undefined ? 200 : options.statusCode;
         options.headers?.forEach(h => {
            Object.entries(h).forEach(([key, value]) => {
               res.setHeader(key, value);
            });
         });
         res.end(data);
      }
   });
}

interface HttpOptions {
   write?: string;
   statusCode?: HttpStatusCode;
   headers?: [{ [key: string]: string }];
}
