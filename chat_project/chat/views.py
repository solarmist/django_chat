import json
import re

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.http import JsonResponse
from django.shortcuts import redirect, render
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


class RegisterView(View):
    def get(self, request):
        form = UserCreationForm()
        return render(request, "chat/register.html", {"form": form})

    def post(self, request):
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)  # Log in the user after registration
            return redirect("/")
        return render(request, "chat/register.html", {"form": form})


# Login View
class LoginView(View):
    def get(self, request):
        return render(request, "chat/login.html")  # Ensure this template exists

    def post(self, request):
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect("/")
        else:
            return render(
                request, "chat/login.html", {"error": "Invalid credentials"}
            )  # Pass error if login fails


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
