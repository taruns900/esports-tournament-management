# Esports Tournament Management System

## Overview
The Esports Tournament Management System is designed to facilitate the organization and management of esports tournaments. This system allows tournament organizers to register, manage their events, and seek approval from administrators. The admin panel provides functionalities to approve organizers and manage pending registrations.

## Features
- **Organizer Registration**: Organizers can register through a dedicated registration page.
- **Database Integration**: Organizer details are stored in a database for easy retrieval and management.

## Project Structure
```
esports-tournament-management
├── src
│   ├── app.ts
│   ├── controllers
│   │   ├── organizerController.ts
│   │   └── adminController.ts
│   ├── routes
│   │   ├── organizerRoutes.ts
│   │   └── adminRoutes.ts
│   ├── models
│   │   └── organizer.ts
│   ├── views
│   │   └── organizerRegistrationPage.tsx
│   └── types
│       └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Installation
1. Clone the repository.
2. Navigate to the project directory.
3. Run `npm install` to install the required dependencies.

## Usage
- Start the server by running `npm start`.
- Access the organizer registration page to register as an organizer.
- Admins can log in to view and approve pending registrations.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.