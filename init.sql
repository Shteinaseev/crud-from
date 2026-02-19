CREATE TABLE IF NOT EXISTS ucenici (
    id          SERIAL          PRIMARY KEY,
    ime         VARCHAR(100)    NOT NULL,
    prezime     VARCHAR(100)    NOT NULL,
    jmbg        CHAR(13)        UNIQUE NOT NULL,
    adresa      VARCHAR(200),
);
INSERT INTO ucenici (ime, prezime, jmbg, adresa) VALUES
('Marko',   'Marković',   '0101993712345', 'Kralja Petra 8, Beograd'),
('Jovana',  'Petrović',   '1508004567890', 'Njegoševa 22, Novi Sad'),
('Nikola',  'Jovanović',  '1205003890123', 'Bulevar Kralja Aleksandra 15, Beograd'),
('Ana',     'Đorđević',   '2503994715678', 'Vojvode Stepe 45, Niš')
ON CONFLICT (jmbg) DO NOTHING; 