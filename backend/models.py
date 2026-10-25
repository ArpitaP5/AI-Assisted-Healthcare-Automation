
from datetime import date, time

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Time
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Medicine(Base):
    __tablename__ = "medicines"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    dosage: Mapped[str] = mapped_column(String(100), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

    reminders: Mapped[list["MedicineReminder"]] = relationship(
        back_populates="medicine",
        cascade="all, delete-orphan",
    )


class MedicineReminder(Base):
    __tablename__ = "medicine_reminders"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    medicine_id: Mapped[int] = mapped_column(
        ForeignKey("medicines.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    reminder_time: Mapped[time] = mapped_column(Time, nullable=False)
    is_enabled: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

    medicine: Mapped["Medicine"] = relationship(
        back_populates="reminders"
    )
