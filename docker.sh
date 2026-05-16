docker build -t social-network:latest . && \
docker run -p 3000:3000 -p 8080:8080 social-network:latest