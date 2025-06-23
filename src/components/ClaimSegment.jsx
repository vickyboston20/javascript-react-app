import React, { useState } from 'react';

/**
 * Claim Segment Component
 * Contains Product/Service ID field that matches the field_config.json patterns
 */
const ClaimSegment = () => {
  // State for Product/Service ID field - matches field_config pattern
  const [productServiceId, setProductServiceId] = useState('');
  const [product_service_id, setProduct_service_id] = useState(''); 
  const [PRODUCT_SERVICE_ID, setPRODUCT_SERVICE_ID] = useState('');
  const [productServiceID, setProductServiceID] = useState('');
  
  // Field validation - expanding from 19 to 40 characters
  const validateProductServiceId = (value) => {
    return value.length <= 19;
  };

  const handleProductServiceIdChange = (e) => {
    const value = e.target.value;
    if (validateProductServiceId(value)) {
      setProductServiceId(value);
    }
  };

  const handleProduct_service_idChange = (e) => {
    const value = e.target.value;
    if (validateProductServiceId(value)) {
      setProduct_service_id(value);
    }
  };

  const handlePRODUCT_SERVICE_IDChange = (e) => {
    const value = e.target.value;
    if (validateProductServiceId(value)) {
      setPRODUCT_SERVICE_ID(value);
    }
  };

  const handleProductServiceIDChange = (e) => {
    const value = e.target.value;
    if (validateProductServiceId(value)) {
      setProductServiceID(value);
    }
  };

  return (
    <div className="claim-segment">
      <h2>Claim Segment</h2>
      
      <div className="field-group">
        <label htmlFor="productServiceId">
          Product/Service ID (productServiceId):
        </label>
        <input
          id="productServiceId"
          type="text"
          value={productServiceId}
          onChange={handleProductServiceIdChange}
          maxLength="19"
          placeholder="Enter product/service ID (max 19 chars)"
        />
        <small>Expanding from 19 to 40 characters</small>
      </div>

      <div className="field-group">
        <label htmlFor="product_service_id">
          Product/Service ID (product_service_id):
        </label>
        <input
          id="product_service_id"
          type="text"
          value={product_service_id}
          onChange={handleProduct_service_idChange}
          maxLength="19"
          placeholder="Enter product_service_id (max 19 chars)"
        />
      </div>

      <div className="field-group">
        <label htmlFor="PRODUCT_SERVICE_ID">
          PRODUCT/SERVICE ID (PRODUCT_SERVICE_ID):
        </label>
        <input
          id="PRODUCT_SERVICE_ID"
          type="text"
          value={PRODUCT_SERVICE_ID}
          onChange={handlePRODUCT_SERVICE_IDChange}
          maxLength="19"
          placeholder="Enter PRODUCT_SERVICE_ID (max 19 chars)"
        />
      </div>

      <div className="field-group">
        <label htmlFor="productServiceID">
          Product/Service ID (productServiceID):
        </label>
        <input
          id="productServiceID"
          type="text"
          value={productServiceID}
          onChange={handleProductServiceIDChange}
          maxLength="19"
          placeholder="Enter productServiceID (max 19 chars)"
        />
      </div>

      <div className="field-summary">
        <h3>Current Values:</h3>
        <p>productServiceId: {productServiceId}</p>
        <p>product_service_id: {product_service_id}</p>
        <p>PRODUCT_SERVICE_ID: {PRODUCT_SERVICE_ID}</p>
        <p>productServiceID: {productServiceID}</p>
      </div>
    </div>
  );
};

export default ClaimSegment; 