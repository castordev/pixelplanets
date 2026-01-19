#!/usr/bin/env bash
set -o errexit

# Ensure Skyfield ephemeris file is available in the deployment bundle.
# de421.bsp is ~16–20MB and can be too large for some git workflows; download at build time.
if [ ! -f "de421.bsp" ]; then
	echo "Downloading de421.bsp (Skyfield ephemeris)..."
	# Prefer curl, but fall back to a Python downloader if curl isn't available.
	if command -v curl >/dev/null 2>&1; then
		curl -L -o de421.bsp "https://ssd.jpl.nasa.gov/ftp/eph/planets/bsp/de421.bsp"
	else
		python - <<'PY'
import sys, urllib.request
url = 'https://ssd.jpl.nasa.gov/ftp/eph/planets/bsp/de421.bsp'
print('Downloading', url)
try:
		urllib.request.urlretrieve(url, 'de421.bsp')
except Exception as e:
		print('Download failed:', e, file=sys.stderr)
		sys.exit(2)
PY
	fi
fi

python manage.py collectstatic --noinput
