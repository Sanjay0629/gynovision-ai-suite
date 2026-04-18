FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
COPY models/ ./models/

# Expose Hugging Face default port
EXPOSE 7860

CMD ["python", "app.py"]
