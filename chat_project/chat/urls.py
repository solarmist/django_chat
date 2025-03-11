from django.urls import path
from .views import (
    SendMessageView,
    FetchMessagesView,
    ChatView,
    ChatRoomsView,
    RegisterView,
    LoginView,
    LogoutView,
)

urlpatterns = [
    path("", ChatView.as_view(), name="chat_view"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("chatrooms/", ChatRoomsView.as_view(), name="chatrooms"),
    path("send_message/", SendMessageView.as_view(), name="send_message"),
    path("fetch_messages/", FetchMessagesView.as_view(), name="fetch_messages"),
]
