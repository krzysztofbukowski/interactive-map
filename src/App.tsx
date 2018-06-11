import * as React from 'react';
import { Route } from 'react-router';

import './App.css';
import DefaultVersionContainer from './containers/DefaultVersionContainer';
import TvVersionContainer from './containers/TvVersionContainer';

class App extends React.Component {
  public render() {
    return (
      <div>
        <Route
          path="/tv"
          isExact={true}
          component={TvVersionContainer}
        />
        <Route
          path="/"
          isExact={true}
          component={DefaultVersionContainer}
        />
      </div>
    )
  }
}

export default App;
