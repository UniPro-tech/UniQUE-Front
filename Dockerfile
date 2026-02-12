FROM oven/bun:1-slim

# Set working directory
WORKDIR /app

# Install dependencies
COPY bun.lock /app/bun.lock
COPY package.json /app/package.json
RUN bun install --frozen-lockfile

# Copy project files
COPY . /app

# Build the project
RUN bun run build

# Expose the application port
EXPOSE 3000

ENV NEXT_TELEMETRY_DISABLED=1

CMD ["sh", "-c", "bun run build && bun run start"]