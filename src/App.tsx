import React, { useEffect, useReducer } from 'react';
import { ToastContainer } from 'react-toastify';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Wrapper from './components/Wrapper';
import NowWhat from './components/MeasurementChart';
import { ApolloClient, ApolloProvider, gql, InMemoryCache, useQuery } from '@apollo/client';
import MeasurementChart from './components/MeasurementChart';
import MetricsSelector from './components/MetricsSelector';

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(39,49,66)',
    },
    secondary: {
      main: 'rgb(197,208,222)',
    },
    background: {
      default: 'rgb(226,231,238)',
    },
  },
});
const client = new ApolloClient({
  uri: 'https://react-assessment.herokuapp.com/graphql',
  cache: new InMemoryCache(),
});

export const MetricContext = React.createContext<any>(null);

function reducer(state: any, action: any) {
  switch (action.type) {
    case 'updateMetrics':
      return { ...state, metrics: action.payload };
    case 'updateMeasurements':
      return { ...state, measurements: action.payload };
    default:
      throw Error('invalid action type!');
  }
}
const App = () => {
  const [state, dispatch] = useReducer<any>(reducer, { metrics: [], measurements: [] });
  useEffect(()=>{
    console.log(state)
  },[state])
  return (
    <MetricContext.Provider value={{state,dispatch}}>
      <ApolloProvider client={client}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <Wrapper>
            <Header />
            <MetricsSelector/>
            <MeasurementChart  />
            <ToastContainer />
          </Wrapper>
        </MuiThemeProvider>
      </ApolloProvider>
    </MetricContext.Provider>
  );
};

export default App;
