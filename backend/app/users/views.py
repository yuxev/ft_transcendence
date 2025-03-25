from rest_framework.views import APIView 
from .serializers import UserSerializer
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from .models import User
import jwt,  datetime
import requests
from django.conf import settings
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os, uuid



class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    

class LoginView(APIView):
    def post(self, request):
        try:
            print("Login request received!")
            print(f"Request data: {request.data}")
            
            email = request.data.get('email')
            password = request.data.get('password')
            
            if not email or not password:
                print(f"Missing email or password: email={email}, password={'*' * len(password) if password else None}")
                raise AuthenticationFailed('Email and password are required!')
            
            print(f"Looking up user with email: {email}")
            user = User.objects.filter(email=email).first()
            
            if not user:
                print(f"User not found for email: {email}")
                raise AuthenticationFailed('User not found!')
            
            print(f"Checking password for user: {user.id}")
            if not user.check_password(password):
                print(f"Incorrect password for user: {user.id}")
                raise AuthenticationFailed('Incorrect password!')
            
            print(f"Login successful for user: {user.id}")
            
            payload = {
                'id': user.id,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
                'iat': datetime.datetime.utcnow()
            }
            
            token = jwt.encode(payload, 'secret', algorithm='HS256')
            print(f"Generated token: {token[:10]}...")
            
            user_data = UserSerializer(user, context={'request': request}).data
            print(f"User data: {user_data}")
            
            response = Response()
            response.set_cookie(key='jwt', value=token, httponly=True)
            response.data = {
                'jwt': token,
                'message': 'Login successful',
                'name': user.name,
                'email': user.email,
                'image_url': user_data.get('image_url')
            }
            print("Sending successful login response")
            return response
            
        except AuthenticationFailed as e:
            print(f"Authentication failed: {str(e)}")
            raise e
        except Exception as e:
            print(f"Unexpected error in login: {str(e)}")
            import traceback
            traceback.print_exc()
            raise AuthenticationFailed(str(e))

class UserView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        token = None
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            raise AuthenticationFailed('Unauthenticated!')
            
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated!')
            
        user = User.objects.filter(id=payload['id']).first()
        print(f"Token decoded, payload: {payload}")
        
        if not user:
            raise AuthenticationFailed('User not found!')
            
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)
    
class LogoutView(APIView):
    def post(self, request):
        response = Response()
        response.delete_cookie('jwt')
        response.data = {
            'message' : 'success Logout'
        }
        return response

class OAuth42View(APIView):
    def get(self, request):
        auth_url = f"{settings.OAUTH42_AUTHORIZATION_URL}?client_id={settings.OAUTH42_CLIENT_ID}&redirect_uri={settings.OAUTH42_REDIRECT_URI}&response_type=code"
        return Response({"auth_url": auth_url})

class OAuth42CallbackView(APIView):
    def post(self, request):
        code = request.data.get('code')
        
        try:
            token_response = requests.post(settings.OAUTH42_TOKEN_URL, data={
                'grant_type': 'authorization_code',
                'client_id': settings.OAUTH42_CLIENT_ID,
                'client_secret': settings.OAUTH42_CLIENT_SECRET,
                'code': code,
                'redirect_uri': settings.OAUTH42_REDIRECT_URI
            })
            
            if token_response.status_code != 200:
                raise AuthenticationFailed('Failed to authenticate with 42')
                
            access_token = token_response.json().get('access_token')
            
            user_response = requests.get('https://api.intra.42.fr/v2/me', 
                headers={'Authorization': f'Bearer {access_token}'})
                
            if user_response.status_code != 200:
                raise AuthenticationFailed('Failed to get user info from 42')
                
            user_data = user_response.json()
            
            intra_id = user_data.get('id', '')
            default_password = f"42intra{intra_id}"
            
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults={
                    'name': user_data['displayname'],
                    'password': default_password,
                    'image_url': user_data.get('image', {}).get('link')
                }
            )
            
            if not created:
                if user_data.get('image', {}).get('link'):
                    user.image_url = user_data['image']['link']
                
                if not user.password or user.password.startswith('!'):
                    user.set_password(default_password)
                
                user.save()
            
            if created:
                user.set_password(default_password)
                user.save()
            
            user.is_oauth_user = True
            user.save()
            
            payload = {
                'id': user.id,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=60),
                'iat': datetime.datetime.utcnow()
            }
            
            token = jwt.encode(payload, 'secret', algorithm='HS256')
            
            user_data_response = UserSerializer(user, context={'request': request}).data
            
            response = Response()
            response.set_cookie(key='jwt', value=token, httponly=True)
            response.data = {
                'jwt': token,
                'name': user.name,
                'email': user.email,
                'image_url': user_data_response.get('image_url')
            }
            return response
            
        except Exception as e:
            print("OAuth callback error:", str(e))
            raise AuthenticationFailed('Authentication failed')

class UpdateUserView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request):
        auth_header = request.headers.get('Authorization')
        token = None
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            raise AuthenticationFailed('Unauthenticated!')
            
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated!')
            
        user = User.objects.filter(id=payload['id']).first()
        
        if not user:
            raise AuthenticationFailed('User not found!')
        
        if 'name' in request.data and request.data['name']:
            user.name = request.data['name']
        
        if 'email' in request.data and request.data['email']:
            existing = User.objects.filter(email=request.data['email']).exclude(id=user.id).first()
            if existing:
                return Response({'error': 'Email already in use'}, status=400)
            user.email = request.data['email']
        
        if 'avatar' in request.FILES:
            try:
                avatar_file = request.FILES['avatar']
                
                file_ext = os.path.splitext(avatar_file.name)[1]
                unique_filename = f"{uuid.uuid4().hex}{file_ext}"
                
                avatar_dir = os.path.join(settings.MEDIA_ROOT, 'avatars')
                os.makedirs(avatar_dir, exist_ok=True)
                
                file_path = os.path.join('avatars', unique_filename)
                full_path = os.path.join(settings.MEDIA_ROOT, file_path)
                
                print(f"Saving avatar to: {full_path}")
                
                with open(full_path, 'wb+') as destination:
                    for chunk in avatar_file.chunks():
                        destination.write(chunk)
                
                file_url = settings.MEDIA_URL + file_path
                print(f"Setting image URL to: {file_url}")
                user.image_url = file_url
            except Exception as e:
                print(f"Error uploading avatar: {str(e)}")
                return Response({'error': f'Failed to upload avatar: {str(e)}'}, status=500)
        
        user.save()
        
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)

class ChangePasswordView(APIView):
    def post(self, request):
        auth_header = request.headers.get('Authorization')
        token = None
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        
        if not token:
            raise AuthenticationFailed('Unauthenticated!')
            
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Unauthenticated!')
            
        user = User.objects.filter(id=payload['id']).first()
        
        if not user:
            raise AuthenticationFailed('User not found!')
        
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not new_password:
            return Response({'error': 'New password is required'}, status=400)
        
        is_oauth_user = False
        oauth_domains = ['@student.42', '@student.1337.ma']
        
        if user.email:
            for domain in oauth_domains:
                if domain in user.email:
                    is_oauth_user = True
                    print(f"User {user.id} is an OAuth user (email: {user.email})")
                    break
        
        if not is_oauth_user:
            if not current_password:
                return Response({'error': 'Current password is required'}, status=400)
            
            if not user.check_password(current_password):
                return Response({'error': 'Current password is incorrect'}, status=400)
        else:
            print(f"Skipping current password check for OAuth user {user.id}")
        
        if len(new_password) < 6:
            return Response({'error': 'Password must be at least 6 characters'}, status=400)
        
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password updated successfully'})

class IsOAuthUserView(APIView):
    def get(self, request):
        auth_header = request.headers.get('Authorization')
        token = None
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        else:
            return Response({'is_oauth': False, 'authenticated': False})
            
        try:
            payload = jwt.decode(token, 'secret', algorithms=['HS256'])
        except Exception:
            return Response({'is_oauth': False, 'authenticated': False})
            
        user = User.objects.filter(id=payload['id']).first()
        
        if not user:
            return Response({'is_oauth': False, 'authenticated': False})
        
        is_oauth = False
        oauth_domains = ['@student.42', '@student.1337.ma']
        
        if user.email:
            for domain in oauth_domains:
                if domain in user.email:
                    is_oauth = True
                    break
        
        return Response({'is_oauth': is_oauth, 'authenticated': True})

class TestView(APIView):
    def get(self, request):
        return Response({"status": "Backend is working"})