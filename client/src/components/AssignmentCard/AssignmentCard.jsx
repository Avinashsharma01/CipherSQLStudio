import { useNavigate } from 'react-router-dom';
import DifficultyBadge from '../DifficultyBadge/DifficultyBadge';
import './AssignmentCard.scss';

function AssignmentCard({ assignment }) {
  const navigate = useNavigate();

  return (
    <div className="assignment-card" onClick={() => navigate(`/playground/${assignment._id}`)}>
      <div className="assignment-card__header">
        <DifficultyBadge level={assignment.difficulty} />
      </div>
      <h3 className="assignment-card__title">{assignment.title}</h3>
      <p className="assignment-card__description">{assignment.description}</p>
      <div className="assignment-card__footer">
        <span className="assignment-card__tables">
          Tables: {assignment.tables_used.join(', ')}
        </span>
        <span className="assignment-card__arrow">→</span>
      </div>
    </div>
  );
}

export default AssignmentCard;
