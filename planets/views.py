from django.shortcuts import render             #render para recibir la requests de html y devolver un httpResponse con el html      
from .planets_distance import get_distance      #traemos la función

def home_view(request):       
    planets = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
    return render(request, 'planets/index.html', {'planets': planets})


def distance_view(request, planet_name):
    try:
        distance = get_distance(planet_name)
        return render(request, 'planets/distance.html', {'planet_name': planet_name, 'distance': int(distance)})
    
    except KeyError:
        return render(request, 'planets/error.html', {'message': 'Planet not found.'})