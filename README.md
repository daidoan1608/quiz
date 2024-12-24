# Project Documentation

## Frontend (React.js)

### Introduction
This is the frontend part of the project built using React.js. The purpose of this frontend is to provide a user-friendly interface for interacting with the backend services.

### Prerequisites
- Node.js (version >= 16.x)
- npm or yarn package manager

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/daidoan1608/quiz
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Development
To start the development server:
```bash
npm start
# or
yarn start
```
The application will be available at `http://localhost:3000/` by default.

### Build
To create a production build:
```bash
npm run build
# or
yarn build
```
The build will be stored in the `build` directory.

### Linting and Formatting
To check and fix code linting:
```bash
npm run lint
```
To format the code:
```bash
npm run format
```

### Environment Variables
Create a `.env` file in the root of the project to configure environment variables. For example:
```
REACT_APP_API_URL=http://localhost:8080/api
```

### Folder Structure
```
src/
├── components/       # Reusable UI components
├── pages/            # Application pages
├── services/         # API calls and related logic
├── assets/           # Static files (images, fonts, etc.)
├── utils/            # Utility functions
├── App.js            # Main application component
├── index.js          # Entry point of the application
```

---

## Backend (Java Spring Boot)

### Introduction
This is the backend service of the project built using Java Spring Boot. It provides APIs for the frontend to interact with the database and other business logic.

### Prerequisites
- Java JDK (version >= 17)
- Maven (version >= 3.6)
- MySQL or any other configured database

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/daidoan1608/quiz
   cd server
   ```
2. Configure the database connection in `application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/quiz?createDatabaseIfNotExist=true
   spring.datasource.username=<db_username>
   spring.datasource.password=<db_password>

   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   ```
3. Build the project:
   ```bash
   mvn clean install
   ```

### Running the Application
To start the backend service:
```bash
mvn spring-boot:run
```
The application will be available at `http://localhost:8080/` by default.

### Endpoints
| Method | Endpoint        | Description           |
|--------|-----------------|-----------------------|
| GET    | /api/example    | Example GET endpoint  |
| POST   | /api/example    | Example POST endpoint |

### Folder Structure
```
src/
├── main/
│   ├── java/
│   │   └── com.example.project/   # Java source files
│   ├── resources/
│       ├── application.properties # Configuration files
│       └── static/                # Static files (if needed)
├── test/
    └── java/                      # Unit tests
```

### Testing
To run unit tests:
```bash
mvn test
```

### Build JAR
To build a JAR file for production:
```bash
mvn package
```
The JAR file will be located in the `target` directory.

### Environment Variables
You can use environment variables or profiles to manage configurations. Example for production:
```properties
spring.profiles.active=prod
```

