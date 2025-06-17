# authapp/admin.py
from django.contrib import admin
from .models import User, OTP

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'is_active', 'is_staff', 'last_login')
    search_fields = ('email', 'username')
    list_filter = ('is_staff', 'is_superuser', 'is_active')

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'code', 'created_at', 'is_expired_display')
    search_fields = ('email', 'code')
    readonly_fields = ('created_at',)

    def is_expired_display(self, obj):
        return obj.is_expired()
    is_expired_display.short_description = 'Expired'
    is_expired_display.boolean = True
