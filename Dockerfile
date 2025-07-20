# Use the official Bun image
FROM oven/bun:slim

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . .

# Expose the port (default 3220, but configurable via PORT env var)
EXPOSE 3220

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --version > /dev/null || exit 1

# Start the application
CMD ["bun", "index.ts"]