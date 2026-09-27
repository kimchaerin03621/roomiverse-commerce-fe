import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Reservation.css';

const partyTypes=['House Party','Listening Party','Day Party','Themed Party','Rave Party','After Party','Other'];
const guests=['1–5','6–10','11–20','20+'];
const music=['House','Disco','Funk','Indie Dance','Other'];
function Choices({name,items,value,onChange}){return <div className={`reservation-options reservation-options--${name}`}>{items.map(item=><button type="button" className={value===item?'active':''} onClick={()=>onChange(item)} key={item}>{item}</button>)}</div>}
export default function Reservation(){const [party,setParty]=useState('');const [guest,setGuest]=useState('');const [genre,setGenre]=useState('');return <main className="reservation-page">
 <nav className="reservation-nav"><Link to="/about">Meet ROOMi</Link><Link to="/culture">What’s Going on?</Link><Link className="active" to="/reservation">Let’s Party</Link></nav><Link className="reservation-logo" to="/"><img src="/logo1.png" alt="ROOMiROOMi"/></Link>
 <header className="reservation-hero"><strong>LET’S PARTY</strong><h1>BUILD YOUR PARTY</h1><p>Tell us the basics. We’ll take care of the setup.</p></header>
 <ol className="reservation-steps"><li className="active">01 PARTY</li><li>02 WHEN &amp; WHERE</li><li>03 SPACE CHECK</li><li>04 YOUR DETAILS</li></ol>
 <section className="reservation-form"><header><span>01</span><div><h2>YOUR PARTY</h2><p>What kind of party are we building?</p></div></header>
 <fieldset><legend>PARTY TYPE</legend><Choices name="party" items={partyTypes} value={party} onChange={setParty}/></fieldset>
 <fieldset><legend>GUESTS</legend><Choices name="guests" items={guests} value={guest} onChange={setGuest}/></fieldset>
 <fieldset><legend>MUSIC</legend><Choices name="music" items={music} value={genre} onChange={setGenre}/></fieldset>
 <button className="reservation-next" type="button">NEXT</button></section>
 </main>}
