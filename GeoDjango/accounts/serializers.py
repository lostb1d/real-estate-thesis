from rest_framework import serializers
from .models import Agency, AgencyEmployee, User, Role, Permission, RolePermission, UserRole, PasswordResetOTP
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, EmailOTP


class AgencySerializer(serializers.ModelSerializer):
    owner_email = serializers.CharField(source="owner.email", read_only=True)

    class Meta:
        model = Agency
        fields = "__all__"
        read_only_fields = ("owner", "is_verified", "created_at", "updated_at")


class AgencyEmployeeSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source="user.email", read_only=True)
    agency_name = serializers.CharField(source="agency.name", read_only=True)

    class Meta:
        model = AgencyEmployee
        fields = "__all__"
        read_only_fields = ("joined_at",)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=6,
        error_messages={
            "min_length": "Password must be at least 6 characters long.",
            "blank": "Password is required.",
            "required": "Password is required.",
        }
    )

    class Meta:
        model = User
        fields = ("id", "username", "email", "phone", "password")
        extra_kwargs = {
            "username": {
                "error_messages": {
                    "blank": "Username is required.",
                    "required": "Username is required.",
                }
            },
            "email": {
                "error_messages": {
                    "blank": "Email is required.",
                    "required": "Email is required.",
                    "invalid": "Enter a valid email address.",
                }
            },
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value.lower()

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            phone=validated_data.get("phone"),
            password=validated_data["password"],
            is_active=True,
            is_verified=False,
        )

        otp = EmailOTP.objects.create(user=user)

        send_mail(
            subject="Verify your email",
            message=f"Your OTP code is {otp.otp}. It expires in 10 minutes.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(
        error_messages={
            "required": "Email is required.",
            "blank": "Email is required.",
            "invalid": "Enter a valid email address.",
        }
    )
    password = serializers.CharField(
        write_only=True,
        error_messages={
            "required": "Password is required.",
            "blank": "Password is required.",
        }
    )

    def validate(self, attrs):
        user = authenticate(
            username=attrs["email"],
            password=attrs["password"]
        )

        if not user:
            raise serializers.ValidationError({
                "message": "Incorrect email or password."
            })

        if not user.is_active:
            raise serializers.ValidationError({
                "message": "Your account is disabled."
            })

        if not user.is_verified:
            raise serializers.ValidationError({
                "message": "Please verify your email before login."
            })

        refresh = RefreshToken.for_user(user)

        return {
            "message": "Login successful.",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "phone": user.phone,
                "is_verified": user.is_verified,
            }
        }


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(
        error_messages={
            "required": "Email is required.",
            "blank": "Email is required.",
            "invalid": "Enter a valid email address.",
        }
    )
    otp = serializers.CharField(
        max_length=6,
        min_length=6,
        error_messages={
            "required": "OTP is required.",
            "blank": "OTP is required.",
            "min_length": "OTP must be 6 digits.",
            "max_length": "OTP must be 6 digits.",
        }
    )

    def validate(self, attrs):
        user = User.objects.filter(email__iexact=attrs["email"]).first()

        if not user:
            raise serializers.ValidationError({
                "message": "User with this email does not exist."
            })

        if user.is_verified:
            raise serializers.ValidationError({
                "message": "Email is already verified."
            })

        otp = EmailOTP.objects.filter(
            user=user,
            otp=attrs["otp"],
            is_used=False
        ).order_by("-created_at").first()

        if not otp:
            raise serializers.ValidationError({
                "message": "Invalid OTP."
            })

        if otp.is_expired():
            raise serializers.ValidationError({
                "message": "OTP has expired. Please request a new OTP."
            })

        otp.is_used = True
        otp.save(update_fields=["is_used"])

        user.is_verified = True
        user.save(update_fields=["is_verified"])

        return attrs


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(
        error_messages={
            "required": "Email is required.",
            "blank": "Email is required.",
            "invalid": "Enter a valid email address.",
        }
    )

    def validate(self, attrs):
        user = User.objects.filter(email__iexact=attrs["email"]).first()

        if not user:
            raise serializers.ValidationError({
                "message": "User with this email does not exist."
            })

        if user.is_verified:
            raise serializers.ValidationError({
                "message": "Email is already verified."
            })

        otp = EmailOTP.objects.create(user=user)

        send_mail(
            subject="Your new OTP code",
            message=f"Your OTP code is {otp.otp}. It expires in 10 minutes.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return attrs
    
class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = "__all__"
        read_only_fields = ("created_by", "created_at", "updated_at")


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)

    class Meta:
        model = Role
        fields = "__all__"
        read_only_fields = ("created_by", "created_at", "updated_at")


class RolePermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RolePermission
        fields = "__all__"
        read_only_fields = ("assigned_by", "assigned_at")


class UserRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRole
        fields = "__all__"
        read_only_fields = ("assigned_by", "assigned_at")


class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "phone",
            "is_active",
            "is_verified",
            "roles",
            "permissions",
        )

    def get_roles(self, obj):
        return [role.code for role in obj.get_roles()]

    def get_permissions(self, obj):
        return [permission.code for permission in obj.get_permissions()]
    
class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        user = User.objects.filter(email__iexact=attrs["email"]).first()

        if not user:
            raise serializers.ValidationError({
                "message": "User with this email does not exist."
            })

        otp = PasswordResetOTP.objects.create(user=user)

        send_mail(
            subject="Password Reset OTP",
            message=f"Your password reset OTP is {otp.otp}. It expires in 10 minutes.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return attrs    
    
class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "message": "Passwords do not match."
            })

        user = User.objects.filter(email__iexact=attrs["email"]).first()

        if not user:
            raise serializers.ValidationError({
                "message": "User with this email does not exist."
            })

        otp = PasswordResetOTP.objects.filter(
            user=user,
            otp=attrs["otp"],
            is_used=False
        ).order_by("-created_at").first()

        if not otp:
            raise serializers.ValidationError({
                "message": "Invalid OTP."
            })

        if otp.is_expired():
            raise serializers.ValidationError({
                "message": "OTP has expired. Please request a new OTP."
            })

        user.set_password(attrs["new_password"])
        user.save()

        otp.is_used = True
        otp.save(update_fields=["is_used"])

        return attrs
    

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        user = self.context["request"].user

        if not user.check_password(attrs["old_password"]):
            raise serializers.ValidationError({
                "message": "Old password is incorrect."
            })

        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "message": "Passwords do not match."
            })

        user.set_password(attrs["new_password"])
        user.save()

        return attrs