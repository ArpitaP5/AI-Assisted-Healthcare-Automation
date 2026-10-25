
from backend.database import engine
from backend.models import Base, Medicine, MedicineReminder

Base.metadata.create_all(
    bind=engine,
    tables=[MedicineReminder.__table__],
)

print("Medicine reminders table is ready.")
