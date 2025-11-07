import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
// This is done to avoid the eslint error
root.render(
    React.createElement(React.StrictMode, null, React.createElement(App, null))
);