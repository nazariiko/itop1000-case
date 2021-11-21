import React from 'react';
import RenderDOM from 'react-dom';

import App from './App';
import './index.css';

RenderDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
