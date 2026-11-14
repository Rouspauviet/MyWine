// Entraînement — reconnaître un cépage à son profil : structure et arômes, quatre propositions.
// Les leurres sont les cépages qu'on confond vraiment avec lui. Ni score ni série : on apprend, on ne compte pas.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { Screen, Header, Body, Footer, Card } from '../components/Layout'
import { ProfileChart } from '../components/Charts'
import { GRAPES, findGrape } from '../data/wineKnowledge'
import { fineProfile } from '../data/grapeProfiles'
import { typicalAxes } from '../utils/profile'
import { grapePath } from './Grape'

const CHOICES = 4

const shuffle = (list) => {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Une question : un cépage à trouver, entouré de ceux qu'on confond avec lui
function newQuestion(previous) {
  const pool = GRAPES.filter(g => fineProfile(g) && g.name !== previous)
  const grape = pool[Math.floor(Math.random() * pool.length)]
  const close = grape.confusables.map(findGrape).filter(g => g && g.color === grape.color).map(g => g.name)
  const others = shuffle(GRAPES.filter(g => g.color === grape.color && g.name !== grape.name && !close.includes(g.name)).map(g => g.name))
  return { grape, options: shuffle([grape.name, ...[...close, ...others].slice(0, CHOICES - 1)]) }
}

export default function Quiz() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState(() => newQuestion(null))
  const [picked, setPicked] = useState(null)
  const { grape, options } = question
  const fine = fineProfile(grape)
  const right = picked === grape.name

  const next = () => { setQuestion(newQuestion(grape.name)); setPicked(null) }

  return (
    <Screen>
      <Header title="Quel cépage ?" label="Entraînement" onBack={() => navigate(-1)} />
      <Body>
        <Card title={grape.color === 'rouge' ? 'Un rouge qui ressemble à ça' : 'Un blanc qui ressemble à ça'}>
          <ProfileChart solo profile={{ axes: typicalAxes(grape) }} />
          <div className="profile-aromas">
            <span className="track-label">On y sent souvent</span>
            <div className="chips">{fine.notes.map(note => <span key={note} className="chip static">{note}</span>)}</div>
          </div>
        </Card>

        <div className="level-list" role="radiogroup" aria-label="Cépage">
          {options.map(name => {
            const state = !picked ? '' : name === grape.name ? 'right' : name === picked ? 'wrong' : ''
            return (
              <button key={name} type="button" role="radio" aria-checked={picked === name} disabled={!!picked} className={`level-card ${state}`} onClick={() => setPicked(name)}>
                <span className="level-label">{name}{state === 'right' && <> <Check size={16} /></>}</span>
              </button>
            )
          })}
        </div>

        {picked && (
          <Card title={right ? 'C\'est bien lui' : `C'était le cépage ${grape.name}`}>
            <p className="lesson-text">{grape.about}</p>
            {!right && <p className="muted left">Ces deux cépages se ressemblent vraiment : les confondre est courant.</p>}
            <button className="btn btn-ghost block" onClick={() => navigate(grapePath(grape.name))}>Voir sa fiche</button>
          </Card>
        )}
      </Body>
      <Footer>
        <button className="btn btn-primary grow" disabled={!picked} onClick={next}>
          Un autre <ArrowRight size={18} />
        </button>
      </Footer>
    </Screen>
  )
}
