# Gandom Kit (api)

run: npm start
production:

    pm2 start ./bin/www --watch --log /home/hossein/apps/vecthor.log

## Connect to the DB

sudo service postgresql start
sudo -u vecthor_admin psql -d vecthor_db

## Migrations

--env: ['dev', 'prod']

knex migrate:latest --env [ENV]
knex seed:run --env [ENV] [TABLE]
knex migrate:make --env [ENV] [NAME]
knex migrate:up --env [ENV]
knex migrate:down --env [ENV]
