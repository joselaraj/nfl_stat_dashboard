import nflreadpy as nfl 
import polars as pl

years = [2021, 2022, 2023, 2024,2025]

df = nfl.load_player_stats(years) 

print(df['position'].unique())
print(df.columns)

'''
qbs = df.filter(df['position'] == 'QB')

clean_up = [
    'position_group',
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
    'fg_made',
    'fg_att',
    'fg_missed',
    'fg_blocked',
    'fg_long',
    'fg_pct',
    'fg_made_0_19',
    'fg_made_20_29',
    'fg_made_30_39',
    'fg_made_40_49',
    'fg_made_50_59',
    'fg_made_60_',
    'fg_missed_0_19',
    'fg_missed_20_29',
    'fg_missed_30_39',
    'fg_missed_40_49',
    'fg_missed_50_59',
    'fg_missed_60_',
    'fg_made_list',
    'fg_missed_list',
    'fg_blocked_list',
    'fg_made_distance',
    'fg_missed_distance',
    'fg_blocked_distance',
    'pat_made',
    'pat_att',
    'pat_missed',
    'pat_blocked',
    'pat_pct',
    'gwfg_made',
    'gwfg_att',
    'gwfg_missed',
    'gwfg_blocked',
    'gwfg_distance',
    'penalties',
    'penalty_yards',
    'rushing_2pt_conversions',
    'fantasy_points_ppr'
]

qbs = qbs.drop(clean_up)

qbs_season = qbs.filter(pl.col('season_type') == 'REG').group_by(
    ['player_id', 'player_name', 'player_display_name', 'position', 'headshot_url', 'season']
).agg([
    # Keep last team
    pl.col('team').last().alias('team'),

    # Sum stats
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
    pl.col('fantasy_points').sum().round(2),

    # Average stats
    pl.col('passing_epa').mean(),
    pl.col('passing_cpoe').mean(),
    pl.col('pacr').mean(),

    # Games played (useful to have)
    pl.col('week').count().alias('games_played'),
])

#get the RB data now 
rbs = df.filter(df['position_group'] == 'RB')

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
    'position_group',
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
    'fg_made',
    'fg_att',
    'fg_missed',
    'fg_blocked',
    'fg_long',
    'fg_pct',
    'fg_made_0_19',
    'fg_made_20_29',
    'fg_made_30_39',
    'fg_made_40_49',
    'fg_made_50_59',
    'fg_made_60_',
    'fg_missed_0_19',
    'fg_missed_20_29',
    'fg_missed_30_39',
    'fg_missed_40_49',
    'fg_missed_50_59',
    'fg_missed_60_',
    'fg_made_list',
    'fg_missed_list',
    'fg_blocked_list',
    'fg_made_distance',
    'fg_missed_distance',
    'fg_blocked_distance',
    'pat_made',
    'pat_att',
    'pat_missed',
    'pat_blocked',
    'pat_pct',
    'gwfg_made',
    'gwfg_att',
    'gwfg_missed',
    'gwfg_blocked',
    'gwfg_distance',
    'penalties',
    'penalty_yards',
    'rushing_2pt_conversions',
    'fantasy_points_ppr'
]

rbs = rbs.drop(clean_up)

rbs_season = rbs.filter(pl.col('season_type') == 'REG').group_by(
    ['player_id', 'player_name', 'player_display_name', 'position', 'headshot_url', 'season']
).agg([
    # Keep last team
    pl.col('team').last().alias('team'),

    # Sum stats
    pl.col('carries').sum(),
    pl.col('rushing_yards').sum(),
    pl.col('rushing_tds').sum(),
    pl.col('rushing_fumbles').sum(),
    pl.col('rushing_fumbles_lost').sum(),
    pl.col('rushing_first_downs').sum(),
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
    pl.col('fantasy_points').sum().round(2),

    # Average stats
    pl.col('rushing_epa').mean(),
    pl.col('receiving_epa').mean(),
    pl.col('racr').mean(),
    pl.col('wopr').mean(),

    # Games played (useful to have)
    pl.col('week').count().alias('games_played'),
])

#get the RB data now 
wrs = df.filter(df['position_group'] == 'WR')

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
    'position_group',
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
    'fg_made',
    'fg_att',
    'fg_missed',
    'fg_blocked',
    'fg_long',
    'fg_pct',
    'fg_made_0_19',
    'fg_made_20_29',
    'fg_made_30_39',
    'fg_made_40_49',
    'fg_made_50_59',
    'fg_made_60_',
    'fg_missed_0_19',
    'fg_missed_20_29',
    'fg_missed_30_39',
    'fg_missed_40_49',
    'fg_missed_50_59',
    'fg_missed_60_',
    'fg_made_list',
    'fg_missed_list',
    'fg_blocked_list',
    'fg_made_distance',
    'fg_missed_distance',
    'fg_blocked_distance',
    'pat_made',
    'pat_att',
    'pat_missed',
    'pat_blocked',
    'pat_pct',
    'gwfg_made',
    'gwfg_att',
    'gwfg_missed',
    'gwfg_blocked',
    'gwfg_distance',
    'penalties',
    'penalty_yards',
    'rushing_2pt_conversions',
    'fantasy_points_ppr'
]

wrs = wrs.drop(clean_up)

wrs_season = wrs.filter(pl.col('season_type') == 'REG').group_by(
    ['player_id', 'player_name', 'player_display_name', 'position', 'headshot_url', 'season']
).agg([
    # Keep last team
    pl.col('team').last().alias('team'),

    # Sum stats
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
    pl.col('fantasy_points').sum().round(2),

    # Average stats
    pl.col('receiving_epa').mean(),
    pl.col('wopr').mean(),

    # Games played (useful to have)
    pl.col('week').count().alias('games_played'),
])


'''
#get the RB data now 
kickers = df.filter(df['position'] == 'K')

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

kickers = kickers.drop(clean_up)

kickers_season = kickers.filter(pl.col('season_type') == 'REG').group_by(
    ['player_id', 'player_name', 'player_display_name', 'position', 'headshot_url', 'season']
).agg([
    pl.col('team').last().alias('team'),

    # FG stats
    pl.col('fg_made').sum(),
    pl.col('fg_att').sum(),
    pl.col('fg_missed').sum(),
    pl.col('fg_blocked').sum(),
    pl.col('fg_long').max(),            # longest FG, not total

    # PAT stats
    pl.col('pat_made').sum(),
    pl.col('pat_att').sum(),
    pl.col('pat_missed').sum(),
    pl.col('pat_blocked').sum(),

    # Game-winning FGs
    pl.col('gwfg_made').sum(),
    pl.col('gwfg_att').sum(),
    pl.col('gwfg_distance').max(),      # longest GWFG attempt

    pl.col('fantasy_points').sum().round(2),
    pl.col('week').count().alias('games_played'),
]).with_columns([
    # Derive percentages from summed counts — don't average pct across games
    (pl.col('fg_made') / pl.col('fg_att') * 100).round(1).alias('fg_pct'),
    (pl.col('pat_made') / pl.col('pat_att') * 100).round(1).alias('pat_pct'),
])

print(kickers_season.head())