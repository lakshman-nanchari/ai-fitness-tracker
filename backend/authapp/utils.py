from django.core.mail import send_mail
from django.conf import settings
import random


def send_otp_email(email, code):
    subject = 'Your OTP Code'
    message = f'Your OTP code is {code}. It is valid for 15 minutes.'
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])


def generate_otp():
    return f"{random.randint(100000, 999999)}"
