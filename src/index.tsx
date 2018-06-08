import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
// import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <App width={1000} height={1000}/>,
  document.getElementById('root') as HTMLElement
);

// registerServiceWorker();
