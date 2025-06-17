from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .serializers import *
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from drf_yasg.utils import swagger_auto_schema

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

    @swagger_auto_schema(operation_summary="Register")
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Registered successfully.'})


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    @swagger_auto_schema(operation_summary="Login with password")
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user, otp_verified=False)
        return Response(tokens)


class SendOTPView(generics.GenericAPIView):
    serializer_class = SendOTPSerializer

    @swagger_auto_schema(operation_summary="Send OTP for login/reset")
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp = OTP.objects.create(email=serializer.validated_data['email'], code=generate_otp())
        send_otp_email(otp.email, otp.code)
        return Response({'message': 'OTP sent to your email'})


class VerifyOTPView(generics.GenericAPIView):
    serializer_class = VerifyOTPSerializer

    @swagger_auto_schema(operation_summary="Verify OTP")
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = User.objects.get(email=email)
        
        # Optional cleanup:
        OTP.objects.filter(email=email).delete()

        tokens = get_tokens_for_user(user, otp_verified=True)
        return Response({'message': 'OTP verified', **tokens})


class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(operation_summary="Change password")
    def post(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Password changed successfully'})


class ResetPasswordRequestView(generics.GenericAPIView):
    serializer_class = ResetPasswordSerializer

    @swagger_auto_schema(operation_summary="Request password reset OTP")
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp = OTP.objects.create(email=serializer.validated_data['email'], code=generate_otp())
        send_otp_email(otp.email, otp.code)
        return Response({'message': 'Reset OTP sent'})
