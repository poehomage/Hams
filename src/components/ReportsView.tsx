import { FileText, AlertCircle, TrendingUp, Download, Eye } from 'lucide-react';
import { useState } from 'react';

interface ReportsViewProps {
  data: any[];
}

export function ReportsView({ data }: ReportsViewProps) {
  const [activeReport, setActiveReport] = useState<'newly-added' | 'missing-data'>('missing-data');

  return (
    <div className="space-y-6">
      {/* Report Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="mb-4">Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveReport('newly-added')}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              activeReport === 'newly-added'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className={`w-6 h-6 ${
                activeReport === 'newly-added' ? 'text-blue-600' : 'text-gray-600'
              }`} />
              <h3>Newly Added Items</h3>
            </div>
            <p className="text-sm text-gray-600">
              View items added in the last 10 days
            </p>
          </button>

          <button
            onClick={() => setActiveReport('missing-data')}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              activeReport === 'missing-data'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className={`w-6 h-6 ${
                activeReport === 'missing-data' ? 'text-blue-600' : 'text-gray-600'
              }`} />
              <h3>Missing Critical Data</h3>
            </div>
            <p className="text-sm text-gray-600">
              Analyze data completion for critical fields
            </p>
          </button>
        </div>
      </div>

      {/* Report Content */}
      {activeReport === 'newly-added' ? (
        <NewlyAddedReport data={data} />
      ) : (
        <MissingCriticalDataReport data={data} />
      )}
    </div>
  );
}

function NewlyAddedReport({ data }: { data: any[] }) {
  // Get items added in the last 10 days
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
  
  const newItems = data.filter(row => {
    // Check if row has a creation date field
    const dateFields = ['Date Created', 'Created Date', 'Created', '_addedDate'];
    
    for (const field of dateFields) {
      if (row[field]) {
        const itemDate = new Date(row[field]);
        if (!isNaN(itemDate.getTime()) && itemDate >= tenDaysAgo) {
          return true;
        }
      }
    }
    
    // Fallback: check if marked as new in current session
    return row._isNew === true;
  });

  // Get items added in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const itemsLast30Days = data.filter(row => {
    const dateFields = ['Date Created', 'Created Date', 'Created', '_addedDate'];
    
    for (const field of dateFields) {
      if (row[field]) {
        const itemDate = new Date(row[field]);
        if (!isNaN(itemDate.getTime()) && itemDate >= thirtyDaysAgo) {
          return true;
        }
      }
    }
    
    return row._isNew === true;
  });

  // Validation functions for critical data
  const isURL = (value: any) => {
    if (!value || typeof value !== 'string') return false;
    const str = value.toLowerCase().trim();
    return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('www.');
  };

  const isNumeric = (value: any) => {
    if (value === null || value === undefined || value === '') return false;
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  };

  const isCriticalDataReady = (row: any) => {
    const hasAWFront = isURL(row['AW_Front']);
    const hasPlacementFromCollar = isNumeric(row['Placement from Collar']);
    const hasSpecSheet = isURL(row['Spec_Sheet']);
    return hasAWFront && hasPlacementFromCollar && hasSpecSheet;
  };

  // Calculate ready vs not ready
  const readyItems = newItems.filter(row => isCriticalDataReady(row));
  const notReadyItems = newItems.filter(row => !isCriticalDataReady(row));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3>Newly Added Items</h3>
            <p className="text-sm text-gray-600 mt-1">
              Items added in the last 10 days
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl text-blue-600">{newItems.length}</div>
            <div className="text-sm text-gray-600">New Items</div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl text-green-700 mb-1">{readyItems.length}</div>
            <div className="text-sm text-green-700">Ready</div>
            <div className="text-xs text-green-600 mt-1">
              {newItems.length > 0 ? ((readyItems.length / newItems.length) * 100).toFixed(1) : 0}% of new items
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl text-red-700 mb-1">{notReadyItems.length}</div>
            <div className="text-sm text-red-700">Not Ready</div>
            <div className="text-xs text-red-600 mt-1">
              {newItems.length > 0 ? ((notReadyItems.length / newItems.length) * 100).toFixed(1) : 0}% of new items
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl text-blue-700 mb-1">{itemsLast30Days.length}</div>
            <div className="text-sm text-blue-700">Last 30 Days</div>
            <div className="text-xs text-blue-600 mt-1">
              Total new items
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {newItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No items added in the last 10 days</p>
            <p className="text-sm mt-2">
              Items with a creation date within the last 10 days will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 text-sm text-gray-600">Internal ID</th>
                  <th className="text-left p-3 text-sm text-gray-600">Display Name</th>
                  <th className="text-left p-3 text-sm text-gray-600">Blank Color</th>
                  <th className="text-left p-3 text-sm text-gray-600 hidden md:table-cell">Shopify Display Color</th>
                  <th className="text-left p-3 text-sm text-gray-600">Critical Data</th>
                  <th className="text-left p-3 text-sm text-gray-600 hidden md:table-cell">Added Date</th>
                </tr>
              </thead>
              <tbody>
                {newItems.map((row, index) => {
                  const isReady = isCriticalDataReady(row);
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-sm">{row['Internal ID'] || '-'}</td>
                      <td className="p-3 text-sm">{row['Display Name'] || '-'}</td>
                      <td className="p-3 text-sm">{row['Blank Color'] || '-'}</td>
                      <td className="p-3 text-sm hidden md:table-cell">{row['Shopify Display Color'] || '-'}</td>
                      <td className="p-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs ${
                          isReady 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {isReady ? 'Ready' : 'Not Ready'}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-600 hidden md:table-cell">
                        {row._addedDate ? new Date(row._addedDate).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MissingCriticalDataReport({ data }: { data: any[] }) {
  const [expandedField, setExpandedField] = useState<string | null>(null);
  
  // Define fields with their types
  const fieldConfig = [
    { name: 'AW_Front', type: 'url' as const },
    { name: 'Spec_Sheet', type: 'url' as const },
    { name: 'Placement from Collar', type: 'numeric' as const }
  ];
  
  const isURL = (value: any) => {
    if (!value || typeof value !== 'string') return false;
    const str = value.toLowerCase().trim();
    return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('www.');
  };

  const isNumeric = (value: any) => {
    if (value === null || value === undefined || value === '') return false;
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  };

  const hasValue = (value: any, type: 'url' | 'numeric') => {
    if (type === 'url') return isURL(value);
    if (type === 'numeric') return isNumeric(value);
    return false;
  };

  // Calculate statistics for each field
  const fieldStats = fieldConfig.map(field => {
    const totalRows = data.length;
    const rowsWithValue = data.filter(row => hasValue(row[field.name], field.type)).length;
    const rowsWithoutValue = totalRows - rowsWithValue;
    const percentageWithValue = totalRows > 0 ? (rowsWithValue / totalRows) * 100 : 0;
    const percentageWithoutValue = totalRows > 0 ? (rowsWithoutValue / totalRows) * 100 : 0;

    return {
      field: field.name,
      type: field.type,
      totalRows,
      rowsWithValue,
      rowsWithoutValue,
      percentageWithValue,
      percentageWithoutValue
    };
  });

  // Overall statistics
  const overallStats = {
    totalFields: fieldConfig.length * data.length,
    fieldsWithValue: fieldStats.reduce((sum, stat) => sum + stat.rowsWithValue, 0),
    fieldsWithoutValue: fieldStats.reduce((sum, stat) => sum + stat.rowsWithoutValue, 0)
  };
  const overallPercentageWithValue = overallStats.totalFields > 0 
    ? (overallStats.fieldsWithValue / overallStats.totalFields) * 100 
    : 0;
  const overallPercentageWithoutValue = overallStats.totalFields > 0 
    ? (overallStats.fieldsWithoutValue / overallStats.totalFields) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="mb-4">Overall Data Completion</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl mb-1">{data.length}</div>
            <div className="text-sm text-gray-600">Total Rows</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl text-green-600 mb-1">
              {overallPercentageWithValue.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">With Data</div>
            <div className="text-xs text-gray-500 mt-1">
              {overallStats.fieldsWithValue} of {overallStats.totalFields} fields
            </div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl text-red-600 mb-1">
              {overallPercentageWithoutValue.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Missing Data</div>
            <div className="text-xs text-gray-500 mt-1">
              {overallStats.fieldsWithoutValue} of {overallStats.totalFields} fields
            </div>
          </div>
        </div>
      </div>

      {/* Field-by-Field Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3>Field-by-Field Analysis</h3>
          <p className="text-sm text-gray-600 mt-1">
            Data completion status for each critical field
          </p>
        </div>
        <div className="p-6 space-y-6">
          {fieldStats.map(stat => (
            <div key={stat.field} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm">{stat.field}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {stat.type === 'url' ? 'URL Field' : 'Numeric Field'}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  {stat.rowsWithValue} / {stat.totalRows} rows
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="absolute left-0 top-0 h-full bg-green-500 transition-all"
                  style={{ width: `${stat.percentageWithValue}%` }}
                />
                <div 
                  className="absolute right-0 top-0 h-full bg-red-500 transition-all"
                  style={{ width: `${stat.percentageWithoutValue}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-3 text-xs text-white">
                  <span className="drop-shadow">
                    {stat.percentageWithValue.toFixed(1)}% Complete
                  </span>
                  <span className="drop-shadow">
                    {stat.percentageWithoutValue.toFixed(1)}% Missing
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-green-50 rounded">
                  <div className="text-green-700">
                    {stat.rowsWithValue} rows with data
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded">
                  <div className="text-red-700">
                    {stat.rowsWithoutValue} rows missing data
                  </div>
                </div>
              </div>

              {/* View Missing Rows Button */}
              {stat.rowsWithoutValue > 0 && (
                <button
                  onClick={() => setExpandedField(expandedField === stat.field ? null : stat.field)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {expandedField === stat.field ? 'Hide' : 'View'} rows missing {stat.field}
                </button>
              )}

              {/* Expanded View - Rows with Missing Data */}
              {expandedField === stat.field && (
                <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <p className="text-sm">
                      Rows missing <strong>{stat.field}</strong>
                    </p>
                  </div>
                  <div className="max-h-96 overflow-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left p-2 text-xs text-gray-600">Internal ID</th>
                          <th className="text-left p-2 text-xs text-gray-600">Display Name</th>
                          <th className="text-left p-2 text-xs text-gray-600">Blank Color</th>
                          <th className="text-left p-2 text-xs text-gray-600">{stat.field}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data
                          .filter(row => !hasValue(row[stat.field], stat.type))
                          .slice(0, 50)
                          .map((row, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="p-2 text-xs">{row['Internal ID'] || '-'}</td>
                              <td className="p-2 text-xs">{row['Display Name'] || '-'}</td>
                              <td className="p-2 text-xs">{row['Blank Color'] || '-'}</td>
                              <td className="p-2 text-xs text-red-600">
                                {row[stat.field] || '(empty)'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {data.filter(row => !hasValue(row[stat.field], stat.type)).length > 50 && (
                      <div className="p-3 bg-gray-50 text-center text-xs text-gray-600">
                        Showing first 50 of {data.filter(row => !hasValue(row[stat.field], stat.type)).length} rows
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Tip:</strong> Use this report to identify which rows need critical data updates. 
          You can filter the main data table to show only rows with missing information.
        </p>
      </div>
    </div>
  );
}