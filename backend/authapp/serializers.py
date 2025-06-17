from rest_framework import serializers
from django.utils import timezone
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import OTP
from .utils import send_otp_email

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['email', 'username', 'password']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        data['user'] = user
        return data


class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, email):
        if not User.objects.filter(email=email).exists():
            raise serializers.ValidationError("User not found.")
        return email

    def save(self):
        code = OTP.objects.create(
            email=self.validated_data['email'],
            code=OTP.generate_code()
        )
        send_otp_email(code.email, code.code)


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField()

    def validate(self, data):
        try:
            otp = OTP.objects.filter(email=data['email'], code=data['code']).latest('created_at')
        except OTP.DoesNotExist:
            raise serializers.ValidationError("Invalid OTP.")
        if otp.is_expired():
            raise serializers.ValidationError("OTP expired.")
        return data


class ChangePasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        user = self.context['request'].user
        request = self.context['request']

        # Enforce once-per-day limit
        if user.last_password_change and timezone.now() - user.last_password_change < timezone.timedelta(days=1):
            raise serializers.ValidationError("You can change password only once per day.")

        # Ensure JWT has otp_verified = True
        auth = JWTAuthentication()
        header = auth.get_header(request)
        raw_token = auth.get_raw_token(header)
        validated_token = auth.get_validated_token(raw_token)
        if not validated_token.get('otp_verified', False):
            raise serializers.ValidationError("OTP verification required to change password.")

        return data

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.last_password_change = timezone.now()
        user.save()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
