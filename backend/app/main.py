from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.summary import router as summary_router
from app.routes.hotspots import router as hotspots_router
from app.routes.map_points import router as map_points_router
from app.routes.trends import router as trends_router
from app.routes.recommendations import router as recommendations_router
from app.routes.filters import router as filters_router
from app import csv_import

app = FastAPI(title="AI Parking Intelligence Dashboard API", version="1.0.0")

# Enable CORS for frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:3000",
        "https://ai-parking-intelligence-dashboard.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(summary_router)
app.include_router(hotspots_router)
app.include_router(map_points_router)
app.include_router(trends_router)
app.include_router(recommendations_router)
app.include_router(filters_router)
app.include_router(csv_import.router, tags=["Import"])

@app.on_event("startup")
async def startup_event():
    print("Registered Routes:")
    for route in app.routes:
        if hasattr(route, "methods"):
            print(f"{list(route.methods)} {route.path}")

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Parking Intelligence Dashboard API"}

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "AI Parking Intelligence Backend"
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
