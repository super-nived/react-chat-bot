# Use Node.js 18 slim image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package.json /app/
COPY package-lock.json /app/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . /app

# Build the Vite application
RUN npm run build

# Expose the port that Vite uses in production
EXPOSE 4173

# Replace placeholders in env.js and start the Vite server
CMD sed -i "s|PLACEHOLDER_COLOR|${VITE_APP_COLOR}|" dist/env.js && \
    sed -i "s|PLACEHOLDER_TEXT|${VITE_APP_MAIN_TEXT}|" dist/env.js && \
    sed -i "s|PLACEHOLDER_API_URL|${VITE_APP_API_URL}|" dist/env.js && \
    npx vite preview --host 0.0.0.0 --port 4173
