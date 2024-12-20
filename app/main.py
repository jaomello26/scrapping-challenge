from fastapi import FastAPI
from app.routes.review import router

app = FastAPI()

app.include_router(router, prefix="/api", tags=["Reviews"])
