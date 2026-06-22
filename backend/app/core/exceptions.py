"""
core/exceptions.py
===================
Excepciones HTTP reutilizables para todo el proyecto.

Centralizar aquí los errores evita repetir HTTPException con los mismos
códigos y mensajes en cada router. Para usarlas, simplemente importa la
función correspondiente y llámala con los parámetros requeridos.

Uso desde cualquier router:
    from app.core.exceptions import raise_not_found, raise_conflict
    raise_not_found("Patient", patient_id)
"""

from fastapi import HTTPException, status


# ---- 404 Not Found ---------------------------------------------------
def raise_not_found(entity: str, entity_id: int) -> None:
    """Lanza HTTP 404 con mensaje estándar.

    Args:
        entity:    Nombre de la entidad (ej. "Patient", "Doctor").
        entity_id: Identificador que no se encontró.
    """
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{entity} con id={entity_id} no encontrado.",
    )


# ---- 409 Conflict ----------------------------------------------------
def raise_conflict(detail: str) -> None:
    """Lanza HTTP 409 con el mensaje de conflicto recibido.

    Args:
        detail: Descripción del conflicto (ej. duplicado, ya vinculado).
    """
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=detail,
    )


# ---- 400 Bad Request --------------------------------------------------
def raise_bad_request(detail: str) -> None:
    """Lanza HTTP 400 con el mensaje de error recibido."""
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=detail,
    )
