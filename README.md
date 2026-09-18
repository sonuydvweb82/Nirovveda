
# Nirovveda 🏥

### Digital Healthcare Coordination Platform

Nirovveda is a digital healthcare coordination platform designed to connect patients, doctors, healthcare workers, and medical facilities through a unified system.

The platform focuses on improving healthcare accessibility, streamlining medical workflows, and supporting coordination between different healthcare stakeholders.

---

## 📌 Overview

Healthcare services can become difficult to manage when patient records, appointments, referrals, and medical coordination are handled through disconnected systems.

Nirovveda aims to bring these workflows together in one platform with role-based dashboards, healthcare management tools, and accessible digital services.

The project is being developed as part of the Smart India Hackathon (SIH) 2026.

---

## ✨ Features

### 👤 User Authentication
- User registration and login
- Role-based access control
- Separate dashboards for different healthcare users

### 🧑‍⚕️ Healthcare Management
- Patient dashboard
- Doctor dashboard
- Health worker dashboard
- Healthcare facility dashboard
- Admin dashboard

### 📅 Appointments & Queues
- Appointment management
- Queue coordination
- Healthcare workflow management

### 🩺 Medical Coordination
- Patient records management
- Doctor and facility coordination
- Referral management
- Follow-up tracking
- Diagnostic and medicine-related workflows

### 🚑 Emergency Support
- Emergency escalation workflows
- Healthcare coordination support

### 💻 Digital Healthcare Services
- Teleconsultation interface
- Healthcare facility map
- Multilingual user interface
- Responsive design for desktop and mobile
- Progressive Web App (PWA) support

### 📊 Research & Analytics
- Research information and charts
- Source-based healthcare information
- Dashboard analytics

> Note: Feature availability depends on the current implementation and deployment configuration.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- Responsive UI

### Backend
- Node.js
- Express.js
- REST API

### Database
- PostgreSQL
- Prisma ORM

### Additional Technologies
- Authentication and role-based access
- PWA capabilities
- Healthcare data workflows
- AI service integration (where configured)

---

## 📁 Project Structure

```text
Nirovveda/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── docker-compose.yml
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## 🔐 Security & Privacy

Nirovveda is designed with healthcare data privacy in mind.

Development and deployment should follow these practices:

- Keep environment variables private.
- Never commit database passwords or API keys.
- Avoid using real patient data in development.
- Use authentication and role-based authorization.
- Protect sensitive healthcare information.
- Validate and secure API requests.
- Review access permissions before deployment.

This project is a development and demonstration platform and should not be treated as a certified clinical system without appropriate validation and compliance review.

---

## 📈 Future Improvements

Potential areas for future development include:

- Improved offline healthcare workflows
- Real-time notifications
- Advanced analytics
- Enhanced multilingual support
- Better healthcare facility coordination
- Production-grade security and audit logging
- Integration with verified healthcare services where applicable

---

## 🤝 Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a new feature branch.
3. Make your changes.
4. Test your changes locally.
5. Submit a pull request.

---

## 📄 License

A license for this project has not yet been specified.

Add an appropriate license before distributing the project under open-source terms.

---

## 👨‍💻 Author

**Sonu Kr Ydv**

GitHub: [@sonuydvweb82](https://github.com/sonuydvweb82)

---
## ⭐ Acknowledgements

Developed as part of Smart India Hackathon (SIH) 2026 project development.

Made with dedication to improving digital healthcare coordination.