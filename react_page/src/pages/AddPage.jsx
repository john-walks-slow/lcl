import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import Page from '../components/Page';
const AddPage = ({ store }) => {
  useEffect(()=>{
    document.title = "New Object"
  },[])
  return (
  <Provider store={store}>
   <Page dispatch = {store.dispatch}/>
  </Provider>
  );
}


export default AddPage;
