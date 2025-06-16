from django.urls import path
from .views import (
    register, login_view, request_otp, verify_otp,
    change_password, reset_password, confirm_reset_password
)

urlpatterns = [
    path('register/', register),
    path('login/', login_view),
    path('send-otp/', request_otp),
    path('verify-otp/', verify_otp),
    path('change-password/', change_password),
    path('reset-password/', reset_password),
    path('reset-password/confirm/', confirm_reset_password), 
]
