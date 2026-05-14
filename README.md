Run the docker compose after setting up .env.docker on vps with the following command:

```bash
docker compose --env-file .env.docker -f docker-compose.vps.yml up -d
```

Make sure to replace the placeholders in the .env.docker file with your actual values before running the command. This will start the necessary services for your application in detached mode.

