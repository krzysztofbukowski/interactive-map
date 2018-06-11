import * as React from 'react';
import { Route } from 'react-router';

import './App.css';
import DefaultVersionContainer from './containers/DefaultVersionContainer';
import TvVersionContainer from './containers/TvVersionContainer';

export enum VERSIONS {
  DEFAULT = 'default',
  TV = 'tv'
}

interface IAppProps {
  version?: VERSIONS
}

class App extends React.Component<IAppProps, {}> {
  public render() {
    switch (this.props.version) {
      case 'tv':
        return <Route
          path="/"
          isExact={true}
          component={TvVersionContainer}
        />;
      case 'default':
      default:
        return <Route
          path="/"
          isExact={true}
          component={DefaultVersionContainer}
        />;
    }
  }
}

export default App;
