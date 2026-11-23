/* buckl3 // content: UI strings, projects, language stats (ET + EN) */
(function () {
  'use strict';

  var GH = 'https://github.com/IgorAleksejevTTHK/';

  var STRINGS = {
    et: {
      'skip': 'Liigu sisu juurde',
      'safe': 'SAFE MODE',
      'hero.tag': 'ÜHENDUS LOODUD',
      'hero.role': 'noorem tarkvaraarendaja',
      'hero.lead': 'Tallinna Tehnoloogiakolledži õpilane. Ehitan veebirakendusi, API-sid ja andmebaase — ja vahel ka madu konsooli.',
      'hero.cta1': '[ AVA PROJEKTID ]',
      'hero.mask': 'originaal',
      'cat.cap': 'kass smokingus',
      'kv.name': 'nimi',
      'kv.role': 'roll',
      'kv.roleV': 'noorem tarkvaraarendaja (õpilane)',
      'kv.school': 'kool',
      'kv.langs': 'keeled',
      'kv.langsV': 'vene · eesti · inglise',
      'kv.focus': 'fookus',
      'kv.status': 'lõputöö kompileerub…',
      'whoami.note': 'Mulle meeldib, kui asi lihtsalt töötab: selge andmemudel, korralik API ja liides, mis ei vaja kasutusjuhendit.',
      'projects.lead': 'Valik minu töid GitHubist. Iga kaart = üks repo. Vajuta „detailid", et näha rohkem.',
      'stack.note': 'Avalikud repod põhikeele järgi (GitHubi andmed, nov 2026):',
      'sk.db': 'Andmebaasid',
      'sk.web': 'Veeb',
      'sk.other': 'Muu',
      'sk.tools': 'Tööriistad',
      'footer.fan': 'Fänni-inspiratsioon hakkeri-esteetikast (Watch Dogs 2). Pole seotud Ubisoftiga. Mask ja kõik ASCII-graafika on originaalsed.',
      'footer.old': 'vana portfoolio (WordPress) ↗',
      'footer.fonts': 'Fondid: JetBrains Mono, Chakra Petch (OFL)',
      // dynamic
      'card.details': 'detailid',
      'card.open': '> ava repo ↗',
      'card.private': '[ privaatne repo ]',
      'status.done': '[DONE]',
      'status.wip': '[IN PROGRESS]',
      'repos': 'repot',
      'aria.mask': 'Abstraktne glitch-mask ASCII-märkidest (buckl3 märk)',
      'aria.cat': 'Portree: kass smokingus, ASCII- või rastri-stiilis',
      'cat.halftone': 'MA NÄEN SIND',
      'typed': ['noorem tarkvaraarendaja', 'C# / .NET · JS · SQL', 'kompileerin ideid koodiks']
    },
    en: {
      'skip': 'Skip to content',
      'safe': 'SAFE MODE',
      'hero.tag': 'CONNECTION ESTABLISHED',
      'hero.role': 'junior software developer',
      'hero.lead': 'Student at Tallinn Technology College. I build web apps, APIs and databases — and sometimes a snake in the console.',
      'hero.cta1': '[ OPEN PROJECTS ]',
      'hero.mask': 'original',
      'cat.cap': 'cat in a tuxedo',
      'kv.name': 'name',
      'kv.role': 'role',
      'kv.roleV': 'junior software developer (student)',
      'kv.school': 'school',
      'kv.langs': 'languages',
      'kv.langsV': 'Russian · Estonian · English',
      'kv.focus': 'focus',
      'kv.status': 'final project compiling…',
      'whoami.note': 'I like things that simply work: a clear data model, a solid API and an interface that needs no manual.',
      'projects.lead': 'A selection of my work from GitHub. One card = one repo. Hit "details" to see more.',
      'stack.note': 'Public repos by primary language (GitHub data, Nov 2026):',
      'sk.db': 'Databases',
      'sk.web': 'Web',
      'sk.other': 'Other',
      'sk.tools': 'Tools',
      'footer.fan': 'Fan-inspired by the hacker aesthetic of Watch Dogs 2. Not affiliated with Ubisoft. The mask and all ASCII art are original.',
      'footer.old': 'old portfolio (WordPress) ↗',
      'footer.fonts': 'Fonts: JetBrains Mono, Chakra Petch (OFL)',
      'card.details': 'details',
      'card.open': '> open repo ↗',
      'card.private': '[ private repo ]',
      'status.done': '[DONE]',
      'status.wip': '[IN PROGRESS]',
      'repos': 'repos',
      'aria.mask': 'Abstract glitch mask made of ASCII characters (buckl3 sign)',
      'aria.cat': 'Portrait: a cat in a tuxedo, in ASCII or halftone style',
      'cat.halftone': 'I SEE YOU',
      'typed': ['junior software developer', 'C# / .NET · JS · SQL', 'compiling ideas into code']
    }
  };

  // Projects: verified against the repositories (Nov 2026).
  var PROJECTS = [
    {
      id: 'Lopputoo-Retseptiraamat', title: 'Recipe Planner', status: 'wip', featured: true, url: null,
      stack: ['C#', 'ASP.NET Core 8 Web API', 'EF Core + SQLite', 'xUnit + Moq', '.NET MAUI'],
      et: { d: 'Lõputöö: retseptikogu ja nädala menüü planeerija. Backend on Web API, peamine klient on .NET MAUI mobiilirakendus.',
            x: ['Andmemudel: kasutajad, kategooriad, koostisosad, retseptid, sammud', 'Retseptide CRUD: otsing, koostisosa filter, sorteerimine, lehekülgedeks jagamine', 'Portsjonite ümberarvutus teenusekihis', 'Menüüplaani mudel, migratsioonid ja seed-andmed', 'Swagger XML-dokumentatsioon, testid xUnit + Moq'] },
      en: { d: 'Final project: a recipe collection and weekly meal planner. Web API backend, the main client is a .NET MAUI mobile app.',
            x: ['Data model: users, categories, ingredients, recipes, steps', 'Recipe CRUD with search, ingredient filter, sorting and pagination', 'Servings recalculation in the service layer', 'Meal plan model, migrations and seed data', 'Swagger XML docs, tests with xUnit + Moq'] }
    },
    {
      id: 'KeelteKoolV2', title: 'KeelteKool V2', status: 'done', featured: true,
      stack: ['C#', 'ASP.NET Core MVC', 'EF Core', 'SQL Server', 'Identity', 'xUnit', 'Selenium'],
      et: { d: 'Keelekooli haldusrakendus kihilise arhitektuuriga: Core, Data, ApplicationServices ja eraldi testiprojektid.',
            x: ['Kursused, õpetajad, kasutajakontod ja e-kirjade saatmine', 'ASP.NET Identity + EF Core (SQL Server), migratsioonid', 'Ühiktestid xUnit + EF Core InMemory', 'UI-testid Seleniumiga'] },
      en: { d: 'Language school management app with a layered architecture: Core, Data, ApplicationServices and separate test projects.',
            x: ['Courses, lecturers, user accounts and emailing', 'ASP.NET Identity + EF Core (SQL Server), migrations', 'Unit tests with xUnit + EF Core InMemory', 'UI tests with Selenium'] }
    },
    {
      id: 'jwt-mini-api', title: 'JWT Mini-API', status: 'done',
      stack: ['Python', 'Flask', 'PyJWT', 'REST'],
      et: { d: 'Väike REST API JWT-autentimise õppimiseks: sisselogimine, tokeni kontroll ja rollipõhine ligipääs.',
            x: ['POST /login tagastab HS256 tokeni (kehtib 5 min)', 'GET /profiil näitab tokeni andmeid', 'GET /admin ainult admin-rollile', 'Salavõti keskkonnamuutujast JWT_SECRET'] },
      en: { d: 'A small REST API for learning JWT auth: login, token validation and role-based access.',
            x: ['POST /login returns an HS256 token (valid 5 min)', 'GET /profiil returns the token payload', 'GET /admin for the admin role only', 'Secret key read from the JWT_SECRET env variable'] }
    },
    {
      id: 'snake-aleksejev', title: 'Snake (console)', status: 'done',
      stack: ['C#', '.NET', 'OOP', 'Console'],
      et: { d: 'Klassikaline madu konsoolis, OOP-stiilis: iga asi on oma klass.',
            x: ['Menüü, tasemed ja kiirus', 'Skoor ja mängija tulemused', 'Seinad, toit ja kokkupõrked', 'Helid (AudioManager)'] },
      en: { d: 'Classic snake in the console, written OOP-style: every thing is its own class.',
            x: ['Menu, levels and speed', 'Score and player results', 'Walls, food and collisions', 'Sounds (AudioManager)'] }
    },
    {
      id: 'uudised-veebirakendus', title: 'Uudised', status: 'done',
      stack: ['Node.js', 'Express', 'EJS', 'MySQL', 'express-validator'],
      et: { d: 'Uudiste veebirakendus serveripoolse renderdamisega.',
            x: ['Express-marsruudid ja EJS-vaated', 'Andmed MySQL-is (mysql2)', 'Vormide valideerimine express-validatoriga'] },
      en: { d: 'A news web app with server-side rendering.',
            x: ['Express routes and EJS views', 'Data stored in MySQL (mysql2)', 'Form validation with express-validator'] }
    },
    {
      id: 'Valimised-Login', title: 'Valimised + Login', status: 'done',
      stack: ['PHP', 'MySQL', 'CSS'],
      et: { d: 'Hääletusrakendus kasutajakontodega.',
            x: ['Registreerimine, sisse- ja väljalogimine', 'Hääletamine ja tulemused', 'Admin-vaade ja galerii'] },
      en: { d: 'A voting app with user accounts.',
            x: ['Sign-up, login and logout', 'Voting and results', 'Admin view and gallery'] }
    },
    {
      id: 'sugupuuRakendusXML', title: 'Sugupuu XML', status: 'done',
      stack: ['C#', 'ASP.NET Web Forms', 'XML', 'XSLT'],
      et: { d: 'Sugupuu ja reiside andmed XML-failides, kuvamine ja päringud XSLT abil.',
            x: ['Sugupuu XML + XSLT-päring', 'Reisi XML + XSLT-päring', 'ASP.NET Web Forms lehed'] },
      en: { d: 'Family tree and trip data in XML, rendered and queried with XSLT.',
            x: ['Family tree XML + XSLT query', 'Trip XML + XSLT query', 'ASP.NET Web Forms pages'] }
    },
    {
      id: 'andmebaas', title: 'SQL // andmebaas', status: 'done',
      stack: ['T-SQL', 'SQL Server', 'MySQL / XAMPP'],
      et: { d: 'Minu SQL-i harjutused ühes kohas: tabelid, päringud, triggerid ja protseduurid.',
            x: ['Triggerid ja salvestatud protseduurid', 'SELECT, GROUP BY, JOIN', 'Raamatukogu, retseptiraamatu ja võistluste andmebaasid', 'Sama skeem SQL Serveris ja XAMPP-is'] },
      en: { d: 'My SQL exercises in one place: tables, queries, triggers and procedures.',
            x: ['Triggers and stored procedures', 'SELECT, GROUP BY, JOIN', 'Library, recipe book and competition databases', 'The same schema in SQL Server and XAMPP'] }
    },
    {
      id: 'MauiApp1', title: 'MAUI App', status: 'done',
      stack: ['C#', '.NET MAUI', 'XAML'],
      et: { d: 'Mitmeleheline .NET MAUI mobiilirakendus: navigeerimine lehtede vahel ja XAML-paigutused.',
            x: ['Start-, teksti- ja kujundite lehed', 'AppShell navigeerimine'] },
      en: { d: 'A multi-page .NET MAUI mobile app: page navigation and XAML layouts.',
            x: ['Start, text and shapes pages', 'AppShell navigation'] }
    }
  ];

  // Public repos by primary language (gh repo list, Nov 2026). "Hack" counted as PHP.
  var LANGS = [
    ['C#', 12], ['Python', 8], ['JavaScript', 6], ['PHP', 5],
    ['HTML', 3], ['EJS', 3], ['T-SQL', 2]
  ];

  window.B3 = { STRINGS: STRINGS, PROJECTS: PROJECTS, LANGS: LANGS, GH: GH };
})();
