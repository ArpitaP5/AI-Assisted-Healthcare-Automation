from sqlalchemy import select

from backend.database import SessionLocal
from backend.models import Medicine
db = SessionLocal()
statement = select(Medicine)
medicines = db.scalars(statement).all()
for medicine in medicines:
    print(f"ID: {medicine.id}")
    print(f"Name: {medicine.name}")
    print(f"Dosage: {medicine.dosage}")
    print("-" * 30)
    db.close()