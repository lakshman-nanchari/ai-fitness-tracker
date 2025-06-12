from rest_framework import serializers
from .models import User, OTP
from django.utils.crypto import get_random_string


# This serializer is used for user registration
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


# This serializer is used for sending OTP to the user's email
class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def create_otp(self):
        email = self.validated_data['email']
        user, _ = User.objects.get_or_create(email=email)
        otp_code = get_random_string(length=6, allowed_chars='1234567890')
        otp = OTP.objects.create(user=user, code=otp_code)
        return otp
    



# This serializer is used for OTP verification
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
