import http2 from "http2";
import tls from "tls";
import fs from "fs";
import { Readable } from "stream";

function SNICallback(servername, cb) {
  cb(
    null,
    tls.createSecureContext({
      cert: fs.readFileSync("./cert.pem"),
      key: fs.readFileSync("./key.pem"),
    })
  );
}

const server = http2
  .createSecureServer(
    {
      SNICallback,
      allowHTTP1: true,
    },
    async (req, res) => {
      console.log(req.method, req.url);
      req.once("aborted", () => {
        console.log(`req aborted`);
      });
      res.once("aborted", () => {
        console.log(`res aborted`);
      });
      if (req.url.startsWith("/action") && req.method === 'POST') {
        const stream = Readable.toWeb(req);
        const reader = stream.getReader();
        async function readChunks() {
          let chunks = [];
          while (true) {
            try {
              const chunk = await reader.read();
              console.log(chunk)

              if (chunk.done) {
                break;
              }
              chunks.push(chunk.value);
            } catch (e) {
              console.error(e);
              break;
            }
          }
          return chunks;
        }
        const chunks = await readChunks();
        console.log(chunks);
        res.end("ok");
      } else {
        res.end(`<html>
          <form action="/action" method="POST">
            <input type="text" name="input" />
            <button type="submit">submit</button>
          </form>
      </html>`);
      }
    }
  )
  .listen(9050, () => {
    console.log("Listening on port 9050");
  });
