import * as React from 'react';
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
        return <TvVersionContainer/>;
      case 'default':
      default:
        return <DefaultVersionContainer/>;
    }
  }
}

export default App;
