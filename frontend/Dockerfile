# Use "slim" instead of "alpine" for better compatibility with native modules
FROM node:20-slim

# Install essential build tools
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Force install for the container environment
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]