FROM python:3.10-slim

WORKDIR /app

# Install system deps for LightGBM
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY models/ ./models/

# Expose Hugging Face default port
EXPOSE 7860

CMD ["python", "app.py"]
