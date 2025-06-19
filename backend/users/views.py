from rest_framework import generics, permissions
from drf_yasg.utils import swagger_auto_schema
from .models import UserProfile
from .serializers import UserProfileSerializer

class UserProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Ensure the user has a profile, or create one
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

    @swagger_auto_schema(
        operation_summary="Retrieve your user profile",
        responses={200: UserProfileSerializer()}
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(
        operation_summary="Update your user profile",
        request_body=UserProfileSerializer,
        responses={200: UserProfileSerializer()}
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)
