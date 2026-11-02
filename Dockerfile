# Multi-stage image running both Node.js (Web Server + React UI) and Python 3.10 (ML Pipeline)
FROM python:3.10-slim

# Avoid prompts during installation
ENV DEBIAN_FRONTEND=noninteractive
ENV PORT=3000
ENV NODE_ENV=production

# Install Node.js 20, npm, build essentials and git
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    git \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency specifications first for optimal Docker layer caching
COPY package*.json ./
RUN npm install

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application code and datasets
COPY . .

# Build the React frontend production bundle
RUN npm run build

# Expose standard web port
EXPOSE 3000

# Start Express server with Node.js
CMD ["npm", "run", "start"]
