from rest_framework import serializers
from .models import User, OTP
from django.utils.crypto import get_random_string


# ✅ Registration serializer
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


# ✅ OTP request serializer (for login)
class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email is not registered.")
        return value

    def create_otp(self):
        email = self.validated_data['email']
        user = User.objects.get(email=email)
        otp_code = get_random_string(length=6, allowed_chars='1234567890')
        otp = OTP.objects.create(user=user, code=otp_code)
        return otp


# ✅ OTP verification serializer
class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate(self, data):
        email = data['email']
        code = data['code']
        try:
            user = User.objects.get(email=email)
            otp = OTP.objects.filter(user=user, code=code, is_used=False).latest('created_at')
            if not otp.is_valid():
                raise serializers.ValidationError("OTP expired or already used")
        except (User.DoesNotExist, OTP.DoesNotExist):
            raise serializers.ValidationError("Invalid email or OTP")
        data['user'] = user
        data['otp'] = otp
        return data
