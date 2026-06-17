from rest_framework import serializers
from .models import Player, RunningBacks, WideReceivers, TightEnd, Kicker

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

    from .models import Player, RunningBacks

class RunningBackSerializer(serializers.ModelSerializer):
    class Meta:
        model = RunningBacks
        fields = '__all__'

class WideReceiversSerializer(serializers.ModelSerializer):
    class Meta:
        model = WideReceivers
        fields = '__all__'

class TightEndSerializer(serializers.ModelSerializer):
    class Meta:
        model = TightEnd
        fields = '__all__'

class KickerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kicker
        fields = '__all__'