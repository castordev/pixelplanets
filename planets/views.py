from django.shortcuts import render
from .planets_distance import get_distance
from skyfield.api import load, utc
import math
import json
from datetime import datetime

def home_view(request):       
    planets = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
    return render(request, 'planets/index.html', {'planets': planets})

def distance_view(request, planet_name):
    try:
        distance = get_distance(planet_name)
        return render(request, 'planets/distance.html', {
            'planet_name': planet_name,
            'distance': int(distance)
        })
    except KeyError:
        return render(request, 'planets/error.html', {'message': 'Planet not found.'})

def orbits(request):
    # Procesar la fecha seleccionada
    date_str = request.GET.get('date')
    if date_str:
        selected_date = datetime.strptime(date_str, '%Y-%m-%d').replace(tzinfo=utc)
    else:
        selected_date = datetime.utcnow().replace(tzinfo=utc)

    ts = load.timescale()
    t = ts.from_datetime(selected_date)
    bodies = load('de421.bsp')
    sun = bodies['sun']

    planet_names = ['mercury','venus','earth','mars','jupiter','saturn','uranus','neptune']
    radii = [80, 120, 160, 200, 260, 320, 380, 440]

    sf_planets = {
        'mercury': bodies['mercury'],
        'venus': bodies['venus'],
        'earth': bodies['earth'],
        'mars': bodies['mars barycenter'],
        'jupiter': bodies['jupiter barycenter'],
        'saturn': bodies['saturn barycenter'],
        'uranus': bodies['uranus barycenter'],
        'neptune': bodies['neptune barycenter']
    }

    positions = {}
    for i, name in enumerate(planet_names):
        vec = sun.at(t).observe(sf_planets[name]).position.km
        angle = math.atan2(vec[1], vec[0])
        positions[name] = {
            'radius': radii[i],
            'angle': angle
        }

    periods = {
        'mercury': 88,
        'venus': 225,
        'earth': 365,
        'mars': 687,
        'jupiter': 4333,
        'saturn': 10759,
        'uranus': 30687,
        'neptune': 60190
    }

    return render(request, 'planets/orbits.html', {
        'positions_json': json.dumps(positions),
        'periods_json': json.dumps(periods),
        'selected_date': selected_date.strftime('%Y-%m-%d')
    })

def pagina2(request):
    return render(request, 'planets/pagina2.html')

def pagina3(request):
    return render(request, 'planets/pagina3.html')
