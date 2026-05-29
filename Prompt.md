What the app does
its a personal project tracker i want to add projects see them in a list edit or delete them mark progress and see a small dashboard with some charts thats it no auth no contact form no email just the tracker it should feel modern and a little interactive smooth transitions hover effects a clean layout but im not trying to build the next asana think polished personal tool id actually use

Tech stack please dont deviate
frontend react 18: with vite plain javascript not typescript tailwind css for styling framer motion for transitions chart js with react chartjs 2 for charts axios for api calls react router dom for routing
Backend: node js with express better sqlite3 for the database synchronous single file zero config this is important i dont want to install postgres or run docker cors, thats it dont add redux dont add prisma dont add a ui library like mui or shadcn dont suggest next js i want this to run on my laptop in two terminal windows with npm run dev

Data model:
one table projects with these columns
id integer primary key auto increment
name text required
category text one of machine learning web app mobile app data analytics research other
status text one of planning in progress on hold completed
priority text low medium high
progress integer 0 to 100
budget integer in rupees optional
start_date text iso date
deadline text iso date
description text optional
created_at text iso timestamp default now
keep it one flat table no joins no normalization sqlite handles this fine and its easier to reason about

API endpoints:
rest all under /api/projects
get /api/projects list all
get /api/projects/:id get one
post /api/projects create
put /api/projects/:id update
delete /api/projects/:id delete
get /api/stats return aggregate counts total projects count by status count by category average progress total budget
all responses json validation on post and put name category status priority deadline are required return 400 with a clear error message if missing wrap everything in try catch and return 500 with the error message this is local i dont care about leaking stack traces

Frontend pages:
three routes
/ dashboard shows the four stat cards at the top total in progress completed total budget below that two charts side by side a doughnut for status distribution and a bar chart for projects per category below that a recent projects list last 5 created
/projects full project list as a table or card grid your call whichever looks cleaner each row or card has edit and delete buttons a button at the top opens a modal to add a new project
/projects/:id single project detail view with all fields and an edit button
the add edit modal should animate in with framer motion scale plus fade from center page transitions between routes should fade hover states on cards should lift slightly keep animations subtle and fast 200 to 300ms i do not want flashy long animations that get annoying after the third use

Styling:
tailwind dark mode by default slate 900 background slate 800 cards white text with one accent color use indigo 500 rounded corners soft shadows generous padding responsive works on a laptop doesnt have to be perfect on mobile but shouldnt break

Things i specifically dont want:
no auth no jwt no login page
no file uploads
no email or notifications
no state management library use reacts useState and useEffect thats enough
no css files beyond what tailwind needs no styled components
no docker no docker compose
no tests i know i know for this scope i just dont want them
do not invent npm packages if you reach for something exotic use one of the ones i listed instead

How i want the code delivered:
in this order
1 the folder tree
2 server/package.json full file
3 server/index.js the express server with all routes sqlite setup and the schema creation inline run create table if not exists on startup so i dont need a migration step
4 server/.env.example show me what env vars to set just PORT=5000 for now
5 client/package.json
6 client/vite.config.js with the proxy set up so /api calls go to localhost:5000
7 client/tailwind.config.js and client/postcss.config.js
8 client/index.html
9 client/src/main.jsx
10 client/src/App.jsx
11 client/src/index.css tailwind directives
12 each component as its own file under client/src/components/ and pages under client/src/pages/
13 an api.js file under client/src/ that wraps the axios calls
14 a README.md at the root with prerequisites node 18+ how to install how to run both servers what url to open
pin package versions in both package jsons no caret no latest use versions youre confident exist as of mid 2024 id rather have a slightly older stable version than a hallucinated one if youre unsure about a version pick a known good one
every file must be complete and ready to paste no rest of the imports or implementation here placeholders if a file is long the file is long ill handle it

Final note:
when i run npm install and npm run dev in both folders this should just work if theres anything i need to do manually beyond that like creating the database file better sqlite3 should create it automatically call it out in the readme dont make me debug
thanks build it cleanly
