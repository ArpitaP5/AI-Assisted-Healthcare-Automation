from datetime import date

from backend.database import SessionLocal
from backend.models import Medicine
db = SessionLocal()

try:
    medicine = Medicine(
        name="Demo Medicine",
        dosage="As prescribed",
        start_date=date(2026, 10, 24),
        end_date=None,
    )

    db.add(medicine)
    db.commit()
    db.refresh(medicine)

    print("Medicine saved successfully!")
    print(f"Medicine ID: {medicine.id}")

except Exception as error:
    db.rollback()
    print("Could not save medicine.")
    print(error)

finally:
    db.close()