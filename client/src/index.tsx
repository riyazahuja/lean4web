// import ReactDOM from 'react-dom/client'
// import App from './App.tsx'
// import './css/index.css'
// import { StrictMode } from 'react'

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

import React from 'react';
import ReactDOM from 'react-dom';
import Notebook from './notebook/Notebook';
import './css/styles.css';

ReactDOM.render(
  <React.StrictMode>
    <Notebook />
  </React.StrictMode>,
  document.getElementById('root')
);
