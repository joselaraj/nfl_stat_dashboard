# Add this view to your views.py

from django.db.models import Sum, Avg, Count
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Player, WideReceivers  # adjust import to match your actual model name

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


# ── urls.py addition ──────────────────────────────────────────────────────────
# In your app's urls.py, add:
#
#   from .views import qb_player_detail
#
#   urlpatterns = [
#       ...
#       path('api/qbs/<str:player_id>/detail/', qb_player_detail, name='qb_player_detail'),
#   ]