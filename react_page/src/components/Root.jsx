import React from 'react';
import { Provider } from 'react-redux';
import Page from './Page';

const Root = ({ store }) => {


  return (
  <Provider store={store}>
   <Page dispatch = {store.dispatch}/>
  </Provider>
  );
}


export default Root;
