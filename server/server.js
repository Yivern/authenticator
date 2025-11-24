const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const config = require('../config.json')

const cors = require('cors');
const express = require('express');
const app = express();

app.use(express.json());
app.use(cors());

const semilla = speakeasy.generateSecret({ name: "LectorPDF417" });
app.get('/generate', (req, res) => {
  QRCode.toDataURL(semilla.otpauth_url, (err, dataUrl) => {
    if (err) {
      console.log(`HTTP/1.1 500 Error generando QR ${Date()}`);
      return res.status(500).json({ message: 'Error generando QR' });
    }
    res.json({
      secret: semilla,
      otpauth_url: dataUrl
    });
    console.log(`HTTP/1.1 200 QR generado ${Date()}`);
  });
});

app.post('/verify', (req, res) => {
  const data = req.body;

  const verified = speakeasy.totp.verify({
    secret: data.secret,
    encoding: 'base32',
    token: data.token,
    window: 2
  });

  if (!verified) {
    res.status(401).json({ verified: false});
    console.log(`HTTP/1.1 401 Codigo OTP no valido ${Date()}`);
    return;
  }
  res.json({ verified: true });
  console.log(`HTTP/1.1 200 Codigo OTP valido ${Date()}`);
});

app.listen(config.port || 8080, () => console.log(`Servidor escuchando en el puerto ${config.port}...`))
