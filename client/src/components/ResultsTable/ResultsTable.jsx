import './ResultsTable.scss';

function ResultsTable({ columns, rows, error, loading }) {
  if (loading) {
    return (
      <div className="results-table">
        <div className="results-table__status results-table__status--loading">
          Running query...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-table">
        <div className="results-table__status results-table__status--error">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!columns || columns.length === 0) {
    return (
      <div className="results-table">
        <div className="results-table__status results-table__status--empty">
          Run a query to see results here.
        </div>
      </div>
    );
  }

  return (
    <div className="results-table">
      <div className="results-table__header">
        <span className="results-table__title">Results</span>
        <span className="results-table__count">{rows.length} row(s)</span>
      </div>
      <div className="results-table__wrapper">
        <table className="results-table__table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col}>
                    {row[col] != null ? String(row[col]) : 'NULL'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResultsTable;
