import './HintPanel.scss';

function HintPanel({ hint, loading, visible, onClose }) {
  if (!visible) return null;

  return (
    <div className="hint-panel">
      <div className="hint-panel__header">
        <h4 className="hint-panel__title">Hint</h4>
        <button className="hint-panel__close" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="hint-panel__body">
        {loading
          ? <p className="hint-panel__loading">Generating hint...</p>
          : <p className="hint-panel__text">{hint}</p>
        }
      </div>
    </div>
  );
}

export default HintPanel;
