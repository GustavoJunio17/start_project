#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

set -e

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Start Application - Docker Deployment Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}Creating .env from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${RED}⚠️  Please edit .env with your settings before deploying!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .env file found${NC}\n"

# Check Docker and Docker Compose
echo -e "${BLUE}Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker found: $(docker --version)${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose found: $(docker-compose --version)${NC}\n"

# Menu
echo -e "${BLUE}What would you like to do?${NC}"
echo "1) Build and start services (development)"
echo "2) Build and start services (production)"
echo "3) Stop services"
echo "4) Restart services"
echo "5) View logs"
echo "6) Run migrations"
echo "7) Seed database with examples"
echo "8) Clean up (remove containers and volumes)"
echo "9) Exit"

read -p "Select option (1-9): " option

case $option in
    1)
        echo -e "\n${BLUE}Starting development environment...${NC}\n"
        docker-compose build
        docker-compose up -d
        echo -e "\n${GREEN}✅ Development environment started!${NC}"
        echo -e "${BLUE}Application: http://localhost:3000${NC}"
        docker-compose ps
        ;;

    2)
        echo -e "\n${BLUE}Starting production environment...${NC}\n"
        echo -e "${YELLOW}⚠️  Make sure to configure:${NC}"
        echo "  - Valid JWT_SECRET (32+ characters)"
        echo "  - Valid SETUP_SECRET (32+ characters)"
        echo "  - NEXT_PUBLIC_APP_URL (your domain)"
        echo "  - SSL certificates in /etc/letsencrypt/"
        read -p "Continue? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            docker-compose -f docker-compose.prod.yml build
            docker-compose -f docker-compose.prod.yml up -d
            echo -e "\n${GREEN}✅ Production environment started!${NC}"
            docker-compose -f docker-compose.prod.yml ps
        else
            echo -e "${YELLOW}Cancelled${NC}"
        fi
        ;;

    3)
        echo -e "\n${BLUE}Stopping services...${NC}\n"
        docker-compose down
        echo -e "${GREEN}✅ Services stopped${NC}"
        ;;

    4)
        echo -e "\n${BLUE}Restarting services...${NC}\n"
        docker-compose restart
        echo -e "${GREEN}✅ Services restarted${NC}"
        docker-compose ps
        ;;

    5)
        echo -e "\n${BLUE}Viewing logs (press Ctrl+C to exit)...${NC}\n"
        read -p "Choose service (app/postgres/all): " service
        case $service in
            app)
                docker-compose logs -f app
                ;;
            postgres)
                docker-compose logs -f postgres
                ;;
            *)
                docker-compose logs -f
                ;;
        esac
        ;;

    6)
        echo -e "\n${BLUE}Running migrations...${NC}\n"
        docker-compose exec app npm run migrate
        echo -e "\n${GREEN}✅ Migrations completed${NC}"
        ;;

    7)
        echo -e "\n${BLUE}Seeding database with examples...${NC}\n"
        docker-compose exec app npm run seed:examples
        echo -e "\n${GREEN}✅ Database seeded${NC}"
        ;;

    8)
        echo -e "\n${YELLOW}⚠️  This will delete all containers and volumes (including database data)!${NC}"
        read -p "Continue? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            docker-compose down -v
            echo -e "${GREEN}✅ Cleanup completed${NC}"
        else
            echo -e "${YELLOW}Cancelled${NC}"
        fi
        ;;

    9)
        echo -e "${YELLOW}Exiting...${NC}"
        exit 0
        ;;

    *)
        echo -e "${RED}Invalid option!${NC}"
        exit 1
        ;;
esac
