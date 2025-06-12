from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .serializers import RegisterSerializer, EmailSerializer, OTPVerifySerializer
from .utils import send_otp_email

@swagger_auto_schema(
    method='post',
    request_body=RegisterSerializer,
    responses={201: openapi.Response("User registered successfully"), 400: "Validation Error"}
)
@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    request_body=EmailSerializer,
    responses={200: openapi.Response("OTP sent to email"), 400: "Validation Error"}
)
@api_view(['POST'])
def request_otp(request):
    serializer = EmailSerializer(data=request.data)
    if serializer.is_valid():
        otp = serializer.create_otp()
        send_otp_email(otp.user.email, otp.code)
        return Response({"message": "OTP sent to email"}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='post',
    request_body=OTPVerifySerializer,
    responses={200: openapi.Response("OTP verified successfully"), 400: "Validation Error"}
)
@api_view(['POST'])
def verify_otp(request):
    serializer = OTPVerifySerializer(data=request.data)
    if serializer.is_valid():
        otp = serializer.validated_data['otp']
        otp.is_used = True
        otp.save()
        user = serializer.validated_data['user']
        return Response({"message": "OTP verified successfully", "user": user.email})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
