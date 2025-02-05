import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [odds, setOdds] = useState(0);
  const [backendPaivaDate, setBackendPaivaDate] = useState(new Date());

  const todayDateOnly = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  useEffect(() => {
    const fetchViimeSePaiva = async () => {
      const response = await fetch('https://dasuki.fi/sepaiva.txt');
      const data = await response.text();
      const parsedDate = new Date(data);
      setBackendPaivaDate(parsedDate);
      setOdds(calculateOdds(todayDateOnly, parsedDate));
    }

    fetchViimeSePaiva();
  }, []);

  const calculateOdds = (today: Date, viimeSePaiva: Date) => {
    const daysSinceViimeSePaiva = Math.round((today.getTime() - viimeSePaiva.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceViimeSePaiva === 0) {
      return 100;
    } else if (today.getDay() === 3) {
      if (daysSinceViimeSePaiva < 7) {
        return 2;
      } else if (daysSinceViimeSePaiva < 14) {
        return 5;
      } else if (daysSinceViimeSePaiva < 21) {
        return 10;
      } else if (daysSinceViimeSePaiva < 28) {
        return 20;
      } else if (daysSinceViimeSePaiva < 35) {
        return 65;
      } else {
        return 98;
      }

    } else if (today.getDay() === 1) {
      if (daysSinceViimeSePaiva < 5) {
        return 1;
      } else if (daysSinceViimeSePaiva < 12) {
        return 2;
      } else if (daysSinceViimeSePaiva < 19) {
        return 5;
      } else if (daysSinceViimeSePaiva < 26) {
        return 10;
      } else if (daysSinceViimeSePaiva < 33) {
        return 20;
      } else if (daysSinceViimeSePaiva < 40) {
        return 30;
      } else {
        if (backendPaivaDate.getDay() === today.getDay()) {
          return 85;
        } else {
          return 50;
        }
      }
    } else {
      if (daysSinceViimeSePaiva < 7) {
        return 0.1;
      } else if (daysSinceViimeSePaiva < 14) {
        return 0.2;
      } else if (daysSinceViimeSePaiva < 21) {
        return 0.5;
      } else if (daysSinceViimeSePaiva < 28) {
        return 1;
      } else if (daysSinceViimeSePaiva < 35) {
        return 2;
      } else if (daysSinceViimeSePaiva < 42) {
        return 10;
      } else {
        if (backendPaivaDate.getDay() === today.getDay()) {
          return 60;
        } else {
          return 20;
        }
      }
    }
  };

  const handleButtonClick = () => {
    const confirmation = window.confirm(
      "Oletko IHAN varma että tänään oli se päivä? Jos painat 'Ok' ja tänään EI ollut se päivä, sammutan nettisivun lopullisesti! >:("
    );
    if (confirmation) {
      const userInfo = {
        userAgent: navigator.userAgent,
        languages: navigator.languages,
      };
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      fetch('https://dasuki.fi/updatesepaiva/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: today, info: userInfo }),
      })
        .then(response => {
          if (response.ok) {
            console.log("Date sent successfully.");
          }
        })
        .catch(error => {
          console.error("Error:", error);
        });
    }
  };

  const fiveWeeksFromBackendPaivaDate = new Date(backendPaivaDate);
  fiveWeeksFromBackendPaivaDate.setDate(fiveWeeksFromBackendPaivaDate.getDate() + 35);

  return (
    <>
      <div className='top-bar'>
        <h1 className="title">"Se Päivä" -laskuri</h1>
      </div>
      <div className='app'>
        <h2>Tänään on {todayDateOnly.toLocaleDateString("fi-FI")}</h2>
        <h2>Viime "se päivä" oli: {backendPaivaDate.toLocaleDateString("fi-FI")} ({backendPaivaDate.toLocaleDateString("fi-FI", { weekday: 'long' })}, {
          Math.round((todayDateOnly.getTime() - backendPaivaDate.getTime()) / (1000 * 60 * 60 * 24))
        } päivää sitten)</h2>
        <h2>Todennäköisin seuraava "se päivä" on {fiveWeeksFromBackendPaivaDate.toLocaleDateString("fi-FI")} (
          {
            fiveWeeksFromBackendPaivaDate.toLocaleDateString("fi-FI", { weekday: 'long' })
          }, {
            Math.round((-todayDateOnly.getTime() + fiveWeeksFromBackendPaivaDate.getTime()) / (1000 * 60 * 60 * 24))
          } päivän päästä, {calculateOdds(fiveWeeksFromBackendPaivaDate, backendPaivaDate)}% Dasuki arvio)</h2>
        <div className='odds-box'>
          <p>Dasuki arvio tämän päivän 'se päivä' -todennäköisyydestä: {odds}%</p>
        </div>
        <button className='se-button' onClick={handleButtonClick}>
          Paina tästä jos tänään oli se päivä
        </button>
      </div>
    </>
  );
}

export default App;