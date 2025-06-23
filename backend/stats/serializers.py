from rest_framework import serializers
from .models import UserDailyStat

class UserDailyStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDailyStat
        fields = "__all__"
        read_only_fields = ("user", "date")
