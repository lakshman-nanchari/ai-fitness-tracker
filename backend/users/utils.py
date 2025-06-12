from django.core.mail import send_mail

def send_otp_email(email, otp_code):
    subject = "Your FitTrack OTP Code"
    message = f"Your OTP is {otp_code}. It expires in 15 minutes."
    send_mail(subject, message, None, [email])
