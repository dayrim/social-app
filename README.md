# Social app

## Requirements

- Node.js > 20.0.0
- Docker
- Docker Compose

## Setup

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/dayrim/social-app.git
   cd linum-test
   ```

2. Install the dependencies:

   ```bash
   yarn install
   ```

### Database Setup

1. Start the database using Docker Compose:

   ```bash
   yarn db:up
   ```

2. Run the database migrations:

   ```bash
   yarn migrate
   ```

### Running Tests

To run the tests, ensure the database is running, then use the following command:

```bash
yarn test
```

### Development

To run the application in development mode:

```bash
yarn dev
```

### Build

To build the application for production:

```bash
yarn build
```

To start the built application:

```bash
yarn start
```
