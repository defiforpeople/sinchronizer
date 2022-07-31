# load .env file
include .env
export $(shell sed 's/=.*//' .env)

VERSION=$$(cat package.json | grep version | sed 's/"/ /g' | awk {'print $$3'})

install:
	@echo "[install] Installing dependencies..."
	@npm install

typescript: clean
	@echo "[typescript] Transpiling code..."
	@npm run typescript

clean:
	@echo "[clean] Cleaning..."
	@rm -rf dist

linter:
	@echo "[linter] Running linter..."
	@npm run linter

check:
	@echo "[check] Checking project..."
	@make typescript
	@make test
	@make linter

compose:
	@echo "[run-dev] Running docker compose..."
	@docker-compose --env-file .env up --build

compose-dev:
	@echo "[run-dev] Running docker compose for dev..."
	@docker-compose --env-file .env -f docker-compose.dev.yml up -d --build

run:
	@echo "[run] running service..."
	@make compose
	
dev: compose-dev
	@echo "[dev] running service in debug mode..."
	@npm run dev 

stop:
	@echo "[stop] Stopping docker compose"
	@docker-compose --env-file .env down || true

deploy:
	@echo "[deploy] Deploying version to remote server..."
	@ssh -i "dfp.pem" $(SSH_MACHINE) "make deploy-interval BRANCH=$(BRANCH)"

deploy-internal:
	@echo "[deploy] Internal deploying..."
	@make stop
	@git checkout $(BRANCH)
	@git pull origin $(BRANCH)
	@make install
	@make dev

destroy:
	@echo "[destroy] Destroying..."

destroy-internal:
	@echo "[destroy] Internal destroying..."
	@make stop

remote:
	@echo "[remote] Connecting to machine via SSH..."
	@ssh -i "dfp.pem" $(SSH_MACHINE)

docker:
	@echo "[docker] Building docker image..."
	@docker buildx build --platform linux/amd64,linux/arm64 --push -t $(CONTAINER_NAME):$(VERSION) .

.PHONY: install typescript clean linter check compose compose-dev run dev stop deploy deploy-internal destroy destroy-internal remote docker