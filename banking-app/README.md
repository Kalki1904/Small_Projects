# Banking Microservice – Docker & File-Based Persistence

A Node.js REST API that manages banking operations using **flat-file storage (`.txt`) instead of a traditional database**, containerized using Docker.

This project explores Docker containerization, bind mounts, anonymous volumes, persistent storage, and asynchronous file handling in Node.js.

## 🚀 Project Overview

The application stores account information, transaction records, and login audit trails using local text files.

The primary objective is to understand how application data and dependencies behave inside Docker containers and how to maintain persistence beyond a container's lifecycle.

### Key Features

- Account registration and management.
- Authentication and login audit tracking.
- Balance and transaction management.
- Asynchronous file operations using Node.js `fs/promises`.
- Persistent application data using Docker bind mounts.
- Dependency isolation using anonymous volumes.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| Express.js | REST API |
| Docker | Containerization |
| Linux | Development environment |
| TXT Files | File-based data storage |
| Docker Volumes | Persistent storage and dependency isolation |

## 📂 Project Structure

```text
banking-microservice/
│
├── data/
│   ├── accounts.txt
│   ├── transactions.txt
│   └── login_logs.txt
│
├── node_modules/
├── src/
│   └── ...
│
├── package.json
├── package-lock.json
├── Dockerfile
└── README.md
```

*Actual file structure may vary depending on your implementation.*

## 🐳 Docker Implementation

### 1. Build the Docker Image

```bash
docker build -t banking-api .
```

### 2. Run the Container

```bash
docker run -d \
  --name banking-container \
  -p 3000:3000 \
  banking-api
```

### 3. Check Running Containers

```bash
docker ps
```

### 4. View Container Logs

```bash
docker logs banking-container
```

Follow logs continuously:

```bash
docker logs -f banking-container
```

### 5. Access the Container

```bash
docker exec -it banking-container sh
```

## 💾 Docker Storage Management

One of the main objectives of this project is understanding Docker storage mechanisms.

### A. Bind Mounts – Persistent Application Data

Mount the host's `data` directory into the container.

```bash
docker run -d \
  --name banking-container \
  -p 3000:3000 \
  -v "$(pwd)/data:/app/data" \
  banking-api
```

**How it works:**

- Host directory: `./data`
- Container directory: `/app/data`
- Application data is stored directly on the host.
- Removing the container does not remove the host files.

Test persistence:

```bash
docker rm -f banking-container
```

Run a new container with the same bind mount and verify that the previous data is still available.

### B. Anonymous Volumes – Dependency Protection

When mounting the project directory into `/app`, the host directory can hide the container's existing `node_modules`.

Use an anonymous volume to protect the dependency directory.

```bash
docker run -d \
  --name banking-dev \
  -p 3000:3000 \
  -v "$(pwd):/app" \
  -v /app/node_modules \
  -v "$(pwd)/data:/app/data" \
  banking-api
```

**Why use this?**

- Mounts local source code into the container.
- Keeps `node_modules` isolated from the host directory.
- Allows changes to source files to be reflected inside the container.

### C. Named Volumes

Create a Docker-managed volume:

```bash
docker volume create banking-data
```

Run the application:

```bash
docker run -d \
  --name banking-volume \
  -p 3000:3000 \
  -v banking-data:/app/data \
  banking-api
```

Inspect the volume:

```bash
docker volume inspect banking-data
```

List all volumes:

```bash
docker volume ls
```

## 🔍 Useful Docker Commands

| Command | Description |
|---|---|
| `docker ps` | List running containers |
| `docker ps -a` | List all containers |
| `docker images` | List available images |
| `docker build -t banking-api .` | Build image |
| `docker logs <container>` | View logs |
| `docker exec -it <container> sh` | Enter container |
| `docker stop <container>` | Stop container |
| `docker start <container>` | Start container |
| `docker rm -f <container>` | Force remove container |
| `docker volume ls` | List volumes |
| `docker volume inspect <volume>` | Inspect volume |
| `docker volume rm <volume>` | Remove volume |
| `docker image rm <image>` | Remove image |

## 🧪 Testing Data Persistence

To verify that Docker storage works as expected:

**Step 1:** Start the application with a bind mount.

**Step 2:** Register an account or perform a transaction.

**Step 3:** Check the host directory.

```bash
ls -la ./data
```

**Step 4:** Remove the container.

```bash
docker rm -f banking-container
```

**Step 5:** Start a new container using the same bind mount.

**Step 6:** Verify that the previous account and transaction data still exist.

This demonstrates that application data is independent of the container lifecycle.

## ⚠️ Limitations and Learning Outcomes

Using flat files instead of a database introduces several engineering challenges:

- Concurrent file access.
- Atomic write operations.
- Data consistency.
- Transaction recovery.
- File corruption handling.
- Multi-container synchronization.

These limitations make flat-file storage unsuitable for production banking systems without additional safeguards.

### What I Learned

- Docker container lifecycle management.
- Difference between bind mounts and Docker volumes.
- Anonymous vs named volumes.
- Persistent storage across container recreation.
- Node.js asynchronous file handling.
- Application state management without database abstractions.

## 🔮 Future Improvements

- [ ] Automate Docker image builds using Jenkins.
- [ ] Integrate automated API testing.
- [ ] Implement atomic file writes and transaction recovery.
- [ ] Add Docker Compose.
- [ ] Introduce PostgreSQL for transactional persistence.
- [ ] Implement CI/CD deployment.

## 👨‍💻 Author

Developed as a hands-on learning project focused on Docker, Linux, Node.js, and DevOps fundamentals.

**Focus:** Containerization | Storage Persistence | Backend Development | CI/CD

---

⭐ If you find this project interesting, feel free to explore the repository!
