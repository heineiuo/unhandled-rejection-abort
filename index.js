import http2 from "http2";
import tls from "tls";
import fs from "fs";

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
    (req, res) => {
      if (req.url === "/") {
        res.end(`<html>
          <script src="/main.js"></script>
      </html>`);
        return;
      }
      console.log(req.url);
    }
  )
  .listen(9050, () => {
    console.log("Listening on port 9050");
  });
