# Tunerr

Tunerr is a simple web app that lets you create shared rooms where invited friends can control your spotify playback (skip, pause and play), perfect for when your hanging out and playing music without needing to pass your phone around.

**Note:** This app uses the spotify API which requires spotify premium for most functionality.

## Run Locally

### Setup Server

Install Dependencies

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

Apply Migrations

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

## Tech Stack

**Client:** React, Javascript, Material UI

**Backend:** Django, Python

## Authors

- [@jcbyte](https://github.com/jcbyte)
