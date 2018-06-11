import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';

import App, { VERSIONS } from './App';
import './index.css';
// import registerServiceWorker from './registerServiceWorker';

declare global {
  /* tslint:disable */
  interface Location {
    getQueryParams: () => {};
  }
}

location.getQueryParams = () => {
  const search = location.search.substring(1);
  try {
    return JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
  } catch (e) {
    return {};
  }
};


const isTv = location.getQueryParams().hasOwnProperty('tv');
let version: VERSIONS = VERSIONS.DEFAULT;

if (isTv) {
  version = VERSIONS.TV;
}

ReactDOM.render(
  <HashRouter>
    <App version={version}/>
  </HashRouter>,
  document.getElementById('root') as HTMLElement
);

// registerServiceWorker();
