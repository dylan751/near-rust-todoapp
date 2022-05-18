import 'regenerator-runtime/runtime';
import React from 'react';
import './global.css';

import getConfig from './utils/config';
const { networkId } = getConfig(process.env.NODE_ENV || 'development');

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import StakingPage from './pages/StakingPage';
import MainLayout from './components/Layout/MainLayout';
import TodosPage from './pages/TodosPage';

export default function App() {
  return (
      <Router>
        <MainLayout>
          <div className="relative pb-24 overflow-x-hidden xs:flex xs:flex-col md:flex md:flex-col">
            <Switch>
              <Route path="/" exact component={AutoHeight(TodosPage)} />
              <Route path="/staking" component={AutoHeight(StakingPage)} />
            </Switch>
          </div>
        </MainLayout>
      </Router>
  );
}

// decorate any components with this HOC to display them as vertical-align middle
// use individual fn is needed since `h-4/5` is not a appropriate style rule for
// any components
function AutoHeight(Comp) {
  return (props) => {
    return (
      <div className="xs:flex xs:flex-col md:flex md:flex-col justify-center h-4/5 lg:mt-12 relative xs:mt-8">
        <Comp {...props} />
      </div>
    );
  };
}
