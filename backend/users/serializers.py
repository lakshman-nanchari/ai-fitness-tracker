from rest_framework import serializers
from .models import User, OTP
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
from .utils import send_otp_email

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['email', 'username', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User not registered.")
        return value

    def create_otp(self):
        user = User.objects.get(email=self.validated_data['email'])
        code = get_random_string(6, '1234567890')
        return OTP.objects.create(
            user=user,
            code=code,
            expires_at=timezone.now() + timedelta(minutes=15),
            is_used=False
        )

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
            otp = OTP.objects.filter(user=user, code=data['code'], is_used=False).latest('created_at')
        except (User.DoesNotExist, OTP.DoesNotExist):
            raise serializers.ValidationError("Invalid email or OTP.")

        if not otp.is_valid():
            raise serializers.ValidationError("OTP invalid or expired")

        data['user'], data['otp'] = user, otp
        return data

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=6)

    def validate_old_password(self, value):
        user = self.context['user']
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User not registered.")
        return value

    def create_otp_and_send(self):
        user = User.objects.get(email=self.validated_data['email'])
        code = get_random_string(6, '1234567890')
        otp = OTP.objects.create(
            user=user,
            code=code,
            expires_at=timezone.now() + timedelta(minutes=15),
            is_used=False
        )
        send_otp_email(user.email, code)
        return otp
