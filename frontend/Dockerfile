FROM node:18-alpine

WORKDIR /app

# Copy package files to install dependencies in the container
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend files
COPY . .

# Expose the port Next.js runs on
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]