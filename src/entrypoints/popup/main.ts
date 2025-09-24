import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from './Popup';

// biome-ignore lint/style/noNonNullAssertion: we know this element exists
const app = document.getElementById('app')!;

ReactDOM.createRoot(app).render(React.createElement(Popup));
