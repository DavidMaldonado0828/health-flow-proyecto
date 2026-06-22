from fastapi import FastAPI

from app.auth.routes.router import router as auth_router

app = FastAPI(title="Health Flow API")


@app.get("/")
def read_root():
    return {"message": "Bienvenido al Backend de Health Flow"}


app.include_router(auth_router)
