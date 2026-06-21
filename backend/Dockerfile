FROM python:3.10-slim

# Install libpq-dev and gcc for psycopg2
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Run FastAPI app
CMD ["python", "app/main.py"]
