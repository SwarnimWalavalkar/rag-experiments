# If the first argument is "migrate"...
ifeq (migrate,$(firstword $(MAKECMDGOALS)))
  # use the rest as arguments for "migrate"
  RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  # ...and also turn them into empty targets
  $(eval $(RUN_ARGS):;@:)
endif

restart: stop start

restart-all: stop start-all

stop:
	docker compose -f docker/dependencies.yml -f docker/app.yml --env-file .env down -v --remove-orphans

start:
	docker compose -f docker/dependencies.yml --env-file .env up -d

start-all:
	docker compose -f docker/dependencies.yml -f docker/app.yml --env-file .env up -d

migrate:
	npx zx ./scripts/migrate.mjs $(RUN_ARGS)