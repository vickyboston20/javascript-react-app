import React, { useState } from 'react';

/**
 * Pharmacy Provider Segment Component
 * Contains Provider ID field that matches the field_config.json patterns
 */
const PharmacyProvider = () => {
  // State for Provider ID field - matches field_config pattern
  const [providerId, setProviderId] = useState('');
  const [provider_id, setProvider_id] = useState(''); 
  const [PROVIDER_ID, setPROVIDER_ID] = useState('');
  const [providerID, setProviderID] = useState('');
  
  // Field validation - expanding from 15 to 35 characters
  const validateProviderId = (value) => {
    return value.length <= 15;
  };

  const handleProviderIdChange = (e) => {
    const value = e.target.value;
    if (validateProviderId(value)) {
      setProviderId(value);
    }
  };

  const handleProvider_idChange = (e) => {
    const value = e.target.value;
    if (validateProviderId(value)) {
      setProvider_id(value);
    }
  };

  const handlePROVIDER_IDChange = (e) => {
    const value = e.target.value;
    if (validateProviderId(value)) {
      setPROVIDER_ID(value);
    }
  };

  const handleProviderIDChange = (e) => {
    const value = e.target.value;
    if (validateProviderId(value)) {
      setProviderID(value);
    }
  };

  return (
    <div className="pharmacy-provider-segment">
      <h2>Pharmacy Provider Segment</h2>
      
      <div className="field-group">
        <label htmlFor="providerId">
          Provider ID (providerId):
        </label>
        <input
          id="providerId"
          type="text"
          value={providerId}
          onChange={handleProviderIdChange}
          maxLength="15"
          placeholder="Enter provider ID (max 15 chars)"
        />
        <small>Expanding from 15 to 35 characters</small>
      </div>

      <div className="field-group">
        <label htmlFor="provider_id">
          Provider ID (provider_id):
        </label>
        <input
          id="provider_id"
          type="text"
          value={provider_id}
          onChange={handleProvider_idChange}
          maxLength="15"
          placeholder="Enter provider_id (max 15 chars)"
        />
      </div>

      <div className="field-group">
        <label htmlFor="PROVIDER_ID">
          PROVIDER ID (PROVIDER_ID):
        </label>
        <input
          id="PROVIDER_ID"
          type="text"
          value={PROVIDER_ID}
          onChange={handlePROVIDER_IDChange}
          maxLength="15"
          placeholder="Enter PROVIDER_ID (max 15 chars)"
        />
      </div>

      <div className="field-group">
        <label htmlFor="providerID">
          Provider ID (providerID):
        </label>
        <input
          id="providerID"
          type="text"
          value={providerID}
          onChange={handleProviderIDChange}
          maxLength="15"
          placeholder="Enter providerID (max 15 chars)"
        />
      </div>

      <div className="field-summary">
        <h3>Current Values:</h3>
        <p>providerId: {providerId}</p>
        <p>provider_id: {provider_id}</p>
        <p>PROVIDER_ID: {PROVIDER_ID}</p>
        <p>providerID: {providerID}</p>
      </div>
    </div>
  );
};

export default PharmacyProvider; 