import React, { useState, useEffect } from 'react';

import { Button } from 'semantic-ui-react';

import DamlLedger from '@daml/react';

import { PublishedInstance, getAutomationInstances } from '../../automation';
import { httpBaseUrl, wsBaseUrl, useVerifiedParties, usePartyName } from '../../config';
import QueryStreamProvider from '../../websocket/queryStream';
import Credentials from '../../Credentials';

import { formatTriggerName } from './DragAndDropToParties';
import { OffersTable } from './OfferServicesPage';
import { ServicesProvider } from '../../context/ServicesContext';
import { OffersProvider } from '../../context/OffersContext';
import { retrieveParties } from '../../Parties';
import { RolesProvider, useRolesContext } from '../../context/RolesContext';

const ReviewPage = (props: { adminCredentials: Credentials; onComplete: () => void }) => {
  const { adminCredentials, onComplete } = props;

  return (
    <div className="setup-page review">
      <h4>Review</h4>
      <DamlLedger
        party={adminCredentials.party}
        token={adminCredentials.token}
        httpBaseUrl={httpBaseUrl}
        wsBaseUrl={wsBaseUrl}
      >
        <QueryStreamProvider defaultPartyToken={adminCredentials.token}>
          <ServicesProvider>
            <RolesProvider>
              <OffersProvider>
                <div className="page-row">
                  <PartiesReview />
                  <OffersTable />
                </div>
              </OffersProvider>
            </RolesProvider>
          </ServicesProvider>
        </QueryStreamProvider>
      </DamlLedger>

      <Button className="ghost next" onClick={() => onComplete()}>
        Next
      </Button>
    </div>
  );
};

const PartiesReview = () => {
  const { identities } = useVerifiedParties();

  const { roles: allRoles } = useRolesContext();

  return (
    <div className="all-parties">
      <h4>Parties</h4>
      <div className="party-names">
        {identities.map(p => (
          <PartyRow
            key={p.payload.customer}
            partyId={p.payload.customer}
            roles={allRoles
              .filter(r => r.contract.payload.provider === p.payload.customer)
              .map(r => r.role)}
          />
        ))}
      </div>
    </div>
  );
};

const PartyRow = (props: { partyId: string; roles: string[] }) => {
  const { partyId, roles } = props;
  const [deployedAutomations, setDeployedAutomations] = useState<PublishedInstance[]>([]);
  const parties = retrieveParties() || [];

  const { getName } = usePartyName('');
  const token = parties.find(p => p.party === partyId)?.token;

  useEffect(() => {
    if (token) {
      const timer = setInterval(() => {
        getAutomationInstances(token).then(pd => {
          setDeployedAutomations(pd || []);
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [token]);

  return (
    <div className="party-name">
      <div className="party-details">
        <p>{getName(partyId)}</p>
        <p className="dropped-items">{roles.join(', ')}</p>
        <p className="dropped-items">
          {deployedAutomations.map(da => formatTriggerName(da.config.value.name)).join(', ')}
        </p>
      </div>
    </div>
  );
};
export default ReviewPage;
