import React, { useState } from 'react';

/**
 * Transaction Header Segment Component
 * Contains fields that match the field_config.json patterns
 */
const TransactionHeader = () => {
  // State for Bin Number field - matches field_config pattern
  const [binNumber, setBinNumber] = useState('');
  const [bin_num, setBin_num] = useState(''); 
  const [BIN_NUMBER, setBIN_NUMBER] = useState('');
  
  // Field validation
  const validateBinNumber = (value) => {
    // Current format: 6 digits, expanding to 8
    return value.length <= 8 && /^\d*$/.test(value);
  };

  const handleBinNumberChange = (e) => {
    const value = e.target.value;
    if (validateBinNumber(value)) {
      setBinNumber(value);
    }
  };

  const handleBinNumChange = (e) => {
    const value = e.target.value;
    if (validateBinNumber(value)) {
      setBin_num(value);
    }
  };

  const handleBIN_NUMBERChange = (e) => {
    const value = e.target.value;
    if (validateBinNumber(value)) {
      setBIN_NUMBER(value);
    }
  };

  return (
    <div className="transaction-header-segment">
      <h2>Transaction Header Segment</h2>
      
      <div className="field-group">
        <label htmlFor="binNumber">
          Bin Number (binNumber):
        </label>
        <input
          id="binNumber"
          type="text"
          value={binNumber}
          onChange={handleBinNumberChange}
          maxLength="8"
          placeholder="Enter bin number (max 8 digits)"
        />
        <small>Expanding from 6 to 8 digits</small>
      </div>

      <div className="field-group">
        <label htmlFor="bin_num">
          Bin Num (bin_num):
        </label>
        <input
          id="bin_num"
          type="text"
          value={bin_num}
          onChange={handleBinNumChange}
          maxLength="8"
          placeholder="Enter bin num (max 8 digits)"
        />
      </div>

      <div className="field-group">
        <label htmlFor="BIN_NUMBER">
          BIN NUMBER (BIN_NUMBER):
        </label>
        <input
          id="BIN_NUMBER"
          type="text"
          value={BIN_NUMBER}
          onChange={handleBIN_NUMBERChange}
          maxLength="8"
          placeholder="Enter BIN NUMBER (max 8 digits)"
        />
      </div>

      <div className="field-summary">
        <h3>Current Values:</h3>
        <p>binNumber: {binNumber}</p>
        <p>bin_num: {bin_num}</p>
        <p>BIN_NUMBER: {BIN_NUMBER}</p>
      </div>
    </div>
  );
};

export default TransactionHeader; 