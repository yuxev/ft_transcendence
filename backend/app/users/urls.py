from django.urls import path
from .views import RegisterView, LoginView, UserView, LogoutView, OAuth42View, OAuth42CallbackView, UpdateUserView, ChangePasswordView, IsOAuthUserView, TestView

urlpatterns = [
    path('api/register', RegisterView.as_view()),
    path('api/login', LoginView.as_view()),
    path('api/user', UserView.as_view()),
    path('api/logout', LogoutView.as_view()),
    path('api/oauth/42', OAuth42View.as_view()),
    path('api/oauth/42/callback', OAuth42CallbackView.as_view()),
    path('api/user/update', UpdateUserView.as_view()),
    path('api/user/change-password', ChangePasswordView.as_view()),
    path('api/user/is-oauth', IsOAuthUserView.as_view()),
    path('api/test', TestView.as_view()),
]
