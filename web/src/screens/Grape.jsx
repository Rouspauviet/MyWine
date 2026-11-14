// Fiche cépage — le profil typique d'un cépage de la base : structure, arômes, voisins, régions.
// On y arrive en touchant un cépage (comparaison, carte des saveurs, "Mon palais", entraînement).
// Ce sont des tendances : la fiche le rappelle.
import { useNavigate, useParams } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { Screen, Header, Body, Footer, Card, useAsync } from '../components/Layout'
import { ProfileChart } from '../components/Charts'
import FlavorMap from '../components/FlavorMap'
import FranceMap from '../components/FranceMap'
import * as db from '../db/db'
import { findGrape, grapeKey, STYLE_LABELS } from '../data/wineKnowledge'
import { fineProfile } from '../data/grapeProfiles'
import { typicalAxes } from '../utils/profile'

export const grapePath = (name) => `/grape/${encodeURIComponent(name)}`

export default function Grape() {
  const navigate = useNavigate()
  const { name } = useParams()
  const grape = findGrape(name)
  const { data: records } = useAsync(() => db.listRecords(), [])
  const back = () => navigate(-1)

  if (!grape) {
    return (
      <Screen>
        <Header title={name} onBack={back} />
        <div className="empty">
          <p className="empty-title">Ce cépage n'est pas encore dans la base</p>
          <p className="empty-text">La base décrit une trentaine de cépages courants. Les autres viendront.</p>
        </div>
      </Screen>
    )
  }

  const fine = fineProfile(grape) ?? { notes: [], regions: [], abroad: [] }
  const neighbors = grape.confusables.map(findGrape).filter(g => g && g.color === grape.color).map(g => g.name)
  const key = grapeKey(grape.name)
  const mine = (records ?? []).filter(r => r.status === 'done' && (r.reality?.grapes ?? []).some(g => grapeKey(g) === key))
  const ratings = mine.map(r => r.style?.rating).filter(Boolean)
  const average = ratings.length ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1).replace('.', ',') : null

  return (
    <Screen>
      <Header title={grape.name} label={`${grape.color === 'rouge' ? 'Cépage rouge' : 'Cépage blanc'} · ${STYLE_LABELS[grape.style]}`} onBack={back} />
      <Body>
        <Card title="Son profil typique">
          <p className="lesson-text">{grape.about}</p>
          <ProfileChart solo profile={{ axes: typicalAxes(grape) }} />
          <div className="profile-aromas">
            <span className="track-label">Ce qu'on y sent souvent</span>
            <div className="chips">
              {fine.notes.map(note => <span key={note} className="chip static found">{note}</span>)}
              {grape.aromas.map(family => <span key={family} className="chip static">{family}</span>)}
            </div>
          </div>
          <p className="muted left">Repères généraux : chaque vin a le droit de s'en écarter.</p>
        </Card>

        <Card title="Ses voisins en bouche">
          <FlavorMap color={grape.color} real={grape.name} near={neighbors} onPick={n => navigate(grapePath(n))} />
          {neighbors.length > 0 && (
            <p className="lesson-text">
              À l'aveugle, on le confond souvent avec :{' '}
              {neighbors.map((n, i) => (
                <span key={n}>{i > 0 && ', '}<button type="button" className="text-link" onClick={() => navigate(grapePath(n))}>{n}</button></span>
              ))}.
            </p>
          )}
        </Card>

        {(fine.regions.length > 0 || fine.abroad.length > 0) && (
          <Card title="Où on le trouve">
            {fine.regions.length > 0 && <FranceMap marked={fine.regions} />}
            {fine.abroad.length > 0 && <p className="lesson-text"><strong>Hors de France.</strong> {fine.abroad.join(', ')}.</p>}
          </Card>
        )}

        {mine.length > 0 && (
          <Card title="Dans mon journal">
            <p className="lesson-text">
              {mine.length} {mine.length > 1 ? 'bouteilles' : 'bouteille'}{average ? `, note moyenne ${average} ★` : ''}.
            </p>
            <button className="btn btn-ghost block" onClick={() => navigate(`/journal?q=${encodeURIComponent(grape.name)}`)}>Voir ces bouteilles</button>
          </Card>
        )}
      </Body>
      <Footer>
        <button className="btn btn-secondary grow" onClick={() => navigate('/quiz')}>
          <GraduationCap size={18} /> M'entraîner à reconnaître les cépages
        </button>
      </Footer>
    </Screen>
  )
}
