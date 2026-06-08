from fastapi import FastAPI

app = FastAPI(title="Health Flow API")


@app.get("/")
def read_root():
    return {"message": "Bienvenido al Backend de Health Flow"}


# Aquí después importarás los routers de tus módulos
# from app.auth.routes import router as auth_router
# app.include_router(auth_router, prefix="/auth")
