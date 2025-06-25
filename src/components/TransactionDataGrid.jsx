import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
  GridActionsCellItem,
  GridRowEditStopReasons,
  GridRowModes
} from '@mui/x-data-grid';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Alert,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

/**
 * Comprehensive Transaction Data Grid Component
 * Manages transaction data with legacy and new field formats
 * Includes data processing, filtering, sorting, and field migration capabilities
 */
const TransactionDataGrid = ({
  initialData = [],
  onDataChange,
  onRowUpdate,
  onRowDelete,
  readOnly = false,
  enableExport = true,
  enableImport = true,
  showFieldMigration = true,
  autoRefresh = false,
  refreshInterval = 30000,
  theme = 'default'
}) => {
  // Transaction data state
  const [transactions, setTransactions] = useState(initialData);
  const [filteredTransactions, setFilteredTransactions] = useState(initialData);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Grid state
  const [rowModesModel, setRowModesModel] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [sortModel, setSortModel] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  
  // Dialog states
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);
  const [fieldAnalysisDialogOpen, setFieldAnalysisDialogOpen] = useState(false);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  
  // Field analysis state
  const [fieldAnalysis, setFieldAnalysis] = useState({});
  const [migrationProgress, setMigrationProgress] = useState({});
  const [validationResults, setValidationResults] = useState({});
  
  // Refs
  const refreshIntervalRef = useRef(null);
  
  // Field patterns and constraints (mirroring the form component)
  const FIELD_PATTERNS = {
    legacyBinNumber: /^\d{6}$/,
    newBinNumber: /^\d{8}$/,
    legacyProviderId: /^[A-Za-z0-9]{1,15}$/,
    newProviderId: /^[A-Za-z0-9]{1,35}$/,
    legacyProductServiceId: /^[A-Za-z0-9_-]{1,19}$/,
    newProductServiceId: /^[A-Za-z0-9_-]{1,40}$/
  };

  const FIELD_CONSTRAINTS = {
    LEGACY_BIN_LENGTH: 6,
    NEW_BIN_LENGTH: 8,
    LEGACY_PROVIDER_LENGTH: 15,
    NEW_PROVIDER_LENGTH: 35,
    LEGACY_PRODUCT_SERVICE_LENGTH: 19,
    NEW_PRODUCT_SERVICE_LENGTH: 40
  };

  // Sample transaction data generator for testing
  const generateSampleTransactions = useCallback(() => {
    const sampleData = [];
    const statuses = ['pending', 'completed', 'failed', 'cancelled'];
    const types = ['sale', 'refund', 'authorization', 'capture'];
    const currencies = ['USD', 'EUR', 'GBP', 'CAD'];
    
    for (let i = 1; i <= 500; i++) {
      const isLegacy = Math.random() > 0.3; // 70% new format, 30% legacy
      
      sampleData.push({
        id: i,
        transactionId: `TXN-${String(i).padStart(6, '0')}`,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        
        // Legacy fields (6/15/19 character limits)
        legacyBinNumber: isLegacy ? String(Math.floor(Math.random() * 900000) + 100000) : null,
        legacy_provider_id: isLegacy ? `PROV${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}` : null,
        LEGACY_PRODUCT_SERVICE_ID: isLegacy ? `PROD-SVC-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}` : null,
        
        // New fields (8/35/40 character limits)
        newBinNumber: !isLegacy ? String(Math.floor(Math.random() * 90000000) + 10000000) : null,
        new_provider_id: !isLegacy ? `PROVIDER-${String(Math.floor(Math.random() * 999999999)).padStart(9, '0')}-NEW` : null,
        NEW_PRODUCT_SERVICE_ID: !isLegacy ? `NEW-PRODUCT-SERVICE-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}-ID` : null,
        
        // Mixed naming conventions
        binNumberValue: String(Math.floor(Math.random() * 90000000) + 10000000),
        providerIdCode: `MIXED-PROV-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
        productServiceIdentifier: `MIXED-PROD-SVC-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
        bin_number_field: String(Math.floor(Math.random() * 90000000) + 10000000),
        provider_id_field: `snake_prov_${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
        product_service_id_field: `snake_prod_svc_${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
        BIN_NUM: String(Math.floor(Math.random() * 90000000) + 10000000),
        PROVIDER_CODE: `UPPER_PROV_${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
        PROD_SVC_ID: `UPPER_PROD_${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
        
        // Transaction details
        amount: Math.floor(Math.random() * 100000) / 100,
        currency: currencies[Math.floor(Math.random() * currencies.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        type: types[Math.floor(Math.random() * types.length)],
        merchantId: `MERCH-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
        terminalId: `TERM-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
        batchNumber: String(Math.floor(Math.random() * 999) + 1),
        
        // Customer info
        customerName: `Customer ${i}`,
        customerEmail: `customer${i}@example.com`,
        
        // Processing info
        processedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        processingTimeMs: Math.floor(Math.random() * 5000) + 100,
        
        // Validation flags
        isLegacyFormat: isLegacy,
        requiresMigration: isLegacy,
        validationStatus: Math.random() > 0.2 ? 'valid' : 'invalid'
      });
    }
    
    return sampleData;
  }, []);

  // Initialize data
  useEffect(() => {
    if (initialData.length === 0) {
      const sampleData = generateSampleTransactions();
      setTransactions(sampleData);
      setFilteredTransactions(sampleData);
    } else {
      setTransactions(initialData);
      setFilteredTransactions(initialData);
    }
  }, [initialData, generateSampleTransactions]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        handleRefreshData();
      }, refreshInterval);
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval]);

  // Field validation functions
  const validateLegacyBinNumber = useCallback((value) => {
    if (!value) return [];
    const errors = [];
    if (value.length !== FIELD_CONSTRAINTS.LEGACY_BIN_LENGTH) {
      errors.push(`Legacy Bin Number must be ${FIELD_CONSTRAINTS.LEGACY_BIN_LENGTH} digits`);
    }
    if (!FIELD_PATTERNS.legacyBinNumber.test(value)) {
      errors.push('Legacy Bin Number must contain only digits');
    }
    return errors;
  }, []);

  const validateNewBinNumber = useCallback((value) => {
    if (!value) return [];
    const errors = [];
    if (value.length !== FIELD_CONSTRAINTS.NEW_BIN_LENGTH) {
      errors.push(`New Bin Number must be ${FIELD_CONSTRAINTS.NEW_BIN_LENGTH} digits`);
    }
    if (!FIELD_PATTERNS.newBinNumber.test(value)) {
      errors.push('New Bin Number must contain only digits');
    }
    return errors;
  }, []);

  const validateLegacyProviderId = useCallback((value) => {
    if (!value) return [];
    const errors = [];
    if (value.length > FIELD_CONSTRAINTS.LEGACY_PROVIDER_LENGTH) {
      errors.push(`Legacy Provider ID cannot exceed ${FIELD_CONSTRAINTS.LEGACY_PROVIDER_LENGTH} characters`);
    }
    if (!FIELD_PATTERNS.legacyProviderId.test(value)) {
      errors.push('Legacy Provider ID must contain only alphanumeric characters');
    }
    return errors;
  }, []);

  const validateNewProviderId = useCallback((value) => {
    if (!value) return [];
    const errors = [];
    if (value.length > FIELD_CONSTRAINTS.NEW_PROVIDER_LENGTH) {
      errors.push(`New Provider ID cannot exceed ${FIELD_CONSTRAINTS.NEW_PROVIDER_LENGTH} characters`);
    }
    if (!FIELD_PATTERNS.newProviderId.test(value)) {
      errors.push('New Provider ID must contain only alphanumeric characters');
    }
    return errors;
  }, []);

  const validateLegacyProductServiceId = useCallback((value) => {
    if (!value) return [];
    const errors = [];
    if (value.length > FIELD_CONSTRAINTS.LEGACY_PRODUCT_SERVICE_LENGTH) {
      errors.push(`Legacy Product/Service ID cannot exceed ${FIELD_CONSTRAINTS.LEGACY_PRODUCT_SERVICE_LENGTH} characters`);
    }
    if (!FIELD_PATTERNS.legacyProductServiceId.test(value)) {
      errors.push('Legacy Product/Service ID must contain only alphanumeric characters, hyphens, and underscores');
    }
    return errors;
  }, []);

  const validateNewProductServiceId = useCallback((value) => {
    if (!value) return [];
    const errors = [];
    if (value.length > FIELD_CONSTRAINTS.NEW_PRODUCT_SERVICE_LENGTH) {
      errors.push(`New Product/Service ID cannot exceed ${FIELD_CONSTRAINTS.NEW_PRODUCT_SERVICE_LENGTH} characters`);
    }
    if (!FIELD_PATTERNS.newProductServiceId.test(value)) {
      errors.push('New Product/Service ID must contain only alphanumeric characters, hyphens, and underscores');
    }
    return errors;
  }, []);

  // Comprehensive field analysis
  const analyzeFieldData = useCallback(() => {
    const analysis = {
      totalRecords: transactions.length,
      legacyRecords: 0,
      newRecords: 0,
      mixedRecords: 0,
      fieldValidation: {
        legacyBinNumber: { valid: 0, invalid: 0, errors: [] },
        newBinNumber: { valid: 0, invalid: 0, errors: [] },
        legacyProviderId: { valid: 0, invalid: 0, errors: [] },
        newProviderId: { valid: 0, invalid: 0, errors: [] },
        legacyProductServiceId: { valid: 0, invalid: 0, errors: [] },
        newProductServiceId: { valid: 0, invalid: 0, errors: [] }
      },
      migrationCandidates: [],
      fieldLengthDistribution: {
        binNumber: {},
        providerId: {},
        productServiceId: {}
      }
    };

    transactions.forEach(transaction => {
      // Count record types
      if (transaction.isLegacyFormat) {
        analysis.legacyRecords++;
      } else {
        analysis.newRecords++;
      }

      // Validate legacy fields
      if (transaction.legacyBinNumber) {
        const errors = validateLegacyBinNumber(transaction.legacyBinNumber);
        if (errors.length === 0) {
          analysis.fieldValidation.legacyBinNumber.valid++;
        } else {
          analysis.fieldValidation.legacyBinNumber.invalid++;
          analysis.fieldValidation.legacyBinNumber.errors.push(...errors);
        }
      }

      if (transaction.legacy_provider_id) {
        const errors = validateLegacyProviderId(transaction.legacy_provider_id);
        if (errors.length === 0) {
          analysis.fieldValidation.legacyProviderId.valid++;
        } else {
          analysis.fieldValidation.legacyProviderId.invalid++;
          analysis.fieldValidation.legacyProviderId.errors.push(...errors);
        }
      }

      if (transaction.LEGACY_PRODUCT_SERVICE_ID) {
        const errors = validateLegacyProductServiceId(transaction.LEGACY_PRODUCT_SERVICE_ID);
        if (errors.length === 0) {
          analysis.fieldValidation.legacyProductServiceId.valid++;
        } else {
          analysis.fieldValidation.legacyProductServiceId.invalid++;
          analysis.fieldValidation.legacyProductServiceId.errors.push(...errors);
        }
      }

      // Validate new fields
      if (transaction.newBinNumber) {
        const errors = validateNewBinNumber(transaction.newBinNumber);
        if (errors.length === 0) {
          analysis.fieldValidation.newBinNumber.valid++;
        } else {
          analysis.fieldValidation.newBinNumber.invalid++;
          analysis.fieldValidation.newBinNumber.errors.push(...errors);
        }
      }

      if (transaction.new_provider_id) {
        const errors = validateNewProviderId(transaction.new_provider_id);
        if (errors.length === 0) {
          analysis.fieldValidation.newProviderId.valid++;
        } else {
          analysis.fieldValidation.newProviderId.invalid++;
          analysis.fieldValidation.newProviderId.errors.push(...errors);
        }
      }

      if (transaction.NEW_PRODUCT_SERVICE_ID) {
        const errors = validateNewProductServiceId(transaction.NEW_PRODUCT_SERVICE_ID);
        if (errors.length === 0) {
          analysis.fieldValidation.newProductServiceId.valid++;
        } else {
          analysis.fieldValidation.newProductServiceId.invalid++;
          analysis.fieldValidation.newProductServiceId.errors.push(...errors);
        }
      }

      // Track migration candidates
      if (transaction.requiresMigration) {
        analysis.migrationCandidates.push({
          id: transaction.id,
          transactionId: transaction.transactionId,
          migrationNeeded: {
            binNumber: !!transaction.legacyBinNumber,
            providerId: !!transaction.legacy_provider_id,
            productServiceId: !!transaction.LEGACY_PRODUCT_SERVICE_ID
          }
        });
      }

      // Track field length distributions
      [
        { field: 'binNumber', legacy: transaction.legacyBinNumber, new: transaction.newBinNumber },
        { field: 'providerId', legacy: transaction.legacy_provider_id, new: transaction.new_provider_id },
        { field: 'productServiceId', legacy: transaction.LEGACY_PRODUCT_SERVICE_ID, new: transaction.NEW_PRODUCT_SERVICE_ID }
      ].forEach(({ field, legacy, new: newValue }) => {
        if (legacy) {
          const length = legacy.length;
          analysis.fieldLengthDistribution[field][length] = (analysis.fieldLengthDistribution[field][length] || 0) + 1;
        }
        if (newValue) {
          const length = newValue.length;
          analysis.fieldLengthDistribution[field][length] = (analysis.fieldLengthDistribution[field][length] || 0) + 1;
        }
      });
    });

    return analysis;
  }, [
    transactions,
    validateLegacyBinNumber,
    validateNewBinNumber,
    validateLegacyProviderId,
    validateNewProviderId,
    validateLegacyProductServiceId,
    validateNewProductServiceId
  ]);

  // Data filtering and searching
  const handleSearch = useCallback((searchValue) => {
    setSearchTerm(searchValue);
    
    if (!searchValue.trim()) {
      setFilteredTransactions(transactions);
      return;
    }

    const filtered = transactions.filter(transaction => {
      const searchLower = searchValue.toLowerCase();
      return (
        transaction.transactionId?.toLowerCase().includes(searchLower) ||
        transaction.legacyBinNumber?.includes(searchValue) ||
        transaction.newBinNumber?.includes(searchValue) ||
        transaction.legacy_provider_id?.toLowerCase().includes(searchLower) ||
        transaction.new_provider_id?.toLowerCase().includes(searchLower) ||
        transaction.LEGACY_PRODUCT_SERVICE_ID?.toLowerCase().includes(searchLower) ||
        transaction.NEW_PRODUCT_SERVICE_ID?.toLowerCase().includes(searchLower) ||
        transaction.binNumberValue?.includes(searchValue) ||
        transaction.providerIdCode?.toLowerCase().includes(searchLower) ||
        transaction.productServiceIdentifier?.toLowerCase().includes(searchLower) ||
        transaction.bin_number_field?.includes(searchValue) ||
        transaction.provider_id_field?.toLowerCase().includes(searchLower) ||
        transaction.product_service_id_field?.toLowerCase().includes(searchLower) ||
        transaction.BIN_NUM?.includes(searchValue) ||
        transaction.PROVIDER_CODE?.toLowerCase().includes(searchLower) ||
        transaction.PROD_SVC_ID?.toLowerCase().includes(searchLower) ||
        transaction.customerName?.toLowerCase().includes(searchLower) ||
        transaction.customerEmail?.toLowerCase().includes(searchLower) ||
        transaction.status?.toLowerCase().includes(searchLower) ||
        transaction.type?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredTransactions(filtered);
  }, [transactions]);

  // Data refresh handler
  const handleRefreshData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const refreshedData = generateSampleTransactions();
      setTransactions(refreshedData);
      setFilteredTransactions(refreshedData);
      
      // Update field analysis
      const analysis = analyzeFieldData();
      setFieldAnalysis(analysis);
      
    } catch (error) {
      setError('Failed to refresh data');
      console.error('Data refresh error:', error);
    } finally {
      setLoading(false);
    }
  }, [generateSampleTransactions, analyzeFieldData]);

  // Field migration handler
  const handleFieldMigration = useCallback(async (transactionIds) => {
    setLoading(true);
    setMigrationProgress({ started: true, progress: 0, total: transactionIds.length });

    try {
      const updatedTransactions = [...transactions];
      
      for (let i = 0; i < transactionIds.length; i++) {
        const transactionId = transactionIds[i];
        const transactionIndex = updatedTransactions.findIndex(t => t.id === transactionId);
        
        if (transactionIndex !== -1) {
          const transaction = updatedTransactions[transactionIndex];
          
          // Migrate legacy fields to new format
          if (transaction.legacyBinNumber && !transaction.newBinNumber) {
            // Pad legacy 6-digit bin to 8 digits
            transaction.newBinNumber = transaction.legacyBinNumber.padStart(FIELD_CONSTRAINTS.NEW_BIN_LENGTH, '0');
          }
          
          if (transaction.legacy_provider_id && !transaction.new_provider_id) {
            // Convert legacy provider ID to new format
            transaction.new_provider_id = `MIGRATED-${transaction.legacy_provider_id}`;
          }
          
          if (transaction.LEGACY_PRODUCT_SERVICE_ID && !transaction.NEW_PRODUCT_SERVICE_ID) {
            // Convert legacy product/service ID to new format
            transaction.NEW_PRODUCT_SERVICE_ID = `MIGRATED-${transaction.LEGACY_PRODUCT_SERVICE_ID}`;
          }
          
          transaction.isLegacyFormat = false;
          transaction.requiresMigration = false;
          transaction.migrationTimestamp = new Date().toISOString();
        }
        
        // Update progress
        const progress = Math.round(((i + 1) / transactionIds.length) * 100);
        setMigrationProgress(prev => ({ ...prev, progress }));
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedTransactions);
      
      // Update field analysis
      const analysis = analyzeFieldData();
      setFieldAnalysis(analysis);
      
      setMigrationProgress(prev => ({ ...prev, completed: true }));
      
    } catch (error) {
      setError('Migration failed');
      console.error('Migration error:', error);
      setMigrationProgress(prev => ({ ...prev, error: true }));
    } finally {
      setLoading(false);
    }
  }, [transactions, analyzeFieldData]);

  // Row editing handlers
  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    const updatedTransactions = transactions.filter((row) => row.id !== id);
    setTransactions(updatedTransactions);
    setFilteredTransactions(updatedTransactions);
    
    if (onRowDelete) {
      onRowDelete(id);
    }
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const processRowUpdate = (newRow) => {
    const updatedTransactions = transactions.map((row) =>
      row.id === newRow.id ? newRow : row
    );
    setTransactions(updatedTransactions);
    setFilteredTransactions(updatedTransactions);
    
    if (onRowUpdate) {
      onRowUpdate(newRow);
    }
    
    return newRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  // Define grid columns
  const columns = useMemo(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      type: 'number'
    },
    {
      field: 'transactionId',
      headerName: 'Transaction ID',
      width: 130,
      editable: !readOnly
    },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      width: 160,
      type: 'dateTime',
      valueGetter: (params) => new Date(params.value)
    },
    {
      field: 'legacyBinNumber',
      headerName: 'Legacy Bin (6)',
      width: 120,
      editable: !readOnly,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {params.value}
          {params.value && validateLegacyBinNumber(params.value).length > 0 && (
            <Tooltip title="Validation errors">
              <WarningIcon color="warning" sx={{ ml: 1, fontSize: 16 }} />
            </Tooltip>
          )}
        </Box>
      )
    },
    {
      field: 'newBinNumber',
      headerName: 'New Bin (8)',
      width: 120,
      editable: !readOnly,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {params.value}
          {params.value && validateNewBinNumber(params.value).length > 0 && (
            <Tooltip title="Validation errors">
              <WarningIcon color="warning" sx={{ ml: 1, fontSize: 16 }} />
            </Tooltip>
          )}
        </Box>
      )
    },
    {
      field: 'legacy_provider_id',
      headerName: 'Legacy Provider (15)',
      width: 150,
      editable: !readOnly,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {params.value}
          {params.value && validateLegacyProviderId(params.value).length > 0 && (
            <Tooltip title="Validation errors">
              <WarningIcon color="warning" sx={{ ml: 1, fontSize: 16 }} />
            </Tooltip>
          )}
        </Box>
      )
    },
    {
      field: 'new_provider_id',
      headerName: 'New Provider (35)',
      width: 180,
      editable: !readOnly,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {params.value}
          {params.value && validateNewProviderId(params.value).length > 0 && (
            <Tooltip title="Validation errors">
              <WarningIcon color="warning" sx={{ ml: 1, fontSize: 16 }} />
            </Tooltip>
          )}
        </Box>
      )
    },
    {
      field: 'LEGACY_PRODUCT_SERVICE_ID',
      headerName: 'Legacy Product/Service (19)',
      width: 200,
      editable: !readOnly,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {params.value}
          {params.value && validateLegacyProductServiceId(params.value).length > 0 && (
            <Tooltip title="Validation errors">
              <WarningIcon color="warning" sx={{ ml: 1, fontSize: 16 }} />
            </Tooltip>
          )}
        </Box>
      )
    },
    {
      field: 'NEW_PRODUCT_SERVICE_ID',
      headerName: 'New Product/Service (40)',
      width: 220,
      editable: !readOnly,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {params.value}
          {params.value && validateNewProductServiceId(params.value).length > 0 && (
            <Tooltip title="Validation errors">
              <WarningIcon color="warning" sx={{ ml: 1, fontSize: 16 }} />
            </Tooltip>
          )}
        </Box>
      )
    },
    {
      field: 'binNumberValue',
      headerName: 'binNumberValue',
      width: 130,
      editable: !readOnly
    },
    {
      field: 'providerIdCode',
      headerName: 'providerIdCode',
      width: 140,
      editable: !readOnly
    },
    {
      field: 'productServiceIdentifier',
      headerName: 'productServiceIdentifier',
      width: 180,
      editable: !readOnly
    },
    {
      field: 'bin_number_field',
      headerName: 'bin_number_field',
      width: 130,
      editable: !readOnly
    },
    {
      field: 'provider_id_field',
      headerName: 'provider_id_field',
      width: 140,
      editable: !readOnly
    },
    {
      field: 'product_service_id_field',
      headerName: 'product_service_id_field',
      width: 180,
      editable: !readOnly
    },
    {
      field: 'BIN_NUM',
      headerName: 'BIN_NUM',
      width: 100,
      editable: !readOnly
    },
    {
      field: 'PROVIDER_CODE',
      headerName: 'PROVIDER_CODE',
      width: 130,
      editable: !readOnly
    },
    {
      field: 'PROD_SVC_ID',
      headerName: 'PROD_SVC_ID',
      width: 120,
      editable: !readOnly
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 100,
      type: 'number',
      editable: !readOnly,
      valueFormatter: (params) => `$${params.value?.toFixed(2) || '0.00'}`
    },
    {
      field: 'currency',
      headerName: 'Currency',
      width: 80,
      editable: !readOnly
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      editable: !readOnly,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'completed' ? 'success' :
            params.value === 'failed' ? 'error' :
            params.value === 'pending' ? 'warning' : 'default'
          }
          size="small"
        />
      )
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 100,
      editable: !readOnly
    },
    {
      field: 'customerName',
      headerName: 'Customer',
      width: 130,
      editable: !readOnly
    },
    {
      field: 'isLegacyFormat',
      headerName: 'Legacy Format',
      width: 120,
      type: 'boolean',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Legacy' : 'New'}
          color={params.value ? 'warning' : 'success'}
          size="small"
        />
      )
    },
    {
      field: 'requiresMigration',
      headerName: 'Needs Migration',
      width: 130,
      type: 'boolean',
      renderCell: (params) => (
        params.value ? (
          <Chip label="Yes" color="error" size="small" />
        ) : (
          <Chip label="No" color="success" size="small" />
        )
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{ color: 'primary.main' }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
            disabled={readOnly}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
            disabled={readOnly}
          />,
        ];
      },
    },
  ], [
    readOnly,
    rowModesModel,
    validateLegacyBinNumber,
    validateNewBinNumber,
    validateLegacyProviderId,
    validateNewProviderId,
    validateLegacyProductServiceId,
    validateNewProductServiceId
  ]);

  // Custom toolbar component
  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      {enableExport && <GridToolbarExport />}
      <Box sx={{ flexGrow: 1 }} />
      <Button
        startIcon={<RefreshIcon />}
        onClick={handleRefreshData}
        disabled={loading}
        size="small"
      >
        Refresh
      </Button>
      {showFieldMigration && (
        <Button
          startIcon={<UploadIcon />}
          onClick={() => setMigrationDialogOpen(true)}
          disabled={loading}
          size="small"
          color="secondary"
        >
          Migrate Fields
        </Button>
      )}
      <Button
        startIcon={<InfoIcon />}
        onClick={() => setFieldAnalysisDialogOpen(true)}
        size="small"
        color="info"
      >
        Field Analysis
      </Button>
    </GridToolbarContainer>
  );

  // Field analysis dialog content
  const renderFieldAnalysisDialog = () => {
    const analysis = fieldAnalysis;
    if (!analysis.totalRecords) return null;

    return (
      <Dialog open={fieldAnalysisDialogOpen} onClose={() => setFieldAnalysisDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Field Analysis Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Record Distribution
                  </Typography>
                  <Typography>Total Records: {analysis.totalRecords}</Typography>
                  <Typography>Legacy Format: {analysis.legacyRecords}</Typography>
                  <Typography>New Format: {analysis.newRecords}</Typography>
                  <Typography>Migration Candidates: {analysis.migrationCandidates?.length || 0}</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Field Validation Results
                  </Typography>
                  {Object.entries(analysis.fieldValidation || {}).map(([fieldName, validation]) => (
                    <Box key={fieldName} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">
                        {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Chip 
                          label={`Valid: ${validation.valid}`} 
                          color="success" 
                          size="small" 
                        />
                        <Chip 
                          label={`Invalid: ${validation.invalid}`} 
                          color="error" 
                          size="small" 
                        />
                      </Box>
                      {validation.errors.length > 0 && (
                        <Typography variant="caption" color="error" display="block">
                          {validation.errors.slice(0, 3).join(', ')}
                          {validation.errors.length > 3 && '...'}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFieldAnalysisDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Migration dialog content
  const renderMigrationDialog = () => (
    <Dialog open={migrationDialogOpen} onClose={() => setMigrationDialogOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>Field Migration</DialogTitle>
      <DialogContent>
        {migrationProgress.started ? (
          <Box>
            <Typography gutterBottom>
              Migration Progress: {migrationProgress.progress}% ({migrationProgress.progress}/{migrationProgress.total})
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={migrationProgress.progress} 
              sx={{ mb: 2 }}
            />
            {migrationProgress.completed && (
              <Alert severity="success">Migration completed successfully!</Alert>
            )}
            {migrationProgress.error && (
              <Alert severity="error">Migration failed. Please try again.</Alert>
            )}
          </Box>
        ) : (
          <Box>
            <Typography gutterBottom>
              This will migrate legacy field formats to new formats for selected transactions.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • Bin Number: 6 digits → 8 digits (padded with leading zeros)
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • Provider ID: 15 chars → 35 chars (prefixed with 'MIGRATED-')
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • Product/Service ID: 19 chars → 40 chars (prefixed with 'MIGRATED-')
            </Typography>
            
            <Typography sx={{ mt: 2 }} gutterBottom>
              {selectedRows.length} transaction(s) selected for migration.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setMigrationDialogOpen(false)}>
          {migrationProgress.completed ? 'Close' : 'Cancel'}
        </Button>
        {!migrationProgress.started && selectedRows.length > 0 && (
          <Button 
            onClick={() => handleFieldMigration(selectedRows)} 
            variant="contained"
            disabled={loading}
          >
            Start Migration
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ height: '100vh', width: '100%', p: 2 }}>
        <Paper sx={{ height: '100%', width: '100%' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
              Transaction Data Grid
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Comprehensive transaction data management with field migration capabilities
            </Typography>
            
            {/* Search and controls */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField
                label="Search transactions"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
                sx={{ minWidth: 300 }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                }
                label="Auto-refresh"
              />
              
              <Typography variant="body2" color="textSecondary">
                {filteredTransactions.length} of {transactions.length} transactions
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {loading && <LinearProgress sx={{ mb: 2 }} />}
          </Box>

          <DataGrid
            rows={filteredTransactions}
            columns={columns}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            slots={{
              toolbar: CustomToolbar,
            }}
            slotProps={{
              toolbar: { setRows: setTransactions, setRowModesModel },
            }}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(newSelection) => {
              setSelectedRows(newSelection);
            }}
            rowSelectionModel={selectedRows}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            filterModel={filterModel}
            onFilterModelChange={setFilterModel}
            pageSizeOptions={[25, 50, 100, 200]}
            density="standard"
            sx={{
              '& .MuiDataGrid-cell': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }
            }}
          />
        </Paper>

        {renderFieldAnalysisDialog()}
        {renderMigrationDialog()}
      </Box>
    </LocalizationProvider>
  );
};

TransactionDataGrid.propTypes = {
  initialData: PropTypes.array,
  onDataChange: PropTypes.func,
  onRowUpdate: PropTypes.func,
  onRowDelete: PropTypes.func,
  readOnly: PropTypes.bool,
  enableExport: PropTypes.bool,
  enableImport: PropTypes.bool,
  showFieldMigration: PropTypes.bool,
  autoRefresh: PropTypes.bool,
  refreshInterval: PropTypes.number,
  theme: PropTypes.string
};

export default TransactionDataGrid; 