# AI-Assisted Healthcare Automation

AI-Assisted Healthcare Automation is a medicine management and reminder application that helps users organize medicines and schedule browser-based reminders according to instructions provided by their healthcare professional.

## Features

- Add, view, update, and delete medicines.
- Schedule multiple reminder times for each medicine.
- Enable or disable individual reminders.
- Search and filter medicines.
- Receive browser notifications when scheduled reminders are due while the application is running.
- Store medicine and reminder information in PostgreSQL.

## Technology Stack

- **Frontend:** Angular, TypeScript, HTML, CSS
- **Backend:** Python, FastAPI
- **Database:** PostgreSQL
- **Notifications:** Browser Notification API
- **AI-Assisted Development:** ChatGPT and other AI coding tools actually used during development

## Project Structure

```text
AI-Assisted-Healthcare-Automation/
├── backend/
├── frontend/
├── .gitignore
├── README.md
└── requirements.txt
```

*Note: The structure above is illustrative. Keep it aligned with the actual files in your repository.*

## Run Locally

### 1. Start the backend

Open a terminal in the project directory and activate the Python virtual environment:

```powershell
cd F:\MedMinder
.\.venv\Scripts\Activate.ps1
python -m uvicorn backend.main:app --reload
```

The backend API documentation is available at:

http://127.0.0.1:8000/docs

### 2. Start the frontend

Open a second terminal:

```powershell
cd F:\MedMinder\frontend
ng serve
```

Open the application at:

http://localhost:4200

### 3. Enable browser notifications

Allow notifications in your browser and keep the application open to receive scheduled reminders.

## AI-Assisted Development

AI tools were used as development assistants to support code implementation, understand frontend–backend integration, troubleshoot errors, and learn application development concepts.

AI-generated suggestions were reviewed and tested during development. The project was also used as a hands-on learning exercise for Angular, FastAPI, and PostgreSQL.


### AI Tools Used in this application

I used AI tools as development assistants while building MedMinder, a medicine reminder application using Angular, FastAPI, and PostgreSQL.

- **ChatGPT:** Used for step-by-step guidance, understanding backend and frontend integration, designing medicine and reminder functionality, debugging errors, and implementing browser notifications.
- **GitHub Copilot:** Can be mentioned for code suggestions and development assistance only for the parts where I actually used it.
- **Claude:** Can be mentioned for code review, debugging, or implementation support only for the tasks I actually completed with it.

I reviewed the suggested code, integrated changes into the project, tested the application, and debugged issues such as failures when adding medicines. I used the project as a learning opportunity to understand how the Angular frontend communicates with the FastAPI backend and stores data in PostgreSQL.

AI tools helped accelerate development, but I still needed to test the functionality and understand the code before presenting it as my work.

## Future Improvements

- Improve notification delivery when the application is not open.
- Add automated tests.
- Deploy the application to a suitable hosting platform.
- Improve error handling and user experience.

## Disclaimer

This project is intended for learning and demonstration purposes. It does not provide medical advice or recommend medicines or dosages. Users should follow instructions from their healthcare professional.

## Author

Arpita Pattanakude