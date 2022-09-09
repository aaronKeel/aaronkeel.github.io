import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const App = () => (<h1>aaronkeel.github.io</h1>);

const root = createRoot(document.getElementById('main'));

root.render(<App />);
