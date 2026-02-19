// app.js
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false   
  }
});

app.use(express.urlencoded({ extended: true }));         
app.use(express.static(path.join(__dirname, 'public')));   

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', async (req, res) => {
  const { id, message } = req.query;

  let ucenici = [];
  let pronadjen = null;
  let errorMessage = message || null;

  try {
    if (id) {
      const result = await pool.query(
        'SELECT * FROM ucenici WHERE id = $1',
        [id]
      );
      pronadjen = result.rows[0] ?? null;
    }

    const all = await pool.query(
      'SELECT * FROM ucenici ORDER BY id'
    );
    ucenici = all.rows;
  } catch (err) {
    console.error('Ошибка при загрузке данных:', err);
    errorMessage = errorMessage || 'Greška pri učitavanju podataka';
  }

  res.render('index', {
    ucenici,
    pronadjen,
    message: errorMessage,
  });
});


app.post('/ucenik', async (req, res) => {
  const { id, ime, prezime, jmbg, adresa } = req.body;
  const akcija = req.body.akcija || (id ? 'izmeni' : 'dodaj');

  try {
    if (akcija === 'izmeni' && id) {
      // Обновляем запись
      await pool.query(
        `UPDATE ucenici
         SET ime = $1, prezime = $2, jmbg = $3, adresa = $4
         WHERE id = $5`,
        [ime, prezime, jmbg, adresa, id]
      );
      return res.redirect('/?message=Učenik uspešno izmenjen');
    }

    // Добавляем нового
    await pool.query(
      `INSERT INTO ucenici (ime, prezime, jmbg, adresa)
       VALUES ($1, $2, $3, $4)`,
      [ime, prezime, jmbg, adresa]
    );

    res.redirect('/?message=Učenik uspešno dodat');
  } catch (err) {
    console.error('Ошибка при сохранении:', err);
    let msg = 'Greška pri čuvanju podataka';
    if (err.code === '23505') {
      msg = 'Učenik sa ovim JMBG već postoji';
    }
    res.redirect(`/?message=${encodeURIComponent(msg)}`);
  }
});


app.post('/obrisi', async (req, res) => {
  const { id } = req.body;

  try {
    if (id === 'all' || id === undefined) {
      // Remove every record and reset the serial counter
      console.log("fdsdf")
      await pool.query('ALTER SEQUENCE ucenici_id_seq RESTART WITH 1;');
      return res.redirect('/?message=Svi učenici obrisani');
    }

    await pool.query('DELETE FROM ucenici WHERE id = $1', [id]);
    res.redirect('/?message=Učenik uspešno obrisan');
  } catch (err) {
    console.error('Ошибка при удалении:', err);
    res.redirect('/?message=Greška pri brisanju');
  }
});


app.listen(port, () => {
  console.log(`Сервер запущен → http://localhost:${port}`);
});