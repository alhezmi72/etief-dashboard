############################################################
# Stage 1 — Build React Applications
############################################################
FROM node:20-alpine AS builder

# Build Page 1
WORKDIR /build/technologies-exploration
COPY technologies-exploration/package*.json ./
RUN npm install
COPY technologies-exploration/ .
RUN npm run build

# Build Page 2
WORKDIR /build/technologies-assessment
COPY technologies-assessment/package*.json ./
RUN npm install
COPY technologies-assessment/ .
RUN npm run build


############################################################
# Stage 2 — Assemble Final Web Server
############################################################
FROM python:3.12-slim

# Working directory for serving all static files
WORKDIR /app/html

# Copy main landing page
COPY html/index.html ./index.html

# Copy React build artifacts from builder stage
COPY --from=builder /build/technologies-exploration/dist ./page1
COPY --from=builder /build/technologies-assessment/dist ./page2

# Expose port for HTTP server
EXPOSE 8080

# Default command — lightweight static hosting
CMD ["python", "-m", "http.server", "8080", "--directory", "/app/html"]
