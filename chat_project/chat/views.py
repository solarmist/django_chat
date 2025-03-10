import json

from django.views import View
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import Message


class ChatView(View):
    def get(self, request):

        return render(request, "index.html")


@method_decorator(csrf_exempt, name="dispatch")
class SendMessageView(View):
    def post(self, request):
        data = json.loads(request.body)
        message = Message.objects.create(
            user=data.get("user", "Anon"), message=data.get("message", "")
        )
        return JsonResponse({"status": "success", "message_id": message.id})


class FetchMessagesView(View):
    def get(self, request):
        last_id = int(request.GET.get("last_id", 0))
        messages = Message.objects.filter(id__gt=last_id).order_by("id")
        messages_data = [
            {"id": msg.id, "user": msg.user, "message": msg.message} for msg in messages
        ]

        return JsonResponse({"messages": messages_data})
