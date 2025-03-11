import json
import re


from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

from .models import ChatRoom, Message, User


class ChatRoomsView(View):
    def get(self, request):
        chat_rooms = ChatRoom.objects.all()
        rooms_data = [{"id": room.id, "name": room.name} for room in chat_rooms]
        return JsonResponse({"rooms": rooms_data})


# Registration View
class RegisterView(View):
    def post(self, request):
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        if not User.objects.filter(username=username).exists():
            User.objects.create_user(username=username, password=password)
            return JsonResponse({"status": "success"})
        return JsonResponse(
            {"status": "error", "message": "User already exists"}, status=400
        )


# Login View
class LoginView(View):
    def post(self, request):
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            return JsonResponse({"status": "success"})
        return JsonResponse(
            {"status": "error", "message": "Invalid credentials"}, status=400
        )


# Logout View
class LogoutView(View):
    def post(self, request):
        logout(request)
        return JsonResponse({"status": "success"})


class ChatView(TemplateView):
    template_name = "chat/chat.html"


@method_decorator(csrf_exempt, name="dispatch")
class SendMessageView(View):
    def post(self, request):
        data = json.loads(request.body)
        room = ChatRoom.objects.get(name=data.get("room"))
        message = Message.objects.create(
            user=request.user, room=room, message=data.get("message", "")
        )

        # Detect @mentions
        mentioned_users = re.findall(r"@(\w+)", message.message)
        for username in mentioned_users:
            try:
                user = User.objects.get(username=username)
                # Trigger notification (for demonstration, real-time would need WebSockets)
                print(f"Notify {user.username}")
            except User.DoesNotExist:
                pass

        return JsonResponse({"status": "success", "message_id": message.id})


class FetchMessagesView(View):
    def get(self, request):
        last_id = int(request.GET.get("last_id", 0))
        room = ChatRoom.objects.get(name=request.GET.get("room"))
        messages = (
            Message.objects.filter(room=room)
            .filter(id__gt=last_id)
            .order_by("timestamp")
        )
        messages_data = [
            {
                "id": msg.id,
                "user": msg.user.username,
                "room": msg.room_id,
                "message": msg.message,
            }
            for msg in messages
        ]

        return JsonResponse({"messages": messages_data})
