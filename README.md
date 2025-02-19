# <img src="frontend/static/favicon.ico" height="40"> &nbsp;Tunerr

A web app for shared music control. Tunerr allows creating rooms, inviting friends, and lets everyone play, pause, or skip tracks on your Spotify account without needing to pass your phone around.

**Note:** This app uses the spotify API which requires spotify premium for most functionality.

## Run Locally

### Setup Server

Install dependencies

```bash
pip install -r requirements.txt
```

Set environment variables at `tunerr/.env`

```ini
SECRET_KEY=...

# Spotify API Secrets
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
```

Apply migrations

```bash
python manage.py migrate
```

Run Server

```bash
python manage.py runserver
```

### Setup frontend

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Build Frontend

```bash
npm run dev
```

## Licence

[Apache License 2.0](LICENSE)
