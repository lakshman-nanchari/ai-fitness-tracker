from django.urls import path
from . import views

urlpatterns = [
    path('users/register/', views.RegisterView.as_view()),
    path('users/login/', views.LoginView.as_view()),
    path('users/send-otp/', views.SendOTPView.as_view()),
    path('users/verify-otp/', views.VerifyOTPView.as_view()),
    path('users/change-password/', views.ChangePasswordView.as_view()),
    path('users/reset-password/', views.ResetPasswordRequestView.as_view()),
]
