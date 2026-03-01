import './QuestionPanel.scss';
import DifficultyBadge from '../DifficultyBadge/DifficultyBadge';

function QuestionPanel({ assignment, onGetHint, hintLoading }) {
  if (!assignment) return null;

  return (
    <div className="question-panel">
      <div className="question-panel__header">
        <h2 className="question-panel__title">{assignment.title}</h2>
        <DifficultyBadge level={assignment.difficulty} />
      </div>
      <p className="question-panel__description">{assignment.description}</p>
      <div className="question-panel__actions">
        <button
          className="question-panel__hint-btn"
          onClick={onGetHint}
          disabled={hintLoading}
        >
          {hintLoading ? 'Thinking...' : 'Get Hint'}
        </button>
      </div>
    </div>
  );
}

export default QuestionPanel;
