FROM oven/bun:1-slim

# Set working directory
WORKDIR /app

# Copy project files
COPY . /app

# Install dependencies
RUN bun install

# Build the project
RUN bun run build

# Expose the application port
EXPOSE 3000

ENV NEXT_TELEMETRY_DISABLED=1
ENV UV_THREADPOOL_SIZE=1

RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]