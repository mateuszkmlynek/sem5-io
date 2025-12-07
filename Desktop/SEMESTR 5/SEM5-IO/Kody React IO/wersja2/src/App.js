import React, { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import {
  PlusCircle,
  Trash2,
  Moon,
  Sun,
  TrendingUp,
  LayoutDashboard,
  Settings,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./App.css";

const INITIAL_SUBSCRIPTIONS = [
  {
    id: 1,
    name: "Netflix",
    price: 43.0,
    currency: "PLN",
    category: "Rozrywka",
    nextPayment: "2025-11-15",
  },
  {
    id: 2,
    name: "Spotify",
    price: 19.99,
    currency: "PLN",
    category: "Muzyka",
    nextPayment: "2025-11-20",
  },
  {
    id: 3,
    name: "Adobe CC",
    price: 140.0,
    currency: "PLN",
    category: "Praca",
    nextPayment: "2025-11-28",
  },
  {
    id: 4,
    name: "Siłownia",
    price: 120.0,
    currency: "PLN",
    category: "Zdrowie",
    nextPayment: "2025-11-05",
  },
];

const COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6"];

// widok kalendarza
const CalendarView = ({ subscriptions }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const monthNames = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ];
  
  const dayNames = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const paymentsByDate = {};
  subscriptions.forEach((sub) => {
    const dateStr = sub.nextPayment;
    if (!paymentsByDate[dateStr]) {
      paymentsByDate[dateStr] = [];
    }
    paymentsByDate[dateStr].push(sub);
  });
  
  const changeMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };
  
  // renderowanie dnia
  const renderDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayPayments = paymentsByDate[dateStr] || [];
    const isToday = 
      new Date().toDateString() === new Date(year, month, day).toDateString();
    
    return (
      <div
        key={day}
        className={`calendar-day ${dayPayments.length > 0 ? 'has-payment' : ''} ${isToday ? 'today' : ''}`}
      >
        <span className="day-number">{day}</span>
        {dayPayments.length > 0 && (
          <div className="payment-indicator">
            <span className="payment-count">{dayPayments.length}</span>
          </div>
        )}
        {dayPayments.length > 0 && (
          <div className="payment-tooltip">
            {dayPayments.map((sub) => (
              <div key={sub.id} className="payment-item">
                <strong>{sub.name}</strong>
                <span>{sub.price.toFixed(2)} {sub.currency}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // utworz tablice dni do wyswietlenia
  const days = [];
  // puste komorki przed 1 dniem miesiaca
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(renderDay(day));
  }
  
  return (
    <div className="calendar-view-container">
      {/* Nagłówek kalendarza z nawigacją */}
      <div className="calendar-header">
        <button 
          className="calendar-nav-btn" 
          onClick={() => changeMonth(-1)}
          title="Poprzedni miesiąc"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="calendar-month-title">
          {monthNames[month]} {year}
        </h3>
        <button 
          className="calendar-nav-btn" 
          onClick={() => changeMonth(1)}
          title="Następny miesiąc"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Dni tygodnia */}
      <div className="calendar-weekdays">
        {dayNames.map((day) => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      
      {/* Kalendarz z dniami */}
      <div className="calendar-grid">
        {days}
      </div>
      
      {/* Legenda */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>Dzisiaj</span>
        </div>
        <div className="legend-item">
          <div className="legend-color has-payment"></div>
          <span>Data płatności</span>
        </div>
      </div>
    </div>
  );
};

export default function SubTrackPrototype() {
  const [subscriptions, setSubscriptions] = useState(INITIAL_SUBSCRIPTIONS);
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [newSub, setNewSub] = useState({
    name: "",
    price: "",
    category: "Rozrywka",
    nextPayment: "",
  });

  const [error, setError] = useState("");

  const totalMonthly = useMemo(() => {
    return subscriptions
      .reduce((acc, sub) => acc + parseFloat(sub.price), 0)
      .toFixed(2);
  }, [subscriptions]);

  const chartData = useMemo(() => {
    const data = {};
    subscriptions.forEach((sub) => {
      if (data[sub.category]) data[sub.category] += sub.price;
      else data[sub.category] = sub.price;
    });
    return Object.keys(data).map((key) => ({ name: key, value: data[key] }));
  }, [subscriptions]);

  const handleAddSubscription = (e) => {
    e.preventDefault();

    // Konwersja ceny na liczbę
    const priceValue = parseFloat(newSub.price);

    // Walidacja: Czy pola są wypełnione?
    if (!newSub.name || !newSub.price) {
      setError("Proszę wypełnić nazwę i cenę.");
      return;
    }

    // Walidacja: Czy cena jest poprawna (> 0)?
    if (priceValue <= 0) {
      setError("Cena subskrypcji musi być większa od 0!");
      return;
    }

    // Jeśli wszystko OK, czyścimy błąd i dodajemy
    setError("");

    const newItem = {
      id: Date.now(),
      name: newSub.name,
      price: priceValue, // Używamy sparsowanej liczby
      currency: "PLN",
      category: newSub.category,
      nextPayment: newSub.nextPayment || new Date().toISOString().split("T")[0],
    };

    setSubscriptions([...subscriptions, newItem]);
    setNewSub({ name: "", price: "", category: "Rozrywka", nextPayment: "" });
  };

  const handleDelete = (id) =>
    setSubscriptions(subscriptions.filter((sub) => sub.id !== id));

  return (
    // Główny kontener aplikacji (obsługuje dark mode klasą 'dark-theme')
    <div className={`app-container ${darkMode ? "dark-theme" : ""}`}>
      {/* Nawigacja */}
      <nav className="navbar">
        <div className="logo-section">
          <div className="logo-icon">
            <TrendingUp size={24} color="white" />
          </div>
          <h1>
            Sub<span>Track</span>
          </h1>
        </div>

        <div className="nav-actions">
          <button 
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')} 
            className="icon-btn" 
            title={viewMode === 'list' ? 'Przełącz na widok kalendarza' : 'Przełącz na widok listy'}
          >
            <Calendar size={20} className="calendar-icon" /> 
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className="icon-btn">
            {darkMode ? <Sun size={20} color="#fbbf24" /> : <Moon size={20} />}
          </button>
          <div className="user-avatar">U</div>
        </div>
      </nav>

      <main className="main-content">
        {/* Dashboard - Statystyki */}
        <section className="stats-grid">
          <div className="card stat-card">
            <p className="label">Miesięczne wydatki</p>
            <h2 className="value highlight">{totalMonthly} PLN</h2>
            <p className="subtext">Suma aktywnych subskrypcji</p>
          </div>

          <div className="card stat-card">
            <p className="label">Liczba subskrypcji</p>
            <h2 className="value">{subscriptions.length}</h2>
            <p className="subtext">Aktywne usługi</p>
          </div>

          <div className="card payment-card">
            <div className="payment-header">
              <Calendar size={20} />
              <span>Nadchodząca płatność</span>
            </div>
            <h3>Netflix</h3>
            <p className="big-price">43.00 PLN</p>
            <p className="due-date">Płatność za 3 dni</p>
          </div>
        </section>

        <div className="content-split">
          {/* Lewa kolumna */}
          <div className="left-column">
            {/* Tabela / Kalendarz */}
            <div className="card table-card">
              <div className="card-header">
                {viewMode === 'list' ? <LayoutDashboard size={20} /> : <Calendar size={20} />}
                <h3>{viewMode === 'list' ? 'Twoje Subskrypcje' : 'Widok Kalendarza'}</h3>
              </div>
              {viewMode === 'list' ? (
                <div className="table-wrapper">
                  <table className="sub-table">
                    <thead>
                      <tr>
                        <th>Usługa</th>
                        <th>Kategoria</th>
                        <th>Data</th>
                        <th className="text-right">Koszt</th>
                        <th className="text-center">Akcja</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((sub) => (
                        <tr key={sub.id}>
                          <td className="font-bold">{sub.name}</td>
                          <td>
                            <span className="badge">{sub.category}</span>
                          </td>
                          <td className="text-muted">{sub.nextPayment}</td>
                          <td className="text-right font-bold">
                            {sub.price.toFixed(2)} {sub.currency}
                          </td>
                          <td className="text-center">
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="btn-delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <CalendarView subscriptions={subscriptions} />
              )}
            </div>

            {/* Formularz */}
            <div className="card form-card">
              <div className="card-header">
                <PlusCircle size={20} color="#10b981" />
                <h3>Dodaj subskrypcję</h3>
              </div>

              <form onSubmit={handleAddSubscription} className="add-form">
                
                {error && <div className="error-message">{error}</div>}

                <input
                  type="text"
                  placeholder="Nazwa (np. HBO Max)"
                  value={newSub.name}
                  onChange={(e) =>
                    setNewSub({ ...newSub, name: e.target.value })
                  }
                  
                />
                <input
                  type="number"
                  placeholder="Cena (PLN)"
                  value={newSub.price}
                  onChange={(e) =>
                    setNewSub({ ...newSub, price: e.target.value })
                  }
                  step="0.01"
                  min="0.01"
                />
                <select
                  value={newSub.category}
                  onChange={(e) =>
                    setNewSub({ ...newSub, category: e.target.value })
                  }
                >
                  <option>Rozrywka</option>
                  <option>Praca</option>
                  <option>Zdrowie</option>
                  <option>Edukacja</option>
                  <option>Inne</option>
                </select>
                <input
                  type="date"
                  value={newSub.nextPayment}
                  onChange={(e) =>
                    setNewSub({ ...newSub, nextPayment: e.target.value })
                  }
                />
                <button type="submit" className="btn-primary">
                  Dodaj do listy
                </button>
              </form>
            </div>
          </div>

          {/* Prawa kolumna */}
          <div className="right-column">
            {/* Wykres */}
            <div className="card chart-card">
              <h3>Struktura wydatków</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ustawienia */}
            <div className="card settings-card">
              <div className="card-header">
                <Settings size={20} className="text-muted" />
                <h3>Szybkie ustawienia</h3>
              </div>
              <div className="setting-row">
                <span>Waluta domyślna</span>
                <span className="highlight">PLN</span>
              </div>
              <div className="setting-row">
                <span>Powiadomienia e-mail</span>
                <div className="toggle-switch active"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
