## Install

1.  https://github.com/asdf-vm/asdf-nodejs
1.  `yarn install`
1.  `AWS_PROFILE=prod AWS_REGION=us-east-1 yarn start`
1.  http://localhost:3000/graphiql

## Admin

If you install admin in the same directory and build it, it will serve at http://localhost:3000/admin

```
|-now-api
| \-(yarn server)
|-now-admin
| \-dist
```

## Deploy

Deployments are handled by travis via `bin/deploy.sh`

## Postgres

### MacOS

- `brew install postgresql@9.6`
- `brew services start postgresql@9.6`
- `echo 'export PATH="/usr/local/opt/postgresql@9.6/bin:$PATH"' >> ~/.bash_profile`
- `createdb meetup_now`
- `createdb meetup_now_test`

### Ubuntu

- `sudo apt install postgres`
- `sudo -u postgres -i`
  - `createuser YOUR_USER_ID`
  - `createdb meetup_now`
  - `createdb meetup_now_test`
  - `psql`
    - `GRANT ALL ON DATABASE meetup_now to YOUR_USER_ID`
    - `GRANT ALL ON DATABASE meetup_now_test to YOUR_USER_ID`

### All

- `yarn migrate:test`
- `yarn migrate:development`
