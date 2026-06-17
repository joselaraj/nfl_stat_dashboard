from django.shortcuts import render
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework import generics
from .models import Player, RunningBacks, WideReceivers, TightEnd, Kicker
from .serializers import PlayerSerializer, RunningBackSerializer, WideReceiversSerializer, TightEndSerializer, KickerSerializer

#create the homepage view, this is basically the landing page 
def players_view(request):
    return render(request,'Players/players.html')

class PlayerListView(generics.ListAPIView):
    serializer_class = PlayerSerializer

    def get_queryset(self):
        queryset = Player.objects.all()
        season = self.request.query_params.get('season')
        team = self.request.query_params.get('team')
        if season:
            queryset = queryset.filter(season=season)
        if team:
            queryset = queryset.filter(team=team)
        return queryset


class PlayerDetailView(generics.RetrieveAPIView):
    serializer_class = PlayerSerializer
    queryset = Player.objects.all()
    lookup_field = 'player_id'

class RunningBackListView(generics.ListAPIView):
    serializer_class = RunningBackSerializer

    def get_queryset(self):
        queryset = RunningBacks.objects.all()
        season = self.request.query_params.get('season')
        team = self.request.query_params.get('team')
        if season:
            queryset = queryset.filter(season=season)
        if team:
            queryset = queryset.filter(team=team)
        return queryset
    
class WideReceiverListView(generics.ListAPIView):
    serializer_class = WideReceiversSerializer

    def get_queryset(self):
        queryset = WideReceivers.objects.all() 
        season = self.request.query_params.get('season')
        team = self.request.query_params.get('team')
        if season:
            queryset = queryset.filter(season=season)
        if team:
            queryset = queryset.filter(team=team)
        return queryset
    

class TightEndListView(generics.ListAPIView):
    serializer_class = TightEndSerializer

    def get_queryset(self):
        queryset = TightEnd.objects.all() 
        season = self.request.query_params.get('season')
        team = self.request.query_params.get('team')
        if season:
            queryset = queryset.filter(season=season)
        if team:
            queryset = queryset.filter(team=team)
        return queryset
    
class KickerEndListView(generics.ListAPIView):
    serializer_class = KickerSerializer

    def get_queryset(self):
        queryset = Kicker.objects.all() 
        season = self.request.query_params.get('season')
        team = self.request.query_params.get('team')
        if season:
            queryset = queryset.filter(season=season)
        if team:
            queryset = queryset.filter(team=team)
        return queryset
    
@api_view(['GET'])
def qb_player_detail(request, player_id):
    """
    Returns all seasons of data for a single QB, used for the player detail page.
    GET /api/qbs/<player_id>/detail/
    """
    # Pull one row per season for this player
    seasons = (
        Player.objects
        .filter(player_id=player_id)
        .values(
            'season',
            'player_display_name',
            'team',
            'headshot_url',
            'games_played',
            'completions',
            'attempts',
            'passing_yards',
            'passing_tds',
            'passing_interceptions',
            'rushing_yards',
            'rushing_tds',
            'fantasy_points',
        )
        .order_by('season')
    )

    if not seasons:
        return Response({'error': 'Player not found'}, status=404)

    data = list(seasons)

    # Derive completion % and yards per attempt per season
    for row in data:
        att = row['attempts'] or 0
        cmp = row['completions'] or 0
        row['completion_pct'] = round((cmp / att * 100), 1) if att > 0 else 0.0
        row['yards_per_attempt'] = round((row['passing_yards'] / att), 2) if att > 0 else 0.0

    # Career totals (numeric columns only)
    numeric_keys = [
        'games_played', 'completions', 'attempts',
        'passing_yards', 'passing_tds', 'passing_interceptions',
        'rushing_yards', 'rushing_tds', 'fantasy_points',
    ]
    career = {k: sum(r[k] or 0 for r in data) for k in numeric_keys}
    career['completion_pct'] = round(
        (career['completions'] / career['attempts'] * 100), 1
    ) if career['attempts'] > 0 else 0.0
    career['yards_per_attempt'] = round(
        career['passing_yards'] / career['attempts'], 2
    ) if career['attempts'] > 0 else 0.0

    return Response({
        'player_id': player_id,
        'player_display_name': data[0]['player_display_name'],
        'headshot_url': data[0]['headshot_url'],
        'seasons': data,
        'career': career,
    })

@api_view(['GET'])
def rb_player_detail(request, player_id):
    seasons = (
        RunningBacks.objects
        .filter(player_id=player_id)
        .values(
            'season', 'player_display_name', 'team', 'headshot_url', 'games_played',
            # rushing
            'carries', 'rushing_yards', 'rushing_tds',
            'rushing_fumbles_lost', 'rushing_first_downs', 'rushing_epa',
            # receiving
            'receptions', 'targets', 'receiving_yards', 'receiving_tds',
            'receiving_yards_after_catch', 'receiving_first_downs',
            # efficiency
            'target_share', 'wopr',
            # misc
            'fantasy_points',
        )
        .order_by('season')
    )

    if not seasons:
        return Response({'error': 'Player not found'}, status=404)

    data = list(seasons)
    numeric_keys = [
        'games_played', 'carries', 'rushing_yards', 'rushing_tds', 'rushing_fumbles_lost',
        'rushing_first_downs', 'receptions', 'targets', 'receiving_yards', 'receiving_tds',
        'receiving_yards_after_catch', 'receiving_first_downs', 'fantasy_points',
    ]   
    career = {k: sum(r[k] or 0 for r in data) for k in numeric_keys}

    return Response({
        'player_id': player_id,
        'player_display_name': data[0]['player_display_name'],
        'headshot_url': data[0]['headshot_url'],
        'seasons': data,
        'career': career,
    })

@api_view(['GET'])
def wr_player_detail(request, player_id):
    seasons = (
        WideReceivers.objects
        .filter(player_id=player_id)
        .values(
            'season', 'player_display_name', 'team', 'headshot_url', 'games_played',
            # core receiving
            'receptions', 'targets', 'receiving_yards', 'receiving_tds',
            # route/role metrics
            'receiving_air_yards', 'receiving_yards_after_catch',
            'receiving_first_downs',
            # efficiency
            'target_share', 'air_yards_share', 'racr', 'wopr',
            'receiving_epa',
            # misc
            'fantasy_points',
        )
        .order_by('season')
    )

    if not seasons:
        return Response({'error': 'Player not found'}, status=404)

    data = list(seasons)
    numeric_keys = [
        'games_played', 'receptions', 'targets', 'receiving_yards',
        'receiving_tds', 'receiving_air_yards', 'receiving_yards_after_catch',
        'receiving_first_downs', 'fantasy_points',
    ]
    career = {k: sum(r[k] or 0 for r in data) for k in numeric_keys}

    return Response({
        'player_id': player_id,
        'player_display_name': data[0]['player_display_name'],
        'headshot_url': data[0]['headshot_url'],
        'seasons': data,
        'career': career,
    })

@api_view(['GET'])
def te_player_detail(request, player_id):
    seasons = (
        TightEnd.objects
        .filter(player_id=player_id)
        .values(
            'season',
            'player_display_name',
            'team',
            'headshot_url',
            'games_played',
            'receptions',
            'receiving_yards',
            'receiving_tds',
            'fantasy_points',
        )
        .order_by('season')
    )

    if not seasons:
        return Response({'error': 'Player not found'}, status=404)

    data = list(seasons)
    numeric_keys = [
        'games_played', 'receptions', 'receiving_yards', 'receiving_tds',
        'fantasy_points',
    ]
    career = {k: sum(r[k] or 0 for r in data) for k in numeric_keys}

    return Response({
        'player_id': player_id,
        'player_display_name': data[0]['player_display_name'],
        'headshot_url': data[0]['headshot_url'],
        'seasons': data,
        'career': career,
    })

@api_view(['GET'])
def k_player_detail(request, player_id):
    seasons = (
        Kicker.objects
        .filter(player_id=player_id)
        .values(
            'season',
            'player_display_name',
            'team',
            'headshot_url',
            'games_played',
            'fg_made',
            'fg_att',
            'fg_missed',
            'fg_blocked',
            'fg_long',
            'pat_made',
            'pat_att',
            'pat_missed',
            'pat_blocked',
            'gwfg_made',
            'gwfg_distance',
            'fantasy_points',
        )
        .order_by('season')
    )

    if not seasons:
        return Response({'error': 'Player not found'}, status=404)

    data = list(seasons)
    numeric_keys = [
        'games_played', 'fg_made', 'fg_att', 'fg_missed', 'fg_blocked',
        'fg_long', 'pat_made', 'pat_att', 'pat_missed', 'pat_blocked',
        'gwfg_made', 'gwfg_distance', 'fantasy_points',
    ]
    career = {k: sum(r[k] or 0 for r in data) for k in numeric_keys}

    return Response({
        'player_id': player_id,
        'player_display_name': data[0]['player_display_name'],
        'headshot_url': data[0]['headshot_url'],
        'seasons': data,
        'career': career,
    })