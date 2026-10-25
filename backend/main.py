
from fastapi import Depends, FastAPI, HTTPException, Response, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from backend.database import SessionLocal
from backend.models import Medicine, MedicineReminder
from backend.schemas import (
    MedicineCreate,
    MedicineResponse,
    MedicineUpdate,
    MedicineReminderCreate,
    MedicineReminderUpdate,
    MedicineReminderResponse,
)


app = FastAPI(title="Medicine Reminder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {
        "message": "Welcome to Medicine Reminder!",
        "status": "running",
    }


# Medicine endpoints

@app.get("/medicines", response_model=list[MedicineResponse])
def get_medicines(db: Session = Depends(get_db)):
    return db.query(Medicine).all()


@app.post(
    "/medicines",
    response_model=MedicineResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_medicine(
    medicine: MedicineCreate,
    db: Session = Depends(get_db),
):
    new_medicine = Medicine(**medicine.model_dump())
    db.add(new_medicine)
    db.commit()
    db.refresh(new_medicine)
    return new_medicine


@app.put("/medicines/{medicine_id}", response_model=MedicineResponse)
def update_medicine(
    medicine_id: int,
    medicine_data: MedicineUpdate,
    db: Session = Depends(get_db),
):
    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id
    ).first()

    if medicine is None:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found",
        )

    for field, value in medicine_data.model_dump().items():
        setattr(medicine, field, value)

    db.commit()
    db.refresh(medicine)
    return medicine


@app.delete(
    "/medicines/{medicine_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_medicine(
    medicine_id: int,
    db: Session = Depends(get_db),
):
    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id
    ).first()

    if medicine is None:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found",
        )

    db.delete(medicine)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Reminder endpoints

@app.post(
    "/medicines/{medicine_id}/reminders",
    response_model=MedicineReminderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_reminder(
    medicine_id: int,
    reminder_data: MedicineReminderCreate,
    db: Session = Depends(get_db),
):
    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id
    ).first()

    if medicine is None:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found",
        )

    reminder = MedicineReminder(
        medicine_id=medicine_id,
        **reminder_data.model_dump(),
    )

    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@app.get(
    "/medicines/{medicine_id}/reminders",
    response_model=list[MedicineReminderResponse],
)
def get_reminders(
    medicine_id: int,
    db: Session = Depends(get_db),
):
    medicine = db.query(Medicine).filter(
        Medicine.id == medicine_id
    ).first()

    if medicine is None:
        raise HTTPException(
            status_code=404,
            detail="Medicine not found",
        )

    return db.query(MedicineReminder).filter(
        MedicineReminder.medicine_id == medicine_id
    ).order_by(MedicineReminder.reminder_time).all()


@app.patch(
    "/reminders/{reminder_id}",
    response_model=MedicineReminderResponse,
)
def update_reminder(
    reminder_id: int,
    reminder_data: MedicineReminderUpdate,
    db: Session = Depends(get_db),
):
    reminder = db.query(MedicineReminder).filter(
        MedicineReminder.id == reminder_id
    ).first()

    if reminder is None:
        raise HTTPException(
            status_code=404,
            detail="Reminder not found",
        )

    changes = reminder_data.model_dump(exclude_unset=True)

    for field, value in changes.items():
        if value is not None:
            setattr(reminder, field, value)

    db.commit()
    db.refresh(reminder)
    return reminder


@app.delete(
    "/reminders/{reminder_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
):
    reminder = db.query(MedicineReminder).filter(
        MedicineReminder.id == reminder_id
    ).first()

    if reminder is None:
        raise HTTPException(
            status_code=404,
            detail="Reminder not found",
        )

    db.delete(reminder)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
