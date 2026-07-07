from django.shortcuts import render
from django.http import HttpResponse

#create the homepage view, this is basically the landing page 
def homepage_view(request):
    return render(request,'homepage/home.html')