from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.utils.crypto import get_random_string
from .models import OTP
from .utils import send_otp_email

User = get_user_model()


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
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate_old_password(self, value):
        user = self.context['user']
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect")
        return value

    def validate(self, data):
        user = self.context['user']
        last_change = user.last_password_change
        if last_change and (timezone.now() - last_change) < timedelta(days=1):
            raise serializers.ValidationError("You can only change your password once per day.")
        return data


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


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist.")

        try:
            otp = OTP.objects.filter(user=user, code=data['otp'], is_used=False).latest('created_at')
        except OTP.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired OTP.")

        if otp.expires_at < timezone.now():
            raise serializers.ValidationError("OTP has expired.")

        data['user'] = user
        data['otp_obj'] = otp
        return data
