import './DifficultyBadge.scss';

function DifficultyBadge({ level }) {
  const modifier = level ? level.toLowerCase() : 'easy';
  return (
    <span className={`difficulty-badge difficulty-badge--${modifier}`}>
      {level}
    </span>
  );
}

export default DifficultyBadge;
