import './SchemaViewer.scss';

function SchemaViewer({ tables, loading }) {
  if (loading) {
    return (
      <div className="schema-viewer">
        <p className="schema-viewer__loading">Loading table info...</p>
      </div>
    );
  }

  if (!tables || tables.length === 0) {
    return (
      <div className="schema-viewer">
        <p className="schema-viewer__empty">No table data available.</p>
      </div>
    );
  }

  return (
    <div className="schema-viewer">
      <h3 className="schema-viewer__heading">Table Schema & Sample Data</h3>
      {tables.map((table) => (
        <div key={table.table_name} className="schema-viewer__table">
          <h4 className="schema-viewer__table-name">{table.table_name}</h4>

          <div className="schema-viewer__columns">
            <p className="schema-viewer__label">Columns:</p>
            <ul className="schema-viewer__column-list">
              {table.columns.map((col) => (
                <li key={col.column_name} className="schema-viewer__column-item">
                  <code>{col.column_name}</code>
                  <span className="schema-viewer__data-type">{col.data_type}</span>
                </li>
              ))}
            </ul>
          </div>

          {table.sample_data.length > 0 && (
            <div className="schema-viewer__sample">
              <p className="schema-viewer__label">Sample Data:</p>
              <div className="schema-viewer__table-wrapper">
                <table className="schema-viewer__data-table">
                  <thead>
                    <tr>
                      {Object.keys(table.sample_data[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.sample_data.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, j) => (
                          <td key={j}>{val !== null ? String(val) : 'NULL'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default SchemaViewer;
