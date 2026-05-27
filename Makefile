staging:
	docker compose -p lumi-staging --env-file .env.staging pull dashboard
	docker compose -p lumi-staging --env-file .env.staging up -d

production:
	docker compose -p lumi-production --env-file .env.production pull dashboard
	docker compose -p lumi-production --env-file .env.production up -d

down-staging:
	docker compose -p lumi-staging --env-file .env.staging down

down-production:
	docker compose -p lumi-production --env-file .env.production down

logs-staging:
	docker compose -p lumi-staging --env-file .env.staging logs -f

logs-production:
	docker compose -p lumi-production --env-file .env.production logs -f

dev:
	cp .env.staging .env.local && npm run dev
