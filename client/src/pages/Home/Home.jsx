import { useState, useEffect } from 'react';
import API from '../../services/api';
import Header from '../../components/Header/Header';
import AssignmentCard from '../../components/AssignmentCard/AssignmentCard';
import './Home.scss';

function Home() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    try {
      setLoading(true);
      const res = await API.get('/assignments');
      setAssignments(res.data.data);
    } catch (err) {
      console.error('Failed to load assignments:', err);
      setError('Could not load assignments. Is the server running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="home">
      <Header />
      <main className="home__main">
        <div className="home__container">
          <div className="home__intro">
            <h1 className="home__title">SQL Assignments</h1>
            <p className="home__subtitle">
              Pick an assignment and start practicing SQL.
            </p>
          </div>

          {loading && (
            <div className="home__loading">Loading assignments...</div>
          )}

          {error && <div className="home__error">{error}</div>}

          {!loading && !error && assignments.length === 0 && (
            <div className="home__empty">
              No assignments found. Run the seed script first.
            </div>
          )}

          {!loading && !error && assignments.length > 0 && (
            <div className="home__grid">
              {assignments.map((a) => (
                <AssignmentCard key={a._id} assignment={a} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
