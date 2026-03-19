FROM python:3.10-slim

WORKDIR /app

# System deps for image processing (Pillow, OpenCV-like ops, matplotlib)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY model_server.py .

EXPOSE 5009

CMD ["python", "model_server.py"]
