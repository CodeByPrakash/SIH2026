# MPLADS-SATHI: Production FastAPI Inference Container
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY Model/serving/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model artifacts and serving code
COPY Model/saved_models/ ./saved_models/
COPY Model/serving/api.py ./api.py

EXPOSE 8000

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
