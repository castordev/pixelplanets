from django.urls import path
from . import views             # importa tus vistas de esta app "." separado para indicar que esta en la misma carpeta

urlpatterns = [

    path('', views.home_view, name='home'),
    path('distance/<str:planet_name>/', views.distance_view, name='distance'),      
]
