
import { useState } from 'react';
import './App.css';

// Standaard werkdagen state
// (deze code hoort in de App component, niet op module-niveau)

const medewerkerKleuren = [
  '#1976d2', // Jan
  '#e57373', // Sanne
  '#81c784', // Mila
  '#ffb74d', // Piet
  '#ba68c8', // Fatima
  '#4db6ac', // Ali
  '#ffd54f', // Kees
  '#64b5f6', // Lisa
  '#a1887f', // Tom
];
const personeel = [
  { naam: 'Jan', rol: 'Winkel', kleur: medewerkerKleuren[0] },
  { naam: 'Sanne', rol: 'Winkel', kleur: medewerkerKleuren[1] },
  { naam: 'Mila', rol: 'Winkel', kleur: medewerkerKleuren[2] },
  { naam: 'Piet', rol: 'Monteur', kleur: medewerkerKleuren[3] },
  { naam: 'Fatima', rol: 'Monteur', kleur: medewerkerKleuren[4] },
  { naam: 'Ali', rol: 'Monteur', kleur: medewerkerKleuren[5] },
  { naam: 'Kees', rol: 'Bezorger', kleur: medewerkerKleuren[6] },
  { naam: 'Lisa', rol: 'Bezorger', kleur: medewerkerKleuren[7] },
  { naam: 'Tom', rol: 'Bezorger', kleur: medewerkerKleuren[8] },
];

const dagen = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
const diensten = ['Ochtend', 'Middag'];


// Voeg vrijdagavond toe als extra dienst voor de winkel
const dagenMetAvond = [...dagen];
const dienstenPerDag = dag => {
  if (dag === 'Vrijdag') return ['Ochtend', 'Middag', 'Avond'];
  return ['Ochtend', 'Middag'];
};

// Kleuren voor nieuwe medewerkers
const beschikbareKleuren = [
  '#1976d2', '#e57373', '#81c784', '#ffb74d', '#ba68c8', '#4db6ac', '#ffd54f', '#64b5f6', '#a1887f',
  '#f06292', '#9575cd', '#aed581', '#ff8a65', '#90caf9', '#a5d6a7', '#fff176', '#bcaaa4', '#b2dfdb', '#fbc02d', '#388e3c'
];


// Genereer roosterPerWeek dummydata voor 50 weken vanaf 1 juli 2025
function getWeekRange(startDate, weekNum) {
  const start = new Date(startDate.getTime() + (weekNum * 7 * 24 * 60 * 60 * 1000));
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  const maanden = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
  function fmt(d) {
    return d.getDate() + ' ' + maanden[d.getMonth()];
  }
  return fmt(start) + ' - ' + fmt(end) + ' ' + start.getFullYear();
}

const roosterPerWeek = {};
const startDatum = new Date(2025, 6, 1); // 1 juli 2025
const winkelNamen = personeel.filter(p => p.rol === 'Winkel').map(p => p.naam);
const monteurNamen = personeel.filter(p => p.rol === 'Monteur').map(p => p.naam);
const bezorgerNamen = personeel.filter(p => p.rol === 'Bezorger').map(p => p.naam);

for (let w = 0; w < 50; w++) {
  const weekLabel = getWeekRange(startDatum, w);
  roosterPerWeek[weekLabel] = {};
  dagen.forEach((dag, dIdx) => {
    roosterPerWeek[weekLabel][dag] = {};
    const diensten = dienstenPerDag(dag);
    diensten.forEach((dienst, diIdx) => {
      // Wissel medewerkers per week/dag/dienst voor variatie
      const winkel = [winkelNamen[(w + dIdx + diIdx) % winkelNamen.length]];
      if (dienst === 'Ochtend') winkel.push(winkelNamen[(w + dIdx + diIdx + 1) % winkelNamen.length]);
      const monteur = [monteurNamen[(w + dIdx + diIdx) % monteurNamen.length]];
      if (dienst === 'Ochtend') monteur.push(monteurNamen[(w + dIdx + diIdx + 1) % monteurNamen.length]);
      const bezorger = [bezorgerNamen[(w + dIdx + diIdx) % bezorgerNamen.length]];
      if (dienst === 'Ochtend') bezorger.push(bezorgerNamen[(w + dIdx + diIdx + 1) % bezorgerNamen.length]);
      roosterPerWeek[weekLabel][dag][dienst] = {
        Winkel: dienst === 'Avond' ? [winkelNamen[(w + dIdx + diIdx) % winkelNamen.length]] : winkel,
        Monteur: dienst === 'Avond' ? [] : monteur,
        Bezorger: dienst === 'Avond' ? [] : bezorger,
      };
    });
  });
}



// Dummy gebruikers: 3 beheerders, rest medewerkers
const gebruikers = [
  { naam: 'Jan', rol: 'beheerder', wachtwoord: 'jan123' },
  { naam: 'Fatima', rol: 'beheerder', wachtwoord: 'fatima123' },
  { naam: 'Lisa', rol: 'beheerder', wachtwoord: 'lisa123' },
  { naam: 'Anita', rol: 'beheerder', wachtwoord: 'test123' },
  { naam: 'Sanne', rol: 'medewerker', wachtwoord: 'sanne123' },
  { naam: 'Mila', rol: 'medewerker', wachtwoord: 'mila123' },
  { naam: 'Piet', rol: 'medewerker', wachtwoord: 'piet123' },
  { naam: 'Ali', rol: 'medewerker', wachtwoord: 'ali123' },
  { naam: 'Kees', rol: 'medewerker', wachtwoord: 'kees123' },
  { naam: 'Tom', rol: 'medewerker', wachtwoord: 'tom123' },
];

function TabTable({ type, rooster, dagen, isBeheerder, onEdit, zoekterm, highlight, setHighlight, vakantieAanvragen, week }) {
  // type: 'Winkel', 'Monteur', 'Bezorger'
  // rooster: roosterData[week]
  // dagen: ['Maandag', ...]
  // zoekterm: string
  // highlight: {dag, dienst} | null
  // setHighlight: fn
  // vakantieAanvragen: array
  // week: string

  // Verzamel alle unieke diensten voor deze week, maar alleen 'Avond' tonen bij type 'Winkel'
  const alleDiensten = Array.from(new Set(
    dagen.flatMap(dag => {
      const diensten = dienstenPerDag(dag);
      if (type !== 'Winkel') {
        // Filter 'Avond' eruit voor monteurs en bezorgers
        return diensten.filter(d => d !== 'Avond');
      }
      return diensten;
    })
  ));

  // Responsive cell style
  const cellStyle = {
    padding: 'clamp(4px, 1.5vw, 10px)',
    fontSize: 'clamp(13px, 2vw, 16px)',
    minWidth: 'clamp(70px, 13vw, 120px)',
    boxSizing: 'border-box',
    wordBreak: 'break-word',
    textAlign: 'left',
  };
  const dienstCellStyle = {
    ...cellStyle,
    fontWeight: 500,
    background: '#fafdff',
    minWidth: 'clamp(60px, 10vw, 100px)'
  };
  const thStyle = {
    ...cellStyle,
    fontWeight: 600,
    color: '#1976d2',
    background: '#f5faff',
    fontSize: 'clamp(14px, 2vw, 16px)'
  };
  // Popover state per cel
  const [popover, setPopover] = useState(null); // {dag, dienst, anchor}
  const [popoverGeselecteerd, setPopoverGeselecteerd] = useState([]);
  const [popoverOpslaanAnim, setPopoverOpslaanAnim] = useState(false);

  // Helper: open popover
  function openPopover(e, dag, dienst) {
    e.stopPropagation();
    const aanwezig = rooster && rooster[dag] && rooster[dag][dienst] && rooster[dag][dienst][type] ? rooster[dag][dienst][type] : [];
    setPopover({ dag, dienst, anchor: e.currentTarget });
    setPopoverGeselecteerd(aanwezig);
  }
  // Helper: opslaan popover
  function savePopover() {
    if (!popover) return;
    onEdit(popover.dag, popover.dienst, type);
    setTimeout(() => {
      // Sla direct op via editModal
      setPopover(null);
      setPopoverOpslaanAnim(true);
      setTimeout(() => setPopoverOpslaanAnim(false), 800);
    }, 0);
  }
  // Helper: annuleer popover
  function cancelPopover() {
    setPopover(null);
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #eee', marginBottom: 24, fontSize: 'clamp(13px, 2vw, 16px)', overflow: 'visible' }}>
      <thead>
        <tr>
          <th style={thStyle}>Dienst</th>
          {dagen.map(dag => (
            <th key={dag} style={thStyle}>{dag}</th>
          ))}
        </tr>
      </thead>
      <tbody style={{ overflow: 'visible' }}>
        {alleDiensten.map(dienst => (
          <tr key={dienst} style={{ background: highlight && highlight.dienst === dienst ? '#e3f0fc' : '#fff', transition: 'background 0.2s', overflow: 'visible' }}>
            <td style={dienstCellStyle}>{dienst}</td>
            {dagen.map(dag => {
              const aanwezig = rooster && rooster[dag] && rooster[dag][dienst] && rooster[dag][dienst][type] ? rooster[dag][dienst][type] : [];
              const aanwezigFiltered = zoekterm ? aanwezig.filter(n => n.toLowerCase().includes(zoekterm.toLowerCase())) : aanwezig;
              // Popover open?
              const isPopover = popover && popover.dag === dag && popover.dienst === dienst;
              return (
                <td
                  key={dag}
                  style={{
                    ...cellStyle,
                    borderBottom: '1px solid #eee',
                    position: 'relative',
                    cursor: isBeheerder ? 'pointer' : 'default',
                    background: isPopover ? '#e3f0fc' : undefined,
                    transition: 'background 0.2s',
                    overflow: 'visible',
                  }}
                  onMouseEnter={() => isBeheerder && setHighlight && setHighlight({ dag, dienst })}
                  onMouseLeave={() => isBeheerder && setHighlight && setHighlight(null)}
                  onClick={isBeheerder ? e => openPopover(e, dag, dienst) : undefined}
                >
                  {/* Potlood-icoon rechtsboven */}
                  {isBeheerder && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 18,
                        height: 18,
                        background: '#fafdff',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 2px #eee',
                        cursor: 'pointer',
                        zIndex: 2,
                        opacity: 0.7,
                        transition: 'opacity 0.2s',
                      }}
                      title="Bewerk deze dienst"
                      onClick={e => openPopover(e, dag, dienst)}
                    >
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M3 17h14M12.5 5.5l2 2M7 15l7.1-7.1a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0L4 12.1V15h3Z" stroke="#1976d2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  )}
                  {aanwezigFiltered.length > 0 && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {aanwezigFiltered.map(naam => {
                        const p = personeel.find(p => p.naam === naam);
                        return (
                          <li key={naam} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 14, height: 14, borderRadius: 3, background: p ? p.kleur : '#ccc', display: 'inline-block', border: '1px solid #ccc' }}></span>
                            <span style={{ fontSize: 'clamp(12px, 1.7vw, 15px)' }}>{naam}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {/* Popover in de cel */}
                  {isPopover && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 28,
                        left: 0,
                        minWidth: 180,
                        background: '#fff',
                        border: '1.5px solid #1976d2',
                        borderRadius: 8,
                        boxShadow: '0 4px 16px #b3d1f7',
                        zIndex: 100,
                        padding: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        maxHeight: '60vh',
                        overflowY: 'auto',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <div style={{ fontWeight: 600, color: '#1976d2', marginBottom: 6, fontSize: 15 }}>Bewerk dienst</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {personeel.filter(p => p.rol === type).map(optie => (
                          <label key={optie.naam} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                            <input
                              type="checkbox"
                              checked={popoverGeselecteerd.includes(optie.naam)}
                              onChange={e => {
                                setPopoverGeselecteerd(g => {
                                  if (e.target.checked) return [...g, optie.naam];
                                  return g.filter(n => n !== optie.naam);
                                });
                              }}
                            />
                            <span style={{ width: 14, height: 14, borderRadius: 3, background: optie.kleur, display: 'inline-block', border: '1px solid #ccc' }}></span>
                            {optie.naam}
                          </label>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                        <button onClick={cancelPopover} style={{ padding: '5px 14px', borderRadius: 4, border: '1px solid #bbb', background: '#f5f5f5', cursor: 'pointer', fontSize: 14 }}>Annuleren</button>
                        <button
                          onClick={() => {
                            // Sla direct op in roosterData
                            onEdit(dag, dienst, type, popoverGeselecteerd);
                            setTimeout(() => {
                              setPopover(null);
                              setPopoverOpslaanAnim(true);
                              setTimeout(() => setPopoverOpslaanAnim(false), 800);
                            }, 0);
                          }}
                          style={{ padding: '5px 14px', borderRadius: 4, border: '1.5px solid #1976d2', background: '#1976d2', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                        >Opslaan</button>
                      </div>
                      {popoverOpslaanAnim && (
                        <div style={{ color: '#388e3c', fontWeight: 600, fontSize: 14, marginTop: 4 }}>Opgeslagen!</div>
                      )}
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function App() {
  // Medewerker beheer modal state
  const [showMedewerkerModal, setShowMedewerkerModal] = useState(false);
  const [medewerkerForm, setMedewerkerForm] = useState({ naam: '', rol: 'Winkel', kleur: beschikbareKleuren[0], wachtwoord: '' });
  const [medewerkerEditIndex, setMedewerkerEditIndex] = useState(null); // null = toevoegen, anders index in personeel array
  const [medewerkerFout, setMedewerkerFout] = useState('');
  const [medewerkerSuccess, setMedewerkerSuccess] = useState('');
  const [medewerkerVerwijderPopup, setMedewerkerVerwijderPopup] = useState(false);
  const [personeelState, setPersoneelState] = useState(personeel);
  const [gebruikersState, setGebruikersState] = useState(gebruikers);
  // Vakantie-aanvragen state
  const [vakantieAanvragen, setVakantieAanvragen] = useState([]);
  const [showVakantieModal, setShowVakantieModal] = useState(false);
  const [vakantieVan, setVakantieVan] = useState('');
  const [vakantieTot, setVakantieTot] = useState('');
  const [vakantieOpmerking, setVakantieOpmerking] = useState('');
  const [vakantieFout, setVakantieFout] = useState('');
  const [vakantieSuccess, setVakantieSuccess] = useState('');
  // Overlay voor vakantie-aanvragen (beheerder)
  const [showVakantieOverlay, setShowVakantieOverlay] = useState(false);
  // Standaard werkdagen beheer (modal)
  const [showStandaardModal, setShowStandaardModal] = useState(false);
  const [standaardEdit, setStandaardEdit] = useState(null);

  // Dummy in-memory opslag voor standaard werkdagen per medewerker
  const [standaardWerkdagen, setStandaardWerkdagen] = useState(() => {
    // Initieel: iedereen werkt alle dagen
    const obj = {};
    personeelState.forEach(p => { obj[p.naam] = [...dagen]; });
    return obj;
  });

  function openStandaardModal(naam) {
    if (!user || user.rol !== 'beheerder') return;
    setStandaardEdit({ naam, geselecteerd: standaardWerkdagen[naam] || [] });
    setShowStandaardModal(true);
  }

  function saveStandaardWerkdagen() {
    if (!user || user.rol !== 'beheerder') return;
    if (!standaardEdit) return;
    // Check of er daadwerkelijk iets gewijzigd is
    const oude = standaardWerkdagen[standaardEdit.naam] || [];
    const nieuw = standaardEdit.geselecteerd;
    const gewijzigd = oude.length !== nieuw.length || oude.some(d => !nieuw.includes(d)) || nieuw.some(d => !oude.includes(d));
    if (gewijzigd) {
      if (!window.confirm(`Weet je zeker dat je de standaard werkdagen van ${standaardEdit.naam} wilt aanpassen?`)) {
        return;
      }
    }
    setStandaardWerkdagen(prev => ({ ...prev, [standaardEdit.naam]: nieuw }));
    setShowStandaardModal(false);
    setStandaardEdit(null);
  }

  // Bepaal tab-rol mapping
  const rolToTab = {
    Winkel: 'Winkel',
    Monteur: 'Monteur',
    Bezorger: 'Bezorger',
  };
  const [tab, setTab] = useState('Winkel');
  const [week, setWeek] = useState('1-7 juli 2025');
  const weken = Object.keys(roosterPerWeek);
  const [user, setUser] = useState(null);
  const [loginNaam, setLoginNaam] = useState('');
  const [loginWachtwoord, setLoginWachtwoord] = useState('');
  const [loginFout, setLoginFout] = useState('');
  const [roosterData, setRoosterData] = useState(roosterPerWeek);
  const [editModal, setEditModal] = useState(null); // {dag, dienst, type, value}
  const [highlight, setHighlight] = useState(null); // {dag, dienst}
  const [zoekterm, setZoekterm] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  function handleLogin(e) {
    e.preventDefault();
    const found = gebruikers.find(g => g.naam === loginNaam && g.wachtwoord === loginWachtwoord);
    if (found) {
      setUser(found);
      setLoginFout('');
      // Medewerker? Zet tab automatisch op juiste rol
      if (found.rol === 'medewerker') {
        // Zoek de rol van het personeel
        const p = personeel.find(p => p.naam === found.naam);
        if (p && rolToTab[p.rol]) setTab(rolToTab[p.rol]);
      }
    } else {
      setLoginFout('Ongeldige inloggegevens');
    }
  }

  function handleLogout() {
    setUser(null);
    setLoginNaam('');
    setLoginWachtwoord('');
    setLoginFout('');
    setTab('Winkel');
    setZoekterm('');
    setHighlight(null);
  }

// Nieuwe handleEdit voor popover: direct roosterData aanpassen
function handleEdit(dag, dienst, type, geselecteerd) {
  setRoosterData(prev => {
    const nieuw = JSON.parse(JSON.stringify(prev));
    if (!nieuw[week][dag][dienst][type]) nieuw[week][dag][dienst][type] = [];
    nieuw[week][dag][dienst][type] = geselecteerd;
    return nieuw;
  });
  setShowSaved(true);
  setDirty(false);
  setTimeout(() => setShowSaved(false), 1200);
}

  function handleEditSave() {
    if (!editModal) return;
    setRoosterData(prev => {
      const nieuw = JSON.parse(JSON.stringify(prev));
      if (!nieuw[week][editModal.dag][editModal.dienst][editModal.type]) nieuw[week][editModal.dag][editModal.dienst][editModal.type] = [];
      nieuw[week][editModal.dag][editModal.dienst][editModal.type] = editModal.geselecteerd;
      return nieuw;
    });
    setEditModal(null);
    setShowSaved(true);
    setDirty(false);
    setTimeout(() => setShowSaved(false), 1500);
  }

  function handleEditCancel() {
    setEditModal(null);
  }


  // Bepaal toegestane tabs
  let toegestaneTabs = ['Winkel', 'Monteur', 'Bezorger'];
  if (user && user.rol === 'medewerker') {
    const p = personeelState.find(p => p.naam === user.naam);
    if (p && rolToTab[p.rol]) toegestaneTabs = [rolToTab[p.rol]];
  }

  // Week naar vandaag knop
  function handleDezeWeek() {
    setWeek(weken[0]);
  }

  // Mijn planning knop
  function handleMijnPlanning() {
    if (user && user.rol === 'medewerker') {
      const p = personeel.find(p => p.naam === user.naam);
      if (p && rolToTab[p.rol]) setTab(rolToTab[p.rol]);
    }
    setZoekterm(user.naam);
  }

  // Detecteer niet-opgeslagen wijzigingen
  function handleEditChange() {
    setDirty(true);
  }


  // Responsive styles
  const responsiveStyle = {
    fontSize: 'clamp(15px, 2.5vw, 18px)',
    padding: 'clamp(8px, 2vw, 16px)'
  };


  // Layout: zijbalk + rooster naast elkaar op desktop
  const mainLayoutStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%'
  };
  const desktop = typeof window !== 'undefined' && window.innerWidth >= 900;
  if (desktop) {
    mainLayoutStyle.flexDirection = 'row';
    mainLayoutStyle.gap = 32;
  }

  const sidebarStyle = {
    minWidth: 220,
    maxWidth: 260,
    background: '#f7fafd',
    borderRadius: 10,
    padding: 18,
    marginBottom: 24,
    boxShadow: '0 2px 8px #f0f4fa',
    height: 'fit-content',
    flexShrink: 0
  };
  const roosterContainerStyle = {
    flex: 1,
    minWidth: 0,
    maxWidth: '100vw',
    margin: '0 auto',
    background: '#fff',
    borderRadius: 10,
    boxShadow: '0 2px 8px #eee',
    padding: 18,
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  };

  // Medewerker toevoegen/wijzigen handlers
  function openMedewerkerModal(editIndex = null) {
    setMedewerkerFout('');
    setMedewerkerSuccess('');
    setMedewerkerEditIndex(editIndex);
    if (editIndex === null) {
      setMedewerkerForm({ naam: '', rol: 'Winkel', kleur: beschikbareKleuren[0], wachtwoord: '' });
    } else {
      const p = personeelState[editIndex];
      const g = gebruikersState.find(g => g.naam === p.naam);
      setMedewerkerForm({ naam: p.naam, rol: p.rol, kleur: p.kleur, wachtwoord: g ? g.wachtwoord : '' });
    }
    setShowMedewerkerModal(true);
  }

  function saveMedewerker() {
    setMedewerkerFout('');
    setMedewerkerSuccess('');
    const { naam, rol, kleur, wachtwoord } = medewerkerForm;
    if (!naam.trim() || !rol || !kleur || !wachtwoord) {
      setMedewerkerFout('Vul alle velden in.');
      return;
    }
    // Uniekheid check
    if (medewerkerEditIndex === null && personeelState.some(p => p.naam === naam)) {
      setMedewerkerFout('Naam bestaat al.');
      return;
    }
    // Toevoegen
    if (medewerkerEditIndex === null) {
      setPersoneelState(prev => {
        const nieuw = [...prev, { naam, rol, kleur }];
        // Voeg standaard werkdagen toe voor nieuwe medewerker
        setStandaardWerkdagen(prevW => {
          const nieuwW = { ...prevW };
          nieuwW[naam] = [...dagen];
          return nieuwW;
        });
        return nieuw;
      });
      setGebruikersState(prev => [...prev, { naam, rol: 'medewerker', wachtwoord }]);
      setMedewerkerSuccess('Medewerker toegevoegd!');
    } else {
      // Wijzigen
      setPersoneelState(prev => prev.map((p, i) => i === medewerkerEditIndex ? { naam, rol, kleur } : p));
      setGebruikersState(prev => prev.map(g => g.naam === personeelState[medewerkerEditIndex].naam ? { naam, rol: 'medewerker', wachtwoord } : g));
      setStandaardWerkdagen(prev => {
        const nieuw = { ...prev };
        if (!nieuw[naam]) nieuw[naam] = [...dagen];
        if (naam !== personeelState[medewerkerEditIndex].naam) {
          // Naam gewijzigd: verplaats werkdagen
          nieuw[naam] = nieuw[personeelState[medewerkerEditIndex].naam] || [...dagen];
          delete nieuw[personeelState[medewerkerEditIndex].naam];
        }
        return nieuw;
      });
      setMedewerkerSuccess('Medewerker gewijzigd!');
    }
    setTimeout(() => setShowMedewerkerModal(false), 1200);
  }

  // Medewerker verwijderen
  function verwijderMedewerker() {
    if (medewerkerEditIndex === null) return;
    const naam = personeelState[medewerkerEditIndex].naam;
    setPersoneelState(prev => {
      const nieuw = prev.filter((_, i) => i !== medewerkerEditIndex);
      // Verwijder standaard werkdagen voor deze medewerker
      setStandaardWerkdagen(prevW => {
        const nieuwW = { ...prevW };
        delete nieuwW[naam];
        return nieuwW;
      });
      return nieuw;
    });
    setGebruikersState(prev => prev.filter(g => g.naam !== naam));
    setMedewerkerSuccess('Medewerker verwijderd!');
    setTimeout(() => {
      setShowMedewerkerModal(false);
      setMedewerkerVerwijderPopup(false);
    }, 1000);
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 350, margin: '60px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
        <h2 style={{ textAlign: 'center' }}>Inloggen</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 12 }}>
            <label>Naam<br />
              <input value={loginNaam} onChange={e => setLoginNaam(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Wachtwoord<br />
              <input type="password" value={loginWachtwoord} onChange={e => setLoginWachtwoord(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
            </label>
          </div>
          {loginFout && <div style={{ color: 'red', marginBottom: 8 }}>{loginFout}</div>}
          <button type="submit" style={{ width: '100%', padding: 10, borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600 }}>Inloggen</button>
        </form>
      </div>
    );
  }

  return (
    <div style={mainLayoutStyle}>
      {/* Zijbalk links op desktop, boven rooster op mobiel */}
      <div style={sidebarStyle}>
        {/* Medewerker beheer knop voor beheerders */}
        {user && user.rol === 'beheerder' && (
          <div style={{ marginBottom: 18 }}>
            <button
              onClick={() => openMedewerkerModal()}
              style={{ width: '100%', padding: '8px 0', borderRadius: 6, border: '1.5px solid #388e3c', background: '#e8f5e9', color: '#388e3c', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 4 }}
            >Medewerker toevoegen</button>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
              <span>Bestaande medewerkers:</span>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {personeelState.map((p, i) => (
                  <li key={p.naam}>
                    <button onClick={() => openMedewerkerModal(i)} style={{ padding: '2px 8px', borderRadius: 4, border: '1px solid #ccc', background: '#fff', color: p.kleur, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{p.naam}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <h2 style={{ marginTop: 0, fontSize: 22, color: '#1976d2', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          Personeelsplanning
          {/* Help icoon */}
          <span title="Uitleg" style={{ cursor: 'pointer', color: '#888', fontSize: 20, marginLeft: 2 }}
            onClick={() => alert('Gebruik de tabs om te wisselen tussen winkel, monteurs en bezorgers. Klik op een naam om te filteren. Beheerders kunnen het rooster aanpassen en vakantieaanvragen beheren. Medewerkers kunnen hun eigen planning en vakantieaanvragen zien.')}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#888" strokeWidth="2"/><text x="10" y="15" textAnchor="middle" fontSize="13" fill="#888">?</text></svg>
          </span>
        </h2>
        <div style={{ marginBottom: 18 }}>
          <span style={{ fontWeight: 500, color: '#888' }}>Legenda:</span>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {personeelState.map(p => (
              <span key={p.naam} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15 }}>
                <span style={{ width: 16, height: 16, borderRadius: 3, background: p.kleur, display: 'inline-block', border: '1px solid #ccc', cursor: 'pointer' }}
                  title={`Filter op ${p.naam}`}
                  onClick={() => setZoekterm && setZoekterm(p.naam)}
                ></span>
                {p.naam}
              </span>
            ))}
          </div>
        </div>
        {/* Alleen voor beheerders: standaard werkdagen beheren */}
        {user.rol === 'beheerder' && (
          <div style={{ marginBottom: 18, background: '#e3f0fc', borderRadius: 8, padding: 10 }}>
            <strong>Standaard werkdagen:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {personeel.map(p => (
                <button
                  key={p.naam}
                  onClick={() => openStandaardModal(p.naam)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 5,
                    border: '1px solid #1976d2',
                    background: '#fff',
                    color: p.kleur,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                >
                  {p.naam}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Beheerder: overzicht vakantie-aanvragen */}
        {user.rol === 'beheerder' && (
          <div style={{ position: 'relative', marginBottom: 18 }}>
            <button
              onClick={() => setShowVakantieOverlay(true)}
              style={{ width: '100%', padding: '8px 0', borderRadius: 6, border: '1.5px solid #ba68c8', background: '#f3e5f5', color: '#6a1b9a', fontWeight: 600, fontSize: 15, cursor: 'pointer', position: 'relative' }}
            >
              Bekijk vakantie-aanvragen
              {/* Badge als er open aanvragen zijn */}
              {vakantieAanvragen.some(a => a.status === 'open') && (
                <span style={{
                  position: 'absolute',
                  top: 7,
                  right: 18,
                  width: 13,
                  height: 13,
                  background: '#e57373',
                  borderRadius: '50%',
                  display: 'inline-block',
                  border: '2px solid #fff',
                  boxShadow: '0 0 0 1.5px #ba68c8',
                }} title="Nieuwe vakantie-aanvraag"></span>
              )}
            </button>
          </div>
        )}
        {/* Overlay voor vakantie-aanvragen (beheerder) */}
        {showVakantieOverlay && user.rol === 'beheerder' && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(106,27,154,0.10)', zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 10, padding: 28, minWidth: 420, maxWidth: '90vw', maxHeight: '90vh', boxShadow: '0 4px 32px #b3d1f7', overflow: 'auto', position: 'relative' }}>
              <h2 style={{ marginTop: 0, color: '#6a1b9a', fontSize: 22, marginBottom: 18 }}>Vakantie-aanvragen</h2>
              <button onClick={() => setShowVakantieOverlay(false)} style={{ position: 'absolute', top: 14, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', fontWeight: 700 }} title="Sluiten">×</button>
              {vakantieAanvragen.length === 0 && <div style={{ color: '#888', fontSize: 15 }}>Geen aanvragen.</div>}
              {vakantieAanvragen.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, background: '#fff', borderRadius: 6, tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '18%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '32%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '8%' }} />
                  </colgroup>
                  <thead>
                    <tr style={{ background: '#ede7f6' }}>
                      <th style={{ padding: 7, borderBottom: '1px solid #ccc', textAlign: 'left', wordBreak: 'break-word' }}>Naam</th>
                      <th style={{ padding: 7, borderBottom: '1px solid #ccc', textAlign: 'left', wordBreak: 'break-word' }}>Van</th>
                      <th style={{ padding: 7, borderBottom: '1px solid #ccc', textAlign: 'left', wordBreak: 'break-word' }}>Tot</th>
                      <th style={{ padding: 7, borderBottom: '1px solid #ccc', textAlign: 'left', wordBreak: 'break-word' }}>Opmerking</th>
                      <th style={{ padding: 7, borderBottom: '1px solid #ccc', textAlign: 'left', wordBreak: 'break-word' }}>Status</th>
                      <th style={{ padding: 7, borderBottom: '1px solid #ccc', wordBreak: 'break-word' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {vakantieAanvragen.map((aanv, i) => (
                      <tr key={i} style={{ background: aanv.status === 'afgewezen' ? '#ffebee' : aanv.status === 'goedgekeurd' ? '#e8f5e9' : '#fff' }}>
                        <td style={{ padding: 7, wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: 120 }}>{aanv.naam}</td>
                        <td style={{ padding: 7, wordBreak: 'break-word', maxWidth: 90 }}>{aanv.van}</td>
                        <td style={{ padding: 7, wordBreak: 'break-word', maxWidth: 90 }}>{aanv.tot}</td>
                        <td style={{ padding: 7, wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: 220 }}>{aanv.opmerking}</td>
                        <td style={{ padding: 7, fontWeight: 600, color: aanv.status === 'afgewezen' ? '#c62828' : aanv.status === 'goedgekeurd' ? '#388e3c' : '#888', wordBreak: 'break-word', maxWidth: 80 }}>{aanv.status}</td>
                        <td style={{ padding: 7 }}>
                          {aanv.status === 'open' && (
                            <>
                              <button
                                onClick={() => {
                                  setVakantieAanvragen(prev => prev.map((a, j) => j === i ? { ...a, status: 'goedgekeurd' } : a));
                                  const aanvraag = vakantieAanvragen[i];
                                  if (!aanvraag) return;
                                  const naam = aanvraag.naam;
                                  const van = aanvraag.van;
                                  const tot = aanvraag.tot;
                                  if (!van || !tot) return;
                                  const vanDate = new Date(van);
                                  const totDate = new Date(tot);
                                  if (isNaN(vanDate) || isNaN(totDate)) return;
                                  setRoosterData(prev => {
                                    const nieuw = JSON.parse(JSON.stringify(prev));
                                    Object.keys(nieuw).forEach(weekKey => {
                                      const weekRooster = nieuw[weekKey];
                                      Object.keys(weekRooster).forEach(dagKey => {
                                        const weekParts = weekKey.split(' ');
                                        if (weekParts.length < 3) return;
                                        const [startDag, startMaand] = weekParts[0].split('-');
                                        const maandNaam = weekParts[1];
                                        const jaar = weekParts[2];
                                        const dagIndex = ['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'].indexOf(dagKey);
                                        if (dagIndex === -1) return;
                                        const maanden = ['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'];
                                        const maandNummer = maanden.indexOf(maandNaam);
                                        if (maandNummer === -1) return;
                                        const startDagNummer = parseInt(startDag, 10);
                                        if (isNaN(startDagNummer)) return;
                                        const datum = new Date(parseInt(jaar,10), maandNummer, startDagNummer + dagIndex);
                                        if (datum >= vanDate && datum <= totDate) {
                                          const dagObj = weekRooster[dagKey];
                                          if (dagObj) {
                                            Object.keys(dagObj).forEach(dienstKey => {
                                              const dienstObj = dagObj[dienstKey];
                                              if (dienstObj) {
                                                Object.keys(dienstObj).forEach(rolKey => {
                                                  if (Array.isArray(dienstObj[rolKey])) {
                                                    dienstObj[rolKey] = dienstObj[rolKey].filter(n => n !== naam);
                                                  }
                                                });
                                              }
                                            });
                                          }
                                        }
                                      });
                                    });
                                    return nieuw;
                                  });
                                }}
                                style={{ marginRight: 4, padding: '3px 8px', borderRadius: 4, border: '1px solid #388e3c', background: '#e8f5e9', color: '#388e3c', fontWeight: 600, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}
                              >Goedkeuren</button>
                              <button onClick={() => setVakantieAanvragen(prev => prev.map((a, j) => j === i ? { ...a, status: 'afgewezen' } : a))} style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid #c62828', background: '#ffebee', color: '#c62828', fontWeight: 600, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>Afwijzen</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
        {/* Medewerker: vakantie aanvragen knop */}
        {user.rol === 'medewerker' && (
          <button onClick={() => setShowVakantieModal(true)} style={{ marginBottom: 16, padding: '6px 14px', borderRadius: 5, border: '1px solid #ba68c8', background: '#f3e5f5', color: '#6a1b9a', fontWeight: 600, cursor: 'pointer', width: '100%' }}>Vakantie aanvragen</button>
        )}
        <div style={{ marginTop: 24, fontSize: 13, color: '#666' }}>
          <span>Demo-rooster. Pas de data aan in <code>src/App.jsx</code> naar wens.</span>
        </div>
      </div>
      {/* Hoofd rooster en bediening */}
      <div style={roosterContainerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <span style={{ marginRight: 12, fontWeight: 500 }}>Hallo, {user.naam} ({user.rol})</span>
          </div>
          <button onClick={handleLogout} style={{ padding: '6px 14px', borderRadius: 5, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}>Uitloggen</button>
        </div>
        <div style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <label htmlFor="week-select" style={{ fontWeight: 500, marginRight: 8 }}>Kies week:</label>
          <select id="week-select" value={week} onChange={e => setWeek(e.target.value)} style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', fontSize: 16 }}>
            {weken.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
          <button onClick={handleDezeWeek} style={{ marginLeft: 8, padding: '6px 14px', borderRadius: 5, border: '1px solid #1976d2', background: '#e3f0fc', color: '#1976d2', fontWeight: 600, cursor: 'pointer' }}>Deze week</button>
          <input
            type="text"
            placeholder="Zoek medewerker..."
            value={zoekterm}
            onChange={e => setZoekterm(e.target.value)}
            style={{ marginLeft: 8, padding: 6, borderRadius: 4, border: '1px solid #ccc', fontSize: 16, minWidth: 120 }}
          />
          {user.rol === 'medewerker' && (
            <button onClick={handleMijnPlanning} style={{ marginLeft: 8, padding: '6px 14px', borderRadius: 5, border: '1px solid #1976d2', background: '#e3f0fc', color: '#1976d2', fontWeight: 600, cursor: 'pointer' }}>Mijn planning</button>
          )}
          {/* Toon alles knop als er een zoekterm actief is */}
          {zoekterm && (
            <button
              onClick={() => setZoekterm('')}
              style={{ marginLeft: 8, padding: '6px 14px', borderRadius: 5, border: '1px solid #888', background: '#f5f5f5', color: '#333', fontWeight: 500, cursor: 'pointer' }}
            >Toon alles</button>
          )}
          {dirty && <span style={{ marginLeft: 8, color: '#e57373', fontWeight: 600 }}>Niet opgeslagen</span>}
          {showSaved && <span style={{ marginLeft: 8, color: '#388e3c', fontWeight: 600 }}>Opgeslagen!</span>}
        </div>
        {/* Sticky tabbladen */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, position: 'sticky', top: 0, background: '#fff', zIndex: 2, paddingTop: 4, paddingBottom: 4 }}>
          {toegestaneTabs.map(tabOptie => (
            <button
              key={tabOptie}
              onClick={() => { setTab(tabOptie); setHighlight(null); }}
              style={{
                ...responsiveStyle,
                borderRadius: 6,
                border: tab === tabOptie ? '2px solid #1976d2' : '1px solid #ccc',
                background: tab === tabOptie ? '#e3f0fc' : '#f5f5f5',
                fontWeight: tab === tabOptie ? 600 : 400,
                cursor: 'pointer',
                minWidth: 90
              }}
              disabled={toegestaneTabs.length === 1}
            >
              {tabOptie === 'Winkel' ? 'Winkel' : tabOptie === 'Monteur' ? 'Monteurs' : 'Bezorgers'}
            </button>
          ))}
        </div>
        <TabTable
          type={tab}
          rooster={roosterData[week]}
          dagen={dagen}
          isBeheerder={user.rol === 'beheerder'}
          onEdit={(dag, dienst, type, geselecteerd) => {
            handleEdit(dag, dienst, type, geselecteerd);
            setDirty(true);
          }}
          zoekterm={zoekterm}
          highlight={highlight}
          setHighlight={setHighlight}
          vakantieAanvragen={vakantieAanvragen}
          week={week}
        />
      </div>
      {/* Modals */}
      {/* Medewerker toevoegen/wijzigen modal */}
      {showMedewerkerModal && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 320, boxShadow: '0 2px 16px #aaa', maxWidth: 360, position: 'relative' }}>
            <h3 style={{ marginTop: 0 }}>{medewerkerEditIndex === null ? 'Medewerker toevoegen' : 'Medewerker wijzigen'}</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Naam:<br />
                <input value={medewerkerForm.naam} onChange={e => setMedewerkerForm(f => ({ ...f, naam: e.target.value }))} style={{ width: '100%', padding: 7, borderRadius: 4, border: '1px solid #ccc' }} disabled={medewerkerEditIndex !== null} />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Rol:<br />
                <select value={medewerkerForm.rol} onChange={e => setMedewerkerForm(f => ({ ...f, rol: e.target.value }))} style={{ width: '100%', padding: 7, borderRadius: 4, border: '1px solid #ccc' }}>
                  <option value="Winkel">Winkel</option>
                  <option value="Monteur">Monteur</option>
                  <option value="Bezorger">Bezorger</option>
                </select>
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Kleur:<br />
                <select value={medewerkerForm.kleur} onChange={e => setMedewerkerForm(f => ({ ...f, kleur: e.target.value }))} style={{ width: '100%', padding: 7, borderRadius: 4, border: '1px solid #ccc' }}>
                  {beschikbareKleuren.map(k => (
                    <option key={k} value={k} style={{ background: k, color: '#222' }}>{k}</option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Wachtwoord:<br />
                <input type="text" value={medewerkerForm.wachtwoord} onChange={e => setMedewerkerForm(f => ({ ...f, wachtwoord: e.target.value }))} style={{ width: '100%', padding: 7, borderRadius: 4, border: '1px solid #ccc' }} />
              </label>
            </div>
            {medewerkerFout && <div style={{ color: 'red', marginBottom: 8 }}>{medewerkerFout}</div>}
            {medewerkerSuccess && <div style={{ color: '#388e3c', marginBottom: 8 }}>{medewerkerSuccess}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={() => setShowMedewerkerModal(false)} style={{ padding: '7px 18px', borderRadius: 4, border: '1px solid #bbb', background: '#f5f5f5', cursor: 'pointer' }}>Annuleren</button>
              {medewerkerEditIndex !== null && (
                <button
                  onClick={() => setMedewerkerVerwijderPopup(true)}
                  style={{ padding: '7px 18px', borderRadius: 4, border: '1px solid #c62828', background: '#ffebee', color: '#c62828', fontWeight: 600, cursor: 'pointer' }}
                >Verwijderen</button>
              )}
              <button onClick={saveMedewerker} style={{ padding: '7px 18px', borderRadius: 4, border: '1px solid #388e3c', background: '#388e3c', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>{medewerkerEditIndex === null ? 'Toevoegen' : 'Opslaan'}</button>
            </div>
            {/* Popup voor verwijderen */}
            {medewerkerVerwijderPopup && (
              <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.30)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', borderRadius: 8, padding: 28, minWidth: 280, boxShadow: '0 2px 16px #aaa', maxWidth: 340, textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 16, color: '#c62828' }}>Weet je zeker dat je deze medewerker wilt verwijderen?</div>
                  <div style={{ marginBottom: 18, color: '#888' }}>{personeelState[medewerkerEditIndex]?.naam}</div>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button onClick={() => setMedewerkerVerwijderPopup(false)} style={{ padding: '7px 18px', borderRadius: 4, border: '1px solid #bbb', background: '#f5f5f5', cursor: 'pointer' }}>Annuleren</button>
                    <button onClick={verwijderMedewerker} style={{ padding: '7px 18px', borderRadius: 4, border: '1px solid #c62828', background: '#c62828', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Verwijderen</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {showStandaardModal && standaardEdit && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 320, boxShadow: '0 2px 16px #aaa' }}>
            <h3 style={{ marginTop: 0 }}>Standaard werkdagen voor {standaardEdit.naam}</h3>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Selecteer standaard werkdagen:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {dagen.map(dag => (
                  <label key={dag} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={standaardEdit.geselecteerd.includes(dag)}
                      onChange={e => {
                        setStandaardEdit(m => {
                          let nieuw;
                          if (e.target.checked) {
                            nieuw = [...m.geselecteerd, dag];
                          } else {
                            nieuw = m.geselecteerd.filter(d => d !== dag);
                          }
                          return { ...m, geselecteerd: nieuw };
                        });
                      }}
                    />
                    {dag}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowStandaardModal(false)} style={{ padding: '7px 18px', borderRadius: 4, border: '1px solid #bbb', background: '#f5f5f5', cursor: 'pointer' }}>Annuleren</button>
              <button onClick={saveStandaardWerkdagen} style={{ padding: '7px 18px', borderRadius: 4, border: '1px solid #1976d2', background: '#1976d2', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Opslaan</button>
            </div>
          </div>
        </div>
      )}
      {showVakantieModal && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 320, boxShadow: '0 2px 16px #aaa' }}>
            <h3 style={{ marginTop: 0 }}>Vakantie aanvragen</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Van:<br />
                <input type="date" value={vakantieVan} onChange={e => setVakantieVan(e.target.value)} style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', width: '100%' }} />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Tot en met:<br />
                <input type="date" value={vakantieTot} onChange={e => setVakantieTot(e.target.value)} style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', width: '100%' }} />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Opmerking (optioneel):<br />
                <input type="text" value={vakantieOpmerking} onChange={e => setVakantieOpmerking(e.target.value)} style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', width: '100%' }} />
              </label>
            </div>
            {vakantieFout && <div style={{ color: 'red', marginBottom: 8 }}>{vakantieFout}</div>}
            {vakantieSuccess && <div style={{ color: '#388e3c', marginBottom: 8 }}>{vakantieSuccess}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowVakantieModal(false); setVakantieFout(''); setVakantieSuccess(''); }} style={{ padding: '7px 18px', borderRadius: 4, border: '1px solid #bbb', background: '#f5f5f5', cursor: 'pointer' }}>Annuleren</button>
              <button
                onClick={() => {
                  if (!vakantieVan || !vakantieTot) {
                    setVakantieFout('Vul een begin- en einddatum in.');
                    return;
                  }
                  if (vakantieTot < vakantieVan) {
                    setVakantieFout('Einddatum mag niet voor begindatum liggen.');
                    return;
                  }
                  setVakantieAanvragen(prev => [...prev, { naam: user.naam, van: vakantieVan, tot: vakantieTot, opmerking: vakantieOpmerking, status: 'open' }]);
                  setVakantieSuccess('Aanvraag verstuurd!');
                  setVakantieFout('');
                  setVakantieVan('');
                  setVakantieTot('');
                  setVakantieOpmerking('');
                  setTimeout(() => { setShowVakantieModal(false); setVakantieSuccess(''); }, 1200);
                }}
                style={{ padding: '7px 18px', borderRadius: 4, border: '1px solid #ba68c8', background: '#ba68c8', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >Verstuur</button>
            </div>
          </div>
        </div>
      )}
      {editModal && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, minWidth: 320, boxShadow: '0 2px 16px #aaa' }}>
            <h3 style={{ marginTop: 0 }}>Bewerk {editModal.type} ({editModal.dag}, {editModal.dienst})</h3>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Selecteer aanwezig personeel:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {editModal.opties.map(optie => (
                  <label key={optie.naam} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={editModal.geselecteerd.includes(optie.naam)}
                      onChange={e => {
                        setEditModal(m => {
                          let nieuw;
                          if (e.target.checked) {
                            nieuw = [...m.geselecteerd, optie.naam];
                          } else {
                            nieuw = m.geselecteerd.filter(n => n !== optie.naam);
                          }
                          return { ...m, geselecteerd: nieuw };
                        });
                        handleEditChange();
                      }}
                    />
                    {optie.naam}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={handleEditCancel} style={{ padding: '7px 18px', borderRadius: 4, border: '1px solid #bbb', background: '#f5f5f5', cursor: 'pointer' }}>Annuleren</button>
              <button onClick={handleEditSave} style={{ padding: '7px 18px', borderRadius: 4, border: '1px solid #1976d2', background: '#1976d2', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Opslaan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
