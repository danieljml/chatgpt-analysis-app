import './styles.css';
import React, { useState } from 'react';
import axios from 'axios';
import Dropzone from 'react-dropzone';

const BACKEND_HOST = '127.0.0.1';
const BACKEND_PORT = '3001';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [result, setResult] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleApiKeyChange = event => {
    setApiKey(event.target.value);
    setIsApiKeyValid(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleDrop = acceptedFiles => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setErrorMessage('');
    } else {
      setCsvFile(null);
      setErrorMessage('Please select a valid CSV file.');
    }
    setSuccessMessage('');
  };

  const handleValidateApiKey = async () => {
    try {
      const response = await axios.post(
        `http://${BACKEND_HOST}:${BACKEND_PORT}/validate_credentials/`,
        {
          apiKey,
        },
        {
          headers: {
            Authorization: apiKey,
          },
        }
      );
      if (response.status !== 200) {
        return setErrorMessage(response.data.response.message);
      }
      setIsApiKeyValid(true);
      setSuccessMessage(response.data.response.message);
    } catch (error) {
      console.error(error);
      setIsApiKeyValid(false);
      setErrorMessage('An error occurred during API key validation.');
    }
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!csvFile) {
      setErrorMessage('Please select a CSV file.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        `http://${BACKEND_HOST}:${BACKEND_PORT}/analyze_document/`,
        {
          document: csvFile,
        },
        {
          mode: 'cors',
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: apiKey,
          },
        }
      );
      setResult(response.data?.choices?.[0]?.message?.content);
    } catch (error) {
      console.error(error);
      setResult(error);
    }
    setIsLoading(false);
  };

  return (
    <div className="app">
      <h1>CHATGPT ANALYSIS</h1>
      <form onSubmit={handleSubmit}>
        <label>
          API Key: <input type="text" value={apiKey} onChange={handleApiKeyChange} />
        </label>
        <button type="button" onClick={handleValidateApiKey}>
          Validate
        </button>
        <br />
        <Dropzone onDrop={handleDrop}>
          {({ getRootProps, getInputProps }) => (
            <div
              {...getRootProps()}
              style={{
                border: '1px dashed black',
                padding: '1rem',
                marginTop: '1rem',
              }}
            >
              <input {...getInputProps()} />
              <p>Drag and drop a CSV file here, or click to select a file</p>
              {csvFile && <p>Selected file: {csvFile.name}</p>}
            </div>
          )}
        </Dropzone>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

        <br />
        <button type="submit" disabled={!apiKey || !csvFile || !isApiKeyValid}>
          Interpret
        </button>
      </form>
      {isLoading && <p>Loading...</p>}
      {result && (
        <>
          <h1>Results</h1>
          <p className="app__data">{result}</p>
        </>
      )}
    </div>
  );
}

export default App;
