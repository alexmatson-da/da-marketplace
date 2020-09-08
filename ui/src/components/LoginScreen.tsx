// Copyright (c) 2020 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect } from 'react'
import { Button, Form } from 'semantic-ui-react'

import Credentials, { computeCredentials } from '../Credentials'
import { DeploymentMode, deploymentMode, ledgerId } from '../config'

import './LoginScreen.css'
import OnboardingTile from './common/OnboardingTile'

type Props = {
  onLogin: (credentials: Credentials) => void;
}

/**
 * React component for the login screen of the `App`.
 */
const LoginScreen: React.FC<Props> = ({onLogin}) => {
  const [username, setUsername] = React.useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const credentials = computeCredentials(username);
    onLogin(credentials);
  }

  const handleDablLogin = () => {
    window.location.assign(`https://login.projectdabl.com/auth/login?ledgerId=${ledgerId}`);
  }

  useEffect(() => {
    const url = new URL(window.location.toString());
    const token = url.searchParams.get('token');
    if (token === null) {
      return;
    }
    const party = url.searchParams.get('party');
    if (party === null) {
      throw Error("When 'token' is passed via URL, 'party' must be passed too.");
    }
    url.search = '';
    window.history.replaceState(window.history.state, '', url.toString());
    onLogin({token, party, ledgerId});
  }, [onLogin]);

  return (
    <OnboardingTile>
      <Form size='large' className='test-select-login-screen'>
        {deploymentMode !== DeploymentMode.PROD_DABL
        ? <>
            {/* FORM_BEGIN */}
            <Form.Input
              fluid
              icon='user'
              iconPosition='left'
              placeholder='Username'
              value={username}
              className='test-select-username-field'
              onChange={e => setUsername(e.currentTarget.value)}
            />
            <Button
              primary
              fluid
              className='test-select-login-button'
              onClick={handleLogin}>
              Log in
            </Button>
            {/* FORM_END */}
          </>
        : <Button primary fluid onClick={handleDablLogin}>
            Log in with DABL
          </Button>
        }
      </Form>
    </OnboardingTile>
  );
};

export default LoginScreen;
