import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
//this is done to avoid the eslint error
root.render(
    React.createElement(React.StrictMode, null, React.createElement(App, null))
);