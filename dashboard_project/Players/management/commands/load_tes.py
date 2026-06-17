import nflreadpy as nfl
import polars as pl
from django.core.management.base import BaseCommand
from Players.models import TightEnd

class Command(BaseCommand):
    help = 'Load TE season stats into the database'

    def handle(self, *args, **kwargs):
        self.stdout.write("Fetching TE data...")

        years = [2021, 2022, 2023, 2024, 2025]
        df = nfl.load_player_stats(years)

        tes = df.filter(pl.col('position_group') == 'TE')

        clean_up = [
            'attempts', 'passing_yards', 'passing_tds', 'passing_interceptions',
            'sacks_suffered', 'sack_yards_lost', 'sack_fumbles', 'sack_fumbles_lost',
            'passing_air_yards', 'passing_yards_after_catch', 'passing_first_downs',
            'passing_epa', 'passing_cpoe', 'passing_2pt_conversions', 'pacr',
            'position_group', 'special_teams_tds', 'def_tackles_solo',
            'def_tackles_with_assist', 'def_tackle_assists', 'def_tackles_for_loss',
            'def_tackles_for_loss_yards', 'def_fumbles_forced', 'def_sacks',
            'def_sack_yards', 'def_qb_hits', 'def_interceptions',
            'def_interception_yards', 'def_pass_defended', 'def_tds', 'def_fumbles',
            'def_safeties', 'misc_yards', 'fumble_recovery_own',
            'fumble_recovery_yards_own', 'fumble_recovery_opp',
            'fumble_recovery_yards_opp', 'fumble_recovery_tds', 'punt_returns',
            'punt_return_yards', 'kickoff_returns', 'kickoff_return_yards',
            'fg_made', 'fg_att', 'fg_missed', 'fg_blocked', 'fg_long', 'fg_pct',
            'fg_made_0_19', 'fg_made_20_29', 'fg_made_30_39', 'fg_made_40_49',
            'fg_made_50_59', 'fg_made_60_', 'fg_missed_0_19', 'fg_missed_20_29',
            'fg_missed_30_39', 'fg_missed_40_49', 'fg_missed_50_59', 'fg_missed_60_',
            'fg_made_list', 'fg_missed_list', 'fg_blocked_list', 'fg_made_distance',
            'fg_missed_distance', 'fg_blocked_distance', 'pat_made', 'pat_att',
            'pat_missed', 'pat_blocked', 'pat_pct', 'gwfg_made', 'gwfg_att',
            'gwfg_missed', 'gwfg_blocked', 'gwfg_distance', 'penalties',
            'penalty_yards', 'rushing_2pt_conversions', 'fantasy_points_ppr'
        ]

        tes = tes.drop(clean_up)

        tes_season = tes.filter(pl.col('season_type') == 'REG').group_by(
            ['player_id', 'player_name', 'player_display_name', 'position', 'headshot_url', 'season']
        ).agg([
            pl.col('team').last().alias('team'),
            pl.col('receptions').sum(),
            pl.col('targets').sum(),
            pl.col('receiving_yards').sum(),
            pl.col('receiving_tds').sum(),
            pl.col('receiving_fumbles').sum(),
            pl.col('receiving_fumbles_lost').sum(),
            pl.col('receiving_air_yards').sum(),
            pl.col('receiving_yards_after_catch').sum(),
            pl.col('receiving_first_downs').sum(),
            pl.col('receiving_2pt_conversions').sum(),
            pl.col('target_share').sum(),
            pl.col('air_yards_share').sum(),
            pl.col('fantasy_points').fill_null(0).sum().round(2),
            pl.col('rushing_epa').mean(),
            pl.col('receiving_epa').mean(),
            pl.col('racr').mean(),
            pl.col('wopr').mean(),
            pl.col('week').count().alias('games_played'),
        ])

        count = 0
        for row in tes_season.to_dicts():
            TightEnd.objects.update_or_create(
                player_id=row['player_id'],
                season=row['season'],
                defaults={
                    'player_name': row['player_name'],
                    'player_display_name': row['player_display_name'],
                    'position': row['position'],
                    'headshot_url': row['headshot_url'],
                    'team': row['team'],
                    'receptions': row['receptions'] or 0,
                    'targets': row['targets'] or 0,
                    'receiving_yards': row['receiving_yards'] or 0,
                    'receiving_tds': row['receiving_tds'] or 0,
                    'receiving_fumbles': row['receiving_fumbles'] or 0,
                    'receiving_fumbles_lost': row['receiving_fumbles_lost'] or 0,
                    'receiving_air_yards': row['receiving_air_yards'] or 0,
                    'receiving_yards_after_catch': row['receiving_yards_after_catch'] or 0,
                    'receiving_first_downs': row['receiving_first_downs'] or 0,
                    'receiving_2pt_conversions': row['receiving_2pt_conversions'] or 0,
                    'receiving_epa': row['receiving_epa'],
                    'target_share': row['target_share'],
                    'air_yards_share': row['air_yards_share'],
                    'racr': row['racr'],
                    'wopr': row['wopr'],
                    'fantasy_points': row['fantasy_points'] or 0,
                    'games_played': row['games_played'] or 0,
                }
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f"✅ Loaded {count} TE records."))