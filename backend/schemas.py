
from datetime import date, time

from pydantic import BaseModel, ConfigDict


class MedicineCreate(BaseModel):
    name: str
    dosage: str
    start_date: date
    end_date: date | None = None


class MedicineUpdate(MedicineCreate):
    pass


class MedicineResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    dosage: str
    start_date: date
    end_date: date | None
    is_active: bool


class MedicineReminderCreate(BaseModel):
    reminder_time: time
    is_enabled: bool = True


class MedicineReminderUpdate(BaseModel):
    reminder_time: time | None = None
    is_enabled: bool | None = None


class MedicineReminderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    medicine_id: int
    reminder_time: time
    is_enabled: bool
