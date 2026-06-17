import nflreadpy as nfl
import polars as pl
from django.core.management.base import BaseCommand
from Players.models import Player

class Command(BaseCommand):
    help = 'Load QB season stats into the database'

    def handle(self, *args, **kwargs):
        self.stdout.write("Fetching QB data...")

        years = [2021, 2022, 2023, 2024,2025]
        df = nfl.load_player_stats(years)

        qbs = df.filter(pl.col('position_group') == 'QB')

        qbs_season = qbs.filter(pl.col('season_type') == 'REG').group_by(
            ['player_id', 'player_name', 'player_display_name', 'position', 'headshot_url', 'season']
        ).agg([
            pl.col('team').last().alias('team'),
            pl.col('completions').sum(),
            pl.col('attempts').sum(),
            pl.col('passing_yards').sum(),
            pl.col('passing_tds').sum(),
            pl.col('passing_interceptions').sum(),
            pl.col('sacks_suffered').sum(),
            pl.col('sack_yards_lost').sum(),
            pl.col('carries').sum(),
            pl.col('rushing_yards').sum(),
            pl.col('rushing_tds').sum(),
            pl.col('rushing_fumbles').sum(),
            pl.col('passing_2pt_conversions').sum(),
            pl.col('fantasy_points').sum(),
            pl.col('passing_epa').mean(),
            pl.col('passing_cpoe').mean(),
            pl.col('pacr').mean(),
            pl.col('week').count().alias('games_played'),
        ])

        count = 0
        for row in qbs_season.to_dicts():
            Player.objects.update_or_create(
                player_id=row['player_id'],
                season=row['season'],
                defaults={
                    'player_name': row['player_name'],
                    'player_display_name': row['player_display_name'],
                    'position': row['position'],
                    'headshot_url': row['headshot_url'],
                    'team': row['team'],
                    'completions': row['completions'] or 0,
                    'attempts': row['attempts'] or 0,
                    'passing_yards': row['passing_yards'] or 0,
                    'passing_tds': row['passing_tds'] or 0,
                    'passing_interceptions': row['passing_interceptions'] or 0,
                    'sacks_suffered': row['sacks_suffered'] or 0,
                    'sack_yards_lost': row['sack_yards_lost'] or 0,
                    'carries': row['carries'] or 0,
                    'rushing_yards': row['rushing_yards'] or 0,
                    'rushing_tds': row['rushing_tds'] or 0,
                    'rushing_fumbles': row['rushing_fumbles'] or 0,
                    'passing_2pt_conversions': row['passing_2pt_conversions'] or 0,
                    'fantasy_points': row['fantasy_points'] or 0,
                    'passing_epa': row['passing_epa'],
                    'passing_cpoe': row['passing_cpoe'],
                    'pacr': row['pacr'],
                    'games_played': row['games_played'] or 0,
                }
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f"✅ Loaded {count} QB records."))