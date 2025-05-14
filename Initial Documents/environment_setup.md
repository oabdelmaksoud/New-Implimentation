# Development Environment Setup

## System Requirements
- **Operating System**: macOS 12+ or Ubuntu 20.04+
- **CPU**: 4 cores minimum (8 recommended)
- **Memory**: 16GB RAM minimum (32GB recommended)
- **Storage**: 50GB available space
- **Network**: Stable internet connection

## Software Requirements
1. **Core Tools**:
   - Git 2.35+
   - Docker 20.10+
   - Docker Compose 2.5+
   - Node.js 18+ (with npm 9+)
   - Python 3.10+
   - Redis 7.0+

2. **Frontend Development**:
   - React 18+
   - Material-UI 5+
   - Redux Toolkit 1.9+
   - D3.js 7.8+

3. **Backend Development**:
   - FastAPI 0.85+
   - GraphQL 3.0+
   - WebSocket support
   - PostgreSQL 14+

## Installation Instructions

### macOS Setup
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install core packages
brew install git docker node python redis postgresql

# Install Python packages
pip install fastapi uvicorn[standard] websockets python-dotenv

# Install Node packages
npm install -g npm@latest
```

### Ubuntu Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install core packages
sudo apt install -y git docker.io docker-compose nodejs npm python3 python3-pip redis postgresql

# Install Python packages
pip install fastapi uvicorn[standard] websockets python-dotenv

# Install Node packages
sudo npm install -g npm@latest
```

## Configuration

### Docker Setup
```bash
# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
docker --version
docker-compose --version
```

### Database Configuration
```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database user
sudo -u postgres createuser --interactive
```

### Environment Variables
Create `.env` file with:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/agent_system
REDIS_URL=redis://localhost:6379
API_SECRET_KEY=your-secret-key-here
```

## Validation Steps
1. Verify installations:
```bash
git --version
node --version
npm --version
python --version
docker --version
redis-cli ping
```

2. Test database connection:
```bash
psql -U user -d agent_system -c "SELECT version();"
```

3. Run basic API test:
```python
# test_api.py
from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "API is working"}

# Run with: uvicorn test_api:app --reload
```

## Troubleshooting
- **Docker permissions**: Add user to docker group
- **PostgreSQL access**: Configure pg_hba.conf
- **Python path issues**: Use virtual environments
- **Node version conflicts**: Use nvm for management
