# Express Book Reviews

A simple Express application that provides user registration/login, book listing and management of user reviews.

This README is based on the code under the `final_project` folder.

## Features
- User registration
- User login (session + JWT stored in session)
- List all books and search by ISBN / author / title
- Authenticated users can add, update, and delete their own book reviews

## Project structure (key files)
- `final_project/index.js` — application entry, middleware and route mounting
- `final_project/package.json` — dependencies and start script
- `final_project/router/booksdb.js` — in-memory books data (JSON object)
- `final_project/router/general.js` — public routes (register, book queries, etc.)
- `final_project/router/auth_users.js` — registered user routes (login, add/delete reviews)

## Requirements
- Node.js (use an LTS release)
- npm

## Install & Run
1. Change to the project directory:
   - cd final_project
2. Install dependencies:
   - npm install
3. Start the app:
   - npm start
   - (the `start` script uses `nodemon index.js`; `nodemon` is listed as a dependency)

The server listens on port 5000 by default (`PORT = 5000` in index.js).

## Important endpoints

- POST /register
  - Register a new user
  - JSON body: `{ "username": "user", "password": "pass" }`
  - Example:
    - curl -X POST http://localhost:5000/register -H "Content-Type: application/json" -d '{"username":"alice","password":"pw"}'

- POST /customer/login
  - User login (creates a session and stores a JWT inside the session)
  - JSON body: `{ "username": "user", "password": "pass" }`
  - Success response: `{ "message": "Login successful!" }`
  - Example:
    - curl -X POST http://localhost:5000/customer/login -H "Content-Type: application/json" -d '{"username":"alice","password":"pw"}' -c cookie.txt
    - Use the saved cookie (cookie.txt) for subsequent authenticated requests with `-b cookie.txt`.

- GET /
  - Get all books (public)
  - Example:
    - curl http://localhost:5000/

- GET /isbn/:isbn
  - Get book by ISBN
  - Example:
    - curl http://localhost:5000/isbn/1

- GET /author/:author
  - Search books by author (exact match)
  - Example:
    - curl http://localhost:5000/author/"Chinua Achebe"

- GET /title/:title
  - Search books by title (exact match)
  - Example:
    - curl http://localhost:5000/title/"Things Fall Apart"

- PUT /customer/auth/review/:isbn?review=your+text
  - Authenticated user adds or updates a review for the given ISBN. The route is under `/customer` so a valid session is required.
  - `review` must be provided as a query parameter, e.g. `?review=Great+book`
  - Example:
    - curl -X PUT "http://localhost:5000/customer/auth/review/1?review=Amazing+read" -b cookie.txt

- DELETE /customer/auth/review/:isbn
  - Authenticated user deletes their review for the given ISBN.
  - Example:
    - curl -X DELETE http://localhost:5000/customer/auth/review/1 -b cookie.txt

## Authentication details
- `express-session` is applied to the `/customer` path with secret `fingerprint_customer`.
- On successful login (`auth_users.js`), a JWT is generated with `jwt.sign({ data: password }, "access", { expiresIn: 60 * 60 })` and stored in `req.session.authorization = { accessToken, username }`.
- The middleware in `index.js` protects `/customer/auth/*` routes by checking session and verifying the JWT with secret `"access"`.
- JWT expires in 1 hour.

## Data
- Books are stored in-memory in `final_project/router/booksdb.js`. There is no persistent database; book keys are simple numeric IDs (1..10 in the sample object) and each book has a `reviews` object.

## Notes & suggestions
- The app uses in-memory storage; consider a persistent database for production.
- Review creation currently expects a `review` query parameter. You may prefer to change this to JSON body payloads for better REST semantics.
- The `start` script runs `nodemon` (good for development). For production, use a stable process manager (pm2, systemd, etc.) or a different start command.

## Dependencies (from package.json)
- express
- express-session
- jsonwebtoken
- axios
- nodemon

## License
MIT (package.json indicates "license": "MIT")

---

If you want, I can:
- produce a separate English README in the repo root (this file is ready to be committed),
- convert curl examples to a Postman collection,
- change review endpoints to accept a JSON body and prepare a PR for that change. Which would you like next?
