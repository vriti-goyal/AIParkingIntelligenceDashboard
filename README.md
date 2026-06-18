# AI Parking Intelligence Dashboard

## 1. Problem Statement
Traffic police currently struggle to efficiently deploy patrols due to an overwhelming number of parking violations reported without context regarding spatial density or their actual impact on traffic congestion. Managing this massive influx of unorganized data leads to sub-optimal enforcement and worsened city-wide traffic delays.

## 2. Solution Overview
The AI Parking Intelligence Dashboard provides traffic enforcement agencies with actionable, data-driven insights. It ingests large volumes of parking violation data, clusters them into actionable hotspots using geospatial algorithms, and assigns priority scores. This allows authorities to optimize patrol deployments, prioritize critical congestion nodes, and mitigate overall traffic delays.

## 3. Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Recharts, Leaflet
- **Backend:** Python, FastAPI, Pandas, Scikit-learn, SQLAlchemy, Pydantic
- **Database:** PostgreSQL, PostGIS, TimescaleDB

## 4. Dataset Details
The platform is designed to handle large-scale civic data. It processes a dataset of nearly 300,000 parking violation records, which includes precise timestamps, geographical coordinates (latitude/longitude), specific violation types, validation statuses, and police station jurisdictions.

## 5. Database Architecture: PostgreSQL + PostGIS + TimescaleDB
- **PostgreSQL:** Serves as the robust relational foundation for the application.
- **PostGIS:** Adds advanced spatial indexing and querying capabilities, enabling extremely fast geographic filtering and bounding-box queries.
- **TimescaleDB:** Used for scalable time-series data storage. It automatically partitions the high-volume, timestamped violation records (hyper-tables) to ensure query performance remains blazing fast even as the dataset grows into the millions.

## 6. Backend APIs
Fast and scalable REST APIs built with FastAPI:
- `/summary`: Aggregates top-level KPIs (total violations, enforcement rates, estimated average delays).
- `/hotspots`: Returns geolocation clusters with severity categorizations and priority scoring.
- `/map-points`: Fetches raw coordinates for rendering individual violations.
- `/trends/daily`, `/trends/hourly`, `/trends/violation-types`, `/trends/police-stations`: Provide deep analytical aggregations for charts.
- `/recommendations`: Delivers AI-generated, actionable patrol and policy recommendations based on current data trends.

## 7. Analytics Logic
The analytics engine applies dynamic filtering by police station, violation type, vehicle type, and timeframe. It calculates real-time enforcement rates by evaluating action-taken timestamps and validation statuses, and estimates traffic delays by assigning weighted penalties to severe violations (e.g., wrong parking or parking near a junction).

## 8. Hotspot Clustering Explanation
The backend utilizes the **DBSCAN** (Density-Based Spatial Clustering of Applications with Noise) algorithm via Scikit-learn. It processes raw latitude and longitude coordinates to identify dense geographic clusters of violations within a specific radius (epsilon). This effectively separates significant, recurring problem areas (hotspots) from isolated, one-off parking incidents (noise).

## 9. Congestion Impact Scoring Formula
Each identified hotspot receives a `priority_score` from 0-100. The formula heavily weights the total volume of violations within the cluster, but applies critical multipliers for high-impact factors. For instance, a cluster predominantly composed of "Parking Near Road Crossing" or one located near a major junction will receive a significantly higher score, marking it as "Critical" for immediate dispatch.

## 10. How to start Docker database
To spin up the PostgreSQL database pre-configured with PostGIS and TimescaleDB:
```bash
docker compose up -d postgres
```

## 11. How to import large CSV using backend/import_large_csv.py
To quickly ingest hundreds of thousands of records using the optimized chunking script:
```bash
cd backend
python import_large_csv.py ../data/your_dataset.csv
```

## 12. How to start backend
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 13. How to start frontend
```bash
cd frontend
npm install
npm run dev
```

## 14. Demo Flow for Judges
1. **Overview:** Start at the top KPIs to show the scale of the system (e.g., analyzing 300k+ records instantly). Highlight the Enforcement Rate and Estimated Avg Delay.
2. **Interactive Map:** Scroll to the map. Toggle the severity legend and click on a large, red "Critical" hotspot to show the detailed tooltip (junction, violation count).
3. **AI Enforcement Priority:** Walk through the ranked list next to the map. Explain how the DBSCAN algorithm and the Congestion Impact Scoring formula prioritize these specific locations over others.
4. **Analytics & Trends:** Scroll down to the charts to display the breakdown of violation types and which police stations are facing the heaviest workloads.
5. **Actionable Insights:** Finish by highlighting the AI Recommendations panel, demonstrating how raw data is translated into concrete patrol strategies and infrastructure policy advice.

## 15. Known Data Limitation
- Congestion delay is estimated from rule-based scoring because live traffic feed is not integrated yet.

## 16. Future Scope
- **Kafka live ingestion:** For real-time streaming of parking violations from edge cameras or citizen apps.
- **SCITA integration:** Integrating with broader Smart City frameworks and IoT sensors.
- **Google Maps / HERE traffic API:** Overlaying real-time traffic congestion data to dynamically adjust hotspot priority scores.
- **OR-Tools patrol routing:** Generating mathematically optimized, turn-by-turn routing for patrol vehicles to cover multiple hotspots efficiently.
- **MLflow tracking:** For versioning and tracking the performance of the clustering and predictive models over time.
- **Docker / Kubernetes deployment:** Containerizing the frontend and backend for scalable, cloud-native orchestration.
