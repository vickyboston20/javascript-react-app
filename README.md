# JavaScript React App - Field Config Sample

This is a sample React application that contains field patterns matching the field_config.json for testing AST chunking and analysis.

## Fields Included

### Transaction Header Segment
- **Bin Number**: Various naming patterns (binNumber, bin_num, BIN_NUMBER)
- Field length expanding from 6 to 8 digits

### Pharmacy Provider Segment  
- **Provider ID**: Various naming patterns (providerId, provider_id, PROVIDER_ID, providerID)
- Field length expanding from 15 to 35 characters

### Claim Segment
- **Product/Service ID**: Various naming patterns (productServiceId, product_service_id, PRODUCT_SERVICE_ID, productServiceID)
- Field length expanding from 19 to 40 characters

## Installation

```bash
npm install
```

## Running

```bash
npm start
```

## Purpose

This repository is designed to test JavaScript AST chunking capabilities for identifying field patterns defined in field_config.json. 