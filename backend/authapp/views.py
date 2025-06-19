from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.contrib.auth import get_user_model

from .serializers import *
from .models import OTP
from .utils import send_otp_email, generate_otp

User = get_user_model()


def get_tokens_for_user(user, otp_verified=False):
    refresh = RefreshToken.for_user(user)
    refresh['otp_verified'] = otp_verified
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    @swagger_auto_schema(
        operation_summary="Register new user",
        request_body=RegisterSerializer,
        responses={
            200: openapi.Response("Registered successfully", examples={"application/json": {"message": "Registered successfully."}}),
            400: openapi.Response("Validation error")
        },
        tags=["Authentication"]
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Registered successfully.'})


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    @swagger_auto_schema(
        operation_summary="Login with email and password",
        request_body=LoginSerializer,
        responses={
            200: openapi.Response("Login success", examples={"application/json": {"refresh": "token", "access": "token"}}),
            400: openapi.Response("Invalid credentials")
        },
        tags=["Authentication"]
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user, otp_verified=False)
        return Response(tokens)


class SendOTPView(generics.GenericAPIView):
    serializer_class = SendOTPSerializer

    @swagger_auto_schema(
        operation_summary="Send OTP to registered email",
        request_body=SendOTPSerializer,
        responses={
            200: openapi.Response("OTP sent", examples={"application/json": {"message": "OTP sent to your email"}}),
            400: openapi.Response("Email not found or validation error")
        },
        tags=["Authentication"]
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp_code = generate_otp()
        otp = OTP.objects.create(email=serializer.validated_data['email'], code=otp_code)
        send_otp_email(otp.email, otp.code)
        return Response({'message': 'OTP sent to your email'})


class VerifyOTPView(generics.GenericAPIView):
    serializer_class = VerifyOTPSerializer

    @swagger_auto_schema(
        operation_summary="Verify OTP code and issue tokens",
        request_body=VerifyOTPSerializer,
        responses={
            200: openapi.Response("OTP verified", examples={"application/json": {"message": "OTP verified", "refresh": "token", "access": "token"}}),
            400: openapi.Response("Invalid or expired OTP")
        },
        tags=["Authentication"]
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        OTP.objects.filter(email=email).delete()
        tokens = get_tokens_for_user(user, otp_verified=True)
        return Response({'message': 'OTP verified', **tokens})


class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Change password (requires OTP-verified JWT)",
        request_body=ChangePasswordSerializer,
        responses={
            200: openapi.Response("Password changed", examples={"application/json": {"message": "Password changed successfully"}}),
            400: openapi.Response("Validation error or OTP required")
        },
        tags=["Authentication"]
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Password changed successfully'})


class ResetPasswordRequestView(generics.GenericAPIView):
    serializer_class = ResetPasswordSerializer

    @swagger_auto_schema(
        operation_summary="Send OTP for password reset",
        request_body=ResetPasswordSerializer,
        responses={
            200: openapi.Response("Reset OTP sent", examples={"application/json": {"message": "Reset OTP sent"}}),
            400: openapi.Response("User not found")
        },
        tags=["Authentication"]
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp_code = generate_otp()
        otp = OTP.objects.create(email=serializer.validated_data['email'], code=otp_code)
        send_otp_email(otp.email, otp.code)
        return Response({'message': 'Reset OTP sent'})
