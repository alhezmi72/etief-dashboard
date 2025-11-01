############################################################
# Stage 1 — Build React Applications
############################################################
FROM node:20-alpine AS builder

# ----------- Build  The App -----------
WORKDIR /build/landing
COPY ./package*.json ./
RUN npm install
COPY . .
RUN npm run build



############################################################
# Stage 2 — Assemble Final Web Server
############################################################
FROM python:3.12-slim

# Working directory for serving all static files
WORKDIR /app/html


# Copy React build artifacts from builder stage
COPY --from=builder /build/landing/dist ./ 

# Expose port for HTTP server
EXPOSE 8080

# Default command — lightweight static hosting
CMD ["python", "-m", "http.server", "8080", "--directory", "/app/html"]
