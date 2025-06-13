
FROM node:18-slim

# Add debugging information
RUN echo "=== Starting Docker build ==="
RUN node -v && npm -v
RUN echo "=== Node and npm versions confirmed ==="

# Install system dependencies including Python and pip
RUN echo "=== Installing system dependencies ==="
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN echo "=== System dependencies installed ==="

# Create a Python virtual environment and install yt-dlp
RUN echo "=== Setting up Python virtual environment ==="
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --upgrade pip
RUN echo "=== Installing yt-dlp ==="
RUN pip install yt-dlp
RUN echo "=== yt-dlp installed successfully ==="

# Create app directory
WORKDIR /app
RUN echo "=== Working directory set to /app ==="

# Copy package files
RUN echo "=== Copying package files ==="
COPY package*.json ./
RUN echo "=== Package files copied ==="
RUN ls -la

# Install dependencies using npm install (not npm ci)
RUN echo "=== Installing npm dependencies ==="
RUN npm install --omit=dev
RUN echo "=== npm dependencies installed successfully ==="

# Copy source code
RUN echo "=== Copying source code ==="
COPY . .
RUN echo "=== Source code copied ==="

# Create non-root user
RUN echo "=== Setting up non-root user ==="
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
