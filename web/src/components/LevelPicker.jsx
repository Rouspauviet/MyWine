// Choix du niveau de dégustateur — adapte le formulaire, ne juge pas
import { LEVELS } from '../data/levels'

export default function LevelPicker({ value, onChange }) {
  return (
    <div className="level-list" role="radiogroup" aria-label="Ton niveau">
      {LEVELS.map(level => (
        <button
          type="button"
          key={level.value}
          role="radio"
          aria-checked={value === level.value}
          className={`level-card ${value === level.value ? 'active' : ''}`}
          onClick={() => onChange(level.value)}
        >
          <span className="level-label">{level.label}</span>
          <span className="level-desc">{level.description}</span>
        </button>
      ))}
    </div>
  )
}
