import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { RecallProvider } from './RecallContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecallProvider>
      <App />
    </RecallProvider>
  </StrictMode>,
);
