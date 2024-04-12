import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ThemeSwitcherProvider } from "react-css-theme-switcher"


const themes = {
  Light: './Themes/Light.css',
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ConfigProvider
        theme={{
          token: {
            // Seed Token
            colorPrimary: '#0290F9',
            borderRadius: 12,
    
            // Alias Token
            // colorBgContainer: '#f6ffed',
          },
        }}
    >
      <ThemeSwitcherProvider defaultTheme={'Light'} themeMap={themes}>


        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeSwitcherProvider>
    </ConfigProvider>

  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
