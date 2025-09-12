import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './providers/theme-provider.tsx'
import { Provider } from "react-redux";
import { store } from "./store";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Provider store ={store}>
    <App />
    </Provider>
    </ThemeProvider>
  </StrictMode>,
)
