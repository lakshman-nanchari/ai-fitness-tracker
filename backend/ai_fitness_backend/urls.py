from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework_simplejwt.authentication import JWTAuthentication

schema_view = get_schema_view(
   openapi.Info(
      title="FitTrack API",
      default_version='v1',
      description="AI Fitness Tracker Backend",
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
   authentication_classes=[JWTAuthentication],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('authapp.urls')),  
    path('api/users/', include('users.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]
