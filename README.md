# Airport Management System (AE-Project)

A full-stack application focused on database administration and management of airport operations. The project was designed as part of an internship to deepen knowledge in Oracle Database administration, PL/SQL programming, and full-stack development practices.

---

## **Project Overview**

The core of this project lies in the database layer. Using Oracle Database and SQL Developer, we designed and implemented:

- **Database Objects:** Tables, Views, Sequences
- **PL/SQL Objects:** Procedures, Functions, Triggers
- **Security Management:** Roles and privileges for controlled access

The database forms the backbone of the project, handling all critical business logic related to airport management. The frontend and backend serve primarily as interfaces to interact with the database securely and efficiently.

---

## **Core Features**

- **User Authentication:** Admin login to access database functionalities based on assigned privileges
- **Airport Management:** CRUD operations for flights, passengers, staff, and other airport resources
- **Business Logic:** Implemented directly in the database via PL/SQL procedures, functions, and triggers
- **Security:** Role-based access control ensuring safe operations

---

## **Technology Stack**

- **Database:** Oracle Database
- **PL/SQL:** Procedures, Functions, Triggers, Views, Roles & Privileges
- **Backend:** FastAPI, SQLAlchemy
- **API Testing:** Swagger UI
- **Frontend:** React + TypeScript, Axios for HTTP requests

---

## **Architecture**

1. **Database Layer:** All critical logic, constraints, and automation handled via PL/SQL
2. **Backend Layer:** FastAPI handles API requests, communicates with Oracle DB via SQLAlchemy
3. **Frontend Layer:** React + TypeScript application interacting with backend APIs
4. **Security:** Role-based authentication ensuring only authorized users can execute specific operations

---

## **Setup Instructions**

1. Clone the repository:

```bash
git clone https://github.com/your-username/airport-management.git
