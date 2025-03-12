FROM node:latest

# Set working directory to /app
WORKDIR /app

# Copy package*.json into the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code into the working directory
COPY . .

# Expose port 3000 to the docker host, so we can access it
# from the outside.
EXPOSE 3000

ENV PORT=3000

# Run command to start the development server when the container launches
CMD ["npm", "start"]