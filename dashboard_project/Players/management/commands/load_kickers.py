import nflreadpy as nfl
import polars as pl
from django.core.management.base import BaseCommand
from Players.models import Kicker

class Command(BaseCommand):
    help = 'Load K season stats into the database'

    def handle(self, *args, **kwargs):
        self.stdout.write("Fetching K data...")

        years = [2021, 2022, 2023, 2024, 2025]
        df = nfl.load_player_stats(years)

        k = df.filter(pl.col('position') == 'K')

        clean_up = [
            'attempts',
            'passing_yards',
            'passing_tds',
            'passing_interceptions',
            'sacks_suffered',
            'sack_yards_lost',
            'sack_fumbles',
            'sack_fumbles_lost',
            'passing_air_yards',
            'passing_yards_after_catch',
            'passing_first_downs',
            'passing_epa',
            'passing_cpoe',
            'passing_2pt_conversions',
            'pacr',
            'receptions',
            'targets',
            'receiving_yards',
            'receiving_tds',
            'receiving_fumbles',
            'receiving_fumbles_lost',
            'receiving_air_yards',
            'receiving_yards_after_catch',
            'receiving_first_downs',
            'receiving_epa',
            'receiving_2pt_conversions',
            'racr',
            'target_share',
            'air_yards_share',
            'wopr',
            'special_teams_tds',
            'def_tackles_solo',
            'def_tackles_with_assist',
            'def_tackle_assists',
            'def_tackles_for_loss',
            'def_tackles_for_loss_yards',
            'def_fumbles_forced',
            'def_sacks',
            'def_sack_yards',
            'def_qb_hits',
            'def_interceptions',
            'def_interception_yards',
            'def_pass_defended',
            'def_tds',
            'def_fumbles',
            'def_safeties',
            'misc_yards',
            'fumble_recovery_own',
            'fumble_recovery_yards_own',
            'fumble_recovery_opp',
            'fumble_recovery_yards_opp',
            'fumble_recovery_tds',
            'punt_returns',
            'punt_return_yards',
            'kickoff_returns',
            'kickoff_return_yards',
        ]

        k = k.drop(clean_up)

        '''

          fg_made = models.IntegerField(default=0)
    fg_att = models.IntegerField(default=0)
    fg_missed = models.IntegerField(default=0)
    fg_blocked = models.IntegerField(default=0)
    fg_long = models.IntegerField(default=0)
         # PAT stats
    pl.col('pat_made').sum(),
    pl.col('pat_att').sum(),
    pl.col('pat_missed').sum(),
    pl.col('pat_blocked').sum()
        
    Game-winning FGs
    pl.col('gwfg_made').sum(),
    pl.col('gwfg_missed').sum(),
    pl.col('gwfg_distance').max(),       longest GWFG attempt
        '''
        k_season = k.filter(pl.col('season_type') == 'REG').group_by(
                ['player_id', 'player_name', 'player_display_name', 'position', 'headshot_url', 'season']
            ).agg([
                
                pl.col('team').last().alias('team'),
                pl.col('fg_made').sum(),
                pl.col('fg_att').sum(),
                pl.col('fg_missed').sum(),
                pl.col('fg_blocked').sum(),
                pl.col('fg_long').max(),
                pl.col('pat_made').sum(),
                pl.col('pat_att').sum(),
                pl.col('pat_missed').sum(),
                pl.col('pat_blocked').sum(),
                pl.col('gwfg_made').sum(),
                pl.col('gwfg_distance').sum(),
                pl.col('fantasy_points').fill_null(0).sum().round(2),
                pl.col('week').count().alias('games_played'),
            ])

        count = 0
        for row in k_season.to_dicts():
            Kicker.objects.update_or_create(
                player_id=row['player_id'],
                season=row['season'],
                defaults={
                    'player_name': row['player_name'],
                    'player_display_name': row['player_display_name'],
                    'position': row['position'],
                    'headshot_url': row['headshot_url'],
                    'team': row['team'],
                    'fg_made': row['fg_made'] or 0,
                    'fg_att': row['fg_att'] or 0,
                    'fg_missed': row['fg_missed'] or 0,
                    'fg_blocked': row['fg_blocked'] or 0,
                    'fg_long': row['fg_long'] or 0,
                    'pat_made': row['pat_made'] or 0,
                    'pat_att': row['pat_att'] or 0,
                    'pat_missed': row['pat_missed'] or 0,
                    'pat_blocked': row['pat_blocked'] or 0,
                    'gwfg_made': row['gwfg_made'] or 0,
                    'fantasy_points': row['fantasy_points'] or 0,
                    'games_played': row['games_played'] or 0,
                }
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f"✅ Loaded {count} K records."))