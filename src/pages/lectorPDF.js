import React, { useState, useRef } from 'react';
import { BrowserPDF417Reader } from '@zxing/library';
import Modal from 'react-modal';
import QRCode from 'qrcode';
import { parseCedulaData } from '../helpers/dataParser';

Modal.setAppElement('#root');

const Pdf417Scanner = () => {
  const [imageCC, setImageCC] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [modal, setModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [imageQr, setImageQr] = useState('');
  const [semilla, setSemilla] = useState('');
  const imgRef = useRef(null);
  const codeReader = useRef(new BrowserPDF417Reader());

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      setParsedData(null);
      setOtp('');
      setOtpError('');
      reader.onloadend = () => {
        setImageCC(reader.result);
      };
      reader.readAsDataURL(file);
      codeReader.current.reset();
    };
  };

  const generateQRCode = async (url) => {
    const urlqr = await QRCode.toDataURL(url);
    setImageQr(urlqr);
  };

  const openModal = () => {
    const semilla = localStorage.getItem('secret');
    if (!semilla) {
      fetch('http://localhost:3001/generate')
        .then((response) => response.json())
        .then((data) => {
          localStorage.setItem('secret', data.secret.base32);
          setImageQr(data.otpauth_url);
          setSemilla(data.secret.base32);
          setModal(true);
          return;
        })
        .catch(() => {
          setParsedData('El servidor no se entra en servicio. Intentalo de nuevo mas tarde.')
        });
      return;
    };

    const urlqr = `otpauth://totp/LectorPDF417?secret=${semilla}`;
    generateQRCode(urlqr);
    setSemilla(semilla);
    setImageQr(urlqr);
    setModal(true);
  };

  const closeOtpModal = () => setModal(false);

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const verifyOtp = () => {
    const secret = localStorage.getItem('secret');

    fetch('http://localhost:3001/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: otp.replace(/\s+/g, ''), secret }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error();
      }
    }).then(() => {
      closeOtpModal();
      decodeImage();
    }).catch(() => {
      setOtpError('OTP invalido. Intentalo nuevamente.');
    });
  };

  const decodeImage = () => {
    console.log(imgRef.current)
    codeReader.current.decodeFromImage(imgRef.current).then(result => {
      const parsed = parseCedulaData(result.text);
      setParsedData(parsed);
    }).catch(err => {
      setParsedData('Error al decodificar: ' + err);
    });
  };

  return (
    <main>
      <section>
        <h1>Sube la imagen del reverso de tu cédula</h1>
        <p>La imagen debe ser clara, tomada en horizontal y con buena luz</p>

        <input type="file" accept="image/*" onChange={handleImageChange} />

        {imageCC && (
          <>
            <div className="contImg">
              <img ref={imgRef} src={imageCC} alt="Imagen PDF417" />
            </div>
            <button onClick={openModal}>Decodificar</button>
          </>
        )}

        {parsedData && (
          <div style={{ marginTop: '1em' }}>
            <pre>{JSON.stringify(parsedData, null, 2)}</pre>
          </div>
        )}

        <Modal isOpen={modal} onRequestClose={closeOtpModal} className='modal'>
          <div className='contModal'>
            <h2>Autenticacion de dos factores</h2>
            <p>Escanea este codigo QR en tu aplicacion de autenticador y luego ingresa el código generado.</p>
            <p>Si no puedes escanear el codigo, ingresa esta clave en tu aplicacion de autenticacion: {semilla}</p>
            {imageQr && (
              <div>
                <img src={imageQr} alt="QR para el Authenticator" />
              </div>
            )}
            <input type="text" value={otp} onChange={handleOtpChange} placeholder="Ingresa el codigo OTP" />
            {otpError &&
              <p style={{ color: 'red' }}>{otpError}</p>
            }
            <div className='buttons'>
              <button onClick={verifyOtp}>Verificar</button>
              <button onClick={closeOtpModal}>Cancelar</button>
            </div>
          </div>
        </Modal>
      </section>
    </main>
  );
};

export default Pdf417Scanner;
