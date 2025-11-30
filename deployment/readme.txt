Сбилдить локально:

docker image rm neurochar-frontend-client-frontend-room:v1 && docker build --no-cache -t neurochar-frontend-client-frontend-room:v1 . && docker save --output ./deployment/builds/neurochar-frontend-client-frontend-room.v1.tar neurochar-frontend-client-frontend-room:v1

Запустить локально:

docker-compose --project-directory ./deployment up

Загрузить на сервере

docker load --input builds/neurochar-frontend-client-frontend-room.v1.tar

Удалить все неиспользуемое

docker system prune -a

Перезапустить с обновленными образами на сервере:

docker compose up -d --force-recreate






