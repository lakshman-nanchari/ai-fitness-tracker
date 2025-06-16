from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta


from .serializers import (
    RegisterSerializer, EmailSerializer,
    OTPVerifySerializer, PasswordChangeSerializer,
    PasswordResetSerializer, PasswordResetConfirmSerializer
)
from .utils import send_otp_email


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@swagger_auto_schema(method='post', request_body=RegisterSerializer)
@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'email': openapi.Schema(type=openapi.TYPE_STRING, format='email'),
            'password': openapi.Schema(type=openapi.TYPE_STRING),
        },
        required=['email', 'password'],
    ),
    responses={200: openapi.Response('Login successful'), 400: 'Invalid credentials'}
)
@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    user = authenticate(request, username=email, password=password)
    if user:
        return Response({'message': 'Login successful', **get_tokens_for_user(user)}, status=status.HTTP_200_OK)
    return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(method='post', request_body=EmailSerializer)
@api_view(['POST'])
def request_otp(request):
    serializer = EmailSerializer(data=request.data)
    if serializer.is_valid():
        otp = serializer.create_otp()
        send_otp_email(otp.user.email, otp.code)
        return Response({"message": "OTP sent to email"}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(method='post', request_body=OTPVerifySerializer)
@api_view(['POST'])
def verify_otp(request):
    serializer = OTPVerifySerializer(data=request.data)
    if serializer.is_valid():
        otp = serializer.validated_data['otp']
        user = serializer.validated_data['user']
        otp.is_used = True
        otp.save()
        return Response({'message': 'OTP verified', **get_tokens_for_user(user)}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'old_password': openapi.Schema(type=openapi.TYPE_STRING, description="Current password (if OTP not verified)", nullable=True),
            'new_password': openapi.Schema(type=openapi.TYPE_STRING, minLength=6),
            'otp_verified': openapi.Schema(type=openapi.TYPE_BOOLEAN, description="Set to true if OTP was recently verified", default=False)
        },
        required=['new_password']
    ),
    responses={
        200: openapi.Response("Password changed successfully"),
        400: openapi.Response("Error"),
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    otp_verified = request.data.get("otp_verified", False)

    if otp_verified:
        # Allow password change without old_password
        if user.last_password_change and (timezone.now() - user.last_password_change) < timedelta(days=1):
            return Response({'detail': 'You can only change your password once per day.'}, status=400)

        new_password = request.data.get("new_password")
        if not new_password or len(new_password) < 6:
            return Response({'detail': 'New password must be at least 6 characters long.'}, status=400)

        user.set_password(new_password)
        user.last_password_change = timezone.now()
        user.save()
        return Response({'message': 'Password changed successfully via OTP'}, status=200)

    # Standard flow: check old password
    serializer = PasswordChangeSerializer(data=request.data, context={'user': user})
    if serializer.is_valid():
        user.set_password(serializer.validated_data['new_password'])
        user.last_password_change = timezone.now()
        user.save()
        return Response({'message': 'Password changed successfully'}, status=200)
    return Response(serializer.errors, status=400)


@swagger_auto_schema(method='post', request_body=PasswordResetSerializer)
@api_view(['POST'])
def reset_password(request):
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        serializer.create_otp_and_send()
        return Response({'message': 'Reset OTP sent'}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(method='post', request_body=PasswordResetConfirmSerializer)
@api_view(['POST'])
def confirm_reset_password(request):
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        otp = serializer.validated_data['otp_obj']
        new_password = serializer.validated_data['new_password']

        user.set_password(new_password)
        user.last_password_change = timezone.now()
        user.save()

        otp.is_used = True
        otp.save()

        return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
