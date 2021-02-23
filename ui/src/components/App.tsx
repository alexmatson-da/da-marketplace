// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react'
import {
  HashRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom'

import DamlLedger from '@daml/react'
import { PublicLedger, WellKnownPartiesProvider } from '@daml/dabl-react'

import QueryStreamProvider from '../websocket/queryStream'
import Credentials, { computeCredentials, storeCredentials, retrieveCredentials } from '../Credentials'
import { httpBaseUrl } from '../config'

import { RegistryLookupProvider } from './common/RegistryLookup'
import { useDablParties } from './common/common'
import OnboardingTile from './common/OnboardingTile'

import LoginScreen from './LoginScreen'
import MainScreen from './MainScreen'
import LoadingScreen from './common/LoadingScreen'

/**
 * React component for the entry point into the application.
 */
// APP_BEGIN
const App: React.FC = () => {
  const [credentials, setCredentials] = React.useState<Credentials | undefined>(retrieveCredentials());

  const handleCredentials = (credentials?: Credentials) => {
    setCredentials(credentials);
    storeCredentials(credentials);
  }

  return (
    <div className='app'>
      <Router>
        <Switch>
          <Route exact path='/'>
            <WellKnownPartiesProvider>
                <QueryStreamProvider>
                  <LoginScreen onLogin={handleCredentials}/>
                </QueryStreamProvider>
            </WellKnownPartiesProvider>
          </Route>

          <Route path='/role' render={() => {
            return credentials
              ? <DamlLedger
                  reconnectThreshold={0}
                  token={credentials.token}
                  party={credentials.party}
                  httpBaseUrl={httpBaseUrl}
                >
                  <WellKnownPartiesProvider>
                      <QueryStreamProvider>
                        <RegistryLookupProvider>
                          <MainScreen onLogout={() => handleCredentials(undefined)}/>
                        </RegistryLookupProvider>
                      </QueryStreamProvider>
                  </WellKnownPartiesProvider>
              </DamlLedger>
              : <Redirect to='/'/>
            }}>
          </Route>
        </Switch>
      </Router>
    </div>

  )
}
// APP_END
                    // <PublicProvider>
                    // </PublicProvider>

const PublicProvider: React.FC = ({ children }) => {
  const { parties, loading } = useDablParties();
  const { party, ledgerId, token } = computeCredentials(parties.publicParty);

    return loading ? <LoadingScreen/> : (
    <PublicLedger
      ledgerId={ledgerId}
      publicParty={party}
      defaultToken={token}
      httpBaseUrl={httpBaseUrl}
    >
      { children }
    </PublicLedger>
  )
}
export default App;
