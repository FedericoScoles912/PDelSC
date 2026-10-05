-- Datos iniciales MySQL para el portfolio.
INSERT INTO profile (id, full_name, role, tagline, email, phone, city, github_url, linkedin_url, about_paragraphs, languages, hobbies) VALUES
(1, 'Federico Scoles', 'Programador en desarrollo', 'Estudiante de informática interesado en Inteligencia Artificial, Machine Learning y desarrollo Front End.', 'fedescoles2007@gmail.com', '+54 223 581-1876', 'Mar del Plata, Argentina', 'https://github.com/FedericoScoles912', 'https://www.linkedin.com/in/federico-scoles-584a50378/', JSON_ARRAY('Soy Federico Scoles, un programador en desarrollo que busca insertarse en el mundo laboral para adquirir experiencia profesional y desarrollo personal. Actualmente estudio el nivel secundario y estoy pensando en estudiar Ingeniería en Informática en la Facultad de Ingeniería de la UNMDP.', 'Me gusta todo lo que tiene que ver con la Inteligencia Artificial, Machine Learning y el Front End de páginas web.', 'Soy trabajador, comprometido y tengo excelente predisposición para aprender cosas nuevas.'), JSON_ARRAY('Español (nativo)', 'Inglés (C1+)'), JSON_ARRAY('Gimnasio', 'Arte enfocado en la música', 'Running'));

INSERT INTO skills (name, level, category, icon_name) VALUES
('HTML', 0, 'Desarrollo frontend', 'code'), ('CSS', 0, 'Desarrollo frontend', 'code'), ('JavaScript', 0, 'Desarrollo frontend', 'code'), ('ReactJS', 0, 'Desarrollo frontend', 'code'), ('NodeJS', 0, 'Desarrollo Backend', 'code'), ('Python', 0, 'Desarrollo Backend', 'code'), ('SQL', 0, 'Base de Datos', 'code'), ('C++', 0, 'Desarrollo de aplicaciones', 'code'), ('Kotlin', 0, 'Desarrollo de aplicaciones', 'code');

INSERT INTO projects (title, description, repo_url, demo_url, image_url, tags, featured) VALUES
('Página web Iglesia de Jesús', 'Página web oficial publicada a través de cPanel mediante una herramienta de gestión web.', NULL, 'https://iglesiadejesus.com.ar', NULL, JSON_ARRAY('cPanel', 'Gestor web'), TRUE);

INSERT INTO experiences (company, role, start_date, end_date, location, description) VALUES
('Tienda de repuestos de motor', 'Pasante', '2026-03-01', '2026-03-31', NULL, 'Cumplí un rol de ayudante bajo relación de dependencia. Realicé actividades digitales y físicas: facturación, mantenimiento de stock y ofimática. Referencia de contacto: Mariano Andrés Scoles (+54 223 456-8010).');

INSERT INTO achievements (title, issuer, date_earned, description, certificate_url) VALUES
('Exploración de IoT con Cisco Packet Tracer', 'Cisco Networking Academy', '2026-04-24', 'Certificación completada con éxito a través del programa Cisco Networking Academy.', NULL);
