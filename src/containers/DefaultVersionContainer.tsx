import * as React from 'react';
import './DefaultVersionContainer.css';

interface IDefaultMapContainerState {
  currentArea: string;
}

class DefaultVersionContainer extends React.Component<{}, IDefaultMapContainerState> {

  constructor(props: {}) {
    super(props);

    this.state = {
      currentArea: ''
    };
  }

  public render() {
    return (
      <div className="default"/>
    );
  }
}

export default DefaultVersionContainer;
