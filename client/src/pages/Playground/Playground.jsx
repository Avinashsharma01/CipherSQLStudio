import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../services/api';
import Header from '../../components/Header/Header';
import QuestionPanel from '../../components/QuestionPanel/QuestionPanel';
import SchemaViewer from '../../components/SchemaViewer/SchemaViewer';
import SQLEditor from '../../components/SQLEditor/SQLEditor';
import ResultsTable from '../../components/ResultsTable/ResultsTable';
import HintPanel from '../../components/HintPanel/HintPanel';
import './Playground.scss';

function Playground() {
  const { assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(true);

  // query execution state
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [queryError, setQueryError] = useState(null);
  const [queryLoading, setQueryLoading] = useState(false);

  // hint stuff
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  const [currentQuery, setCurrentQuery] = useState('');
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [assignmentRes, tablesRes] = await Promise.all([
          API.get(`/assignments/${assignmentId}`),
          API.get(`/assignments/${assignmentId}/tables`),
        ]);
        setAssignment(assignmentRes.data.data);
        setTables(tablesRes.data.data);
      } catch (err) {
        console.error('Failed to load assignment data:', err);
        setPageError('Could not load this assignment.');
      } finally {
        setTablesLoading(false);
      }
    }
    loadData();
  }, [assignmentId]);

  async function handleExecuteQuery(query) {
    setCurrentQuery(query);
    setQueryLoading(true);
    setQueryError(null);
    setColumns([]);
    setRows([]);

    try {
      const res = await API.post('/query/execute', { query });
      setColumns(res.data.columns);
      setRows(res.data.rows);
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong running the query';
      setQueryError(msg);
    } finally {
      setQueryLoading(false);
    }
  }

  async function handleGetHint() {
    setHintLoading(true);
    setHintVisible(true);
    try {
      const res = await API.post('/hint', {
        assignmentId,
        userQuery: currentQuery,
      });
      setHint(res.data.hint);
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not get hint right now';
      setHint(msg);
    } finally {
      setHintLoading(false);
    }
  }

  if (pageError) {
    return (
      <div className="playground">
        <Header />
        <main className="playground__main">
          <div className="playground__error">{pageError}</div>
          <Link to="/" className="playground__back-link">← Back to assignments</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="playground">
      <Header />
      <main className="playground__main">
        <div className="playground__container">
          <div className="playground__back">
            <Link to="/" className="playground__back-link">
              ← Back to assignments
            </Link>
          </div>

          <div className="playground__layout">
            {/* left - question + schema */}
            <div className="playground__sidebar">
              <QuestionPanel
                assignment={assignment}
                onGetHint={handleGetHint}
                hintLoading={hintLoading}
              />

              {hintVisible && (
                <HintPanel
                  hint={hint}
                  loading={hintLoading}
                  visible={hintVisible}
                  onClose={() => setHintVisible(false)}
                />
              )}

              <SchemaViewer tables={tables} loading={tablesLoading} />
            </div>

            {/* right - editor + results */}
            <div className="playground__workspace">
              <SQLEditor
                onExecute={handleExecuteQuery}
                loading={queryLoading}
              />
              <ResultsTable
                columns={columns}
                rows={rows}
                error={queryError}
                loading={queryLoading}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Playground;
