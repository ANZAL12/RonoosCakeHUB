from rest_framework import serializers
from .models import User, Address

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'place', 'profile_picture', 'role', 'password', 'expo_push_token']
        read_only_fields = ['id', 'role']
        extra_kwargs = {
            'password': {'write_only': True, 'required': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            name=validated_data.get('name', ''),
            phone=validated_data.get('phone', ''),
            profile_picture=validated_data.get('profile_picture', None),
        )
        return user

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'user', 'line1', 'line2', 'city', 'state', 'pincode', 'map_link', 'is_default']
        read_only_fields = ['id', 'user']
