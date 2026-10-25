
from backend.database import engine
from backend.models import Base, Medicine

Base.metadata.create_all(bind=engine)

print("Database tables created successfully.")
