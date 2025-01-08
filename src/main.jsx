import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './App.css';

import {registerLicense} from '@syncfusion/ej2-base';
registerLicense("Ngo9BigBOggjHTQxAR8/V1NMaF5cXmtCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdmWX5ed3RRQ2JdUkx+V0s=")


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
