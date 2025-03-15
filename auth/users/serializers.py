from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'image_url']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # Add an absolute URL for the image if needed
        if 'image_url' in rep and rep['image_url'] and not rep['image_url'].startswith(('http://', 'https://')):
            request = self.context.get('request')
            if request:
                rep['image_url'] = request.build_absolute_uri(rep['image_url'])
        return rep
        
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance
