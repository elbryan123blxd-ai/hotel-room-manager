import { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';

function App() {
  const [habitaciones, setHabitaciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.from('habitaciones').select('*');
      if (error) {
        console.error('Error:', error.message);
      } else {
        setHabitaciones(data || []);
      }
      setCargando(false);
    }
    fetchData();
  }, []);

  return (
    <div>
      <h1>Proyecto Hotel conectado</h1>
      {cargando ? (
        <p>Cargando habitaciones...</p>
      ) : habitaciones.length === 0 ? (
        <p>No hay habitaciones en la base de datos. ¡Agrega una en Supabase!</p>
      ) : (
        <ul>
          {habitaciones.map((h, index) => (
            <li key={index}>{JSON.stringify(h)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;