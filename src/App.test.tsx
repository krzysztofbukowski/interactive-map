import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App width={500} height={500}/>, div);
  ReactDOM.unmountComponentAtNode(div);
});
