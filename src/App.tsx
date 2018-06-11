import * as React from 'react';
import './App.css';
import DefaultVersionContainer from './containers/DefaultVersionContainer';

interface IAppProps {
  version?: 'default'
}

class App extends React.Component<IAppProps, {}> {
  public render() {
    switch (this.props.version) {
      case 'default':
      default:
        return <DefaultVersionContainer/>;
    }
  }
}

export default App;
