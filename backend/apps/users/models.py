from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    joined_date = models.DateTimeField(auto_now_add=True)
    is_pro_member = models.BooleanField(default=False)
    study_streak_days = models.PositiveIntegerField(default=0)
    google_account_id = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'recall_users'

    def __str__(self):
        return self.email or self.username


class DeviceRegistration(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='devices')
    fcm_token = models.CharField(max_length=500, unique=True)
    device_type = models.CharField(max_length=50, choices=[('ios', 'iOS'), ('android', 'Android'), ('web', 'Web')])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'recall_user_devices'

    def __str__(self):
        return f"{self.user.username} - {self.device_type}"
