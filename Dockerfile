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

# Start the application
CMD ["sh", "-c", "bun run build && bun run start"]