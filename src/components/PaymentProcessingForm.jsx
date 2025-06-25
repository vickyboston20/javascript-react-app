import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  TextField, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Alert, 
  Chip, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

/**
 * Comprehensive Payment Processing Form Component
 * Handles multiple payment scenarios with field validation and processing
 * Contains legacy and new field implementations for testing AST chunking
 */
const PaymentProcessingForm = ({ 
  onSubmit, 
  initialData, 
  readonly = false, 
  showAdvanced = false,
  enableValidation = true,
  paymentMethods = [],
  providers = [],
  onFieldChange,
  theme = 'default'
}) => {
  // Legacy field state management - OLD FORMAT
  const [legacyBinNumber, setLegacyBinNumber] = useState(''); // 6 digits max
  const [legacy_provider_id, setLegacyProviderId] = useState(''); // 15 chars max
  const [LEGACY_PRODUCT_SERVICE_ID, setLegacyProductServiceId] = useState(''); // 19 chars max
  
  // New field state management - NEW FORMAT  
  const [newBinNumber, setNewBinNumber] = useState(''); // 8 digits max
  const [new_provider_id, setNewProviderId] = useState(''); // 35 chars max
  const [NEW_PRODUCT_SERVICE_ID, setNewProductServiceId] = useState(''); // 40 chars max
  
  // Mixed naming convention fields
  const [binNumberValue, setBinNumberValue] = useState('');
  const [providerIdCode, setProviderIdCode] = useState('');
  const [productServiceIdentifier, setProductServiceIdentifier] = useState('');
  const [bin_number_field, setBinNumberField] = useState('');
  const [provider_id_field, setProviderIdField] = useState('');
  const [product_service_id_field, setProductServiceIdField] = useState('');
  const [BIN_NUM, setBinNum] = useState('');
  const [PROVIDER_CODE, setProviderCode] = useState('');
  const [PROD_SVC_ID, setProdSvcId] = useState('');
  
  // Additional form state
  const [formData, setFormData] = useState({
    customerInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
      }
    },
    paymentDetails: {
      amount: 0,
      currency: 'USD',
      description: '',
      reference: '',
      merchantId: '',
      terminalId: '',
      batchNumber: '',
      transactionType: 'sale',
      paymentMethod: 'credit_card'
    },
    cardDetails: {
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: '',
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
      }
    },
    processingOptions: {
      enableFraudCheck: true,
      enable3DSecure: false,
      enableTokenization: true,
      saveCustomer: false,
      sendReceipt: true,
      enableInstallments: false,
      installmentCount: 1
    },
    riskAssessment: {
      riskLevel: 'medium',
      fraudScore: 0,
      velocityChecks: true,
      deviceFingerprint: '',
      ipAddress: '',
      userAgent: ''
    }
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [validationResults, setValidationResults] = useState({});
  const [processingHistory, setProcessingHistory] = useState([]);
  const [fieldValidations, setFieldValidations] = useState({});

  // Field validation patterns
  const FIELD_PATTERNS = {
    legacyBinNumber: /^\d{6}$/,
    newBinNumber: /^\d{8}$/,
    legacyProviderId: /^[A-Za-z0-9]{1,15}$/,
    newProviderId: /^[A-Za-z0-9]{1,35}$/,
    legacyProductServiceId: /^[A-Za-z0-9_-]{1,19}$/,
    newProductServiceId: /^[A-Za-z0-9_-]{1,40}$/
  };

  // Field length constraints
  const FIELD_CONSTRAINTS = {
    LEGACY_BIN_LENGTH: 6,
    NEW_BIN_LENGTH: 8,
    LEGACY_PROVIDER_LENGTH: 15,
    NEW_PROVIDER_LENGTH: 35,
    LEGACY_PRODUCT_SERVICE_LENGTH: 19,
    NEW_PRODUCT_SERVICE_LENGTH: 40
  };

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData(prevData => ({
        ...prevData,
        ...initialData
      }));
      
      // Initialize legacy fields from initial data
      if (initialData.legacyFields) {
        setLegacyBinNumber(initialData.legacyFields.binNumber || '');
        setLegacyProviderId(initialData.legacyFields.providerId || '');
        setLegacyProductServiceId(initialData.legacyFields.productServiceId || '');
      }
      
      // Initialize new fields from initial data
      if (initialData.newFields) {
        setNewBinNumber(initialData.newFields.binNumber || '');
        setNewProviderId(initialData.newFields.providerId || '');
        setNewProductServiceId(initialData.newFields.productServiceId || '');
      }
    }
  }, [initialData]);

  // Field validation handlers
  const validateLegacyBinNumber = useCallback((value) => {
    const errors = [];
    if (!value) {
      errors.push('Bin Number is required');
    } else if (value.length !== FIELD_CONSTRAINTS.LEGACY_BIN_LENGTH) {
      errors.push(`Bin Number must be exactly ${FIELD_CONSTRAINTS.LEGACY_BIN_LENGTH} digits`);
    } else if (!FIELD_PATTERNS.legacyBinNumber.test(value)) {
      errors.push('Bin Number must contain only digits');
    }
    return errors;
  }, []);

  const validateNewBinNumber = useCallback((value) => {
    const errors = [];
    if (!value) {
      errors.push('Bin Number is required');
    } else if (value.length !== FIELD_CONSTRAINTS.NEW_BIN_LENGTH) {
      errors.push(`Bin Number must be exactly ${FIELD_CONSTRAINTS.NEW_BIN_LENGTH} digits`);
    } else if (!FIELD_PATTERNS.newBinNumber.test(value)) {
      errors.push('Bin Number must contain only digits');
    }
    return errors;
  }, []);

  const validateLegacyProviderId = useCallback((value) => {
    const errors = [];
    if (!value) {
      errors.push('Provider ID is required');
    } else if (value.length > FIELD_CONSTRAINTS.LEGACY_PROVIDER_LENGTH) {
      errors.push(`Provider ID cannot exceed ${FIELD_CONSTRAINTS.LEGACY_PROVIDER_LENGTH} characters`);
    } else if (!FIELD_PATTERNS.legacyProviderId.test(value)) {
      errors.push('Provider ID must contain only alphanumeric characters');
    }
    return errors;
  }, []);

  const validateNewProviderId = useCallback((value) => {
    const errors = [];
    if (!value) {
      errors.push('Provider ID is required');
    } else if (value.length > FIELD_CONSTRAINTS.NEW_PROVIDER_LENGTH) {
      errors.push(`Provider ID cannot exceed ${FIELD_CONSTRAINTS.NEW_PROVIDER_LENGTH} characters`);
    } else if (!FIELD_PATTERNS.newProviderId.test(value)) {
      errors.push('Provider ID must contain only alphanumeric characters');
    }
    return errors;
  }, []);

  const validateLegacyProductServiceId = useCallback((value) => {
    const errors = [];
    if (!value) {
      errors.push('Product/Service ID is required');
    } else if (value.length > FIELD_CONSTRAINTS.LEGACY_PRODUCT_SERVICE_LENGTH) {
      errors.push(`Product/Service ID cannot exceed ${FIELD_CONSTRAINTS.LEGACY_PRODUCT_SERVICE_LENGTH} characters`);
    } else if (!FIELD_PATTERNS.legacyProductServiceId.test(value)) {
      errors.push('Product/Service ID must contain only alphanumeric characters, hyphens, and underscores');
    }
    return errors;
  }, []);

  const validateNewProductServiceId = useCallback((value) => {
    const errors = [];
    if (!value) {
      errors.push('Product/Service ID is required');
    } else if (value.length > FIELD_CONSTRAINTS.NEW_PRODUCT_SERVICE_LENGTH) {
      errors.push(`Product/Service ID cannot exceed ${FIELD_CONSTRAINTS.NEW_PRODUCT_SERVICE_LENGTH} characters`);
    } else if (!FIELD_PATTERNS.newProductServiceId.test(value)) {
      errors.push('Product/Service ID must contain only alphanumeric characters, hyphens, and underscores');
    }
    return errors;
  }, []);

  // Comprehensive field change handler
  const handleFieldChange = useCallback((fieldName, value, fieldType = 'legacy') => {
    let validationErrors = [];
    
    switch (fieldName) {
      case 'binNumber':
        if (fieldType === 'legacy') {
          setLegacyBinNumber(value);
          validationErrors = validateLegacyBinNumber(value);
        } else {
          setNewBinNumber(value);
          validationErrors = validateNewBinNumber(value);
        }
        break;
      case 'providerId':
        if (fieldType === 'legacy') {
          setLegacyProviderId(value);
          validationErrors = validateLegacyProviderId(value);
        } else {
          setNewProviderId(value);
          validationErrors = validateNewProviderId(value);
        }
        break;
      case 'productServiceId':
        if (fieldType === 'legacy') {
          setLegacyProductServiceId(value);
          validationErrors = validateLegacyProductServiceId(value);
        } else {
          setNewProductServiceId(value);
          validationErrors = validateNewProductServiceId(value);
        }
        break;
      case 'binNumberValue':
        setBinNumberValue(value);
        validationErrors = validateNewBinNumber(value);
        break;
      case 'providerIdCode':
        setProviderIdCode(value);
        validationErrors = validateNewProviderId(value);
        break;
      case 'productServiceIdentifier':
        setProductServiceIdentifier(value);
        validationErrors = validateNewProductServiceId(value);
        break;
      case 'bin_number_field':
        setBinNumberField(value);
        validationErrors = validateNewBinNumber(value);
        break;
      case 'provider_id_field':
        setProviderIdField(value);
        validationErrors = validateNewProviderId(value);
        break;
      case 'product_service_id_field':
        setProductServiceIdField(value);
        validationErrors = validateNewProductServiceId(value);
        break;
      case 'BIN_NUM':
        setBinNum(value);
        validationErrors = validateNewBinNumber(value);
        break;
      case 'PROVIDER_CODE':
        setProviderCode(value);
        validationErrors = validateNewProviderId(value);
        break;
      case 'PROD_SVC_ID':
        setProdSvcId(value);
        validationErrors = validateNewProductServiceId(value);
        break;
    }

    // Update field validations
    setFieldValidations(prev => ({
      ...prev,
      [`${fieldType}_${fieldName}`]: validationErrors
    }));

    // Call external field change handler if provided
    if (onFieldChange) {
      onFieldChange(fieldName, value, fieldType, validationErrors);
    }
  }, [
    validateLegacyBinNumber, 
    validateNewBinNumber, 
    validateLegacyProviderId, 
    validateNewProviderId,
    validateLegacyProductServiceId, 
    validateNewProductServiceId,
    onFieldChange
  ]);

  // Business logic for field processing
  const processLegacyFields = useCallback(() => {
    const legacyData = {
      binNumber: legacyBinNumber,
      providerId: legacy_provider_id,
      productServiceId: LEGACY_PRODUCT_SERVICE_ID,
      fieldLengths: {
        binNumber: FIELD_CONSTRAINTS.LEGACY_BIN_LENGTH,
        providerId: FIELD_CONSTRAINTS.LEGACY_PROVIDER_LENGTH,
        productServiceId: FIELD_CONSTRAINTS.LEGACY_PRODUCT_SERVICE_LENGTH
      }
    };

    return legacyData;
  }, [legacyBinNumber, legacy_provider_id, LEGACY_PRODUCT_SERVICE_ID]);

  const processNewFields = useCallback(() => {
    const newData = {
      binNumber: newBinNumber,
      providerId: new_provider_id,
      productServiceId: NEW_PRODUCT_SERVICE_ID,
      fieldLengths: {
        binNumber: FIELD_CONSTRAINTS.NEW_BIN_LENGTH,
        providerId: FIELD_CONSTRAINTS.NEW_PROVIDER_LENGTH,
        productServiceId: FIELD_CONSTRAINTS.NEW_PRODUCT_SERVICE_LENGTH
      }
    };

    return newData;
  }, [newBinNumber, new_provider_id, NEW_PRODUCT_SERVICE_ID]);

  const processMixedFields = useCallback(() => {
    const mixedData = {
      camelCase: {
        binNumberValue: binNumberValue,
        providerIdCode: providerIdCode,
        productServiceIdentifier: productServiceIdentifier
      },
      snakeCase: {
        bin_number_field: bin_number_field,
        provider_id_field: provider_id_field,
        product_service_id_field: product_service_id_field
      },
      upperCase: {
        BIN_NUM: BIN_NUM,
        PROVIDER_CODE: PROVIDER_CODE,
        PROD_SVC_ID: PROD_SVC_ID
      }
    };

    return mixedData;
  }, [
    binNumberValue, providerIdCode, productServiceIdentifier,
    bin_number_field, provider_id_field, product_service_id_field,
    BIN_NUM, PROVIDER_CODE, PROD_SVC_ID
  ]);

  // Form submission handler
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const legacyFields = processLegacyFields();
      const newFields = processNewFields();
      const mixedFields = processMixedFields();

      const submissionData = {
        formData,
        legacyFields,
        newFields,
        mixedFields,
        validationResults: fieldValidations,
        timestamp: new Date().toISOString(),
        formVersion: '2.0.0'
      };

      // Add to processing history
      setProcessingHistory(prev => [...prev, {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        data: submissionData,
        status: 'processing'
      }]);

      if (onSubmit) {
        await onSubmit(submissionData);
      }

      // Update processing history with success
      setProcessingHistory(prev => prev.map(item => 
        item.id === Date.now() ? { ...item, status: 'success' } : item
      ));

    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(prev => ({
        ...prev,
        submission: 'Failed to submit form. Please try again.'
      }));

      // Update processing history with error
      setProcessingHistory(prev => prev.map(item => 
        item.id === Date.now() ? { ...item, status: 'error', error: error.message } : item
      ));
    } finally {
      setLoading(false);
    }
  }, [
    formData, 
    fieldValidations, 
    processLegacyFields, 
    processNewFields, 
    processMixedFields, 
    onSubmit
  ]);

  // Computed field validation summary
  const validationSummary = useMemo(() => {
    const allErrors = Object.values(fieldValidations).flat();
    return {
      hasErrors: allErrors.length > 0,
      errorCount: allErrors.length,
      errors: allErrors
    };
  }, [fieldValidations]);

  // Field comparison utility
  const compareFieldLengths = useCallback(() => {
    return {
      binNumber: {
        legacy: FIELD_CONSTRAINTS.LEGACY_BIN_LENGTH,
        new: FIELD_CONSTRAINTS.NEW_BIN_LENGTH,
        increase: FIELD_CONSTRAINTS.NEW_BIN_LENGTH - FIELD_CONSTRAINTS.LEGACY_BIN_LENGTH
      },
      providerId: {
        legacy: FIELD_CONSTRAINTS.LEGACY_PROVIDER_LENGTH,
        new: FIELD_CONSTRAINTS.NEW_PROVIDER_LENGTH,
        increase: FIELD_CONSTRAINTS.NEW_PROVIDER_LENGTH - FIELD_CONSTRAINTS.LEGACY_PROVIDER_LENGTH
      },
      productServiceId: {
        legacy: FIELD_CONSTRAINTS.LEGACY_PRODUCT_SERVICE_LENGTH,
        new: FIELD_CONSTRAINTS.NEW_PRODUCT_SERVICE_LENGTH,
        increase: FIELD_CONSTRAINTS.NEW_PRODUCT_SERVICE_LENGTH - FIELD_CONSTRAINTS.LEGACY_PRODUCT_SERVICE_LENGTH
      }
    };
  }, []);

  const fieldComparison = useMemo(() => compareFieldLengths(), [compareFieldLengths]);

  // Render legacy fields section
  const renderLegacyFields = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Legacy Field Format (Old System)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Legacy Bin Number"
              value={legacyBinNumber}
              onChange={(e) => handleFieldChange('binNumber', e.target.value, 'legacy')}
              error={fieldValidations.legacy_binNumber?.length > 0}
              helperText={
                fieldValidations.legacy_binNumber?.length > 0 
                  ? fieldValidations.legacy_binNumber.join(', ')
                  : `${FIELD_CONSTRAINTS.LEGACY_BIN_LENGTH} digits required`
              }
              inputProps={{ maxLength: FIELD_CONSTRAINTS.LEGACY_BIN_LENGTH }}
              disabled={readonly}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Legacy Provider ID"
              value={legacy_provider_id}
              onChange={(e) => handleFieldChange('providerId', e.target.value, 'legacy')}
              error={fieldValidations.legacy_providerId?.length > 0}
              helperText={
                fieldValidations.legacy_providerId?.length > 0 
                  ? fieldValidations.legacy_providerId.join(', ')
                  : `Max ${FIELD_CONSTRAINTS.LEGACY_PROVIDER_LENGTH} characters`
              }
              inputProps={{ maxLength: FIELD_CONSTRAINTS.LEGACY_PROVIDER_LENGTH }}
              disabled={readonly}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Legacy Product/Service ID"
              value={LEGACY_PRODUCT_SERVICE_ID}
              onChange={(e) => handleFieldChange('productServiceId', e.target.value, 'legacy')}
              error={fieldValidations.legacy_productServiceId?.length > 0}
              helperText={
                fieldValidations.legacy_productServiceId?.length > 0 
                  ? fieldValidations.legacy_productServiceId.join(', ')
                  : `Max ${FIELD_CONSTRAINTS.LEGACY_PRODUCT_SERVICE_LENGTH} characters`
              }
              inputProps={{ maxLength: FIELD_CONSTRAINTS.LEGACY_PRODUCT_SERVICE_LENGTH }}
              disabled={readonly}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  // Render new fields section
  const renderNewFields = () => (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">New Field Format (Updated System)</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="New Bin Number"
              value={newBinNumber}
              onChange={(e) => handleFieldChange('binNumber', e.target.value, 'new')}
              error={fieldValidations.new_binNumber?.length > 0}
              helperText={
                fieldValidations.new_binNumber?.length > 0 
                  ? fieldValidations.new_binNumber.join(', ')
                  : `${FIELD_CONSTRAINTS.NEW_BIN_LENGTH} digits required`
              }
              inputProps={{ maxLength: FIELD_CONSTRAINTS.NEW_BIN_LENGTH }}
              disabled={readonly}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="New Provider ID"
              value={new_provider_id}
              onChange={(e) => handleFieldChange('providerId', e.target.value, 'new')}
              error={fieldValidations.new_providerId?.length > 0}
              helperText={
                fieldValidations.new_providerId?.length > 0 
                  ? fieldValidations.new_providerId.join(', ')
                  : `Max ${FIELD_CONSTRAINTS.NEW_PROVIDER_LENGTH} characters`
              }
              inputProps={{ maxLength: FIELD_CONSTRAINTS.NEW_PROVIDER_LENGTH }}
              disabled={readonly}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="New Product/Service ID"
              value={NEW_PRODUCT_SERVICE_ID}
              onChange={(e) => handleFieldChange('productServiceId', e.target.value, 'new')}
              error={fieldValidations.new_productServiceId?.length > 0}
              helperText={
                fieldValidations.new_productServiceId?.length > 0 
                  ? fieldValidations.new_productServiceId.join(', ')
                  : `Max ${FIELD_CONSTRAINTS.NEW_PRODUCT_SERVICE_LENGTH} characters`
              }
              inputProps={{ maxLength: FIELD_CONSTRAINTS.NEW_PRODUCT_SERVICE_LENGTH }}
              disabled={readonly}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  // Render mixed naming convention fields
  const renderMixedFields = () => (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">Mixed Naming Conventions</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Camel Case Fields
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="binNumberValue"
              value={binNumberValue}
              onChange={(e) => handleFieldChange('binNumberValue', e.target.value)}
              inputProps={{ maxLength: FIELD_CONSTRAINTS.NEW_BIN_LENGTH }}
              disabled={readonly}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="providerIdCode"
              value={providerIdCode}
              onChange={(e) => handleFieldChange('providerIdCode', e.target.value)}
              inputProps={{ maxLength: FIELD_CONSTRAINTS.NEW_PROVIDER_LENGTH }}
              disabled={readonly}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="productServiceIdentifier"
              value={productServiceIdentifier}
              onChange={(e) => handleFieldChange('productServiceIdentifier', e.target.value)}
              inputProps={{ maxLength: FIELD_CONSTRAINTS.NEW_PRODUCT_SERVICE_LENGTH }}
              disabled={readonly}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Snake Case Fields
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="bin_number_field"
              value={bin_number_field}
              onChange={(e) => handleFieldChange('bin_number_field', e.target.value)}
              inputProps={{ maxLength: FIELD_CONSTRAINTS.NEW_BIN_LENGTH }}
              disabled={readonly}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="provider_id_field"
              value={provider_id_field}
              onChange={(e) => handleFieldChange('provider_id_field', e.target.value)}
              inputProps={{ maxLength: FIELD_CONSTRAINTS.NEW_PROVIDER_LENGTH }}
              disabled={readonly}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="product_service_id_field"
              value={product_service_id_field}
              onChange={(e) => handleFieldChange('product_service_id_field', e.target.value)}
              inputProps={{ maxLength: FIELD_CONSTRAINTS.NEW_PRODUCT_SERVICE_LENGTH }}
              disabled={readonly}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Upper Case Fields
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="BIN_NUM"
              value={BIN_NUM}
              onChange={(e) => handleFieldChange('BIN_NUM', e.target.value)}
              inputProps={{ maxLength: FIELD_CONSTRAINTS.NEW_BIN_LENGTH }}
              disabled={readonly}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="PROVIDER_CODE"
              value={PROVIDER_CODE}
              onChange={(e) => handleFieldChange('PROVIDER_CODE', e.target.value)}
              inputProps={{ maxLength: FIELD_CONSTRAINTS.NEW_PROVIDER_LENGTH }}
              disabled={readonly}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="PROD_SVC_ID"
              value={PROD_SVC_ID}
              onChange={(e) => handleFieldChange('PROD_SVC_ID', e.target.value)}
              inputProps={{ maxLength: FIELD_CONSTRAINTS.NEW_PRODUCT_SERVICE_LENGTH }}
              disabled={readonly}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  // Render field comparison table
  const renderFieldComparison = () => (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Field Length Comparison
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Field</TableCell>
              <TableCell align="right">Legacy Length</TableCell>
              <TableCell align="right">New Length</TableCell>
              <TableCell align="right">Increase</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Bin Number</TableCell>
              <TableCell align="right">{fieldComparison.binNumber.legacy}</TableCell>
              <TableCell align="right">{fieldComparison.binNumber.new}</TableCell>
              <TableCell align="right">+{fieldComparison.binNumber.increase}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Provider ID</TableCell>
              <TableCell align="right">{fieldComparison.providerId.legacy}</TableCell>
              <TableCell align="right">{fieldComparison.providerId.new}</TableCell>
              <TableCell align="right">+{fieldComparison.providerId.increase}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Product/Service ID</TableCell>
              <TableCell align="right">{fieldComparison.productServiceId.legacy}</TableCell>
              <TableCell align="right">{fieldComparison.productServiceId.new}</TableCell>
              <TableCell align="right">+{fieldComparison.productServiceId.increase}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  // Render validation summary
  const renderValidationSummary = () => {
    if (!validationSummary.hasErrors) return null;

    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <Typography variant="subtitle2">
          Validation Errors ({validationSummary.errorCount})
        </Typography>
        <ul>
          {validationSummary.errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </Alert>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={{ maxWidth: '100%', margin: 'auto', p: 2 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Payment Processing Form
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center" color="textSecondary">
            Comprehensive field testing for legacy and new field formats
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {renderLegacyFields()}
              </Grid>
              
              <Grid item xs={12}>
                {renderNewFields()}
              </Grid>
              
              <Grid item xs={12}>
                {renderMixedFields()}
              </Grid>
              
              <Grid item xs={12}>
                {renderFieldComparison()}
              </Grid>
              
              <Grid item xs={12}>
                {renderValidationSummary()}
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setDialogOpen(true)}
                  >
                    View Processing History
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || validationSummary.hasErrors || readonly}
                    startIcon={loading && <CircularProgress size={20} />}
                  >
                    {loading ? 'Processing...' : 'Submit Payment'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Processing History Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Processing History</DialogTitle>
        <DialogContent>
          {processingHistory.length === 0 ? (
            <Typography>No processing history available</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processingHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.status} 
                        color={
                          item.status === 'success' ? 'success' : 
                          item.status === 'error' ? 'error' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {item.error || 'Processed successfully'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

PaymentProcessingForm.propTypes = {
  onSubmit: PropTypes.func,
  initialData: PropTypes.object,
  readonly: PropTypes.bool,
  showAdvanced: PropTypes.bool,
  enableValidation: PropTypes.bool,
  paymentMethods: PropTypes.array,
  providers: PropTypes.array,
  onFieldChange: PropTypes.func,
  theme: PropTypes.string
};

export default PaymentProcessingForm; 